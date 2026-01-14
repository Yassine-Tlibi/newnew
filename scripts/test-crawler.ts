/**
 * Test script to verify crawler functionality
 * Usage: npx tsx scripts/test-crawler.ts
 */

import { crawler } from '../lib/scraper/crawler';
import { getPluginForDomain } from '../lib/scraper/plugins';

async function testCrawler() {
  const testDomain = 'gameworld.tn';
  
  console.log(`\n🔍 Testing crawler for ${testDomain}\n`);
  
  const plugin = getPluginForDomain(testDomain);
  if (!plugin) {
    console.error(`❌ No plugin found for ${testDomain}`);
    return;
  }
  
  console.log(`✅ Plugin found: ${plugin.name}`);
  console.log(`📋 Category URLs:`);
  plugin.getCategoryUrls().forEach(url => console.log(`   - ${url}`));
  
  try {
    console.log(`\n🚀 Starting crawl (limited to 1 page)...\n`);
    
    const result = await crawler.crawlStore(testDomain, {
      maxPages: 1,
      delay: 2000,
    });
    
    console.log(`\n✅ Crawl completed!`);
    console.log(`📊 Stats:`);
    console.log(`   - Pages visited: ${result.stats.pagesVisited}`);
    console.log(`   - Products found: ${result.stats.productsFound}`);
    console.log(`   - Duration: ${result.stats.duration}ms`);
    console.log(`   - Errors: ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.log(`\n⚠️  Errors encountered:`);
      result.errors.forEach(err => console.log(`   - ${err}`));
    }
    
    if (result.products.length > 0) {
      console.log(`\n📦 Sample products (first 3):`);
      result.products.slice(0, 3).forEach((product, i) => {
        console.log(`\n   ${i + 1}. ${product.title}`);
        console.log(`      Price: ${product.price} ${product.currency}`);
        console.log(`      URL: ${product.url}`);
        console.log(`      In Stock: ${product.availability !== 'out_of_stock'}`);
      });
    } else {
      console.log(`\n⚠️  No products extracted. This might indicate:`);
      console.log(`   - The selectors need updating for this store`);
      console.log(`   - The store structure has changed`);
      console.log(`   - Network or rate limiting issues`);
    }
  } catch (error) {
    console.error(`\n❌ Crawl failed:`, error);
  }
}

testCrawler();
