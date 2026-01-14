# TN Game Price Finder

A production-ready price aggregator for gaming products across Tunisian e-commerce stores. Find the lowest prices for consoles, games, PC components, accessories, and more.

## 🎯 Features

- **Price Comparison**: Aggregates prices from multiple Tunisian gaming stores
- **Smart Search**: Full-text search with autocomplete and product normalization
- **Category Filtering**: Browse by consoles, video games, PC components, accessories, gift cards, etc.
- **Store Filtering**: Filter results by specific stores
- **Sorting Options**: Sort by lowest price, highest price, newest, or relevance
- **Stock Status**: Shows availability information when available
- **Secure Redirects**: Validated redirect system to prevent open redirect abuse
- **Background Crawling**: Queue-based worker system for regular price updates
- **Product Matching**: Smart normalization and deduplication of products across stores

## 📁 Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── search/       # Product search endpoint
│   │   ├── autocomplete/ # Search suggestions
│   │   ├── go/           # Secure redirect endpoint
│   │   ├── product/[id]/ # Product details
│   │   ├── categories/   # Category list
│   │   └── stores/       # Store list
│   ├── search/           # Search results page
│   ├── product/[id]/     # Product detail page
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── SearchBar.tsx
│   ├── ProductCard.tsx
│   ├── FilterPanel.tsx
│   └── CategoryButtons.tsx
├── lib/
│   ├── db/               # Database client
│   ├── scraper/          # Scraping logic
│   │   ├── plugins/      # Store-specific scrapers
│   │   ├── normalizer.ts # Product normalization
│   │   ├── crawler.ts    # Web crawler
│   │   └── types.ts
│   ├── queue/            # Job queue setup
│   └── search/           # Search functionality
├── workers/              # Background workers
│   └── crawl-worker.ts   # Crawl job processor
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
└── .env                  # Environment variables
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Redis server (for queue workers)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd tn-game-price-finder
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tn_game_price_finder?schema=public"

# Redis (for queue workers)
REDIS_URL="redis://localhost:6379"

# Search Provider (optional)
SEARCH_PROVIDER_API_KEY=""
SEARCH_PROVIDER_TYPE=""

# Allowed domains for redirect
ALLOWED_DOMAINS="gameworld.tn,skymil-informatique.com,sbsinformatique.com,mytek.tn,bestbuytunisie.tn"

# App settings
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Set up the database**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed initial data (categories and stores)
npx tsx prisma/seed.ts
```

5. **Start the development server**

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

6. **Start the crawl worker** (in a separate terminal)

```bash
npx tsx workers/crawl-worker.ts
```

## 🔧 Configuration

### Adding a New Store

To add support for a new Tunisian store:

1. **Add the store to the database**:

```typescript
await prisma.store.create({
  data: {
    domain: 'newstore.tn',
    name: 'New Store',
    active: true,
    crawlEnabled: true,
    rateLimit: 1000, // milliseconds between requests
    sitemapUrl: 'https://newstore.tn/sitemap.xml',
  },
});
```

2. **Create a store plugin** (optional, for custom extraction logic):

Create `lib/scraper/plugins/newstore.ts`:

```typescript
import { BaseStorePlugin } from './base';
import { ScrapedProduct } from '../types';

export class NewStorePlugin extends BaseStorePlugin {
  domain = 'newstore.tn';
  name = 'New Store';
  
  getCategoryUrls(): string[] {
    return [
      'https://newstore.tn/gaming',
      'https://newstore.tn/consoles',
      // Add category URLs
    ];
  }
  
  extractProducts(html: string, url: string): ScrapedProduct[] {
    const $ = this.loadHtml(html);
    const products: ScrapedProduct[] = [];
    
    // Custom extraction logic for this store
    $('.product-item').each((_, elem) => {
      const $elem = $(elem);
      const title = $elem.find('.product-title').text().trim();
      const url = $elem.find('a').attr('href') || '';
      const priceText = $elem.find('.price').text().trim();
      const price = this.extractPriceFromText(priceText);
      
      if (title && url && price) {
        products.push({
          title,
          url: this.normalizeProductUrl(url),
          price,
          currency: 'TND',
          imageUrl: $elem.find('img').attr('src'),
        });
      }
    });
    
    return products;
  }
}
```

3. **Register the plugin**:

In `lib/scraper/plugins/index.ts`:

```typescript
import { NewStorePlugin } from './newstore';
plugins.set('newstore.tn', new NewStorePlugin());
```

4. **Update allowed domains** in `.env`:

```env
ALLOWED_DOMAINS="gameworld.tn,skymil-informatique.com,sbsinformatique.com,mytek.tn,bestbuytunisie.tn,newstore.tn"
```

### Store Plugin System

The generic plugin automatically handles common e-commerce patterns. For stores with standard structures, no custom plugin is needed.

**Custom selectors** can be stored in the database:

```typescript
await prisma.store.update({
  where: { domain: 'store.tn' },
  data: {
    selectors: {
      productContainer: '.product-card',
      title: '.product-name',
      price: '.price-amount',
      image: 'img.product-image',
      link: 'a.product-link',
    },
  },
});
```

## 📊 Database Schema

Key models:

- **Category**: Product categories (consoles, games, components, etc.)
- **Store**: Tunisian e-commerce stores
- **Product**: Canonical products (normalized and deduplicated)
- **ProductOffer**: Store-specific offers for products
- **CrawlLog**: Crawl activity tracking

## 🤖 Background Workers

### Crawl Worker

Processes crawl jobs from the queue:

```bash
npx tsx workers/crawl-worker.ts
```

### Triggering Crawls

**Programmatically**:

```typescript
import { addCrawlJob } from '@/lib/queue';

await addCrawlJob({
  storeId: 'store-id',
  domain: 'gameworld.tn',
  maxPages: 5,
});
```

**Via API** (add an admin endpoint):

```typescript
// app/api/admin/crawl/route.ts
export async function POST(request: Request) {
  const { storeId, domain } = await request.json();
  await addCrawlJob({ storeId, domain });
  return NextResponse.json({ success: true });
}
```

## 🔍 Search Provider Integration (Optional)

The app works without external search APIs but can be extended to discover new stores:

**Supported providers**:
- SerpAPI
- Brave Search API
- Google Custom Search Engine

**Integration**:

1. Set environment variables:
```env
SEARCH_PROVIDER_TYPE="serpapi"
SEARCH_PROVIDER_API_KEY="your-api-key"
```

2. Implement in `lib/search/providers/` (architecture is ready for extension)

## 🔒 Security

- **Redirect Validation**: `/api/go` validates URLs against an allowlist of domains
- **Rate Limiting**: Respects crawl delays per store
- **robots.txt**: Crawler checks and respects robots.txt rules
- **No Authentication Required**: Public price comparison, no user data collected

## 🎨 Customization

### Styling

Uses Tailwind CSS. Customize in `app/globals.css` and component classes.

### Categories

Edit categories in `prisma/seed.ts` and re-run:

```bash
npx tsx prisma/seed.ts
```

### Normalization Rules

Customize brand/model patterns in `lib/scraper/normalizer.ts`:

```typescript
const BRAND_PATTERNS = {
  amd: /\b(amd|ryzen|radeon)\b/i,
  // Add more patterns
};
```

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/search` | GET | Search products with filters |
| `/api/autocomplete` | GET | Get search suggestions |
| `/api/product/[id]` | GET | Get product details |
| `/api/categories` | GET | List all categories |
| `/api/stores` | GET | List all active stores |
| `/api/go` | GET | Secure redirect to store URL |

### Example API Call

```bash
curl "http://localhost:3000/api/search?q=ryzen&sortBy=price_asc&limit=10"
```

## 🧪 Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run lint
```

## 📦 Deployment

1. **Database**: Set up PostgreSQL (Supabase, Railway, etc.)
2. **Redis**: Set up Redis instance (Upstash, Redis Cloud, etc.)
3. **App**: Deploy to Vercel, Railway, or any Node.js host
4. **Worker**: Deploy worker separately (Railway, Render, etc.)

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform.

## 🤝 Legal Compliance

- **robots.txt**: Always check and respect robots.txt
- **Rate Limiting**: Implement appropriate delays between requests
- **Terms of Service**: Review each store's ToS regarding scraping
- **Data Storage**: Only store public product information
- **Attribution**: Show store names and link to official product pages

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Built with Next.js, Prisma, and BullMQ
- Designed for Tunisian gaming community
- Respects store terms and rate limits

---

**Note**: This is a price comparison tool for educational and personal use. Always respect website terms of service and implement appropriate rate limiting.
