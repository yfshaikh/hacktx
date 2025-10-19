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

