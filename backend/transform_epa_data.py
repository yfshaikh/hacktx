"""
Transform EPA data format to match tamuhack-25 schema
EPA uses abbreviated names (city08, UCity) while tamuhack uses verbose names
"""
import json
from pathlib import Path

def transform_epa_to_tamuhack_format():
    print("🔄 Transforming EPA data to tamuhack-25 format...")
    
    input_path = Path(__file__).parent / "toyota_vehicles_filtered.json"
    output_path = Path(__file__).parent / "toyota_vehicles_transformed.json"
    
    with open(input_path, 'r') as f:
        epa_vehicles = json.load(f)
    
    print(f"📊 Transforming {len(epa_vehicles)} vehicles...")
    
    transformed = []
    
    # EPA to tamuhack field mapping (based on comparing EPA docs with your recs.json)
    for vehicle in epa_vehicles:
        transformed_vehicle = {
            # Basic info
            "id": vehicle.get("id"),
            "make": vehicle.get("make"),
            "model": vehicle.get("model"),
            "year": vehicle.get("year"),
            "basemodel": vehicle.get("model"),  # EPA doesn't have separate basemodel
            
            # Fuel consumption
            "annualPetroleumConsumptionForFuelType1": safe_float(vehicle.get("barrels08")),
            "annualPetroleumConsumptionForFuelType2": safe_float(vehicle.get("barrelsA08")),
            
            # Charging times
            "timeToChargeAt120V": safe_float(vehicle.get("charge120")),
            "timeToChargeAt240V": safe_float(vehicle.get("charge240")),
            
            # City MPG
            "cityMpgForFuelType1": safe_int(vehicle.get("city08")),
            "unroundedCityMpgForFuelType1 (2)": safe_float(vehicle.get("city08U")),
            "cityMpgForFuelType2": safe_int(vehicle.get("cityA08")),
            "unroundedCityMpgForFuelType2": safe_float(vehicle.get("cityA08U")),
            
            # City consumption
            "cityGasolineConsumption": safe_float(vehicle.get("cityCD")),
            "cityElectricityConsumption": safe_float(vehicle.get("cityE")),
            "epaCityUtilityFactor": safe_float(vehicle.get("cityUF")),
            
            # CO2
            "co2FuelType1": safe_int(vehicle.get("co2")),
            "co2FuelType2": safe_int(vehicle.get("co2A")),
            "co2TailpipeForFuelType1": safe_float(vehicle.get("co2TailpipeGpm")),
            "co2TailpipeForFuelType2": safe_float(vehicle.get("co2TailpipeAGpm")),
            
            # Combined MPG
            "combinedMpgForFuelType1": safe_int(vehicle.get("comb08")),
            "unroundedCombinedMpgForFuelType1": safe_float(vehicle.get("comb08U")),
            "combinedMpgForFuelType2": safe_int(vehicle.get("combA08")),
            "unroundedCombinedMpgForFuelType2": safe_float(vehicle.get("combA08U")),
            
            # Combined consumption
            "combinedElectricityConsumption": safe_float(vehicle.get("combE")),
            "combinedGasolineConsumption": 0,  # Not in EPA data
            "epaCombinedUtilityFactor": 0,  # Not in EPA data
            
            # Engine
            "cylinders": safe_int(vehicle.get("cylinders")),
            "engineDisplacement": safe_float(vehicle.get("displ")),
            "drive": vehicle.get("drive"),
            "engineDescriptor": vehicle.get("eng_dscr"),
            
            # EPA scores
            "epaFuelEconomyScore": str(vehicle.get("fuelCost08", "")),
            "epaModelTypeIndex": vehicle.get("id"),  # Using ID as index
            
            # Fuel costs
            "annualFuelCostForFuelType1": str(vehicle.get("fuelCost08", "")),
            "annualFuelCostForFuelType2": str(vehicle.get("fuelCostA08", "")),
            
            # Fuel type
            "fuelType": vehicle.get("fuelType"),
            "fuelType1": vehicle.get("fuelType1"),
            "fuelType2": vehicle.get("fuelType2"),
            
            # GHG scores
            "ghgScore": str(vehicle.get("ghgScore", "")),
            "ghgScoreAlternativeFuel": str(vehicle.get("ghgScoreA", "")),
            
            # Highway MPG
            "highwayMpgForFuelType1": str(vehicle.get("highway08", "")),
            "unroundedHighwayMpgForFuelType1": str(vehicle.get("highway08U", "")),
            "highwayMpgForFuelType2": str(vehicle.get("highwayA08", "")),
            "unroundedHighwayMpgForFuelType2": str(vehicle.get("highwayA08U", "")),
            
            # Highway consumption
            "highwayGasolineConsumption": str(vehicle.get("highwayCD", "0.0")),
            "highwayElectricityConsumption": str(vehicle.get("highwayE", "0.0")),
            "epaHighwayUtilityFactor": str(vehicle.get("highwayUF", "0.0")),
            
            # Luggage/Passenger volumes
            "hatchbackLuggageVolume": str(vehicle.get("hlv", "0")),
            "hatchbackPassengerVolume": str(vehicle.get("hpv", "0")),
            "2DoorLuggageVolume": str(vehicle.get("lv2", "0")),
            "4DoorLuggageVolume": str(vehicle.get("lv4", "0")),
            "2DoorPassengerVolume": str(vehicle.get("pv2", "0")),
            "4DoorPassengerVolume": str(vehicle.get("pv4", "0")),
            
            # Range
            "rangeForFuelType1": str(vehicle.get("range", "0")),
            "rangeCityForFuelType1": str(vehicle.get("rangeCity", "0.0")),
            "rangeCityForFuelType2": str(vehicle.get("rangeCityA", "0.0")),
            "rangeHighwayForFuelType1": str(vehicle.get("rangeHwy", "0.0")),
            "rangeHighwayForFuelType2": str(vehicle.get("rangeHwyA", "0.0")),
            "epaRangeForFuelType2": str(vehicle.get("rangeA", "0")),
            
            # Transmission
            "transmission": vehicle.get("trany"),
            "transmissionDescriptor": vehicle.get("trany"),
            
            # Unadjusted MPG
            "unadjustedCityMpgForFuelType1": str(vehicle.get("UCity", "0.0")),
            "unadjustedCityMpgForFuelType2": str(vehicle.get("UCityA", "0.0")),
            "unadjustedHighwayMpgForFuelType1": str(vehicle.get("UHighway", "0.0")),
            "unadjustedHighwayMpgForFuelType2": str(vehicle.get("UHighwayA", "0.0")),
            
            # Vehicle class
            "vehicleSizeClass": vehicle.get("VClass"),
            "atvType": vehicle.get("atvType"),
            
            # Other fields
            "mpgData": "Y" if vehicle.get("city08") else "N",
            "phevBlended": "true" if vehicle.get("phevBlended") == "true" else "false",
            "guzzler": vehicle.get("guzzler", ""),
            "startStop": vehicle.get("startStop", ""),
            "mfrCode": vehicle.get("mfrCode"),
            
            # Electric/Hybrid
            "electricMotor": vehicle.get("evMotor", ""),
            "phevCity": str(vehicle.get("phevCity", "0")),
            "phevHighway": str(vehicle.get("phevHwy", "0")),
            "phevCombined": str(vehicle.get("phevComb", "0")),
            
            # Charging
            "charge240B": str(vehicle.get("charge240b", "0.0")),
            "tCharger": vehicle.get("tCharger", ""),
            "sCharger": vehicle.get("sCharger", ""),
            
            # Pricing (EPA doesn't have this - set defaults)
            "msrp": None,  # Will need to add manually or from another source
            "youSave/spend": "0",
            
            # Visual data (EPA doesn't have this - would need Toyota API)
            "has3D": False,
            "colorNames": None,
            "colorCodes": None,
            "colorHexCodes": None,
            "modelGrade": None,
            "modelTag": None,
            "imageCount": 36,  # Default
            "url": None,
        }
        
        transformed.append(transformed_vehicle)
    
    # Save transformed data
    with open(output_path, 'w') as f:
        json.dump(transformed, f, indent=2)
    
    print(f"✅ Transformed {len(transformed)} vehicles")
    print(f"💾 Saved to: {output_path}")
    print(f"📝 File size: {output_path.stat().st_size / 1024:.1f} KB")
    print("\n⚠️  Note: EPA data doesn't include:")
    print("   - MSRP (pricing)")
    print("   - Color information")
    print("   - Toyota image data (modelTag, modelGrade)")
    print("   You'll need to merge with Toyota's website data for complete car display")
    
    return output_path

def safe_int(value):
    """Safely convert to int"""
    try:
        return int(float(value)) if value else 0
    except:
        return 0

def safe_float(value):
    """Safely convert to float"""
    try:
        return float(value) if value else 0.0
    except:
        return 0.0

if __name__ == "__main__":
    transform_epa_to_tamuhack_format()
    print("\n✅ Next: Run 'python load_vehicles_to_supabase.py' to load the transformed data")

