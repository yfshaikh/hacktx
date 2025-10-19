# Firebase to Supabase Migration Guide

This guide explains how to migrate your scraped car data from Firebase to Supabase.

## Overview

The migration system consists of:
1. **SQL Table Schema** (`create_scraped_cars_table.sql`) - Creates the Supabase table
2. **Migration Script** (`migrate_firebase_to_supabase.py`) - Transfers data from Firebase to Supabase

## Migration Steps

### Step 1: Create the Supabase Table

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Open `create_scraped_cars_table.sql` and copy its contents
5. Paste into the SQL Editor and click **Run**

This creates the `scraped_cars` table with:
- Basic info (id, name, year, make)
- Price data
- Images (stored as JSON)
- Key specs (horsepower, mpg, seating, cargo, etc.)
- Additional specs (flexible JSON field)
- Timestamps and source tracking
- Indexes for fast queries

### Step 2: Run the Migration Script

Make sure you have the required environment variables in your `.env` file:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

Then run:
```bash
cd backend
python migrate_firebase_to_supabase.py
```

The script will:
1. ✅ Connect to Firebase and Supabase
2. 📥 Fetch all cars from Firebase collection 'cars'
3. 🔄 Transform each document to Supabase format
4. 📤 Upload to Supabase (with upsert to handle duplicates)
5. 🔍 Verify the migration and show samples

### Step 3: Verify Migration

After migration completes, you can verify in Supabase:

```sql
-- Check total count
SELECT COUNT(*) FROM scraped_cars;

-- View sample cars
SELECT id, name, year, price 
FROM scraped_cars 
ORDER BY year DESC 
LIMIT 10;

-- Check cars with images
SELECT id, name, year, jsonb_array_length(images::jsonb) as image_count
FROM scraped_cars 
WHERE images IS NOT NULL;
```

## Data Transformation

The migration script transforms Firebase documents as follows:

| Firebase Field | Supabase Field | Transformation |
|---------------|----------------|----------------|
| document ID | id | Direct mapping |
| name | name | Direct mapping |
| year | year | Direct mapping |
| price | price | Converted to numeric |
| images | images | Stored as JSONB |
| horsepower | horsepower | Direct mapping |
| mpg | mpg | Direct mapping |
| seating-capacity | seating_capacity | Renamed (dash to underscore) |
| cargo-space | cargo_space | Renamed (dash to underscore) |
| towing-capacity | towing_capacity | Renamed (dash to underscore) |
| fuel-tank-capacity | fuel_tank_capacity | Renamed (dash to underscore) |
| curb-weight | curb_weight | Renamed (dash to underscore) |
| ground-clearance | ground_clearance | Renamed (dash to underscore) |
| other fields | additional_specs | Stored as JSONB |

## Benefits of Supabase

1. **Better Integration** - Works seamlessly with your existing backend
2. **SQL Power** - Use complex queries, joins, and aggregations
3. **Real-time** - Subscribe to changes in car data
4. **No Extra SDK** - Use REST API or the Supabase client
5. **Better Performance** - Indexed queries for fast searches
6. **Cost Effective** - Generous free tier

## Using the Migrated Data

### Query Examples

```python
from utils.initialize_supabase import get_supabase_client

supabase = get_supabase_client()

# Get all Toyota Camrys
result = supabase.table('scraped_cars').select('*').eq('name', 'Camry').execute()

# Get cars from 2020
result = supabase.table('scraped_cars').select('*').eq('year', 2020).execute()

# Get cars with price range
result = supabase.table('scraped_cars').select('*').gte('price', 20000).lte('price', 30000).execute()

# Search by name (case insensitive)
result = supabase.table('scraped_cars').select('*').ilike('name', '%prius%').execute()
```

### API Integration

You can easily create endpoints in `backend/routes/car_routes.py`:

```python
@router.get("/scraped-cars/{car_id}")
async def get_scraped_car(car_id: str):
    result = supabase.table('scraped_cars').select('*').eq('id', car_id).single().execute()
    return result.data

@router.get("/scraped-cars")
async def search_scraped_cars(year: int = None, name: str = None):
    query = supabase.table('scraped_cars').select('*')
    if year:
        query = query.eq('year', year)
    if name:
        query = query.ilike('name', f'%{name}%')
    result = query.execute()
    return result.data
```

## Troubleshooting

### "Table doesn't exist" error
- Make sure you ran the SQL script in Supabase first

### Firebase connection error
- Check that `fb-admin-sdk.json` exists in the backend directory
- Verify the credentials file has the correct permissions

### Supabase connection error
- Verify `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
- Check that the key has appropriate permissions

### Image JSON parsing issues
- The script automatically handles image dictionaries
- Images are stored as JSONB for flexible querying

## Next Steps

After migration, you can:
1. Update your frontend to query Supabase instead of Firebase
2. Create new API endpoints for the scraped car data
3. Combine EPA vehicles and scraped cars for comprehensive search
4. Set up real-time subscriptions for data updates
5. Decommission Firebase (optional, after verifying everything works)

## Keeping Both Systems (Optional)

If you want to keep Firebase as a backup:
- The migration script uses `upsert`, so you can run it multiple times
- Set up a cron job to sync periodically
- Keep the scraping script writing to Firebase, then sync to Supabase

## Future Scraping

To scrape new cars directly to Supabase instead of Firebase:
- Use `scrape_to_supabase.py` (if created)
- Or modify your existing scraping to write to Supabase
- The table schema supports all current and future fields

