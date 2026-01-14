# Quick Reference - Search Flow Fix

## The Problem
- ✅ Search returns "0 products found"
- ✅ Supabase database has no tables or data

## The Fix (3 Steps)

```bash
# Step 1: Create database tables
npm run db:push

# Step 2: Start server
npm run dev

# Step 3: Initialize data (in new terminal)
./scripts/quick-setup.sh
```

**Done!** Search now works at http://localhost:3000

---

## Manual Initialization

If quick-setup.sh doesn't work:

```bash
# Terminal 1
npm run dev

# Terminal 2
curl -X POST http://localhost:3000/api/admin/init-db
curl -X POST http://localhost:3000/api/admin/add-test-products
```

---

## Verify Setup

```bash
# Check database
curl http://localhost:3000/api/health

# Test search
curl "http://localhost:3000/api/search?q=ryzen"

# Or run test script
npm run test:search
```

---

## Test Searches

Open http://localhost:3000 and search for:
- `Ryzen` → 2 AMD processors
- `PS5` → 1 PlayStation 5
- `processor` → 3 processors

---

## New Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/init-db` | POST | Create categories & stores |
| `/api/admin/add-test-products` | POST | Add sample products |
| `/api/health` | GET | Check database status |

---

## New Scripts

| Command | Purpose |
|---------|---------|
| `npm run db:push` | Push schema to database |
| `npm run test:search` | Test search functionality |
| `./scripts/quick-setup.sh` | Quick setup (all-in-one) |

---

## Troubleshooting

### Database Connection Error
```bash
# Check DATABASE_URL is set
echo $DATABASE_URL

# Verify Supabase is running
# Check Supabase dashboard
```

### Still Getting 0 Results
```bash
# 1. Check health
curl http://localhost:3000/api/health

# 2. Re-initialize
curl -X POST http://localhost:3000/api/admin/init-db
curl -X POST http://localhost:3000/api/admin/add-test-products

# 3. Test again
curl "http://localhost:3000/api/search?q=ryzen"
```

---

## Next: Real Crawling

Once test products work:

```bash
# Crawl real store
curl -X POST http://localhost:3000/api/admin/crawl \
  -H "Content-Type: application/json" \
  -d '{"domain": "gameworld.tn", "maxPages": 5}'

# Start background worker
npm run worker:crawl
```

---

## Documentation

- **START_HERE.md** - Start here (3-step guide)
- **FIX_SEARCH.md** - Detailed fix guide
- **SETUP_DATABASE.md** - Complete setup
- **IMPLEMENTATION_SUMMARY.md** - Technical details
- **CHANGES.md** - What was changed

---

## What Was NOT Changed

- ✅ No UI changes
- ✅ No styling changes
- ✅ No layout changes
- ✅ No new features

**Only backend database initialization!**
