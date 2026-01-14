import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '../lib/db/prisma';
import { crawler } from '../lib/scraper/crawler';
import { normalizeProductTitle, areProductsSimilar } from '../lib/scraper/normalizer';
import { CrawlJobData } from '../lib/queue';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const crawlWorker = new Worker(
  'crawl',
  async (job) => {
    const { storeId, domain, maxPages = 10 } = job.data as CrawlJobData;
    
    console.log(`Starting crawl for store: ${domain}`);
    
    const startTime = Date.now();
    let productsCreated = 0;
    let productsUpdated = 0;
    let error: string | null = null;
    
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
      });
      
      if (!store || !store.active || !store.crawlEnabled) {
        throw new Error('Store is not active or crawl is disabled');
      }
      
      const result = await crawler.crawlStore(domain, {
        maxPages,
        delay: store.rateLimit,
      });
      
      console.log(`Crawled ${result.stats.productsFound} products from ${domain}`);
      
      for (const scrapedProduct of result.products) {
        const normalized = normalizeProductTitle(scrapedProduct.title);
        
        const existingProducts = await prisma.product.findMany({
          where: {
            normalizedTitle: {
              contains: normalized.normalizedTitle.split(' ')[0] || '',
              mode: 'insensitive',
            },
          },
          include: {
            productOffers: {
              where: { storeId: store.id },
            },
          },
        });
        
        let matchedProduct = null;
        for (const existing of existingProducts) {
          const existingNormalized = normalizeProductTitle(existing.originalTitle);
          if (areProductsSimilar(normalized, existingNormalized, 0.75)) {
            matchedProduct = existing;
            break;
          }
        }
        
        if (!matchedProduct) {
          const defaultCategory = await prisma.category.findFirst();
          if (!defaultCategory) continue;
          
          matchedProduct = await prisma.product.create({
            data: {
              originalTitle: scrapedProduct.title,
              normalizedTitle: normalized.normalizedTitle,
              brand: normalized.brand,
              model: normalized.model,
              categoryId: defaultCategory.id,
              imageUrl: scrapedProduct.imageUrl,
            },
          });
          productsCreated++;
        }
        
        const existingOffer = await prisma.productOffer.findUnique({
          where: {
            productId_storeId: {
              productId: matchedProduct.id,
              storeId: store.id,
            },
          },
        });
        
        if (existingOffer) {
          await prisma.productOffer.update({
            where: { id: existingOffer.id },
            data: {
              price: scrapedProduct.price,
              title: scrapedProduct.title,
              url: scrapedProduct.url,
              imageUrl: scrapedProduct.imageUrl,
              inStock: scrapedProduct.availability !== 'out_of_stock',
              availability: scrapedProduct.availability,
              lastCheckedAt: new Date(),
            },
          });
          productsUpdated++;
        } else {
          await prisma.productOffer.create({
            data: {
              productId: matchedProduct.id,
              storeId: store.id,
              title: scrapedProduct.title,
              url: scrapedProduct.url,
              price: scrapedProduct.price,
              currency: scrapedProduct.currency,
              originalPrice: scrapedProduct.originalPrice,
              imageUrl: scrapedProduct.imageUrl,
              inStock: scrapedProduct.availability !== 'out_of_stock',
              availability: scrapedProduct.availability,
            },
          });
          productsCreated++;
        }
      }
      
      await prisma.store.update({
        where: { id: store.id },
        data: { lastCrawlAt: new Date() },
      });
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      console.error(`Crawl error for ${domain}:`, error);
      throw err;
    } finally {
      const duration = Date.now() - startTime;
      
      await prisma.crawlLog.create({
        data: {
          storeId,
          status: error ? 'failed' : 'success',
          productsFound: productsCreated + productsUpdated,
          productsCreated,
          productsUpdated,
          error,
          startedAt: new Date(startTime),
          completedAt: new Date(),
          duration,
        },
      });
      
      console.log(`Crawl completed for ${domain}: ${productsCreated} created, ${productsUpdated} updated in ${duration}ms`);
    }
  },
  { connection }
);

crawlWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

crawlWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

console.log('Crawl worker started');

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing worker...');
  await crawlWorker.close();
  process.exit(0);
});
