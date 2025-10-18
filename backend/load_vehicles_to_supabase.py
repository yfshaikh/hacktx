"""
Load vehicle data from tamuhack-25/recs.json into Supabase
This extracts the vehicle data from the recommendations and uploads it
"""
import json
import sys
from pathlib import Path
from utils.initialize_supabase import get_supabase_client

def load_vehicles():
    print("🚗 Loading vehicle data to Supabase...")
    
    # Path to the transformed data file
    transformed_path = Path(__file__).parent / "toyota_vehicles_transformed.json"
    
    if not transformed_path.exists():
        print(f"❌ Error: Could not find toyota_vehicles_transformed.json")
        print("Run these steps first:")
        print("  1. python download_epa_vehicles.py")
        print("  2. python transform_epa_data.py")
        sys.exit(1)
    
    print(f"📂 Reading from: {transformed_path}")
    
    # Load the vehicles (already transformed to correct format)
    with open(transformed_path, 'r') as f:
        vehicles = json.load(f)
    
    print(f"📊 Found {len(vehicles)} Toyota vehicles")
    
    # Connect to Supabase
    try:
        supabase = get_supabase_client()
        print("✅ Connected to Supabase")
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")
        sys.exit(1)
    
    # Check if table already has data
    try:
        existing = supabase.table('vehicles').select('id', count='exact').limit(1).execute()
        existing_count = len(existing.data) if existing.data else 0
        
        if existing_count > 0:
            response = input(f"\n⚠️  Table already has {existing_count} vehicles. Delete and reload? (yes/no): ")
            if response.lower() != 'yes':
                print("❌ Aborted by user")
                sys.exit(0)
            
            print("🗑️  Deleting existing vehicles...")
            # Delete all existing data
            supabase.table('vehicles').delete().neq('id', '').execute()
            print("✅ Cleared existing data")
    except Exception as e:
        print(f"⚠️  Could not check existing data: {e}")
    
    # Upload vehicles in batches
    batch_size = 100
    total = len(vehicles)
    uploaded = 0
    errors = 0
    
    print(f"\n📤 Uploading {total} vehicles in batches of {batch_size}...")
    
    for i in range(0, total, batch_size):
        batch = vehicles[i:i + batch_size]
        
        try:
            supabase.table('vehicles').insert(batch).execute()
            uploaded += len(batch)
            print(f"  ✅ Uploaded batch {i // batch_size + 1}: {uploaded}/{total} vehicles")
        except Exception as e:
            errors += len(batch)
            print(f"  ❌ Error uploading batch {i // batch_size + 1}: {e}")
            # Try uploading one by one to identify problematic records
            for vehicle in batch:
                try:
                    supabase.table('vehicles').insert(vehicle).execute()
                    uploaded += 1
                except Exception as ve:
                    print(f"    ❌ Failed to upload vehicle {vehicle.get('id', 'unknown')}: {ve}")
    
    print(f"\n{'='*60}")
    print(f"✅ Upload complete!")
    print(f"   Successfully uploaded: {uploaded} vehicles")
    if errors > 0:
        print(f"   ❌ Failed: {errors} vehicles")
    print(f"{'='*60}\n")
    
    # Verify the upload
    try:
        result = supabase.table('vehicles').select('id, make, model, year').limit(5).execute()
        if result.data:
            print("🔍 Sample vehicles in Supabase:")
            for vehicle in result.data:
                print(f"  - {vehicle.get('year')} {vehicle.get('make')} {vehicle.get('model')}")
        print("\n✅ Data successfully loaded into Supabase!")
        print("\n🚀 You can now use the voice agent car search!")
        print("   Try: 'Show me a Toyota Camry'")
    except Exception as e:
        print(f"⚠️  Could not verify upload: {e}")

if __name__ == "__main__":
    load_vehicles()

