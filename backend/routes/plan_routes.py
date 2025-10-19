# backend/routes/plan_routes.py
from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel, Field
import httpx, os

plan_router = APIRouter(prefix="/plan")

class UserFinanceInputs(BaseModel):
    income: float = Field(..., gt=0)
    credit: int = Field(..., ge=300, le=850)
    miles_per_year: int = 12000
    horizon_years: int = 5
    down_payment: float = 0
    budget_target: float = 0

def comfort_calc(x: UserFinanceInputs):
    base = 0.12 + (-0.02 if x.credit < 640 else 0.0)
    pct = max(0.06, min(0.22, base))
    return round(pct * x.income, 2), pct

def plan_choice_calc(x: UserFinanceInputs):
    p = 0.6 if x.horizon_years <= 3 else 0.3
    if x.miles_per_year > 15000: p -= 0.2
    if x.credit < 640: p -= 0.05
    p = max(0.05, min(0.95, p))
    return round(p, 3), round(1 - p, 3)

@plan_router.post("/speak-summary", response_class=Response)
async def speak_summary(x: UserFinanceInputs):
    comfy, pct = comfort_calc(x)
    p_lease, p_fin = plan_choice_calc(x)

    script = (
        f"Here’s your quick Toyota financing summary. "
        f"A comfortable monthly payment is about {round(comfy)} dollars, "
        f"which is {round(pct*100,1)} percent of your income. "
        f"Given your driving and term, I’d estimate a {round(p_lease*100)} percent chance lease fits better, "
        f"and {round(p_fin*100)} percent to finance. "
        f"If you want to lower the payment, consider adding to your down payment or a longer term."
    )

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
