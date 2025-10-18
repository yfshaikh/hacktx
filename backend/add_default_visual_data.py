"""
Add default modelTag, modelGrade, and color codes for vehicles that don't have them
This uses common defaults to try to make Toyota CDN URLs work
"""
from utils.initialize_supabase import get_supabase_client

# Common defaults for Toyota models
DEFAULT_MODEL_TAG = "1000"  # Generic tag
DEFAULT_MODEL_GRADE = "le"  # Most common trim
DEFAULT_COLORS = "FFFFFF, 000000, 1D1D1D, 8A8D8F"  # White, Black, Dark Gray, Silver
DEFAULT_IMAGE_COUNT = 36

# Model-specific overrides (based on common configurations)
MODEL_GRADES = {
    "camry": "le, se, xle, xse",
    "corolla": "le, se, xle",
    "rav4": "le, xle, limited",
    "highlander": "le, xle, limited",
    "tacoma": "sr, sr5, trd",
    "tundra": "sr, sr5, limited",
    "prius": "le, xle",
    "4runner": "sr5, trd",
    "sienna": "le, xle",
}

def add_default_visual_data():
    print("🎨 Adding default visual data for vehicles without it...\n")
    
    supabase = get_supabase_client()
    
    # Get vehicles without visual data
    result = supabase.table('vehicles').select('*').execute()
    vehicles = result.data
    
    needs_update = [v for v in vehicles if not v.get('modelTag') or not v.get('colorHexCodes')]
    
    print(f"📊 Found {len(needs_update)} vehicles needing default visual data\n")
    
    response = input("⚠️  This will add DEFAULT/GUESSED visual data to vehicles.\n"
                    "   The 360° spinner MIGHT work, but images might be wrong/missing.\n"
                    "   Continue? (yes/no): ")
    
    if response.lower() != 'yes':
        print("❌ Aborted")
        return
    
    updated = 0
    
    for vehicle in needs_update:
        model_lower = vehicle.get('model', '').split()[0].lower()
        grade = MODEL_GRADES.get(model_lower, DEFAULT_MODEL_GRADE)
        
        try:
            supabase.table('vehicles').update({
                'modelTag': DEFAULT_MODEL_TAG,
                'modelGrade': grade,
                'colorHexCodes': DEFAULT_COLORS,
                'imageCount': DEFAULT_IMAGE_COUNT,
            }).eq('id', vehicle['id']).execute()
            
            updated += 1
            if updated <= 10:
                print(f"  ✅ {vehicle['year']} {vehicle['model']}: grade={grade}")
        except Exception as e:
            print(f"  ❌ Error: {e}")
    
    print(f"\n✅ Updated {updated} vehicles with default visual data")
    print(f"\n⚠️  WARNING: These are GUESSED values!")
    print(f"   - 360° spinner might not load correctly")
    print(f"   - Colors might be wrong")
    print(f"   - modelTag/grade might not match Toyota's CDN")
    print(f"\n💡 For accurate data, you'd need to scrape Toyota's website")

if __name__ == "__main__":
    add_default_visual_data()

