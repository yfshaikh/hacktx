# FE can now generate a URL like /quote?token=<token> and reconstruct the quote.

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict
import os, time, jwt

from routes.coach_routes import QuoteRequest

share_router = APIRouter(prefix="/share")

_SECRET = os.getenv("DEMO_SHARE_SECRET") or os.getenv("SUPABASE_JWT_SECRET") or "dev-secret"

class EncodeIn(BaseModel):
    request: QuoteRequest
    ttl_seconds: int = 60 * 60 * 24  # 24h default

@share_router.post("/encode")
def encode_quote(x: EncodeIn):
    payload = {
        "v": 1,
        "exp": int(time.time()) + int(x.ttl_seconds),
        "q": x.request.model_dump(),
    }
    token = jwt.encode(payload, _SECRET, algorithm="HS256")
    return {"token": token}

@share_router.get("/decode")
def decode_quote(token: str):
    try:
        data = jwt.decode(token, _SECRET, algorithms=["HS256"])
        return {"ok": True, "request": data.get("q"), "v": data.get("v")}
    except jwt.ExpiredSignatureError:
        raise HTTPException(400, "Link expired")
    except Exception:
        raise HTTPException(400, "Invalid token")