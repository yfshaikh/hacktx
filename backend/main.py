# backend/main.py
from dotenv import load_dotenv
load_dotenv()  # load env before any route/auth imports

from fastapi import FastAPI, HTTPException, Request, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import os

# Supabase (dev-safe; returns None if not configured in DEV_MODE)
from utils.initialize_supabase import get_supabase_client

# Routers
from routes.eleven_routes import eleven_router

# -----------------------------------------------------------------------------
# Logging
# -----------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("toyota-finance-coach")

# -----------------------------------------------------------------------------
# App
# -----------------------------------------------------------------------------
app = FastAPI(
    title="Toyota Finance Coach API",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

# -----------------------------------------------------------------------------
# CORS
# -----------------------------------------------------------------------------
allowed = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in allowed],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "User-Agent", "X-Requested-With"],
)

# -----------------------------------------------------------------------------
# Supabase (optional in dev)
# -----------------------------------------------------------------------------
try:
    supabase = get_supabase_client()
    app.state.supabase = supabase  # available via request.app.state.supabase
    logger.info("✅ Supabase client initialized successfully")
except Exception as e:
    logger.warning(f"⚠️  Supabase not initialized (dev mode?): {e}")
    app.state.supabase = None

# -----------------------------------------------------------------------------
# Routers
# -----------------------------------------------------------------------------
api = APIRouter(prefix="/api")

# ElevenLabs routes under /api/eleven
api.include_router(eleven_router, tags=["eleven"])

# ML routes under /api/ml
from routes.ml_routes import ml_router
api.include_router(ml_router, tags=["ml"])

from routes.voice_routes import voice_router
api.include_router(voice_router, tags=["voice"])

from routes.plan_routes import plan_router
api.include_router(plan_router, tags=["plan"])

from routes.calc_routes import calc_router
api.include_router(calc_router, tags=["calc"])

from routes.advice_routes import advice_router
api.include_router(advice_router, tags=["advice"])

from routes.inventory_routes import inventory_router
api.include_router(inventory_router, tags=["inventory"])

from routes.coach_routes import coach_router
api.include_router(coach_router, tags=["coach"])

from routes.nessie_routes import nessie_router
api.include_router(nessie_router, tags=["nessie"])

from routes.events_routes import events_router
api.include_router(events_router, tags=["events"])

from routes.optimize_routes import optimize_router
api.include_router(optimize_router, tags=["optimize"])

from routes.share_routes import share_router
api.include_router(share_router, tags=["share"])


# Debug router (define BEFORE mounting `api`)
debug = APIRouter(prefix="/debug")

@debug.get("/env")
def debug_env():
    def mask(v: str | None):
        if not v:
            return None
        if len(v) <= 8:
            return "***"
        return v[:4] + "…" + v[-4:]
    return {
        "ALLOWED_ORIGINS": os.getenv("ALLOWED_ORIGINS"),
        "SUPABASE_URL": os.getenv("SUPABASE_URL"),
        "SUPABASE_KEY": mask(os.getenv("SUPABASE_KEY")),
        "SUPABASE_JWT_SECRET": mask(os.getenv("SUPABASE_JWT_SECRET")),
        "ELEVEN_API_KEY": mask(os.getenv("ELEVEN_API_KEY")),
        "ELEVEN_VOICE_ID": mask(os.getenv("ELEVEN_VOICE_ID")),
    }

from fastapi.routing import APIRoute

@debug.get("/routes")
def list_routes():
    return sorted([r.path for r in app.routes if isinstance(r, APIRoute)])


# mount debug under /api
api.include_router(debug, tags=["debug"])

# finally mount the api router on the app
app.include_router(api)

# -----------------------------------------------------------------------------
# Health
# -----------------------------------------------------------------------------
@app.get("/")
async def root():
    return {
        "message": "FastAPI is running",
        "status": "healthy",
        "supabase": bool(app.state.supabase),
        "version": "1.0.0",
    }

# -----------------------------------------------------------------------------
# Error handling
# -----------------------------------------------------------------------------
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "path": request.url.path,
        },
    )

# -----------------------------------------------------------------------------
# Dev entrypoint
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
