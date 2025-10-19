from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List

advice_router = APIRouter(prefix="/advice")

class AffordInput(BaseModel):
    monthly_payment: float = Field(..., gt=0)
    gross_monthly_income: float = Field(..., gt=0)
    credit_score: int = Field(..., ge=300, le=850)
    avg_monthly_outflows: float = Field(0, ge=0)   # from Nessie features (optional)
    recurring_bills: float = Field(0, ge=0)        # optional
    savings_rate: float = Field(0.1, ge=0, le=1)   # optional prior

class AffordResponse(BaseModel):
    dti: float
    payment_to_income_pct: float
    flags: List[str]
    tips: List[str]

@advice_router.post("/evaluate", response_model=AffordResponse)
def evaluate(x: AffordInput):
    # simple proxies; tighten later with real features
    payment_to_income = x.monthly_payment / x.gross_monthly_income
    dti = (x.recurring_bills + x.monthly_payment) / max(x.gross_monthly_income, 1e-6)

    flags, tips = [], []
    if payment_to_income > 0.15: flags.append("High payment-to-income (>15%).")
    if dti > 0.36: flags.append("High DTI proxy (>36%).")

    if x.credit_score < 640: tips.append("Improve credit to access lower APR/MF; pay down revolving balances or fix delinquencies.")
    if payment_to_income > 0.12: tips.append("Consider +$1k down or +12 mo term to reduce monthly.")
    if dti > 0.36: tips.append("Lower fixed bills or target cheaper trim to keep buffer days healthy.")
    if x.savings_rate < 0.1: tips.append("Aim for at least 10% savings; avoid stretching term beyond vehicle life.")

    return AffordResponse(
        dti=round(dti,3),
        payment_to_income_pct=round(payment_to_income,3),
        flags=flags,
        tips=tips or ["Looks good—payment fits within typical guardrails."]
    )
