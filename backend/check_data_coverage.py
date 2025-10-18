"""
Check what data is available across all vehicles in Supabase
"""
from utils.initialize_supabase import get_supabase_client

def check_data_coverage():
    print("🔍 Checking data coverage across all vehicles...\n")
    
    supabase = get_supabase_client()
    
    # Get all vehicles
    result = supabase.table('vehicles').select('*').execute()
    vehicles = result.data
    
    total = len(vehicles)
    print(f"📊 Total vehicles: {total}\n")
    
    # Count what data we have
    has_msrp = sum(1 for v in vehicles if v.get('msrp') is not None)
    has_3d = sum(1 for v in vehicles if v.get('has3D') is True)
    has_model_tag = sum(1 for v in vehicles if v.get('modelTag'))
    has_model_grade = sum(1 for v in vehicles if v.get('modelGrade'))
    has_colors = sum(1 for v in vehicles if v.get('colorHexCodes'))
    has_image_count = sum(1 for v in vehicles if v.get('imageCount'))
    has_url = sum(1 for v in vehicles if v.get('url'))
    
    # EPA data
    has_city_mpg = sum(1 for v in vehicles if v.get('cityMpgForFuelType1'))
    has_highway_mpg = sum(1 for v in vehicles if v.get('highwayMpgForFuelType1'))
    has_cylinders = sum(1 for v in vehicles if v.get('cylinders'))
    has_transmission = sum(1 for v in vehicles if v.get('transmission'))
    has_drive = sum(1 for v in vehicles if v.get('drive'))
    
    print("💰 PRICING & VISUAL DATA:")
    print(f"   MSRP:              {has_msrp:3d} / {total} ({has_msrp/total*100:.1f}%)")
    print(f"   has3D flag:        {has_3d:3d} / {total} ({has_3d/total*100:.1f}%)")
    print(f"   modelTag (360°):   {has_model_tag:3d} / {total} ({has_model_tag/total*100:.1f}%)")
    print(f"   modelGrade:        {has_model_grade:3d} / {total} ({has_model_grade/total*100:.1f}%)")
    print(f"   Color codes:       {has_colors:3d} / {total} ({has_colors/total*100:.1f}%)")
    print(f"   Image count:       {has_image_count:3d} / {total} ({has_image_count/total*100:.1f}%)")
    print(f"   URL:               {has_url:3d} / {total} ({has_url/total*100:.1f}%)")
    
    print("\n⚙️  EPA TECHNICAL DATA:")
    print(f"   City MPG:          {has_city_mpg:3d} / {total} ({has_city_mpg/total*100:.1f}%)")
    print(f"   Highway MPG:       {has_highway_mpg:3d} / {total} ({has_highway_mpg/total*100:.1f}%)")
    print(f"   Cylinders:         {has_cylinders:3d} / {total} ({has_cylinders/total*100:.1f}%)")
    print(f"   Transmission:      {has_transmission:3d} / {total} ({has_transmission/total*100:.1f}%)")
    print(f"   Drive:             {has_drive:3d} / {total} ({has_drive/total*100:.1f}%)")
    
    # Check for complete records (has everything for 360° spinner)
    complete_visual = sum(1 for v in vehicles if 
                         v.get('msrp') and 
                         v.get('has3D') and 
                         v.get('modelTag') and 
                         v.get('colorHexCodes'))
    
    print(f"\n✨ COMPLETE VISUAL RECORDS:")
    print(f"   (MSRP + 360° + Colors): {complete_visual} / {total} ({complete_visual/total*100:.1f}%)")
    
    # Show examples of what we have
    print("\n📋 SAMPLE DATA:\n")
    
    # Complete records
    complete_vehicles = [v for v in vehicles if 
                        v.get('msrp') and 
                        v.get('has3D') and 
                        v.get('modelTag') and 
                        v.get('colorHexCodes')]
    if complete_vehicles:
        print("✅ Complete visual data (can show 360° spinner):")
        for v in complete_vehicles[:5]:
            colors = len(str(v.get('colorHexCodes', '')).split(','))
            print(f"   - {v['year']} {v['make']} {v['model']}: ${v['msrp']:,}, {colors} colors")
    
    # EPA only records
    epa_only = [v for v in vehicles if 
                not v.get('msrp') and 
                v.get('cityMpgForFuelType1')]
    if epa_only:
        print("\n📊 EPA specs only (no visual/pricing):")
        for v in epa_only[:5]:
            city = v.get('cityMpgForFuelType1', 'N/A')
            highway = v.get('highwayMpgForFuelType1', 'N/A')
            print(f"   - {v['year']} {v['make']} {v['model']}: {city}/{highway} MPG")
    
    # Year breakdown
    print("\n📅 DATA BY YEAR:")
    years = {}
    years_with_msrp = {}
    for v in vehicles:
        year = v.get('year', 'Unknown')
        years[year] = years.get(year, 0) + 1
        if v.get('msrp'):
            years_with_msrp[year] = years_with_msrp.get(year, 0) + 1
    
    for year in sorted(years.keys(), reverse=True)[:15]:
        total_year = years[year]
        with_msrp = years_with_msrp.get(year, 0)
        print(f"   {year}: {total_year:3d} vehicles ({with_msrp:2d} with MSRP)")
    
    print("\n" + "="*60)
    print("SUMMARY:")
    print(f"  ✅ {complete_visual} vehicles have FULL data (360° spinner ready)")
    print(f"  📊 {total - complete_visual} vehicles have EPA specs only")
    print(f"  🎯 Voice agent will work with ALL {total} vehicles")
    print(f"     (but {complete_visual} will have the best visual experience)")
    print("="*60)

if __name__ == "__main__":
    check_data_coverage()

