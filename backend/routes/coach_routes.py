from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel, Field
from typing import Optional, List, Literal, Dict, Any
import os, httpx

# Reuse logic by importing your existing modules
from routes.calc_routes import (
    CalcInput, calc_finance, calc_lease, SafeQuoteInputs
)
from routes.advice_routes import evaluate, AffordInput
from routes.inventory_routes import suggest, SuggestInput
from routes.nessie_routes import summary as nessie_summary, tips as nessie_tips

coach_router = APIRouter(prefix="/coach")


# -------------------------------------------------------------------
# Health
# -------------------------------------------------------------------
@coach_router.get("/ping")
def coach_ping():
    return {"ok": True}


# -------------------------------------------------------------------
# Models
# -------------------------------------------------------------------
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
    preferred_plan: Literal["finance", "lease"]
    monthly_target: float
    advice: Dict[str, Any]
    suggestions: List[Dict[str, Any]]
    notes: List[str]


class WhatIfIn(BaseModel):
    # Required: original QuoteRequest
    original: QuoteRequest
    # Optional deltas/overrides
    delta_down: Optional[float] = None      # e.g., +1000
    delta_term: Optional[int] = None        # e.g., +12
    override_apr: Optional[float] = None    # (not wired into calc directly yet)
    override_miles_per_year: Optional[int] = None


# -------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------
def _pick_preference(fin_total: float, lease_total: float) -> str:
    # Simple preference: lower monthly wins
    return "lease" if lease_total < fin_total else "finance"


def _mk_script(
    fin: dict, lea: dict, pref: str, monthly: float,
    advice: dict, notes: List[str], suggs: List[dict]
) -> str:
    parts = []
    parts.append("Here is your Toyota plan comparison.")
    parts.append(f"Financing is about {round(fin['total_monthly'])} dollars per month.")
    parts.append(f"Leasing is about {round(lea['total_monthly'])} dollars per month.")
    parts.append(f"The lower payment right now is {pref}, around {round(monthly)} dollars.")

    if advice:
        pti = int(round(advice.get('payment_to_income_pct', 0) * 100))
        dti = int(round(advice.get('dti', 0) * 100))
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


def _format_ui(fin: dict, lea: dict, x: QuoteRequest, preferred: str, monthly_target: float) -> dict:
    # Convert to teammate’s UI shape
    return {
        "best_loan": {
            "monthly_payment": round(float(fin["total_monthly"]), 2),
            "total_interest": round(float(fin["total_interest"]), 2),
            "total_cost": round(float(fin["total_monthly"]) * x.term_months + x.down_payment, 2),
            "apr": round((float(fin["apr"]) * 100 if float(fin["apr"]) <= 1 else float(fin["apr"])), 2),
            "term_months": x.term_months,
            "down_payment": round(x.down_payment, 2),
        },
        "best_lease": {
            "monthly_payment": round(float(lea["total_monthly"]), 2),
            "total_lease_payments": round(float(lea["total_monthly"]) * x.term_months, 2),
            "residual_value": round(float(lea["residual_value"]), 2),
            "buyout_cost": round(float(lea["residual_value"]), 2),
            "total_if_purchased": round(float(lea["total_monthly"]) * x.term_months + float(lea["residual_value"]), 2),
            "term_months": x.term_months,
            "apr": round(float(lea["money_factor"]) * 2400, 2),
        },
        "preferred_plan": preferred,
        "monthly_target": round(monthly_target, 2),
        "assumptions": {
            "apr_used_loan_pct": round((float(fin["apr"]) * 100 if float(fin["apr"]) <= 1 else float(fin["apr"])), 2),
            "money_factor": float(lea["money_factor"]),
            "apr_used_lease_pct": round(float(lea["money_factor"]) * 2400, 2),
            "residual_value": round(float(lea["residual_value"]), 2),
            "tax_rate": x.state_tax_rate,
            "fees": {"doc": round(x.doc_fees, 2), "acq": round(x.acquisition_fee, 2), "title_reg": round(x.title_reg, 2)},
            "down_payment": round(x.down_payment, 2),
        },
    }


def _mk_delta_script(baseline: dict, new: dict, deltas: dict) -> str:
    parts = []
    parts.append("Here are the changes to your plan.")
    # Loan
    loan_old = baseline["best_loan"]["monthly_payment"]
    loan_new = new["best_loan"]["monthly_payment"]
    parts.append(f"For financing, monthly changes from {round(loan_old)} to {round(loan_new)} dollars.")
    # Lease
    lease_old = baseline["best_lease"]["monthly_payment"]
    lease_new = new["best_lease"]["monthly_payment"]
    parts.append(f"For leasing, monthly changes from {round(lease_old)} to {round(lease_new)} dollars.")
    # Preferred plan switch?
    sw = deltas.get("preferred_plan_change")
    if sw:
        parts.append(f"Your preferred plan shifts from {sw['from']} to {sw['to']}.")
    parts.append("Want me to lock this option and check inventory that fits?")
    return " ".join(parts)


# -------------------------------------------------------------------
# Core quote endpoints (validated with SafeQuoteInputs)
# -------------------------------------------------------------------
@coach_router.post("/quote", response_model=QuoteResponse)
def quote(x: QuoteRequest):
    # Validate inputs with your guardrails (pydantic will raise 422 if invalid)
    SafeQuoteInputs(**x.model_dump())

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
        assumed_apr=0.07 if x.credit_score < 700 else 0.05,
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
        monthly_target=round(monthly_target, 2),
        advice=advice,
        suggestions=suggestions,
        notes=notes
    )


@coach_router.post("/speak-quote", response_class=Response)
async def speak_quote(x: QuoteRequest):
    # Validate inputs first
    SafeQuoteInputs(**x.model_dump())

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


# -------------------------------------------------------------------
# Nessie-powered variants
# -------------------------------------------------------------------
@coach_router.post("/quote-from-nessie/{customer_id}", response_model=QuoteResponse)
async def quote_from_nessie(customer_id: str, x: QuoteRequest):
    """
    Use Nessie to populate affordability fields (income/outflows/bills),
    while the caller provides the vehicle pricing knobs.
    """
    # Validate inputs (vehicle knobs etc.)
    SafeQuoteInputs(**x.model_dump())

    # fetch financial summary (works in DEV even without API key due to fallback)
    s = await nessie_summary(customer_id)  # returns NessieSummaryOut-compatible dict

    # override affordability fields from Nessie if not supplied by caller
    x.gross_monthly_income = x.gross_monthly_income or s["monthly_inflow"]
    x.avg_monthly_outflows = x.avg_monthly_outflows or s["monthly_outflow"]
    x.recurring_bills = x.recurring_bills or s["recurring_bills"]

    return quote(x)


@coach_router.post("/speak-quote-from-nessie/{customer_id}", response_class=Response)
async def speak_quote_from_nessie(customer_id: str, x: QuoteRequest):
    SafeQuoteInputs(**x.model_dump())

    # 1) Pull Nessie summary (dev fallback works if no key set)
    s = await nessie_summary(customer_id)

    # 2) Override affordability from Nessie when not supplied
    x.gross_monthly_income = x.gross_monthly_income or s["monthly_inflow"]
    x.avg_monthly_outflows = x.avg_monthly_outflows or s["monthly_outflow"]
    x.recurring_bills = x.recurring_bills or s["recurring_bills"]

    # 3) Compute quote and speech script
    q = quote(x)
    script = _mk_script(q.finance, q.lease, q.preferred_plan, q.monthly_target, q.advice, q.notes, q.suggestions)

    # 4) ElevenLabs TTS
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
        return Response(
            content=r.content,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=quote_nessie.mp3"},
        )


# -------------------------------------------------------------------
# UI-friendly endpoints
# -------------------------------------------------------------------
@coach_router.post("/quote-ui")
def quote_ui(x: QuoteRequest):
    SafeQuoteInputs(**x.model_dump())

    q = quote(x)
    fin = q.finance
    lea = q.lease
    return _format_ui(fin, lea, x, q.preferred_plan, q.monthly_target)


@coach_router.post("/quote-ui-from-nessie/{customer_id}")
async def quote_ui_from_nessie(customer_id: str, x: QuoteRequest):
    SafeQuoteInputs(**x.model_dump())

    s = await nessie_summary(customer_id)
    x.gross_monthly_income = x.gross_monthly_income or s["monthly_inflow"]
    x.avg_monthly_outflows = x.avg_monthly_outflows or s["monthly_outflow"]
    x.recurring_bills = x.recurring_bills or s["recurring_bills"]

    q = quote(x)
    return _format_ui(q.finance, q.lease, x, q.preferred_plan, q.monthly_target)


@coach_router.post("/quote-ui-from-nessie-with-tips/{customer_id}")
async def quote_ui_from_nessie_with_tips(customer_id: str, x: QuoteRequest):
    SafeQuoteInputs(**x.model_dump())

    # summary + budgeting tips (reduce outflows by estimated savings)
    s = await nessie_summary(customer_id)
    t = await nessie_tips(customer_id)
    savings = float(t.get("estimated_monthly_savings", 0.0))

    x.gross_monthly_income = x.gross_monthly_income or s["monthly_inflow"]
    base_out = x.avg_monthly_outflows or s["monthly_outflow"]
    x.avg_monthly_outflows = max(0.0, base_out - savings)
    x.recurring_bills = x.recurring_bills or s["recurring_bills"]

    q = quote(x)
    ui = _format_ui(q.finance, q.lease, x, q.preferred_plan, q.monthly_target)
    ui["budgeting"] = {
        "estimated_savings_applied": round(savings, 2),
        "notes": "Outflows reduced by estimated savings from Nessie tips."
    }
    return ui


# -------------------------------------------------------------------
# What-if endpoints
# -------------------------------------------------------------------
@coach_router.post("/what-if-ui")
def what_if_ui(x: WhatIfIn):
    # Validate baseline inputs
    SafeQuoteInputs(**x.original.model_dump())

    # Baseline
    base_q = quote(x.original)
    base_ui = _format_ui(base_q.finance, base_q.lease, x.original, base_q.preferred_plan, base_q.monthly_target)

    # Apply deltas to a deep copy
    req = x.original.model_copy(deep=True)
    if x.delta_down:
        req.down_payment = max(0.0, req.down_payment + x.delta_down)
    if x.delta_term:
        req.term_months = max(12, req.term_months + x.delta_term)
    if x.override_miles_per_year is not None:
        req.miles_per_year = x.override_miles_per_year
    # (optional) x.override_apr: you could thread an apr override into calc_finance later

    # What-if
    new_q = quote(req)
    new_ui = _format_ui(new_q.finance, new_q.lease, req, new_q.preferred_plan, new_q.monthly_target)

    # Track deltas
    deltas: Dict[str, Any] = {}
    if base_q.preferred_plan != new_q.preferred_plan:
        deltas["preferred_plan_change"] = {"from": base_q.preferred_plan, "to": new_q.preferred_plan}

    deltas["loan_monthly_change"] = round(new_ui["best_loan"]["monthly_payment"] - base_ui["best_loan"]["monthly_payment"], 2)
    deltas["lease_monthly_change"] = round(new_ui["best_lease"]["monthly_payment"] - base_ui["best_lease"]["monthly_payment"], 2)

    return {
        "baseline": base_ui,
        "what_if": new_ui,
        "deltas": deltas,
        "request_applied": req.model_dump(),
    }


@coach_router.post("/speak-what-if", response_class=Response)
async def speak_what_if(x: WhatIfIn):
    SafeQuoteInputs(**x.original.model_dump())

    base = what_if_ui(x)  # reuses the computation above
    script = _mk_delta_script(base["baseline"], base["what_if"], base["deltas"])

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
        return Response(
            content=r.content,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=what_if.mp3"},
        )

from routes.nessie_routes import tips as nessie_tips

@coach_router.post("/quote-ui-from-nessie-with-tips/{customer_id}")
async def quote_ui_from_nessie_with_tips(customer_id: str, x: QuoteRequest):
    # 1) Start with your regular Nessie-powered quote
    from routes.nessie_routes import summary as nessie_summary
    s = await nessie_summary(customer_id)

    # 2) Pull budgeting tips & savings
    t = await nessie_tips(customer_id)
    savings = float(t.get("estimated_monthly_savings", 0.0))

    # 3) Override affordability
    x.gross_monthly_income = x.gross_monthly_income or s["monthly_inflow"]
    # reduce outflows by estimated savings (conservative floor at 0)
    base_out = x.avg_monthly_outflows or s["monthly_outflow"]
    x.avg_monthly_outflows = max(0.0, base_out - savings)
    x.recurring_bills = x.recurring_bills or s["recurring_bills"]

    # 4) Return UI-flavored response (reuse your quote_ui function/formatter)
    q = quote(x)
    ui = {
        "best_loan": {
            "monthly_payment": round(float(q.finance["total_monthly"]), 2),
            "total_interest": round(float(q.finance["total_interest"]), 2),
            "total_cost": round(float(q.finance["total_monthly"]) * x.term_months + x.down_payment, 2),
            "apr": round((float(q.finance["apr"]) * 100 if float(q.finance["apr"]) <= 1 else float(q.finance["apr"])), 2),
            "term_months": x.term_months,
            "down_payment": round(x.down_payment, 2),
        },
        "best_lease": {
            "monthly_payment": round(float(q.lease["total_monthly"]), 2),
            "total_lease_payments": round(float(q.lease["total_monthly"]) * x.term_months, 2),
            "residual_value": round(float(q.lease["residual_value"]), 2),
            "buyout_cost": round(float(q.lease["residual_value"]), 2),
            "total_if_purchased": round(float(q.lease["total_monthly"]) * x.term_months + float(q.lease["residual_value"]), 2),
            "term_months": x.term_months,
            "apr": round(float(q.lease["money_factor"]) * 2400, 2),
        },
        "preferred_plan": q.preferred_plan,
        "monthly_target": round(q.monthly_target, 2),
        "assumptions": {
            "apr_used_loan_pct": round((float(q.finance["apr"]) * 100 if float(q.finance["apr"]) <= 1 else float(q.finance["apr"])), 2),
            "money_factor": float(q.lease["money_factor"]),
            "apr_used_lease_pct": round(float(q.lease["money_factor"]) * 2400, 2),
            "residual_value": round(float(q.lease["residual_value"]), 2),
            "tax_rate": x.state_tax_rate,
            "fees": {"doc": round(x.doc_fees, 2), "acq": round(x.acquisition_fee, 2), "title_reg": round(x.title_reg, 2)},
            "down_payment": round(x.down_payment, 2),
        },
        "budgeting": {
            "estimated_savings_applied": round(savings, 2),
            "notes": "Outflows reduced by estimated savings from Nessie tips."
        }
    }
    return ui

@coach_router.post("/explain")
def explain(x: QuoteRequest):
    q = quote(x)
    script = _mk_script(q.finance, q.lease, q.preferred_plan,
                        q.monthly_target, q.advice, q.notes, q.suggestions)
    return {
        "script": script,
        "preferred_plan": q.preferred_plan,
        "monthly_target": q.monthly_target,
        "finance": q.finance,
        "lease": q.lease,
        "notes": q.notes,
        "suggestions": q.suggestions,
    }
