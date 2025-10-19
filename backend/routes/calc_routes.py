from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Literal
import math

calc_router = APIRouter(prefix="/calc")

# --- simple tables (tune later / replace with real rate service) ---
APR_BY_CREDIT = { "prime":0.049, "nearprime":0.079, "subprime":0.129 }
MF_BY_CREDIT  = { "prime":0.00150, "nearprime":0.00220, "subprime":0.00350 }  # money factor ~ APR/2400
# Residuals by term/miles (illustrative; adjust per model)
RESIDUAL_TABLE = {
    (36,12000): 0.62, (36,15000): 0.60,
    (48,12000): 0.54, (48,15000): 0.52,
}

def tier_from_score(score:int)->str:
    if score>=700: return "prime"
    if score>=640: return "nearprime"
    return "subprime"

class CalcInput(BaseModel):
    msrp: float = Field(..., gt=0)
    sell_price: Optional[float] = Field(None, gt=0)         # negotiated price; default msrp
    state_tax_rate: float = Field(0.0625, ge=0)             # e.g., 6.25% -> 0.0625
    doc_fees: float = Field(200.0, ge=0)                    # dealer/doc fees
    acquisition_fee: float = Field(650.0, ge=0)             # lease only
    title_reg: float = Field(250.0, ge=0)
    rebates: float = Field(0.0, ge=0)
    trade_in_credit: float = Field(0.0, ge=0)
    down_payment: float = Field(0.0, ge=0)
    term_months: int = Field(60, gt=0)                      # finance term; lease term uses same field
    miles_per_year: int = Field(12000, gt=0)                # lease only
    credit_score: int = Field(700, ge=300, le=850)

class FinanceResult(BaseModel):
    principal: float
    apr: float
    monthly_base: float
    monthly_tax: float
    total_monthly: float
    total_interest: float

class LeaseResult(BaseModel):
    cap_cost: float
    residual_value: float
    money_factor: float
    depreciation_fee: float
    rent_charge: float
    monthly_base: float
    monthly_tax: float
    total_monthly: float
    drive_off: float

class CompareResponse(BaseModel):
    finance: FinanceResult
    lease: LeaseResult
    notes: list[str]

def amort_payment(principal: float, apr: float, n_months: int) -> float:
    r = apr/12
    if r==0: return principal/n_months
    return principal * (r*(1+r)**n_months) / ((1+r)**n_months - 1)

@calc_router.post("/finance", response_model=FinanceResult)
def calc_finance(x: CalcInput):
    price = x.sell_price or x.msrp
    taxable_amount = max(price - x.rebates - x.trade_in_credit, 0)
    subtotal = taxable_amount + x.doc_fees + x.title_reg
    apr = APR_BY_CREDIT[tier_from_score(x.credit_score)]
    principal = max(subtotal - x.down_payment, 0)
    monthly_base = amort_payment(principal, apr, x.term_months)
    monthly_tax  = monthly_base * x.state_tax_rate
    total_monthly = monthly_base + monthly_tax
    total_interest = (monthly_base * x.term_months) - principal
    return FinanceResult(
        principal=round(principal,2), apr=apr,
        monthly_base=round(monthly_base,2),
        monthly_tax=round(monthly_tax,2),
        total_monthly=round(total_monthly,2),
        total_interest=round(total_interest,2),
    )

@calc_router.post("/lease", response_model=LeaseResult)
def calc_lease(x: CalcInput):
    price = x.sell_price or x.msrp
    tier = tier_from_score(x.credit_score)
    mf = MF_BY_CREDIT[tier]
    residual_pct = RESIDUAL_TABLE.get((x.term_months, x.miles_per_year))
    if residual_pct is None:
        # simple fallback: degrade residual with longer term / higher miles
        base = 0.60 if x.term_months<=36 else 0.53
        adj  = -0.02 if x.miles_per_year>12000 else 0.0
        residual_pct = base + adj
    # Capitalized cost: negotiated price minus incentives minus down, plus fees
    cap_cost = max((price - x.rebates) - x.down_payment + x.doc_fees + x.acquisition_fee + x.title_reg, 0)
    residual_value = (price) * residual_pct
    depreciation_fee = (cap_cost - residual_value) / x.term_months
    rent_charge = (cap_cost + residual_value) * mf
    monthly_base = depreciation_fee + rent_charge
    # Tax on monthly (most states); for drive-off tax we’ll keep it simple
    monthly_tax = monthly_base * x.state_tax_rate
    total_monthly = monthly_base + monthly_tax
    drive_off = x.down_payment + x.doc_fees + x.acquisition_fee + x.title_reg
    return LeaseResult(
        cap_cost=round(cap_cost,2),
        residual_value=round(residual_value,2),
        money_factor=mf,
        depreciation_fee=round(depreciation_fee,2),
        rent_charge=round(rent_charge,2),
        monthly_base=round(monthly_base,2),
        monthly_tax=round(monthly_tax,2),
        total_monthly=round(total_monthly,2),
        drive_off=round(drive_off,2),
    )

@calc_router.post("/compare", response_model=CompareResponse)
def compare(x: CalcInput):
    fin = calc_finance(x)
    lea = calc_lease(x)
    notes = []
    if lea.total_monthly < fin.total_monthly:
        notes.append("Lease has a lower monthly than finance.")
    else:
        notes.append("Finance has a lower monthly than lease (often with longer term/down).")
    if x.down_payment < 1000:
        notes.append("Consider increasing down payment to reduce finance principal and lease cap cost.")
    if x.term_months>60 and tier_from_score(x.credit_score)!="prime":
        notes.append("Long terms with higher APR increase total interest—balance monthly vs. total paid.")
    return CompareResponse(finance=fin, lease=lea, notes=notes)

from pydantic import BaseModel, Field, field_validator

class SafeQuoteInputs(BaseModel):
    msrp: float = Field(..., gt=5000, lt=150000)
    sell_price: float | None = Field(None, gt=4000, lt=150000)
    state_tax_rate: float = Field(0.0625, ge=0, le=0.12)
    doc_fees: float = Field(200, ge=0, le=1000)
    acquisition_fee: float = Field(650, ge=0, le=1500)
    title_reg: float = Field(250, ge=0, le=1500)
    rebates: float = Field(0, ge=0, le=10000)
    trade_in_credit: float = Field(0, ge=0, le=100000)
    down_payment: float = Field(0, ge=0, le=50000)
    term_months: int = Field(36, ge=12, le=84)
    miles_per_year: int = Field(12000, ge=7500, le=20000)
    credit_score: int = Field(700, ge=300, le=850)

    @field_validator("sell_price")
    def sell_price_not_above_msrp(cls, v, info):
        if v is not None:
            msrp = info.data.get("msrp")
            if msrp and v > msrp * 1.2:
                raise ValueError("sell_price unusually high vs MSRP")
        return v
