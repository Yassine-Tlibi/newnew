# Quick Start Guide

Get TN Game Price Finder up and running in minutes!

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- Docker & Docker Compose ([Download](https://www.docker.com/)) - *Optional but recommended*

## Option 1: Using Docker (Recommended)

This is the fastest way to get started with PostgreSQL and Redis.

### 1. Clone and Install

```bash
git clone <repository-url>
cd tn-game-price-finder
npm install
```

### 2. Start Database Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

### 3. Set Up Environment

The `.env` file should already be configured for Docker:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/tn_game_price_finder?schema=public"
REDIS_URL="redis://localhost:6379"
```

### 4. Initialize Database

```bash
npm run db:migrate
npm run db:seed
```

### 5. Start the App

```bash
# Terminal 1: Start Next.js app
npm run dev

# Terminal 2: Start crawl worker
npm run worker:crawl
```

### 6. Open in Browser

Visit [http://localhost:3000](http://localhost:3000)

### 7. Test Crawler (Optional)

```bash
npx tsx scripts/test-crawler.ts
```

## Option 2: Using Existing Services

If you already have PostgreSQL and Redis running:

### 1. Install

```bash
npm install
```

### 2. Configure Environment

Edit `.env` with your database and Redis URLs:

```env
DATABASE_URL="postgresql://your-user:your-password@your-host:5432/your-db?schema=public"
REDIS_URL="redis://your-redis-host:6379"
```

### 3. Set Up Database

```bash
npm run db:migrate
npm run db:seed
```

### 4. Start Application

```bash
# Terminal 1: App
npm run dev

# Terminal 2: Worker
npm run worker:crawl
```

## Initial Setup Checklist

- [x] PostgreSQL running
- [x] Redis running
- [x] Dependencies installed
- [x] Database migrated
- [x] Database seeded
- [x] App running on port 3000
- [x] Worker running

## What's Next?

### Trigger Your First Crawl

The app is empty until you crawl some stores. Here's how to trigger a crawl:

**Method 1: Via Admin API (coming soon)**

Create an admin endpoint or use the console:

```typescript
// In your browser console or Node REPL
fetch('http://localhost:3000/api/admin/crawl', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    domain: 'gameworld.tn'
  })
})
```

**Method 2: Programmatically**

Create a script `scripts/trigger-crawl.ts`:

```typescript
import { prisma } from '../lib/db/prisma';
import { addCrawlJob } from '../lib/queue';

async function triggerCrawl() {
  const stores = await prisma.store.findMany({
    where: { active: true, crawlEnabled: true },
  });
  
  for (const store of stores) {
    console.log(`Adding crawl job for ${store.name}...`);
    await addCrawlJob({
      storeId: store.id,
      domain: store.domain,
      maxPages: 3, // Start small for testing
    });
  }
  
  console.log('Crawl jobs added!');
}

triggerCrawl();
```

Then run:
```bash
npx tsx scripts/trigger-crawl.ts
```

The worker will process the jobs and populate your database.

## Verify It's Working

1. **Check database**:
   ```bash
   npx prisma studio
   ```
   Open [http://localhost:5555](http://localhost:5555) to browse data

2. **Check API**:
   ```bash
   curl http://localhost:3000/api/categories
   curl http://localhost:3000/api/stores
   ```

3. **Search for products**:
   Visit [http://localhost:3000/search](http://localhost:3000/search)

## Troubleshooting

### "Connection refused" errors

**Problem**: Can't connect to PostgreSQL or Redis

**Solutions**:
- Ensure Docker containers are running: `docker-compose ps`
- Check ports aren't in use: `lsof -i :5432` and `lsof -i :6379`
- Restart containers: `docker-compose restart`

### No products showing

**Problem**: Search returns empty results

**Solutions**:
- Check if crawl jobs ran: Check `CrawlLog` table in Prisma Studio
- Look at worker logs for errors
- Test crawler manually: `npx tsx scripts/test-crawler.ts`
- Stores might be blocking or rate-limiting

### Prisma Client errors

**Problem**: "Cannot find module '@prisma/client'"

**Solutions**:
```bash
npm run db:generate
```

### Worker not processing jobs

**Problem**: Jobs added but not processed

**Solutions**:
- Ensure Redis is running
- Check worker is running in separate terminal
- Look for errors in worker output
- Verify `REDIS_URL` in `.env`

## Development Tips

### Watch Logs

```bash
# App logs
npm run dev

# Worker logs (in separate terminal)
npm run worker:crawl

# Docker logs
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Database Management

```bash
# Open Prisma Studio
npx prisma studio

# Reset database (careful!)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name your_migration_name
```

### Stop Everything

```bash
# Stop Docker services
docker-compose down

# Stop and remove volumes (deletes data!)
docker-compose down -v
```

## Production Deployment

See [README.md](README.md) for production deployment guide.

## Need Help?

- Check [README.md](README.md) for detailed documentation
- See [CONTRIBUTING.md](CONTRIBUTING.md) for adding stores
- Open an issue on GitHub

---

Happy price hunting! 🎮💰
