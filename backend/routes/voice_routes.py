# routes/voice_routes.py
from fastapi import APIRouter, HTTPException, Response
import httpx, os

voice_router = APIRouter(prefix="/voice")

@voice_router.get("/speak")
def speak_info():
    return {"usage": 'POST /api/voice/speak with JSON {"text":"..."} or ?text=... (dev only)'}

@voice_router.post("/speak", response_class=Response)
async def speak(text: str | None = None):
    if not text:
        raise HTTPException(400, 'Provide ?text=... or JSON {"text":"..."}')
    api_key = os.getenv("ELEVEN_API_KEY") or os.getenv("ELEVENLABS_API_KEY")
    voice_id = os.getenv("ELEVEN_VOICE_ID")
    if not api_key or not voice_id:
        raise HTTPException(400, "ElevenLabs not configured")

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {"xi-api-key": api_key, "Content-Type": "application/json", "Accept": "audio/mpeg"}
    payload = {"text": text, "model_id": "eleven_monolingual_v1",
               "voice_settings": {"stability": 0.5, "similarity_boost": 0.7}}
    async with httpx.AsyncClient(timeout=45.0) as client:
        r = await client.post(url, headers=headers, json=payload)
        r.raise_for_status()
        return Response(content=r.content, media_type="audio/mpeg")
