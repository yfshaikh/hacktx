"""
Server-side tools for the ElevenLabs voice agent
These tools can be called by the agent to fetch data
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.initialize_supabase import get_supabase_client
from typing import Optional
import json

router = APIRouter(prefix="/api/agent-tools", tags=["agent-tools"])


class SearchCarRequest(BaseModel):
    make: str
    model: str
    year: Optional[str] = None
    fuelType: Optional[str] = None  # e.g., "Regular", "Gasoline or E85", "Regular Gas and Electricity"
    drive: Optional[str] = None  # e.g., "Front-Wheel Drive", "All-Wheel Drive", "4-Wheel Drive"
    minMpg: Optional[int] = None  # Minimum combined MPG
    maxPrice: Optional[int] = None  # Maximum MSRP


@router.post("/search-car")
async def search_car_tool(request: SearchCarRequest):
    """
    Server-side tool for voice agent to search for a car by make/model
    Returns JSON string ready to be passed to displayCarInfo client tool
    
    Searches scraped_cars table which has real photos from cars.com
    This is called by ElevenLabs as a server tool, then the agent can
    pass the result to the displayCarInfo client tool to show the UI
    """
    try:
        supabase = get_supabase_client()
        
        # Import the formatting function from car_routes
        from .car_routes import format_scraped_car
        
        # Search scraped_cars table (has real images from cars.com)
        query = supabase.table('scraped_cars').select('*')
        query = query.ilike('make', request.make)
        query = query.ilike('name', f'%{request.model}%')
        
        if request.year:
            query = query.eq('year', int(request.year))
        
        # Note: Can add filters for scraped data if needed
        # For now, just get the first match
        result = query.order('year', desc=True).limit(1).execute()
        
        if not result.data or len(result.data) == 0:
            return {
                "success": False,
                "error": f"No vehicle found matching {request.make} {request.model}" + (f" {request.year}" if request.year else ""),
                "carData": None
            }
        
        vehicle = result.data[0]
        formatted_vehicle = format_scraped_car(vehicle)
        
        # Return as JSON string for the agent to pass to client tool
        return {
            "success": True,
            "carData": json.dumps(formatted_vehicle),
            "message": f"Found {formatted_vehicle.get('year')} {formatted_vehicle.get('make')} {formatted_vehicle.get('model')}. Displaying with real photos."
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": f"Error searching vehicle: {str(e)}",
            "carData": None
        }



