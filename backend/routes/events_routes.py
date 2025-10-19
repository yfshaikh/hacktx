# helps demo ("we're measuring engagement") and gives FE a drop-in place to log events. 
# keeping in-mem so it's trivial.

# backend/routes/events_routes.py
from fastapi import APIRouter, Request
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional
import time

events_router = APIRouter(prefix="/events")  # <-- NAME MUST MATCH THE IMPORT

# super simple in-memory store (per-process)
_EVENTS: List[Dict[str, Any]] = []

class TrackEventIn(BaseModel):
    name: str = Field(..., max_length=64)        # e.g., "quote_viewed"
    props: Dict[str, Any] = {}                   # arbitrary payload
    user_id: Optional[str] = None                # optional
    session_id: Optional[str] = None

@events_router.post("/track")
async def track(ev: TrackEventIn, request: Request):
    _EVENTS.append({
        "ts": time.time(),
        "name": ev.name,
        "props": ev.props,
        "user_id": ev.user_id,
        "session_id": ev.session_id,
        "ip": request.client.host if request.client else None,
        "ua": request.headers.get("user-agent"),
    })
    # keep last 2k events
    if len(_EVENTS) > 2000:
        del _EVENTS[:-2000]
    return {"ok": True, "count": len(_EVENTS)}

@events_router.get("/recent")
async def recent(limit: int = 50):
    limit = max(1, min(limit, 200))
    return list(reversed(_EVENTS))[:limit]
