# backend/routes/nessie_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Tuple
import os, httpx, logging
from statistics import pstdev

log = logging.getLogger("nessie")
nessie_router = APIRouter(prefix="/nessie")

class NessieSummaryOut(BaseModel):
    customer_id: str
    monthly_inflow: float
    monthly_outflow: float
    monthly_outflow_std: float
    recurring_bills: float
    categories: Dict[str, float]
    sample_tx_count: int

def _api() -> Tuple[str, str | None]:
    base = os.getenv("NESSIE_BASE", "https://api.nessieisreal.com")
    key = os.getenv("NESSIE_API_KEY")  # may be None
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

@nessie_router.get("/ping")
def ping():
    return {"ok": True}

@nessie_router.get("/customers")
async def customers(limit: int = 5):
    base, key = _api()
    # Dev shortcut
    if not key or os.getenv("DEV_MODE") == "1":
        return _demo_customers()[:limit]

    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            r = await client.get(f"{base}/customers", params={"key": key})
            r.raise_for_status()
            data = r.json()
            if not isinstance(data, list):
                raise ValueError("Unexpected customers payload")
            return data[:limit]
    except Exception as e:
        log.warning(f"Nessie customers fallback due to error: {e}")
        return _demo_customers()[:limit]

@nessie_router.get("/summary/{customer_id}", response_model=NessieSummaryOut)
async def summary(customer_id: str):
    base, key = _api()
    # Dev shortcut
    if not key or os.getenv("DEV_MODE") == "1":
        return _demo_summary(customer_id)

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
        inflows: List[float]
        outflows: List[float] = [], []
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

        return {
            "customer_id": customer_id,
            "monthly_inflow": round(monthly_in, 2),
            "monthly_outflow": round(monthly_out, 2),
            "monthly_outflow_std": round(std_out, 2),
            "recurring_bills": round(recurring_total / months_assumed, 2),
            "categories": {k: round(v/months_assumed, 2)
                           for k, v in sorted(cats.items(), key=lambda kv: kv[1], reverse=True)[:10]},
            "sample_tx_count": len(txs),
        }
    except Exception as e:
        log.warning(f"Nessie summary fallback for {customer_id} due to error: {e}")
        return _demo_summary(customer_id)
