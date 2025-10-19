# backend/routes/nessie_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Tuple, Optional
import os, httpx, logging, time
from statistics import pstdev

log = logging.getLogger("nessie")
nessie_router = APIRouter(prefix="/nessie")

# ---------------- In-memory cache (15 min TTL) ----------------
_CACHE: Dict[str, Dict[str, Any]] = {}
TTL_SEC = int(os.getenv("NESSIE_CACHE_TTL_SEC", "900"))

def _cache_get(key: str) -> Optional[Any]:
    v = _CACHE.get(key)
    if not v: return None
    if time.time() - v["ts"] > TTL_SEC:
        _CACHE.pop(key, None)
        return None
    return v["data"]

def _cache_set(key: str, data: Any) -> None:
    _CACHE[key] = {"ts": time.time(), "data": data}

# ---------------- Models ----------------
class NessieSummaryOut(BaseModel):
    customer_id: str
    monthly_inflow: float
    monthly_outflow: float
    monthly_outflow_std: float
    recurring_bills: float
    categories: Dict[str, float]
    sample_tx_count: int

# ---------------- Helpers ----------------
def _api() -> Tuple[str, Optional[str]]:
    base = os.getenv("NESSIE_BASE", "https://api.nessieisreal.com")
    key = os.getenv("NESSIE_API_KEY")  # may be None in DEV
    return base, key

def _demo_customers():
    return [
        {"_id": "demo_customer_1", "first_name": "Demo", "last_name": "User"},
        {"_id": "demo_customer_2", "first_name": "Alex", "last_name": "Park"},
        {"_id": "demo_customer_3", "first_name": "Riley", "last_name": "Ng"},
    ]

def _demo_summary(customer_id: str):
    return {
        "customer_id": customer_id,
        "monthly_inflow": 6000.0,
        "monthly_outflow": 2500.0,
        "monthly_outflow_std": 300.0,
        "recurring_bills": 800.0,
        "categories": {"rent": 1500.0, "groceries": 400.0, "utilities": 200.0, "fuel": 120.0},
        "sample_tx_count": 42,
    }

# ---------------- Routes ----------------
@nessie_router.get("/ping")
def ping():
    return {"ok": True}

@nessie_router.get("/customers")
async def customers(limit: int = 5):
    base, key = _api()
    if not key or os.getenv("DEV_MODE") == "1":
        return _demo_customers()[:limit]

    ck = f"customers:{limit}"
    c = _cache_get(ck)
    if c: return c
    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            r = await client.get(f"{base}/customers", params={"key": key})
            r.raise_for_status()
            data = r.json()
            if not isinstance(data, list):
                raise ValueError("Unexpected customers payload")
            out = data[:limit]
            _cache_set(ck, out)
            return out
    except Exception as e:
        log.warning(f"Nessie customers fallback due to error: {e}")
        return _demo_customers()[:limit]

@nessie_router.get("/summary/{customer_id}", response_model=NessieSummaryOut)
async def summary(customer_id: str):
    base, key = _api()
    if not key or os.getenv("DEV_MODE") == "1":
        return _demo_summary(customer_id)

    ck = f"summary:{customer_id}"
    c = _cache_get(ck)
    if c: return c

    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            # 1) Accounts
            r = await client.get(f"{base}/customers/{customer_id}/accounts", params={"key": key})
            r.raise_for_status()
            accounts = r.json()
            if not isinstance(accounts, list):
                raise ValueError("Unexpected accounts payload")

            # 2) Transactions across accounts
            txs: List[Dict[str, Any]] = []
            for acc in accounts:
                acc_id = acc.get("_id")
                if not acc_id:
                    continue
                t = await client.get(f"{base}/accounts/{acc_id}/transactions", params={"key": key})
                t.raise_for_status()
                part = t.json()
                if isinstance(part, list):
                    txs.extend(part)

        # Aggregate (simple heuristics)
        inflows: List[float] = []
        outflows: List[float] = []
        cats: Dict[str, float] = {}
        counts: Dict[str, int] = {}

        for t in txs:
            amt = float(abs((t.get("amount") or 0)))
            typ = (t.get("transaction_type") or "").lower()
            desc = (t.get("description") or "other").lower()

            if "deposit" in typ or "credit" in typ:
                inflows.append(amt)
            else:
                outflows.append(amt)
                cats[desc] = cats.get(desc, 0.0) + amt

            counts[desc] = counts.get(desc, 0) + 1

        # naive recurring guess: any description seen >= 3 times
        recurring_total = 0.0
        for t in txs:
            desc = (t.get("description") or "other").lower()
            if counts.get(desc, 0) >= 3:
                recurring_total += float(abs((t.get("amount") or 0)))

        months_assumed = 3.0
        monthly_in = sum(inflows) / months_assumed if inflows else 0.0
        monthly_out = sum(outflows) / months_assumed if outflows else 0.0
        std_out = pstdev(outflows) if len(outflows) > 1 else 0.0

        out = {
            "customer_id": customer_id,
            "monthly_inflow": round(monthly_in, 2),
            "monthly_outflow": round(monthly_out, 2),
            "monthly_outflow_std": round(std_out, 2),
            "recurring_bills": round(recurring_total / months_assumed, 2),
            "categories": {k: round(v / months_assumed, 2)
                           for k, v in sorted(cats.items(), key=lambda kv: kv[1], reverse=True)[:10]},
            "sample_tx_count": len(txs),
        }
        _cache_set(ck, out)
        return out
    except Exception as e:
        log.warning(f"Nessie summary fallback for {customer_id} due to error: {e}")
        return _demo_summary(customer_id)

# ---------------- Savings Tips from Spend ----------------
from typing import List

@nessie_router.get("/tips/{customer_id}")
async def tips(customer_id: str, top_n: int = 6):
    """
    Turn category spend into actionable monthly savings tips.
    Uses simple % trims per category and adds a 'recurring bills' nudge.
    Returns:
      {
        customer_id,
        estimated_monthly_savings,
        tips: [
          { category, current_monthly, suggested_reduction_pct, estimated_savings, suggestion }
        ]
      }
    """
    ck = f"tips:{customer_id}:{top_n}"
    cached = _cache_get(ck)
    if cached:
        return cached

    # Pull normalized monthly categories from the same module's summary() endpoint
    s = await summary(customer_id)  # returns NessieSummaryOut (pydantic converts to dict-like)
    cats: Dict[str, float] = dict(s["categories"])  # e.g., {"rent": 1500.0, "groceries": 400.0, ...}
    recurring = float(s.get("recurring_bills", 0.0))

    # Heuristic: % trims per (canonical) category name
    # Keys here are lowercase; we’ll match by normalized key contains
    TRIM_PCT = {
        "restaurants": 0.10,
        "dining": 0.10,
        "coffee": 0.20,
        "subscriptions": 0.15,
        "entertainment": 0.10,
        "shopping": 0.08,
        "travel": 0.05,
        "groceries": 0.05,   # conservative; don’t be preachy
        "fuel": 0.05,        # driving style/route/app couponing
        "utilities": 0.05,   # provider-negotiation & efficiency
    }
    GENERIC_TRIM = 0.05  # fallback for anything else

    # Small helper to choose a % based on a category key
    def pick_pct(cat_key: str) -> float:
        k = cat_key.lower()
        for name, pct in TRIM_PCT.items():
            if name in k:
                return pct
        return GENERIC_TRIM

    tips: List[Dict[str, Any]] = []
    total_savings = 0.0

    # Rank categories by current spend (desc)
    for k, amt in sorted(cats.items(), key=lambda kv: kv[1], reverse=True):
        amt = float(amt)
        if amt <= 0:
            continue
        pct = pick_pct(k)
        save = round(amt * pct, 2)
        if save < 5:  # ignore tiny wins
            continue

        # Pretty label for UI
        label = k.title()
        tips.append({
            "category": label,
            "current_monthly": round(amt, 2),
            "suggested_reduction_pct": round(pct * 100, 1),
            "estimated_savings": save,
            "suggestion": f"Trim {label.lower()} by {int(pct*100)}% to free ~${save}/mo."
        })
        total_savings += save

    # Recurring bills nudge (conservative)
    if recurring > 0:
        rec_pct = 0.05
        rec_cap = 15.0  # don't overpromise
        rec_save = round(min(rec_cap, recurring * rec_pct), 2)
        if rec_save >= 5:
            tips.append({
                "category": "Recurring Bills",
                "current_monthly": round(recurring, 2),
                "suggested_reduction_pct": round(rec_pct * 100, 1),
                "estimated_savings": rec_save,
                "suggestion": f"Call providers (phone/internet/utilities) and ask for ~5% off: ~${rec_save}/mo."
            })
            total_savings += rec_save

    # Sort by biggest savings and cap the list
    tips = sorted(tips, key=lambda t: -t["estimated_savings"])[:max(1, int(top_n))]

    out = {
        "customer_id": customer_id,
        "estimated_monthly_savings": round(total_savings, 2),
        "tips": tips,
    }
    _cache_set(ck, out)
    return out
