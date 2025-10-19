# FE can now call this when a user drags a “payment comfort” slider.
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import math

from routes.calc_routes import CalcInput, calc_finance

optimize_router = APIRouter(prefix="/optimize")

class SolvePaymentIn(BaseModel):
    # vehicle and fees
    msrp: float = Field(..., gt=0)
    sell_price: Optional[float] = Field(None, gt=0)
    state_tax_rate: float = Field(0.0625, ge=0, le=0.12)
    doc_fees: float = Field(200, ge=0, le=2000)
    acquisition_fee: float = Field(650, ge=0, le=2500)
    title_reg: float = Field(250, ge=0, le=2500)
    rebates: float = Field(0, ge=0, le=20000)
    trade_in_credit: float = Field(0, ge=0, le=200000)

    # user constraints
    credit_score: int = Field(700, ge=300, le=850)
    target_monthly: float = Field(..., gt=0)

    # search space
    down_min: float = Field(0, ge=0)
    down_max: float = Field(10000, ge=0)
    down_step: float = Field(500, gt=0)
    terms: List[int] = Field(default_factory=lambda: [36, 48, 60, 72])

class SolvePaymentOut(BaseModel):
    target_monthly: float
    best: Dict[str, Any]
    candidates_considered: int

@optimize_router.post("/solve-payment", response_model=SolvePaymentOut)
def solve_payment(x: SolvePaymentIn):
    best = None
    considered = 0

    # normalize price
    price = x.sell_price or x.msrp
    down = x.down_min

    downs = []
    v = x.down_min
    while v <= x.down_max + 1e-6:
        downs.append(round(v, 2))
        v += x.down_step

    for d in downs:
        for term in x.terms:
            calc_in = CalcInput(
                msrp=x.msrp,
                sell_price=price,
                state_tax_rate=x.state_tax_rate,
                doc_fees=x.doc_fees,
                acquisition_fee=x.acquisition_fee,
                title_reg=x.title_reg,
                rebates=x.rebates,
                trade_in_credit=x.trade_in_credit,
                down_payment=d,
                term_months=term,
                miles_per_year=12000,
                credit_score=x.credit_score,
            )
            fin = calc_finance(calc_in)
            considered += 1

            monthly = float(fin.total_monthly)
            delta = abs(monthly - x.target_monthly)
            total_cost = monthly * term + d

            cand = {
                "down_payment": round(d, 2),
                "term_months": term,
                "monthly_payment": round(monthly, 2),
                "delta_from_target": round(monthly - x.target_monthly, 2),
                "apr": float(fin.apr),
                "total_interest": round(float(fin.total_interest), 2),
                "total_cost": round(total_cost, 2),
            }

            def better(a, b):
                if a is None: return True
                # prioritize lowest absolute delta, then lower total cost, then shorter term
                if abs(cand["delta_from_target"]) < abs(a["delta_from_target"]): return True
                if abs(cand["delta_from_target"]) > abs(a["delta_from_target"]): return False
                if cand["total_cost"] < a["total_cost"]: return True
                if cand["total_cost"] > a["total_cost"]: return False
                return cand["term_months"] < a["term_months"]

            if better(best, cand):
                best = cand

    return SolvePaymentOut(
        target_monthly=round(x.target_monthly, 2),
        best=best,
        candidates_considered=considered,
    )