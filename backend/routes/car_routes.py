"""
Car lookup routes for voice agent
Provides simple make/model lookup without recommendation engine
Uses scraped_cars table with real photos from cars.com
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
    All vehicles have real images from cars.com
    """
    try:
        supabase = get_supabase_client()
        
        # Search scraped_cars table
        query = supabase.table('scraped_cars').select('*')
        query = query.ilike('make', make)
        query = query.ilike('name', f'%{model}%')
        
        if year:
            query = query.eq('year', int(year))
        
        result = query.order('year', desc=True).limit(1).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=404, 
                detail=f"No vehicle found matching {make} {model}" + (f" {year}" if year else "")
            )
        
        vehicle = result.data[0]
        return format_scraped_car(vehicle)
    
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
        result = supabase.table('scraped_cars').select('*').eq('id', vehicle_id).single().execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        return format_scraped_car(result.data)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching vehicle: {str(e)}")




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
    
    # Check additional_specs for seating_capacity (scraped data)
    additional_specs = vehicle.get("additional_specs")
    if additional_specs:
        try:
            specs = json.loads(additional_specs) if isinstance(additional_specs, str) else additional_specs
            if specs.get("seating_capacity"):
                return int(specs["seating_capacity"])
        except (json.JSONDecodeError, ValueError):
            pass
    
    # Default to 5 passengers
    return 5


def format_scraped_car(vehicle: dict) -> dict:
    """
    Format a vehicle from scraped_cars table for the frontend
    This includes parsing JSON fields and extracting specs
    """
    # Parse images JSON
    images = {}
    if vehicle.get("images"):
        try:
            images = json.loads(vehicle["images"]) if isinstance(vehicle["images"], str) else vehicle["images"]
        except json.JSONDecodeError:
            images = {}
    
    # Parse additional_specs JSON
    additional_specs = {}
    if vehicle.get("additional_specs"):
        try:
            additional_specs = json.loads(vehicle["additional_specs"]) if isinstance(vehicle["additional_specs"], str) else vehicle["additional_specs"]
        except json.JSONDecodeError:
            additional_specs = {}
    
    # Extract MPG from additional_specs or direct fields
    combined_mpg = additional_specs.get("combined_mpg") or vehicle.get("mpg")
    
    formatted_vehicle = {
        "id": vehicle.get("id"),
        "vehicleId": vehicle.get("id"),
        "make": vehicle.get("make", "toyota").title(),
        "model": vehicle.get("name"),
        "year": str(vehicle.get("year")),
        "msrp": vehicle.get("price"),
        "fuelType": additional_specs.get("fuel_type", "Gasoline"),
        "transmission": additional_specs.get("transmission", "Automatic"),
        # Scraped images - real photos from cars.com
        "images": images,
        "imageType": "scraped",
        "imageCount": len(images) if images else 0,
        "url": vehicle.get("source_url"),
        # Additional fields from scraped data
        "horsepower": vehicle.get("horsepower") or additional_specs.get("horsepower"),
        "seatingCapacity": vehicle.get("seating_capacity") or additional_specs.get("seating_capacity", "5"),
        "cargoSpace": vehicle.get("cargo_space") or additional_specs.get("cargo_space"),
        "towingCapacity": vehicle.get("towing_capacity") or additional_specs.get("towing_capacity"),
        "fuelTankCapacity": vehicle.get("fuel_tank_capacity") or additional_specs.get("fuel_tank_capacity"),
        "curbWeight": vehicle.get("curb_weight") or additional_specs.get("curb_weight"),
        "groundClearance": vehicle.get("ground_clearance") or additional_specs.get("ground_clearance"),
        "dimensions": additional_specs.get("dimensions"),
        "bodyStyle": additional_specs.get("body_style"),
        "drivetrain": additional_specs.get("drivetrain"),
        "combinedMpgForFuelType1": combined_mpg,
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
            "matchingFeatures": get_scraped_car_features(vehicle, additional_specs),
            "missingFeatures": [],
            "featureNotes": [
                f"{additional_specs.get('body_style', 'Vehicle')} with {additional_specs.get('drivetrain', 'standard drivetrain')}",
                f"{combined_mpg or 'Standard'} MPG combined"
            ],
            "priceAnalysis": {
                "isWithinBudget": True,
                "percentageFromBudget": 0,
            },
            "passengerAnalysis": {
                "actualCapacity": int(additional_specs.get("seating_capacity", 5)),
                "configuration": "Standard",
                "notes": f"Seats {additional_specs.get('seating_capacity', '5')} passengers comfortably"
            },
            "usageAnalysis": ["Daily commuting", "Family trips"],
        },
    }
    
    return formatted_vehicle
    

def get_scraped_car_features(vehicle: dict, additional_specs: dict) -> list[str]:
    """
    Extract key features from scraped car data
    """
    features = []
    
    # Add body style
    body_style = additional_specs.get("body_style")
    if body_style:
        features.append(f"{body_style} Body Style")
    
    # Add drivetrain
    drivetrain = additional_specs.get("drivetrain")
    if drivetrain:
        features.append(drivetrain)
    
    # Add MPG features if good
    combined_mpg = additional_specs.get("combined_mpg")
    if combined_mpg:
        try:
            mpg_val = int(combined_mpg)
            if mpg_val > 30:
                features.append("Excellent Fuel Economy")
            elif mpg_val > 25:
                features.append("Good Fuel Economy")
        except ValueError:
            pass
    
    # Add seating capacity
    seating = additional_specs.get("seating_capacity")
    if seating:
        features.append(f"Seats {seating} Passengers")
    
    # Add horsepower if available
    horsepower = vehicle.get("horsepower") or additional_specs.get("horsepower")
    if horsepower:
        features.append(f"{horsepower} Horsepower")
    
    # Add standard features
    features.extend([
        "Advanced Safety Features",
        "Modern Technology Package",
        "Climate Control",
        "Infotainment System",
    ])
    
    return features

