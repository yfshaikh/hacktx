from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel, Field
from typing import Optional, List, Literal, Dict, Any
import os, httpx

# Reuse logic by importing your existing modules
from routes.calc_routes import CalcInput, calc_finance, calc_lease
from routes.advice_routes import evaluate, AffordInput
from routes.inventory_routes import suggest, SuggestInput

coach_router = APIRouter(prefix="/coach")

@coach_router.get("/ping")
def coach_ping():
    return {"ok": True}


# ----- Request/Response models for clarity -----
class QuoteRequest(BaseModel):
    # Vehicle & pricing
    msrp: float = Field(..., gt=0)
    sell_price: Optional[float] = Field(None, gt=0)
    state_tax_rate: float = Field(0.0625, ge=0)
    doc_fees: float = Field(200, ge=0)
    acquisition_fee: float = Field(650, ge=0)
    title_reg: float = Field(250, ge=0)
    rebates: float = Field(0, ge=0)
    trade_in_credit: float = Field(0, ge=0)
    # User knobs
    down_payment: float = Field(0, ge=0)
    term_months: int = Field(60, gt=0)
    miles_per_year: int = Field(12000, gt=0)
    credit_score: int = Field(700, ge=300, le=850)
    # Affordability
    gross_monthly_income: Optional[float] = Field(None, gt=0)
    avg_monthly_outflows: float = Field(0, ge=0)
    recurring_bills: float = Field(0, ge=0)
    savings_rate: float = Field(0.1, ge=0, le=1)
    # Model recs
    target_body_style: Optional[str] = None
    seating: Optional[int] = None
    lifestyle: Optional[str] = None

class QuoteResponse(BaseModel):
    finance: Dict[str, Any]
    lease: Dict[str, Any]
    preferred_plan: Literal["finance","lease"]
    monthly_target: float
    advice: Dict[str, Any]
    suggestions: List[Dict[str, Any]]
    notes: List[str]

def _pick_preference(fin_total: float, lease_total: float) -> str:
    # Simple preference: cheaper monthly wins (we could add horizon logic)
    return "lease" if lease_total < fin_total else "finance"

@coach_router.post("/quote", response_model=QuoteResponse)
def quote(x: QuoteRequest):
    # 1) compute plans
    calc_in = CalcInput(
        msrp=x.msrp, sell_price=x.sell_price, state_tax_rate=x.state_tax_rate,
        doc_fees=x.doc_fees, acquisition_fee=x.acquisition_fee, title_reg=x.title_reg,
        rebates=x.rebates, trade_in_credit=x.trade_in_credit,
        down_payment=x.down_payment, term_months=x.term_months,
        miles_per_year=x.miles_per_year, credit_score=x.credit_score
    )
    fin = calc_finance(calc_in)
    lea = calc_lease(calc_in)

    # 2) choose a target monthly (for budget & suggestions)
    preferred = _pick_preference(fin.total_monthly, lea.total_monthly)
    monthly_target = float(min(fin.total_monthly, lea.total_monthly))

    # 3) affordability advice (if income provided)
    advice = {}
    if x.gross_monthly_income:
        aff_in = AffordInput(
            monthly_payment=monthly_target,
            gross_monthly_income=x.gross_monthly_income,
            credit_score=x.credit_score,
            avg_monthly_outflows=x.avg_monthly_outflows,
            recurring_bills=x.recurring_bills,
            savings_rate=x.savings_rate
        )
        advice = evaluate(aff_in).model_dump()

    # 4) model suggestions (use assumptions matching user knobs)
    suggs = suggest(SuggestInput(
        budget_monthly=monthly_target,
        body_style=x.target_body_style,
        seating=x.seating,
        lifestyle=x.lifestyle,
        assumed_down=int(x.down_payment),
        assumed_apr=0.07 if x.credit_score<700 else 0.05,
        assumed_term=x.term_months,
        return_if_over_budget=True
    ))
    suggestions = [s.model_dump() for s in suggs]

    # 5) notes
    notes = []
    if preferred == "lease":
        notes.append("Lease is cheaper monthly; consider mileage limits and wear/tear.")
    else:
        notes.append("Finance builds equity and avoids mileage restrictions.")
    if x.down_payment < 1000:
        notes.append("Try increasing down payment to reduce monthly costs for both plans.")
    if x.term_months > 60 and preferred == "finance":
        notes.append("Longer terms reduce the monthly but increase total interest paid.")

    return QuoteResponse(
        finance=fin.model_dump(),
        lease=lea.model_dump(),
        preferred_plan=preferred,
        monthly_target=round(monthly_target,2),
        advice=advice,
        suggestions=suggestions,
        notes=notes
    )

def _mk_script(fin:dict, lea:dict, pref:str, monthly:float, advice:dict, notes:list[str], suggs:list[dict]) -> str:
    parts = []
    parts.append("Here is your Toyota plan comparison.")
    parts.append(f"Financing is about {round(fin['total_monthly'])} dollars per month.")
    parts.append(f"Leasing is about {round(lea['total_monthly'])} dollars per month.")
    parts.append(f"The lower payment right now is {pref}, around {round(monthly)} dollars.")

    if advice:
        pti = int(round(advice.get('payment_to_income_pct', 0)*100))
        dti = int(round(advice.get('dti', 0)*100))
        parts.append(f"Your payment to income ratio is approximately {pti} percent. DTI proxy about {dti} percent.")
        tips = advice.get('tips') or []
        if tips:
            parts.append("Tips: " + "; ".join(tips[:2]))

    if suggs:
        top = suggs[:2]
        label = " and ".join([f"{c['model']} {c['trim']}" for c in top])
        parts.append(f"Within budget, consider {label}.")

    if notes:
        parts.append("Notes: " + "; ".join(notes[:2]) + ".")

    parts.append("Would you like to adjust the down payment or term to see updated options?")
    return " ".join(parts)

@coach_router.post("/speak-quote", response_class=Response)
async def speak_quote(x: QuoteRequest):
    # reuse quote() logic
    q = quote(x)
    script = _mk_script(q.finance, q.lease, q.preferred_plan, q.monthly_target, q.advice, q.notes, q.suggestions)

    api_key = os.getenv("ELEVEN_API_KEY") or os.getenv("ELEVENLABS_API_KEY")
    voice_id = os.getenv("ELEVEN_VOICE_ID")
    if not api_key or not voice_id:
        raise HTTPException(400, "ElevenLabs not configured")

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {"xi-api-key": api_key, "Content-Type": "application/json", "Accept": "audio/mpeg"}
    payload = {"text": script, "model_id": "eleven_monolingual_v1",
               "voice_settings": {"stability": 0.5, "similarity_boost": 0.7}}
    async with httpx.AsyncClient(timeout=45.0) as client:
        r = await client.post(url, headers=headers, json=payload)
        r.raise_for_status()
        return Response(content=r.content, media_type="audio/mpeg")

from fastapi import Depends
# ===== Nessie-assisted quoting & speech ======================================
from routes.nessie_routes import summary as nessie_summary  # absolute import to avoid pkg issues

@coach_router.post("/quote-from-nessie/{customer_id}", response_model=QuoteResponse)
async def quote_from_nessie(customer_id: str, x: QuoteRequest):
    """
    Use Nessie to populate affordability fields (income/outflows/bills),
    while the caller provides the vehicle pricing knobs.
    """
    s = await nessie_summary(customer_id)  # works in DEV via fallback
    x.gross_monthly_income = x.gross_monthly_income or s["monthly_inflow"]
    x.avg_monthly_outflows = x.avg_monthly_outflows or s["monthly_outflow"]
    x.recurring_bills = x.recurring_bills or s["recurring_bills"]
    return quote(x)

@coach_router.post("/speak-quote-from-nessie/{customer_id}", response_class=Response)
async def speak_quote_from_nessie(customer_id: str, x: QuoteRequest):
    # 1) Pull Nessie summary (dev fallback works if no key set)
    s = await nessie_summary(customer_id)

    # 2) Override affordability from Nessie when not supplied
    x.gross_monthly_income = x.gross_monthly_income or s["monthly_inflow"]
    x.avg_monthly_outflows = x.avg_monthly_outflows or s["monthly_outflow"]
    x.recurring_bills = x.recurring_bills or s["recurring_bills"]

    # 3) Compute quote and speech script
    q = quote(x)
    script = _mk_script(
        q.finance, q.lease, q.preferred_plan, q.monthly_target, q.advice, q.notes, q.suggestions
    )

    # 4) ElevenLabs TTS
    api_key = os.getenv("ELEVEN_API_KEY") or os.getenv("ELEVENLABS_API_KEY")
    voice_id = os.getenv("ELEVEN_VOICE_ID")
    if not api_key or not voice_id:
        raise HTTPException(400, "ElevenLabs not configured")

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {"xi-api-key": api_key, "Content-Type": "application/json", "Accept": "audio/mpeg"}
    payload = {
        "text": script,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.7},
    }
    async with httpx.AsyncClient(timeout=45.0) as client:
        r = await client.post(url, headers=headers, json=payload)
        r.raise_for_status()
        return Response(
            content=r.content,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=quote_nessie.mp3"},
        )

# ===== What-if analysis =======================================================
from pydantic import BaseModel

class WhatIfIn(BaseModel):
    # Required: original QuoteRequest
    original: QuoteRequest
    # Optional deltas/overrides
    delta_down: float | None = None          # e.g., +1000
    delta_term: int | None = None            # e.g., +12
    override_apr: float | None = None        # (hook not wired yet)
    override_miles_per_year: int | None = None

@coach_router.post("/what-if", response_model=QuoteResponse)
def what_if(x: WhatIfIn):
    req = x.original.model_copy(deep=True)

    if x.delta_down:
        req.down_payment = max(0.0, req.down_payment + x.delta_down)
    if x.delta_term:
        req.term_months = max(12, req.term_months + x.delta_term)
    if x.override_apr is not None:
        # TODO: expose APR override in calc_finance if you want true APR control.
        # For now, we ignore or could map to a pseudo credit-score tweak.
        pass
    if x.override_miles_per_year is not None:
        req.miles_per_year = x.override_miles_per_year

    return quote(req)

from fastapi import APIRouter
from typing import Dict, Any

@coach_router.post("/quote-ui")
def quote_ui(x: QuoteRequest) -> Dict[str, Any]:
    # Reuse your existing logic to keep consistency
    q = quote(x)

    # Finance block
    fin = q.finance
    loan_monthly = float(fin["total_monthly"])
    loan_total_interest = float(fin["total_interest"])
    loan_total_cost = round(loan_monthly * x.term_months + x.down_payment, 2)
    loan_apr_pct = round(float(fin["apr"]) * 100, 2) if fin["apr"] <= 1 else round(float(fin["apr"]), 2)

    # Lease block
    lea = q.lease
    lease_monthly = float(lea["total_monthly"])
    lease_total_payments = round(lease_monthly * x.term_months, 2)
    residual_value = float(lea["residual_value"])
    buyout_cost = residual_value  # + fees if you want to model them
    total_if_purchased = round(lease_total_payments + buyout_cost, 2)
    # Convert MF → APR% for display
    mf = float(lea["money_factor"])
    lease_apr_pct = round(mf * 2400, 2)

    return {
        "best_loan": {
            "monthly_payment": round(loan_monthly, 2),
            "total_interest": round(loan_total_interest, 2),
            "total_cost": loan_total_cost,
            "apr": loan_apr_pct,
            "term_months": x.term_months,
            "down_payment": round(x.down_payment, 2),
        },
        "best_lease": {
            "monthly_payment": round(lease_monthly, 2),
            "total_lease_payments": lease_total_payments,
            "residual_value": round(residual_value, 2),
            "buyout_cost": round(buyout_cost, 2),
            "total_if_purchased": total_if_purchased,
            "term_months": x.term_months,
            "apr": lease_apr_pct,
        },
    }

@coach_router.post("/quote-ui-from-nessie/{customer_id}")
async def quote_ui_from_nessie(customer_id: str, x: QuoteRequest):
    # hydrate affordability from Nessie first
    s = await nessie_summary(customer_id)
    x.gross_monthly_income = x.gross_monthly_income or s["monthly_inflow"]
    x.avg_monthly_outflows = x.avg_monthly_outflows or s["monthly_outflow"]
    x.recurring_bills = x.recurring_bills or s["recurring_bills"]
    return quote_ui(x)
