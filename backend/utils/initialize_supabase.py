# backend/utils/initialize_supabase.py
import os
from dotenv import load_dotenv

def get_supabase_client():
    # load env at call time to avoid import-order issues
    load_dotenv()
    dev_mode = os.getenv("DEV_MODE", "1") == "1"

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")

    if not url or not key:
        # In dev, don't crash the server — just return None
        if dev_mode:
            return None
        # In prod, enforce env presence
        raise ValueError("SUPABASE_URL and SUPABASE_KEY environment variables are required")

    # Import only when actually needed (avoids dependency errors in dev)
    from supabase import create_client  # type: ignore
    return create_client(url, key)
