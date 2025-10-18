from fastapi import HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from typing import Optional, Dict, Any
import logging
import os
from dotenv import load_dotenv

load_dotenv()

# Set up logging
logger = logging.getLogger(__name__)

# Supabase JWT configuration
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
if not SUPABASE_JWT_SECRET:
    logger.error("❌ SUPABASE_JWT_SECRET environment variable is required")
    raise ValueError("SUPABASE_JWT_SECRET environment variable is required")

JWT_ALGORITHM = "HS256"
JWT_AUDIENCE = "authenticated"

# Set up HTTP Bearer token extraction
security = HTTPBearer()

class CurrentUser:
    """User info extracted from Supabase JWT token"""
    def __init__(self, uid: str, email: str, phone: str = None, role: str = "authenticated", aud: str = "authenticated", user_role: str = "student", **kwargs):
        self.uid = uid
        self.sub = uid  # JWT standard field
        self.email = email
        self.phone = phone
        self.role = role
        self.aud = aud
        self.raw_claims = kwargs
        self.user_role = user_role

    def __str__(self):
        return f"User({self.email}, role={self.user_role})"

def verify_supabase_jwt(token: str) -> Dict[str, Any]:
    """
    Verify Supabase JWT token locally using the JWT secret
    Returns the decoded payload if valid
    """
    try:
        # Decode and verify the JWT token
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            audience=JWT_AUDIENCE,
            options={"verify_exp": True, "verify_aud": True}
        )
        
        logger.debug(f"Successfully verified JWT for user: {payload.get('email', 'unknown')}")
        
        # Log detailed user information from JWT payload
        user_info = {
            'uid': payload.get('sub'),
            'email': payload.get('email'),
            'phone': payload.get('phone'),
            'user_role': payload.get('user_role', 'student'),
            'role': payload.get('role', payload.get('aud', 'authenticated')),
            'aud': payload.get('aud'),
            'exp': payload.get('exp'),
            'iat': payload.get('iat')
        }
        logger.info(f"User login - JWT payload info: {user_info}")
        
        return payload
        
    except ExpiredSignatureError:
        logger.warning("JWT token has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except InvalidTokenError as e:
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

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> CurrentUser:
    """
    Dependency to get current authenticated user from Supabase JWT token
    """
    try:
        # Verify token
        payload = verify_supabase_jwt(credentials.credentials)
        
        # Extract user info from JWT payload
        # Remove keys that are explicitly passed to avoid conflicts
        filtered_payload = {k: v for k, v in payload.items() 
                          if k not in ['sub', 'email', 'phone', 'user_role', 'role', 'aud']}
        
        user = CurrentUser(
            uid=payload.get('sub'),  # User ID
            email=payload.get('email', ''),
            phone=payload.get('phone'),
            user_role=payload.get('user_role', "student"),  # Custom claim for role
            role=payload.get('role', payload.get('aud', 'authenticated')),  # Role or audience
            aud=payload.get('aud', 'authenticated'),
            **filtered_payload  # Include remaining claims without conflicts
        )
        
        logger.info(f"Authenticated user: {user}")
        return user
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error extracting user from token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

