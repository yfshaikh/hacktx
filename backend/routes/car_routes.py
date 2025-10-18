"""
Car lookup routes for voice agent
Provides simple make/model lookup without recommendation engine
"""
from fastapi import APIRouter, HTTPException
from utils.initialize_supabase import get_supabase_client
from typing import Optional
import json

router = APIRouter(prefix="/api/cars", tags=["cars"])

@router.get("/search")
async def search_car_by_make_model(make: str, model: str, year: Optional[str] = None):
    """
    Search for a vehicle by make and model (optionally year)
    Returns vehicle data formatted for displayCarInfo client tool
    """
    try:
        supabase = get_supabase_client()
        
        # Build query
        query = supabase.table('vehicles').select('*')
        
        # Case-insensitive search
        query = query.ilike('make', make)
        query = query.ilike('model', model)
        
        if year:
            query = query.eq('year', year)
        
        # Get the first match, ordered by year descending (newest first)
        result = query.order('year', desc=True).limit(1).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=404, 
                detail=f"No vehicle found matching {make} {model}" + (f" {year}" if year else "")
            )
        
        vehicle = result.data[0]
        
        # Format for client tool (simplified - no scoring needed)
        formatted_vehicle = {
            "id": vehicle.get("id"),
            "vehicleId": vehicle.get("id"),
            "make": vehicle.get("make"),
            "model": vehicle.get("model"),
            "year": vehicle.get("year"),
            "msrp": vehicle.get("msrp"),
            "fuelType": vehicle.get("fuelType") or vehicle.get("Fuel Type"),
            "transmission": vehicle.get("transmission"),
            "colorCodes": vehicle.get("colorCodes") or vehicle.get("color_codes"),
            "colorHexCodes": vehicle.get("colorHexCodes") or vehicle.get("color_hex_codes"),
            "colorNames": vehicle.get("colorNames") or vehicle.get("color_names"),
            "modelTag": vehicle.get("modelTag") or vehicle.get("model_tag"),
            "modelGrade": vehicle.get("modelGrade") or vehicle.get("model_grade"),
            "imageCount": vehicle.get("imageCount") or vehicle.get("image_count"),
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
            # Default scores since we're not using recommendation engine
            "totalScore": 85,
            "confidenceScore": 90,
            "factors": {
                "vehicleTypeMatch": 85,
                "priceCompatibility": 85,
                "featureAlignment": 85,
                "passengerFit": 85,
                "fuelTypeMatch": 85,
                "usageCompatibility": 85,
                "locationFactor": 90,
            },
            "metadata": {
                "matchingFeatures": get_vehicle_features(vehicle),
                "missingFeatures": [],
                "featureNotes": [
                    f"Fuel-efficient {vehicle.get('fuelType', 'vehicle')}",
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
        
        return formatted_vehicle
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching vehicle: {str(e)}")


@router.get("/{vehicle_id}")
async def get_vehicle_by_id(vehicle_id: str):
    """
    Get a specific vehicle by ID
    """
    try:
        supabase = get_supabase_client()
        result = supabase.table('vehicles').select('*').eq('id', vehicle_id).single().execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        return result.data
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching vehicle: {str(e)}")


def get_vehicle_features(vehicle: dict) -> list[str]:
    """
    Extract key features from vehicle data
    """
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
    ])
    
    return features


def extract_passenger_capacity(vehicle: dict) -> int:
    """
    Try to extract passenger capacity from vehicle data
    """
    # Check various passenger volume fields
    for field in ["4-door passenger volume", "2-door passenger volume", 
                  "Hatchback passenger volume"]:
        if vehicle.get(field):
            # Most passenger volumes indicate capacity
            # This is a simplification - adjust based on your data
            return 5  # Default for most cars
    
    # Default to 5 passengers
    return 5

