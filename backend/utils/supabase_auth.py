from __future__ import annotations
import os
import logging
from typing import Any, Dict, Optional

from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from dotenv import load_dotenv

import jwt
from jwt import InvalidTokenError, ExpiredSignatureError

load_dotenv()
logger = logging.getLogger(__name__)

# ---- Config ----
DEV_MODE: bool = os.getenv("DEV_MODE", "1") == "1"  # default ON for hackathon
SUPABASE_JWT_SECRET: Optional[str] = os.getenv("SUPABASE_JWT_SECRET")

JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
# Some Supabase tokens include aud="authenticated"; make audience optional
JWT_AUDIENCE: Optional[str] = os.getenv("JWT_AUDIENCE")  # e.g., "authenticated"

# Don’t auto-error so we can handle missing headers ourselves
security = HTTPBearer(auto_error=False)

# ---- Model ----
class CurrentUser(BaseModel):
    uid: str
    email: str
    phone: Optional[str] = None
    role: str = "authenticated"
    aud: Optional[str] = "authenticated"
    user_role: str = "student"
    raw_claims: Dict[str, Any] = {}

    def __str__(self) -> str:
        return f"User({self.email}, role={self.user_role})"

# ---- Verify helper ----
def verify_supabase_jwt(token: str) -> Dict[str, Any]:
    """
    Verify Supabase JWT token locally.
    Audience is optional: we try with audience first, then without.
    """
    if not SUPABASE_JWT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Server missing SUPABASE_JWT_SECRET",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # First attempt: with aud if provided
    try:
        return jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            audience=JWT_AUDIENCE if JWT_AUDIENCE else None,
            options={"verify_exp": True, "verify_aud": bool(JWT_AUDIENCE)},
        )
    except ExpiredSignatureError:
        logger.warning("JWT token has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except InvalidTokenError as e:
        # If audience was required and failed, try once more without aud
        if JWT_AUDIENCE:
            try:
                return jwt.decode(
                    token,
                    SUPABASE_JWT_SECRET,
                    algorithms=[JWT_ALGORITHM],
                    options={"verify_exp": True, "verify_aud": False},
                )
            except Exception:
                logger.warning(f"Invalid JWT token (after no-aud retry): {e}")
        else:
            logger.warning(f"Invalid JWT token: {e}")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Unexpected error verifying JWT: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token verification failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

# ---- Dependency ----
async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> CurrentUser:
    """
    FastAPI dependency to get the authenticated user.
    In DEV_MODE or when SUPABASE_JWT_SECRET is absent, returns a dummy user.
    """
    # Dev bypass: no header needed
    if DEV_MODE or not SUPABASE_JWT_SECRET:
        return CurrentUser(uid="dev-user", email="dev@example.com")

    if credentials is None or not credentials.scheme.lower() == "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_supabase_jwt(credentials.credentials)

    filtered_payload = {
        k: v for k, v in payload.items()
        if k not in {"sub", "email", "phone", "user_role", "role", "aud"}
    }

    user = CurrentUser(
        uid=str(payload.get("sub")),
        email=str(payload.get("email", "")),
        phone=payload.get("phone"),
        user_role=str(payload.get("user_role", "student")),
        role=str(payload.get("role", payload.get("aud", "authenticated"))),
        aud=payload.get("aud", "authenticated"),
        raw_claims=filtered_payload,
    )
    logger.info(f"Authenticated user: {user}")
    return user
