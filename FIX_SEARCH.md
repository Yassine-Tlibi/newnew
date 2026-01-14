# Fix Search Flow - Quick Guide

## Problem
Search returns "0 products found" because database has no tables or data.

## Solution

### Option 1: Automatic Setup (Recommended)

1. **Push database schema**
   ```bash
   npm run db:push
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **In a new terminal, initialize the database**
   ```bash
   curl -X POST http://localhost:3000/api/admin/init-db
   ```

4. **Add test products**
   ```bash
   curl -X POST http://localhost:3000/api/admin/add-test-products
   ```

5. **Test search**
   Open browser and go to http://localhost:3000
   Search for: `Ryzen` or `PS5` or `processor`

### Option 2: Using Prisma Seed

```bash
# 1. Push schema
npm run db:push

# 2. Start server
npm run dev

# 3. In new terminal, seed database
npm run db:seed

# 4. Add test products via API
curl -X POST http://localhost:3000/api/admin/add-test-products

# 5. Test in browser
```

### Option 3: One Command Setup

```bash
npm run db:setup
```

This will:
- Push schema to database
- Seed categories and stores
- But you still need to add test products via API

## Verify Setup

Check if everything is working:

```bash
curl http://localhost:3000/api/health
```

Expected output:
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

## Test Search API Directly

```bash
# Search for Ryzen
curl "http://localhost:3000/api/search?q=ryzen" | jq

# Expected: Should return products with "Ryzen" in title

# Search for PS5
curl "http://localhost:3000/api/search?q=ps5" | jq

# Search in PC Components category
curl "http://localhost:3000/api/search?category=<category-id>&q=processor" | jq
```

## What Each Step Does

1. **`npm run db:push`** - Creates all database tables:
   - Category (product categories)
   - Store (Tunisian stores)
   - Product (normalized products)
   - ProductOffer (price offers)
   - CrawlLog (crawl history)
   - SearchProvider (search APIs)

2. **`/api/admin/init-db`** - Populates:
   - 7 categories (Consoles, Games, Components, etc.)
   - 5 stores (gameworld.tn, mytek.tn, etc.)

3. **`/api/admin/add-test-products`** - Adds sample products:
   - AMD Ryzen 5 5500
   - AMD Ryzen 5 5600X
   - PlayStation 5
   - NVIDIA RTX 4060 Ti
   - Intel Core i5-12400F

## Troubleshooting

### "Can't reach database server"
- Check if DATABASE_URL is set correctly
- Verify Supabase database is running
- Try using connection pooler URL (port 6543 instead of 5432)

### Still getting 0 results
1. Verify products were added:
   ```bash
   curl http://localhost:3000/api/health
   ```
2. Check if "products" and "offers" are > 0

3. Try exact product search:
   ```bash
   curl "http://localhost:3000/api/search?q=AMD%20Ryzen%205%205500"
   ```

### Categories or stores not found
Run init-db again:
```bash
curl -X POST http://localhost:3000/api/admin/init-db
```

## Next Steps: Real Crawling

Once test products work, trigger real store crawls:

```bash
# Crawl gameworld.tn (limit to 5 pages for testing)
curl -X POST http://localhost:3000/api/admin/crawl \
  -H "Content-Type: application/json" \
  -d '{"domain": "gameworld.tn", "maxPages": 5}'
```

Then search should return real products from the crawled store.
