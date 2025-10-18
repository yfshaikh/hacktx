"""
Download EPA vehicle database and filter for Toyota vehicles (last 10 years)
This gives you ~300-500 Toyota vehicles instead of 45,000+ all manufacturers
"""
import requests
import csv
import json
from pathlib import Path
from datetime import datetime

EPA_FUEL_ECONOMY_URL = "https://www.fueleconomy.gov/feg/epadata/vehicles.csv"

# Filter settings
MANUFACTURER = "Toyota"  # Change if you want other manufacturers
YEARS_BACK = 10  # How many years back to include
CURRENT_YEAR = datetime.now().year
MIN_YEAR = CURRENT_YEAR - YEARS_BACK

def download_and_filter_toyota():
    print(f"🚗 Downloading EPA Vehicle Database (filtering for {MANUFACTURER})...")
    print(f"📅 Years: {MIN_YEAR}-{CURRENT_YEAR}")
    print(f"📡 URL: {EPA_FUEL_ECONOMY_URL}")
    print("⏳ This may take a minute... (downloading ~40MB, filtering ~300-500 Toyotas)")
    
    try:
        response = requests.get(EPA_FUEL_ECONOMY_URL, stream=True, timeout=60)
        response.raise_for_status()
        
        print("✅ Download complete, filtering data...")
        
        # Parse CSV and filter for Toyota
        lines = response.text.splitlines()
        reader = csv.DictReader(lines)
        
        toyota_vehicles = []
        total_count = 0
        
        for row in reader:
            total_count += 1
            
            # Filter by manufacturer and year
            make = row.get('make', '').strip()
            year = row.get('year', '')
            
            try:
                year_int = int(year) if year else 0
            except:
                year_int = 0
            
            if make == MANUFACTURER and year_int >= MIN_YEAR:
                toyota_vehicles.append(row)
        
        print(f"📊 Scanned: {total_count:,} total vehicles")
        print(f"🎯 Found: {len(toyota_vehicles):,} {MANUFACTURER} vehicles ({MIN_YEAR}-{CURRENT_YEAR})")
        
        if not toyota_vehicles:
            print(f"❌ No {MANUFACTURER} vehicles found!")
            return None
        
        # Save filtered data as JSON
        output_path = Path(__file__).parent / "toyota_vehicles_filtered.json"
        
        with open(output_path, 'w') as f:
            json.dump(toyota_vehicles, f, indent=2)
        
        print(f"✅ Saved filtered data to: {output_path}")
        print(f"📝 File size: {output_path.stat().st_size / 1024:.1f} KB (much smaller!)")
        
        # Show some examples
        print(f"\n🚗 Sample vehicles:")
        models = {}
        for v in toyota_vehicles[:20]:
            model = v.get('model', 'Unknown')
            year = v.get('year', '?')
            models[model] = year
        
        for model, year in list(models.items())[:10]:
            print(f"  - {year} {MANUFACTURER} {model}")
        
        return output_path
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n💡 Alternative: Download manually from:")
        print("   https://www.fueleconomy.gov/feg/download.shtml")
        return None

if __name__ == "__main__":
    path = download_and_filter_toyota()
    if path:
        print(f"\n✅ Next step: Run 'python load_filtered_vehicles.py' to load {MANUFACTURER} vehicles to Supabase")

