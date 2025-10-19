from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from pydantic import BaseModel
import logging
from utils.supabase_auth import get_current_user, CurrentUser
from utils.initialize_supabase import get_supabase_client
from typing import Annotated, Optional, List, Dict, Any
import uuid
import json

logger = logging.getLogger(__name__)

# Create router for admin routes
eleven_router = APIRouter(prefix="/eleven", tags=["eleven"])
