from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from pydantic import BaseModel
import logging
from utils.supabase_auth import get_current_user, CurrentUser
# from utils.initialize_supabase import get_supabase_client
from typing import Annotated, Optional, List, Dict, Any
import uuid
import json
import httpx
import os

logger = logging.getLogger(__name__)

# Create router for admin routes
eleven_router = APIRouter(prefix="/eleven", tags=["eleven"])

class SignedUrlResponse(BaseModel):
    signedUrl: str

@eleven_router.get("/get-signed-url", response_model=SignedUrlResponse)
async def get_signed_url():
    """
    Get a signed URL for ElevenLabs agent authentication
    """
    try:
        # Get environment variables
        api_key = os.getenv("ELEVENLABS_API_KEY")
        agent_id = os.getenv("ELEVENLABS_AGENT_ID")
        
        if not api_key:
            logger.error("ELEVENLABS_API_KEY not found in environment variables")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="ElevenLabs API key not configured"
            )
        
        if not agent_id:
            logger.error("ELEVENLABS_AGENT_ID not found in environment variables")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="ElevenLabs agent ID not configured"
            )
        
        # Make request to ElevenLabs API
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id={agent_id}",
                headers={
                    "xi-api-key": api_key,
                }
            )
            
            if response.status_code != 200:
                logger.error(f"ElevenLabs API request failed: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to get signed URL from ElevenLabs"
                )
            
            data = response.json()
            signed_url = data.get("signed_url")
            
            if not signed_url:
                logger.error("No signed_url in ElevenLabs API response")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Invalid response from ElevenLabs API"
                )
            
            logger.info("Successfully generated signed URL")
            return SignedUrlResponse(signedUrl=signed_url)
            
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Unexpected error getting signed URL: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate signed URL"
        )
