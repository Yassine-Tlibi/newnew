/**
 * Queue setup using BullMQ
 */

import { Queue } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// Define queue names
export const QUEUE_NAMES = {
  CRAWL: 'crawl',
  REFRESH_PRICES: 'refresh-prices',
};

// Create queues
export const crawlQueue = new Queue(QUEUE_NAMES.CRAWL, { connection });
export const refreshPricesQueue = new Queue(QUEUE_NAMES.REFRESH_PRICES, { connection });

// Job data types
export interface CrawlJobData {
  storeId: string;
  domain: string;
  maxPages?: number;
}

export interface RefreshPricesJobData {
  storeId?: string;
  productId?: string;
}

// Add jobs to queues
export async function addCrawlJob(data: CrawlJobData, delay = 0) {
  return crawlQueue.add('crawl-store', data, {
    delay,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  });
}

export async function addRefreshPricesJob(data: RefreshPricesJobData, delay = 0) {
  return refreshPricesQueue.add('refresh-prices', data, {
    delay,
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
  });
}

// Schedule recurring jobs
export async function scheduleRecurringCrawls(storeIds: string[]) {
  for (const storeId of storeIds) {
    await crawlQueue.add(
      'crawl-store-recurring',
      { storeId },
      {
        repeat: {
          pattern: '0 */6 * * *', // Every 6 hours
        },
      }
    );
  }
}
