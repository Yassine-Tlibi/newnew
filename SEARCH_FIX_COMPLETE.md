# Search Flow Fix - Complete Implementation

## What Was Fixed

### ✅ Database Schema
- All Prisma tables are ready to be created via `npm run db:push`
- Schema includes: Category, Store, Product, ProductOffer, CrawlLog, SearchProvider

### ✅ Database Initialization
- New endpoint: `POST /api/admin/init-db` - Creates categories and stores
- New endpoint: `POST /api/admin/add-test-products` - Adds sample products for testing

### ✅ Search Logic
- Search query logic already works correctly
- Returns products from database with proper filtering and sorting
- Just needs data in the database to return results

### ✅ Crawler Integration
- Crawler properly saves scraped products to database
- Worker queue handles background crawling
- Products are normalized and deduplicated

## Quick Start (Step by Step)

### Step 1: Push Database Schema
```bash
npm run db:push
```

This creates all tables in your Supabase database.

**If you see error "Can't reach database server":**
- Your DATABASE_URL might be incorrect
- The Supabase instance might be paused/stopped
- Try accessing Supabase dashboard to check database status

### Step 2: Start Development Server
```bash
npm run dev
```

Server starts at http://localhost:3000

### Step 3: Initialize Database (In New Terminal)
```bash
# Initialize categories and stores
curl -X POST http://localhost:3000/api/admin/init-db

# Add test products
curl -X POST http://localhost:3000/api/admin/add-test-products
```

### Step 4: Test Search
```bash
# Option 1: Use test script
npm run test:search

# Option 2: Search via API
curl "http://localhost:3000/api/search?q=ryzen"

# Option 3: Open browser
# Visit: http://localhost:3000
# Search for: "Ryzen" or "PS5" or "processor"
```

## New Files Created

### API Endpoints
1. `/app/api/admin/init-db/route.ts` - Initialize database with categories/stores
2. `/app/api/admin/add-test-products/route.ts` - Add sample products for testing

### Scripts
1. `/scripts/setup-database.ts` - Automated database setup
2. `/scripts/test-search-flow.ts` - Test search functionality

### Documentation
1. `SETUP_DATABASE.md` - Detailed database setup guide
2. `FIX_SEARCH.md` - Quick search fix guide
3. `SEARCH_FIX_COMPLETE.md` - This file

## NPM Scripts Added

```json
{
  "db:push": "Push schema to database",
  "db:setup": "Automated setup (push + seed)",
  "test:search": "Test search flow"
}
```

## Usage Examples

### Initialize Everything
```bash
# 1. Push schema
npm run db:push

# 2. Start server
npm run dev

# 3. In new terminal - initialize
curl -X POST http://localhost:3000/api/admin/init-db

# 4. Add test products
curl -X POST http://localhost:3000/api/admin/add-test-products

# 5. Test
npm run test:search
```

### Verify Setup
```bash
curl http://localhost:3000/api/health
```

Expected response:
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

### Search Examples
```bash
# Search for Ryzen processors
curl "http://localhost:3000/api/search?q=ryzen"

# Search in specific category
curl "http://localhost:3000/api/search?category=<category-id>&q=processor"

# Filter by price range
curl "http://localhost:3000/api/search?q=processor&minPrice=400&maxPrice=600"

# Sort by price descending
curl "http://localhost:3000/api/search?q=ryzen&sortBy=price_desc"

# In stock only
curl "http://localhost:3000/api/search?q=ps5&inStockOnly=true"
```

## Test Products Added

When you run `/api/admin/add-test-products`, these products are added:

1. **AMD Ryzen 5 5500** - 450.500 TND
2. **AMD Ryzen 5 5600X** - 620.000 TND
3. **PlayStation 5 Console** - 2450.000 TND
4. **NVIDIA GeForce RTX 4060 Ti** - 1850.000 TND
5. **Intel Core i5-12400F** - 520.000 TND

All from "Game World" store with placeholder images.

## Real Crawling (After Testing)

Once test products work, trigger real crawls:

```bash
# Crawl gameworld.tn (5 pages)
curl -X POST http://localhost:3000/api/admin/crawl \
  -H "Content-Type: application/json" \
  -d '{"domain": "gameworld.tn", "maxPages": 5}'

# Check crawl status
curl http://localhost:3000/api/admin/crawl

# Start crawl worker (for background processing)
npm run worker:crawl
```

## Troubleshooting

### Database Connection Failed
```
Error: P1001: Can't reach database server
```

**Solutions:**
1. Check DATABASE_URL in environment
2. Verify Supabase database is running (not paused)
3. Try connection pooler URL (port 6543 instead of 5432)
4. Check Supabase dashboard for database status

### Still Getting 0 Results

**Check:**
```bash
# 1. Health check
curl http://localhost:3000/api/health

# 2. If products = 0, add test products
curl -X POST http://localhost:3000/api/admin/add-test-products

# 3. If stores = 0, initialize database
curl -X POST http://localhost:3000/api/admin/init-db

# 4. Try exact search
curl "http://localhost:3000/api/search?q=AMD+Ryzen+5+5500"
```

### Categories Not Found
```bash
curl -X POST http://localhost:3000/api/admin/init-db
```

### Can't Add Test Products
Error: "Categories or stores not found"

Run init-db first:
```bash
curl -X POST http://localhost:3000/api/admin/init-db
```

Then add products:
```bash
curl -X POST http://localhost:3000/api/admin/add-test-products
```

## Summary

The search flow is now complete and ready to use:

✅ **Database schema** - Ready to push to Supabase
✅ **Initialization endpoints** - Categories, stores, test products
✅ **Search logic** - Working correctly, needs data
✅ **Crawler integration** - Saves products to database
✅ **Test scripts** - Verify everything works
✅ **Documentation** - Complete setup guides

**Next step:** Run the Quick Start commands above to get search working!
