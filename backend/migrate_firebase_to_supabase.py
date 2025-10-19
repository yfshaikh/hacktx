"""
Migrate car data from Firebase to Supabase
This script reads all car documents from the Firebase 'cars' collection
and inserts them into the Supabase 'scraped_cars' table
"""
import os
import json
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from dotenv import load_dotenv
from utils.initialize_supabase import get_supabase_client
from datetime import datetime

load_dotenv()

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    # Get the directory where the script is located
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Create the path to the credentials file
    cred_path = os.path.join(current_dir, "fb-admin-sdk.json")
    
    if not os.path.exists(cred_path):
        print(f"❌ Error: Firebase credentials file not found at {cred_path}")
        return None
    
    try:
        # Check if Firebase is already initialized
        firebase_admin.get_app()
        print("✅ Firebase already initialized")
    except ValueError:
        # Initialize Firebase if not already initialized
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("✅ Firebase initialized successfully")
    
    return firestore.client()

def transform_firebase_doc_to_supabase(doc_id, doc_data):
    """Transform a Firebase document to Supabase format"""
    
    # Extract known fields
    name = doc_data.get('name', '')
    year = doc_data.get('year')
    price = doc_data.get('price')
    images = doc_data.get('images', {})
    
    # Build the record for Supabase
    record = {
        'id': doc_id,
        'name': name,
        'year': year,
        'make': 'toyota',  # Assuming all are Toyota based on the scrape script
        'images': json.dumps(images) if images else None,  # Convert dict to JSON string
        'updated_at': datetime.utcnow().isoformat(),
    }
    
    # Add price if available
    if price:
        try:
            # Convert price string to numeric (remove non-numeric characters)
            price_numeric = float(str(price).replace(',', '').replace('$', '').strip())
            record['price'] = price_numeric
        except (ValueError, AttributeError):
            print(f"  ⚠️  Could not parse price for {doc_id}: {price}")
            record['price'] = None
    
    # Map known spec fields from cars.com scraping
    spec_mapping = {
        'horsepower': 'horsepower',
        'mpg': 'mpg',
        'seating-capacity': 'seating_capacity',
        'cargo-space': 'cargo_space',
        'towing-capacity': 'towing_capacity',
        'fuel-tank-capacity': 'fuel_tank_capacity',
        'curb-weight': 'curb_weight',
        'ground-clearance': 'ground_clearance',
    }
    
    # Add mapped specs
    for firebase_key, supabase_key in spec_mapping.items():
        if firebase_key in doc_data:
            record[supabase_key] = doc_data[firebase_key]
    
    # Collect any additional specs not mapped above
    excluded_keys = {'name', 'year', 'images', 'price'} | set(spec_mapping.keys())
    additional_specs = {
        key: value 
        for key, value in doc_data.items() 
        if key not in excluded_keys
    }
    
    if additional_specs:
        record['additional_specs'] = json.dumps(additional_specs)
    
    # Generate source URL if possible
    if name and year:
        model_slug = name.lower().replace(' ', '-')
        record['source_url'] = f"https://www.cars.com/research/toyota-{model_slug}-{year}/"
    
    return record

def migrate_data():
    """Main migration function"""
    print("="*60)
    print("🚀 Starting Firebase to Supabase Migration")
    print("="*60)
    
    # Initialize Firebase
    print("\n📱 Initializing Firebase...")
    db = initialize_firebase()
    if not db:
        return
    
    # Initialize Supabase
    print("🗄️  Initializing Supabase...")
    try:
        supabase = get_supabase_client()
        print("✅ Connected to Supabase")
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")
        print("Make sure SUPABASE_URL and SUPABASE_KEY are set in your .env file")
        return
    
    # Check if scraped_cars table exists and has data
    try:
        existing = supabase.table('scraped_cars').select('id', count='exact').limit(1).execute()
        existing_count = len(existing.data) if existing.data else 0
        
        if existing_count > 0:
            response = input(f"\n⚠️  Table 'scraped_cars' already has data. Clear and reload? (yes/no): ")
            if response.lower() == 'yes':
                print("🗑️  Clearing existing data...")
                supabase.table('scraped_cars').delete().neq('id', '').execute()
                print("✅ Cleared existing data")
            else:
                print("📝 Will attempt to upsert (update existing, insert new)")
    except Exception as e:
        print(f"⚠️  Could not check existing data: {e}")
        print("Make sure the 'scraped_cars' table exists in Supabase")
        print("Run the SQL script: create_scraped_cars_table.sql")
        return
    
    # Fetch all documents from Firebase
    print("\n📥 Fetching cars from Firebase...")
    try:
        cars_ref = db.collection('cars')
        cars_docs = list(cars_ref.stream())
        total_cars = len(cars_docs)
        print(f"✅ Found {total_cars} cars in Firebase")
    except Exception as e:
        print(f"❌ Failed to fetch from Firebase: {e}")
        return
    
    if total_cars == 0:
        print("⚠️  No cars found in Firebase collection 'cars'")
        return
    
    # Transform and upload to Supabase
    print(f"\n📤 Migrating {total_cars} cars to Supabase...")
    
    uploaded = 0
    errors = 0
    error_details = []
    
    for i, doc in enumerate(cars_docs, 1):
        doc_id = doc.id
        doc_data = doc.to_dict()
        
        try:
            # Transform the document
            record = transform_firebase_doc_to_supabase(doc_id, doc_data)
            
            # Upload to Supabase (upsert to handle duplicates)
            supabase.table('scraped_cars').upsert(record).execute()
            uploaded += 1
            
            # Progress indicator
            if i % 10 == 0 or i == total_cars:
                print(f"  📊 Progress: {i}/{total_cars} ({uploaded} successful, {errors} errors)")
        
        except Exception as e:
            errors += 1
            error_msg = f"Failed to migrate {doc_id}: {str(e)}"
            error_details.append(error_msg)
            print(f"  ❌ {error_msg}")
    
    # Summary
    print("\n" + "="*60)
    print("✅ Migration Complete!")
    print("="*60)
    print(f"  Total cars in Firebase: {total_cars}")
    print(f"  Successfully migrated: {uploaded}")
    print(f"  Errors: {errors}")
    
    if error_details:
        print("\n⚠️  Error Details:")
        for error in error_details[:10]:  # Show first 10 errors
            print(f"  - {error}")
        if len(error_details) > 10:
            print(f"  ... and {len(error_details) - 10} more errors")
    
    # Verify the migration
    print("\n🔍 Verifying migration...")
    try:
        result = supabase.table('scraped_cars').select('id, name, year, price').order('year', desc=True).limit(5).execute()
        if result.data:
            print("Sample cars in Supabase:")
            for car in result.data:
                price_str = f"${car.get('price'):,.0f}" if car.get('price') else "N/A"
                print(f"  - {car.get('year')} {car.get('name')} - {price_str}")
        
        # Get total count
        count_result = supabase.table('scraped_cars').select('id', count='exact').execute()
        print(f"\n✅ Total cars in Supabase: {count_result.count if hasattr(count_result, 'count') else len(count_result.data)}")
    except Exception as e:
        print(f"⚠️  Could not verify migration: {e}")
    
    print("\n🎉 Migration script completed!")
    print("="*60)

if __name__ == "__main__":
    migrate_data()

