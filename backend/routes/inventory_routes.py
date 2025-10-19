from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Optional

inventory_router = APIRouter(prefix="/inventory")

class SuggestInput(BaseModel):
    budget_monthly: float = Field(..., gt=0)
    body_style: Optional[str] = None   # "sedan","suv","truck","hybrid","ev"
    seating: Optional[int] = None
    lifestyle: Optional[str] = None
    # assumptions (override defaults)
    assumed_down: int = 2000
    assumed_apr: float = 0.07
    assumed_term: int = 60
    # behavior
    return_if_over_budget: bool = True  # return closest even if over

class Car(BaseModel):
    model: str
    trim: str
    msrp: int
    body_style: str
    mpg: int
    blurb: str

class CarWithEstimate(Car):
    est_monthly: float

TOYOTA: List[Car] = [
    Car(model="Corolla",    trim="LE",  msrp=22895, body_style="sedan",  mpg=35, blurb="Efficient commuter; low payment."),
    Car(model="Camry",      trim="SE",  msrp=29495, body_style="sedan",  mpg=32, blurb="Roomy sedan; great value."),
    Car(model="RAV4",       trim="XLE", msrp=30925, body_style="suv",    mpg=30, blurb="Popular compact SUV."),
    Car(model="Highlander", trim="LE",  msrp=38960, body_style="suv",    mpg=25, blurb="Family 3-row."),
    Car(model="Prius",      trim="XLE", msrp=32175, body_style="hybrid", mpg=52, blurb="Max fuel savings."),
    Car(model="Tacoma",     trim="SR5", msrp=34495, body_style="truck",  mpg=21, blurb="New-gen mid-size truck."),
]

def rough_monthly(msrp:int, dp:int, apr:float, term:int) -> float:
    p = max(msrp - dp, 0)
    r = apr / 12
    return p * (r * (1 + r) ** term) / ((1 + r) ** term - 1)

@inventory_router.post("/suggest", response_model=List[CarWithEstimate])
def suggest(x: SuggestInput):
    candidates: List[CarWithEstimate] = []
    for c in TOYOTA:
        if x.body_style and c.body_style != x.body_style:
            continue
        if x.seating and c.model not in ("Highlander",) and x.seating > 5:
            continue
        m = rough_monthly(c.msrp, x.assumed_down, x.assumed_apr, x.assumed_term)
        candidates.append(CarWithEstimate(**c.model_dump(), est_monthly=round(m,2)))

    # first try under-budget
    under = [c for c in candidates if c.est_monthly <= x.budget_monthly + 50]
    under.sort(key=lambda c: c.est_monthly)

    if under:
        return under[:5]

    # otherwise return the 3 closest over budget (if allowed)
    if x.return_if_over_budget:
        candidates.sort(key=lambda c: c.est_monthly - x.budget_monthly)
        return candidates[:3]

    return []
