# Database Setup Guide

## Quick Setup (When Database is Accessible)

### Step 1: Push Schema to Database
```bash
npx prisma db push --accept-data-loss
```

This will create all required tables in your Supabase database:
- `Category` - Product categories
- `Store` - Tunisian e-commerce stores
- `Product` - Canonical products (normalized)
- `ProductOffer` - Store-specific offers/prices
- `CrawlLog` - Crawl activity tracking
- `SearchProvider` - External search API configuration

### Step 2: Initialize Database with Categories and Stores
```bash
curl -X POST http://localhost:3000/api/admin/init-db \
  -H "Content-Type: application/json"
```

Or if you have ADMIN_TOKEN set:
```bash
curl -X POST http://localhost:3000/api/admin/init-db \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

This will create:
- 7 product categories (Consoles, Video Games, PC Components, etc.)
- 5 Tunisian stores (gameworld.tn, mytek.tn, etc.)

### Step 3: Add Test Products (For Testing Search)
```bash
curl -X POST http://localhost:3000/api/admin/add-test-products \
  -H "Content-Type: application/json"
```

This will add sample products including:
- AMD Ryzen 5 5500 Processor
- AMD Ryzen 5 5600X Processor
- PlayStation 5 Console
- NVIDIA GeForce RTX 4060 Ti
- Intel Core i5-12400F Processor

### Step 4: Test Search
Now you can search for products:
```bash
# Search for "Ryzen"
curl "http://localhost:3000/api/search?q=ryzen"

# Search for "PS5"
curl "http://localhost:3000/api/search?q=ps5"

# Search for "processor"
curl "http://localhost:3000/api/search?q=processor"
```

## Alternative: Use Prisma Seed

If you prefer to use the built-in seed script:

```bash
npx prisma db seed
```

This will run the seed script in `prisma/seed.ts` which creates categories and stores.

## Verify Database Setup

Check database health:
```bash
curl http://localhost:3000/api/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "connected",
  "stats": {
    "products": 5,
    "offers": 5,
    "stores": 5,
    "categories": 7
  }
}
```

## Troubleshooting

### Database Connection Error
If you see `Can't reach database server`, check:
1. Is DATABASE_URL environment variable set correctly?
2. Is the Supabase database accessible from your network?
3. Try using the connection pooler URL (ends with `:6543` instead of `:5432`)

### Empty Search Results
If search returns 0 results:
1. Run Step 2 to initialize categories and stores
2. Run Step 3 to add test products
3. Verify with `/api/health` endpoint

### Manual Database Check
Connect to your database directly:
```bash
psql $DATABASE_URL
```

Then check tables:
```sql
\dt -- List all tables
SELECT COUNT(*) FROM "Product"; -- Check product count
SELECT COUNT(*) FROM "ProductOffer"; -- Check offer count
SELECT COUNT(*) FROM "Store"; -- Check store count
SELECT COUNT(*) FROM "Category"; -- Check category count
```

## Production Crawling

Once test data works, trigger real crawls:

```bash
# Crawl Game World store
curl -X POST http://localhost:3000/api/admin/crawl \
  -H "Content-Type: application/json" \
  -d '{"domain": "gameworld.tn", "maxPages": 5}'

# Check crawl logs
curl http://localhost:3000/api/admin/crawl
```

## Complete Setup Flow

```bash
# 1. Push schema
npx prisma db push --accept-data-loss

# 2. Start the dev server
npm run dev

# 3. In another terminal, initialize database
curl -X POST http://localhost:3000/api/admin/init-db

# 4. Add test products
curl -X POST http://localhost:3000/api/admin/add-test-products

# 5. Test search
curl "http://localhost:3000/api/search?q=ryzen"

# 6. Open browser and visit
# http://localhost:3000 and search for "Ryzen" or "PS5"
```
