from fastapi import APIRouter
from pydantic import BaseModel, Field

ml_router = APIRouter(prefix="/ml")

class UserFinanceInputs(BaseModel):
    income: float = Field(..., gt=0)
    credit: int = Field(..., ge=300, le=850)
    miles_per_year: int = Field(12000, gt=0)
    horizon_years: int = Field(5, gt=0)
    down_payment: float = Field(0, ge=0)
    budget_target: float = Field(0, ge=0)

@ml_router.post("/comfort")
def comfort(x: UserFinanceInputs):
    # simple heuristic (we’ll swap to a trained model later)
    base = 0.12 + (-0.02 if x.credit < 640 else 0.0)
    pct = max(0.06, min(0.22, base))
    return {"comfortable_monthly": round(pct * x.income, 2), "pct_income": round(pct, 4)}

@ml_router.post("/plan-choice")
def plan_choice(x: UserFinanceInputs):
    p = 0.6 if x.horizon_years <= 3 else 0.3
    if x.miles_per_year > 15000: p -= 0.2
    if x.credit < 640: p -= 0.05
    p = max(0.05, min(0.95, p))
    return {"p_lease": round(p, 3), "p_finance": round(1 - p, 3)}
