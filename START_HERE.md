# 🚀 START HERE - Fix Search in 3 Steps

## Problem
Search returns "0 products found" because database is empty.

## Solution (3 Steps)

### Step 1: Push Database Schema
```bash
npm run db:push
```

This creates all tables in Supabase (Category, Store, Product, ProductOffer, etc.)

**If this fails:** Your DATABASE_URL might be incorrect or Supabase database is not accessible.

---

### Step 2: Start Server & Initialize
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Initialize database
curl -X POST http://localhost:3000/api/admin/init-db
curl -X POST http://localhost:3000/api/admin/add-test-products
```

Or use the quick setup script:
```bash
# After npm run dev is running
./scripts/quick-setup.sh
```

---

### Step 3: Test Search
Open browser: http://localhost:3000

Search for:
- **"Ryzen"** → Returns AMD processors
- **"PS5"** → Returns PlayStation 5
- **"processor"** → Returns multiple processors

---

## Verify It Works

```bash
# Check database health
curl http://localhost:3000/api/health

# Should show:
# - products: 5
# - offers: 5
# - stores: 5
# - categories: 7

# Test search API
curl "http://localhost:3000/api/search?q=ryzen"

# Should return 2 products
```

---

## What Was Fixed

✅ **New Endpoints:**
- `/api/admin/init-db` - Creates categories & stores
- `/api/admin/add-test-products` - Adds sample products

✅ **New Scripts:**
- `npm run db:push` - Push schema to database
- `npm run test:search` - Test search flow
- `./scripts/quick-setup.sh` - Automated setup

✅ **Documentation:**
- `START_HERE.md` ← You are here
- `FIX_SEARCH.md` - Detailed fix guide
- `SETUP_DATABASE.md` - Complete database setup
- `IMPLEMENTATION_SUMMARY.md` - Technical details

---

## Troubleshooting

### Can't connect to database
```
Error: P1001: Can't reach database server
```

**Fix:**
1. Check DATABASE_URL in `.env`
2. Verify Supabase database is running
3. Check Supabase dashboard

### Still getting 0 results
```bash
# 1. Check health
curl http://localhost:3000/api/health

# 2. If products = 0, add test products
curl -X POST http://localhost:3000/api/admin/add-test-products

# 3. If categories = 0, initialize
curl -X POST http://localhost:3000/api/admin/init-db
```

---

## Next: Real Store Crawling

Once test products work, crawl real stores:

```bash
# Crawl gameworld.tn (5 pages for testing)
curl -X POST http://localhost:3000/api/admin/crawl \
  -H "Content-Type: application/json" \
  -d '{"domain": "gameworld.tn", "maxPages": 5}'

# Start background worker for automated crawling
npm run worker:crawl
```

---

## Complete Flow

```bash
# 1. Push schema
npm run db:push

# 2. Start server
npm run dev

# 3. Initialize (in new terminal)
./scripts/quick-setup.sh

# 4. Test
npm run test:search

# 5. Open browser
http://localhost:3000
```

---

## Success Checklist

- [ ] `npm run db:push` completed without errors
- [ ] Dev server running at http://localhost:3000
- [ ] `/api/health` returns "healthy" status
- [ ] Search for "Ryzen" returns 2 products
- [ ] Search for "PS5" returns 1 product
- [ ] Can click "View in Store" button

✅ **If all checked, search is fixed!**

---

## More Help

- **Quick Fix:** See `FIX_SEARCH.md`
- **Detailed Setup:** See `SETUP_DATABASE.md`
- **Technical Details:** See `IMPLEMENTATION_SUMMARY.md`
- **Run Test:** `npm run test:search`
