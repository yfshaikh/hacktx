# 🚀 Quick Start: Firebase to Supabase Migration

## What Was Created

1. **`create_scraped_cars_table.sql`** - SQL schema for the Supabase table
2. **`migrate_firebase_to_supabase.py`** - Migration script to transfer existing data
3. **`scrape_to_supabase.py`** - Future scraping directly to Supabase (optional)
4. **`FIREBASE_MIGRATION_GUIDE.md`** - Detailed documentation

## 3-Step Migration Process

### Step 1: Create the Table (2 minutes)

```bash
# 1. Go to https://app.supabase.com
# 2. Select your project
# 3. Click "SQL Editor" in sidebar
# 4. Copy contents of create_scraped_cars_table.sql
# 5. Paste and click "Run"
```

### Step 2: Install Dependencies (1 minute)

```bash
cd backend
pip install -r requirements.txt
```

### Step 3: Run Migration (5-10 minutes depending on data size)

```bash
cd backend
python migrate_firebase_to_supabase.py
```

That's it! Your data is now in Supabase.

## Quick Verification

After migration, verify in Supabase SQL Editor:

```sql
-- Total count
SELECT COUNT(*) FROM scraped_cars;

-- Sample data
SELECT id, name, year, price FROM scraped_cars LIMIT 10;
```

Or in Python:

```python
from utils.initialize_supabase import get_supabase_client

supabase = get_supabase_client()
result = supabase.table('scraped_cars').select('*').limit(5).execute()
print(result.data)
```

## What Changed from Firebase

| Before (Firebase) | After (Supabase) |
|------------------|------------------|
| Collection: `cars` | Table: `scraped_cars` |
| Document ID | Primary Key: `id` |
| Nested objects | JSONB columns |
| NoSQL queries | SQL queries |
| Firebase SDK | Supabase client |

## Common Issues & Fixes

### ❌ "Table doesn't exist"
➡️ Run the SQL script first (Step 1)

### ❌ "Firebase credentials not found"
➡️ Make sure `fb-admin-sdk.json` is in the backend directory

### ❌ "Supabase connection failed"  
➡️ Check `.env` has `SUPABASE_URL` and `SUPABASE_KEY`

### ❌ "Module not found"
➡️ Run `pip install -r requirements.txt`

## Next Steps

After migration:

1. ✅ Test queries in Supabase
2. ✅ Update your API routes to use Supabase
3. ✅ Update frontend to fetch from new endpoints
4. ✅ (Optional) Keep Firebase as backup or decommission it

## Using the Migrated Data

### Simple Query Example

```python
# In your FastAPI routes
from utils.initialize_supabase import get_supabase_client

@router.get("/cars/{car_id}")
async def get_car(car_id: str):
    supabase = get_supabase_client()
    result = supabase.table('scraped_cars').select('*').eq('id', car_id).single().execute()
    return result.data

@router.get("/cars/search")
async def search_cars(year: int = None, name: str = None):
    supabase = get_supabase_client()
    query = supabase.table('scraped_cars').select('*')
    
    if year:
        query = query.eq('year', year)
    if name:
        query = query.ilike('name', f'%{name}%')
    
    result = query.execute()
    return result.data
```

## Support

- Full guide: `FIREBASE_MIGRATION_GUIDE.md`
- Supabase docs: https://supabase.com/docs
- For issues: Check error messages in migration output

---

**Estimated Total Time: 8-13 minutes** ⏱️

