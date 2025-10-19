"""
Remove 2025 and 2026 model years from Supabase
These years don't have pricing or visual data and cause issues
"""
from utils.initialize_supabase import get_supabase_client

def remove_future_years():
    print("🗑️  Removing 2025 and 2026 model years from database...\n")
    
    supabase = get_supabase_client()
    
    # Check how many we have
    result_2025 = supabase.table('vehicles').select('id', count='exact').eq('year', '2025').execute()
    result_2026 = supabase.table('vehicles').select('id', count='exact').eq('year', '2026').execute()
    
    count_2025 = len(result_2025.data) if result_2025.data else 0
    count_2026 = len(result_2026.data) if result_2026.data else 0
    
    print(f"📊 Found:")
    print(f"   2025 models: {count_2025}")
    print(f"   2026 models: {count_2026}")
    print(f"   Total to delete: {count_2025 + count_2026}")
    
    if count_2025 + count_2026 == 0:
        print("\n✅ No future year models to remove!")
        return
    
    print(f"\n⚠️  Proceeding to delete {count_2025 + count_2026} vehicles...")
    
    # Delete 2025
    if count_2025 > 0:
        print(f"\n🗑️  Deleting {count_2025} 2025 models...")
        supabase.table('vehicles').delete().eq('year', '2025').execute()
        print(f"   ✅ Deleted {count_2025} vehicles")
    
    # Delete 2026
    if count_2026 > 0:
        print(f"\n🗑️  Deleting {count_2026} 2026 models...")
        supabase.table('vehicles').delete().eq('year', '2026').execute()
        print(f"   ✅ Deleted {count_2026} vehicles")
    
    # Verify
    result = supabase.table('vehicles').select('year', count='exact').execute()
    years = {}
    for v in result.data:
        year = v.get('year', 'Unknown')
        years[year] = years.get(year, 0) + 1
    
    print(f"\n{'='*60}")
    print("✅ Cleanup complete!")
    print(f"   Remaining vehicles: {len(result.data)}")
    print(f"\n📊 Vehicles by year:")
    for year in sorted(years.keys(), reverse=True):
        print(f"   {year}: {years[year]} vehicles")
    print(f"{'='*60}")

if __name__ == "__main__":
    remove_future_years()

