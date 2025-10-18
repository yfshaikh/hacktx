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


@router.post("/search-car")
async def search_car_tool(request: SearchCarRequest):
    """
    Server-side tool for voice agent to search for a car by make/model
    Returns JSON string ready to be passed to displayCarInfo client tool
    
    This is called by ElevenLabs as a server tool, then the agent can
    pass the result to the displayCarInfo client tool to show the UI
    """
    try:
        supabase = get_supabase_client()
        
        # Build query
        query = supabase.table('vehicles').select('*')
        
        # Case-insensitive search
        query = query.ilike('make', request.make)
        query = query.ilike('model', request.model)
        
        if request.year:
            query = query.eq('year', request.year)
        
        # Get the first match, ordered by year descending (newest first)
        result = query.order('year', desc=True).limit(1).execute()
        
        if not result.data or len(result.data) == 0:
            return {
                "success": False,
                "error": f"No vehicle found matching {request.make} {request.model}" + (f" {request.year}" if request.year else ""),
                "carData": None
            }
        
        vehicle = result.data[0]
        
        # Format for client tool
        formatted_vehicle = {
            "id": vehicle.get("id"),
            "vehicleId": vehicle.get("id"),
            "make": vehicle.get("make"),
            "model": vehicle.get("model"),
            "year": vehicle.get("year"),
            "msrp": vehicle.get("msrp"),
            "fuelType": vehicle.get("fuelType") or vehicle.get("Fuel Type"),
            "transmission": vehicle.get("transmission"),
            "colorCodes": vehicle.get("color_codes"),
            "colorHexCodes": vehicle.get("color_hex_codes"),
            "colorNames": vehicle.get("color_names"),
            "modelTag": vehicle.get("model_tag"),
            "modelGrade": vehicle.get("model_grade"),
            "imageCount": vehicle.get("image_count"),
            "url": vehicle.get("url"),
            # Additional fields
            "cylinders": vehicle.get("cylinders"),
            "engineDisplacement": vehicle.get("Engine displacement"),
            "drive": vehicle.get("drive"),
            "vehicleSizeClass": vehicle.get("Vehicle Size Class"),
            "cityMpgForFuelType1": vehicle.get("City Mpg For Fuel Type1"),
            "combinedMpgForFuelType1": vehicle.get("Combined Mpg For Fuel Type1"),
            "highwayMpgForFuelType1": vehicle.get("Highway Mpg For Fuel Type1"),
            "has3D": vehicle.get("has3D"),
            # Default scores
            "totalScore": 88,
            "confidenceScore": 92,
            "factors": {
                "vehicleTypeMatch": 90,
                "priceCompatibility": 85,
                "featureAlignment": 88,
                "passengerFit": 90,
                "fuelTypeMatch": 95,
                "usageCompatibility": 85,
                "locationFactor": 90,
            },
            "metadata": {
                "matchingFeatures": get_vehicle_features(vehicle),
                "missingFeatures": [],
                "featureNotes": [
                    f"Fuel-efficient {vehicle.get('fuelType') or vehicle.get('Fuel Type', 'vehicle')}",
                    f"{vehicle.get('Vehicle Size Class', 'Standard')} size class"
                ],
                "priceAnalysis": {
                    "isWithinBudget": True,
                    "percentageFromBudget": 0,
                },
                "passengerAnalysis": {
                    "actualCapacity": extract_passenger_capacity(vehicle),
                    "configuration": "Standard",
                    "notes": "Comfortable seating"
                },
                "usageAnalysis": ["Daily commuting", "Family trips"],
            },
        }
        
        # Return as JSON string for the agent to pass to client tool
        return {
            "success": True,
            "carData": json.dumps(formatted_vehicle),
            "message": f"Found {vehicle.get('year')} {vehicle.get('make')} {vehicle.get('model')}. Use displayCarInfo to show details."
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": f"Error searching vehicle: {str(e)}",
            "carData": None
        }


def get_vehicle_features(vehicle: dict) -> list[str]:
    """Extract key features from vehicle data"""
    features = []
    
    # Add fuel type as feature
    fuel_type = vehicle.get("fuelType") or vehicle.get("Fuel Type")
    if fuel_type:
        if "hybrid" in fuel_type.lower():
            features.append("Hybrid Technology")
        elif "electric" in fuel_type.lower():
            features.append("Electric Vehicle")
        elif "plugin" in fuel_type.lower():
            features.append("Plug-in Hybrid")
    
    # Add MPG features if good
    combined_mpg = vehicle.get("Combined Mpg For Fuel Type1")
    if combined_mpg and combined_mpg > 30:
        features.append("Excellent Fuel Economy")
    elif combined_mpg and combined_mpg > 25:
        features.append("Good Fuel Economy")
    
    # Add size class
    size_class = vehicle.get("Vehicle Size Class")
    if size_class:
        features.append(f"{size_class} Vehicle")
    
    # Add transmission
    transmission = vehicle.get("transmission")
    if transmission:
        features.append(f"{transmission} Transmission")
    
    # Add safety features (default for modern vehicles)
    features.extend([
        "Advanced Safety Features",
        "Modern Technology Package",
        "Climate Control",
        "Infotainment System",
    ])
    
    return features


def extract_passenger_capacity(vehicle: dict) -> int:
    """Try to extract passenger capacity from vehicle data"""
    # Check various passenger volume fields
    for field in ["4-door passenger volume", "2-door passenger volume", 
                  "Hatchback passenger volume"]:
        if vehicle.get(field):
            return 5  # Default for most cars
    
    # Default to 5 passengers
    return 5

