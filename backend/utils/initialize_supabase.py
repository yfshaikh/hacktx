import os
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# Supabase configuration
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

if not url or not key:
    logger.error("❌ SUPABASE_URL and SUPABASE_KEY environment variables are required")
    raise ValueError("SUPABASE_URL and SUPABASE_KEY environment variables are required")

supabase: Client = create_client(url, key)

def get_supabase_client() -> Client:
    """Get Supabase client instance"""
    return supabase