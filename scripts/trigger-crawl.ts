/**
 * Trigger crawl jobs for all active stores
 * Usage: npx tsx scripts/trigger-crawl.ts
 */

import { prisma } from '../lib/db/prisma';
import { addCrawlJob } from '../lib/queue';

async function triggerCrawl() {
  console.log('🔍 Finding active stores...\n');
  
  const stores = await prisma.store.findMany({
    where: { 
      active: true, 
      crawlEnabled: true 
    },
  });
  
  if (stores.length === 0) {
    console.log('❌ No active stores found. Run seed first: npm run db:seed');
    return;
  }
  
  console.log(`✅ Found ${stores.length} active stores:\n`);
  stores.forEach(store => {
    console.log(`   - ${store.name} (${store.domain})`);
  });
  
  console.log('\n🚀 Adding crawl jobs...\n');
  
  for (const store of stores) {
    try {
      await addCrawlJob({
        storeId: store.id,
        domain: store.domain,
        maxPages: 3, // Start small for initial test
      });
      console.log(`   ✅ ${store.name} - Job added`);
    } catch (error) {
      console.error(`   ❌ ${store.name} - Failed: ${error}`);
    }
  }
  
  console.log('\n✅ All jobs added to queue!');
  console.log('\nMake sure the worker is running:');
  console.log('   npm run worker:crawl');
  console.log('\nJobs will be processed in the background.');
  
  await prisma.$disconnect();
}

triggerCrawl().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
