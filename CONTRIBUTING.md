# Contributing to TN Game Price Finder

Thank you for your interest in contributing! This guide will help you add support for new Tunisian gaming stores.

## Adding a New Store

### Step 1: Test Store Structure

Before adding a store, manually inspect its structure:

1. Visit the store's gaming/tech categories
2. Open browser DevTools and inspect product listings
3. Note the selectors for:
   - Product container (e.g., `.product-item`, `.product-card`)
   - Product title
   - Price
   - Product URL
   - Image
   - Stock status (if available)

### Step 2: Add Store to Database

Option A: Via seed script (recommended for initial setup)

Edit `prisma/seed.ts` and add your store:

```typescript
{
  domain: 'newstore.tn',
  name: 'New Store Name',
  active: true,
  crawlEnabled: true,
  rateLimit: 1000, // milliseconds between requests
  sitemapUrl: 'https://newstore.tn/sitemap.xml', // optional
}
```

Then run:
```bash
npm run db:seed
```

Option B: Direct database insert

```typescript
import { prisma } from '@/lib/db/prisma';

await prisma.store.create({
  data: {
    domain: 'newstore.tn',
    name: 'New Store',
    active: true,
    crawlEnabled: true,
    rateLimit: 1000,
  },
});
```

### Step 3: Create Store Plugin (if needed)

Most stores work with the generic plugin. Create a custom plugin only if:
- The store has a unique structure
- Special parsing logic is needed
- The generic selectors don't work

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
      'https://newstore.tn/pc-components',
      'https://newstore.tn/accessories',
    ];
  }
  
  extractProducts(html: string, url: string): ScrapedProduct[] {
    const $ = this.loadHtml(html);
    const products: ScrapedProduct[] = [];
    
    $('.product-card').each((_, elem) => {
      const $elem = $(elem);
      
      const title = $elem.find('h3.title').text().trim();
      const href = $elem.find('a').attr('href');
      const productUrl = href ? this.normalizeProductUrl(href) : '';
      
      const priceText = $elem.find('.price').text();
      const price = this.extractPriceFromText(priceText);
      
      const imageUrl = $elem.find('img').attr('src');
      
      const inStockText = $elem.find('.stock').text().toLowerCase();
      const availability = inStockText.includes('stock') 
        ? 'in_stock' 
        : 'out_of_stock';
      
      if (title && productUrl && price !== null) {
        products.push({
          title,
          url: productUrl,
          price,
          currency: 'TND',
          imageUrl: imageUrl ? this.normalizeProductUrl(imageUrl) : undefined,
          availability,
        });
      }
    });
    
    return products;
  }
}
```

### Step 4: Register Plugin

Edit `lib/scraper/plugins/index.ts`:

```typescript
import { NewStorePlugin } from './newstore';

// Add to plugin registry
plugins.set('newstore.tn', new NewStorePlugin());
```

### Step 5: Update Allowed Domains

Add the domain to `.env`:

```env
ALLOWED_DOMAINS="gameworld.tn,skymil-informatique.com,sbsinformatique.com,mytek.tn,bestbuytunisie.tn,newstore.tn"
```

### Step 6: Test the Crawler

Test your plugin:

```bash
# Edit scripts/test-crawler.ts to use your domain
npx tsx scripts/test-crawler.ts
```

Verify:
- Products are extracted correctly
- Prices are parsed properly
- URLs are absolute and valid
- Images load correctly

### Step 7: Trigger a Crawl

Add a crawl job:

```typescript
import { addCrawlJob } from '@/lib/queue';
import { prisma } from '@/lib/db/prisma';

const store = await prisma.store.findUnique({
  where: { domain: 'newstore.tn' }
});

if (store) {
  await addCrawlJob({
    storeId: store.id,
    domain: store.domain,
    maxPages: 5,
  });
}
```

## Best Practices

### Respect Robots.txt

Always check the store's robots.txt:

```bash
curl https://newstore.tn/robots.txt
```

Respect any disallowed paths.

### Rate Limiting

- Default: 1 request per second (1000ms)
- For smaller stores: increase to 2000ms
- For large stores with good infrastructure: can reduce to 500ms
- Always test and monitor

### Error Handling

Your plugin should gracefully handle:
- Missing elements
- Malformed prices
- Relative URLs
- Missing images
- Different stock status formats

### Testing Checklist

- [ ] Products extract correctly from category pages
- [ ] Prices parse as valid numbers
- [ ] URLs are absolute and working
- [ ] Images load
- [ ] Stock status detected (if available)
- [ ] No crawler crashes on edge cases
- [ ] Respects rate limits
- [ ] robots.txt compliance

## Common Issues

### Issue: No products extracted

**Causes:**
- Wrong selectors
- JavaScript-rendered content (needs Playwright)
- Rate limiting or blocking

**Solutions:**
- Inspect HTML source, not DevTools (may be JS-rendered)
- Try with Playwright if content is dynamic
- Increase rate limit delay
- Check user agent

### Issue: Wrong prices

**Causes:**
- Multiple price elements (original + sale price)
- Price in different format

**Solutions:**
- Be more specific with selectors
- Use `:first` or filter by class
- Update price extraction regex in `normalizer.ts`

### Issue: Products not matching

**Causes:**
- Very different naming conventions
- Missing brand/model information

**Solutions:**
- Improve normalization patterns in `lib/scraper/normalizer.ts`
- Lower similarity threshold in worker
- Add store-specific normalization rules

## Store Requirements

To be added, a store should:

1. ✅ Be a legitimate Tunisian e-commerce site
2. ✅ Sell gaming products (consoles, games, components, accessories)
3. ✅ Have publicly accessible product pages
4. ✅ Allow web scraping (check robots.txt and ToS)
5. ✅ Have stable URLs and structure

## Need Help?

- Check existing plugins in `lib/scraper/plugins/`
- Review `lib/scraper/normalizer.ts` for parsing utilities
- Test with `scripts/test-crawler.ts`
- Open an issue if stuck

## Legal Compliance

- Only scrape publicly accessible pages
- Respect robots.txt
- Implement rate limiting
- Don't bypass paywalls or authentication
- Store only necessary product information
- Provide attribution to stores
- Review each store's Terms of Service

---

Thank you for helping expand TN Game Price Finder! 🎮
