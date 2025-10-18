"""
Merge MSRP pricing data from tamuhack-25/recs.json into Supabase
The recs.json has pricing for 66 vehicles that we can add to our EPA data
"""
import json
import sys
from pathlib import Path
from utils.initialize_supabase import get_supabase_client

def merge_msrp_data():
    print("💰 Merging MSRP pricing data from recs.json...")
    
    # Path to the recs.json file
    recs_path = Path(__file__).parent.parent.parent / "tamuhack-25" / "recs.json"
    
    if not recs_path.exists():
        print(f"❌ Error: Could not find recs.json at {recs_path}")
        sys.exit(1)
    
    print(f"📂 Reading pricing from: {recs_path}")
    
    # Load the recommendations
    with open(recs_path, 'r') as f:
        recommendations = json.load(f)
    
    print(f"📊 Found {len(recommendations)} vehicle recommendations with pricing")
    
    # Extract MSRP data
    pricing_map = {}
    for rec in recommendations:
        vehicle = rec.get('vehicle', {})
        vehicle_id = vehicle.get('id')
        msrp = vehicle.get('msrp')
        
        if vehicle_id and msrp:
            pricing_map[str(vehicle_id)] = {
                'msrp': msrp,
                'make': vehicle.get('make'),
                'model': vehicle.get('model'),
                'year': vehicle.get('year'),
                # Also get visual data while we're at it
                'has3D': vehicle.get('has3D', False),
                'colorNames': vehicle.get('colorNames'),
                'colorCodes': vehicle.get('colorCodes') or vehicle.get('color_codes'),
                'colorHexCodes': vehicle.get('colorHexCodes') or vehicle.get('color_hex_codes'),
                'modelGrade': vehicle.get('modelGrade') or vehicle.get('model_grade'),
                'modelTag': vehicle.get('modelTag') or vehicle.get('model_tag'),
                'imageName': vehicle.get('imageName') or vehicle.get('image_name'),
                'imageCount': vehicle.get('imageCount') or vehicle.get('image_count'),
                'url': vehicle.get('url'),
            }
    
    print(f"💵 Extracted pricing for {len(pricing_map)} vehicles")
    
    # Show price range
    prices = [p['msrp'] for p in pricing_map.values() if p['msrp']]
    if prices:
        print(f"💰 Price range: ${min(prices):,} - ${max(prices):,}")
    
    # Connect to Supabase
    try:
        supabase = get_supabase_client()
        print("✅ Connected to Supabase")
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")
        sys.exit(1)
    
    # Update vehicles with pricing
    print(f"\n📤 Updating {len(pricing_map)} vehicles with MSRP and visual data...")
    
    updated = 0
    not_found = 0
    errors = 0
    
    for vehicle_id, data in pricing_map.items():
        try:
            # Update the vehicle by ID
            result = supabase.table('vehicles').update({
                'msrp': data['msrp'],
                'has3D': data['has3D'],
                'colorNames': data['colorNames'],
                'colorCodes': data['colorCodes'],
                'colorHexCodes': data['colorHexCodes'],
                'modelGrade': data['modelGrade'],
                'modelTag': data['modelTag'],
                'imageName': data['imageName'],
                'imageCount': data['imageCount'],
                'url': data['url'],
            }).eq('id', vehicle_id).execute()
            
            if result.data and len(result.data) > 0:
                updated += 1
                print(f"  ✅ Updated: {data['year']} {data['make']} {data['model']} - ${data['msrp']:,}")
            else:
                not_found += 1
                print(f"  ⚠️  Not found in DB: {data['year']} {data['make']} {data['model']} (ID: {vehicle_id})")
                
        except Exception as e:
            errors += 1
            if errors <= 5:
                print(f"  ❌ Error updating {vehicle_id}: {e}")
    
    print(f"\n{'='*60}")
    print(f"✅ Update complete!")
    print(f"   Successfully updated: {updated} vehicles")
    if not_found > 0:
        print(f"   ⚠️  Not found in database: {not_found} vehicles")
    if errors > 0:
        print(f"   ❌ Failed: {errors} vehicles")
    print(f"{'='*60}\n")
    
    # Verify
    try:
        result = supabase.table('vehicles').select('id, make, model, year, msrp, has3D').not_.is_('msrp', 'null').limit(10).execute()
        
        if result.data:
            print(f"💰 Sample vehicles with pricing:")
            for v in result.data[:5]:
                msrp = v.get('msrp')
                has_3d = v.get('has3D')
                spinner = "🔄" if has_3d else "📸"
                print(f"  {spinner} {v.get('year')} {v.get('make')} {v.get('model')}: ${msrp:,}")
            
            # Count how many have pricing
            total_with_pricing = len(result.data)
            print(f"\n✅ {updated} vehicles now have MSRP pricing!")
            print(f"✅ {updated} vehicles now have visual data (colors, 360° spinner)!")
            print("\n🚀 These vehicles will display with full info in the CarSidebar!")
    except Exception as e:
        print(f"⚠️  Could not verify: {e}")

if __name__ == "__main__":
    merge_msrp_data()

