#!/usr/bin/env tsx
/**
 * Test script to verify search flow works
 * Run: npm run dev (in one terminal) then tsx scripts/test-search-flow.ts (in another)
 */

async function testSearchFlow() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  console.log('🧪 Testing TN Game Price Finder Search Flow\n');
  
  // Test 1: Health Check
  console.log('1️⃣ Testing health endpoint...');
  try {
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const health = await healthRes.json();
    
    if (health.status === 'healthy') {
      console.log('✅ Database connected');
      console.log(`   Products: ${health.stats.products}`);
      console.log(`   Offers: ${health.stats.offers}`);
      console.log(`   Stores: ${health.stats.stores}`);
      console.log(`   Categories: ${health.stats.categories}\n`);
    } else {
      console.log('❌ Database unhealthy:', health.error);
      console.log('\n⚠️  Run this first: npm run db:push\n');
      return;
    }
  } catch (error) {
    console.log('❌ Health check failed:', error);
    console.log('\n⚠️  Make sure the dev server is running: npm run dev\n');
    return;
  }
  
  // Test 2: Check if categories exist
  console.log('2️⃣ Checking categories...');
  try {
    const catRes = await fetch(`${baseUrl}/api/categories`);
    const catData = await catRes.json();
    
    if (catData.categories && catData.categories.length > 0) {
      console.log(`✅ Found ${catData.categories.length} categories`);
      console.log(`   Examples: ${catData.categories.slice(0, 3).map((c: { name: string }) => c.name).join(', ')}\n`);
    } else {
      console.log('⚠️  No categories found');
      console.log('   Run: curl -X POST ' + baseUrl + '/api/admin/init-db\n');
      return;
    }
  } catch (error) {
    console.log('❌ Categories check failed:', error);
    return;
  }
  
  // Test 3: Check if stores exist
  console.log('3️⃣ Checking stores...');
  try {
    const storesRes = await fetch(`${baseUrl}/api/stores`);
    const storesData = await storesRes.json();
    
    if (storesData.stores && storesData.stores.length > 0) {
      console.log(`✅ Found ${storesData.stores.length} stores`);
      console.log(`   Examples: ${storesData.stores.slice(0, 3).map((s: { name: string }) => s.name).join(', ')}\n`);
    } else {
      console.log('⚠️  No stores found');
      console.log('   Run: curl -X POST ' + baseUrl + '/api/admin/init-db\n');
      return;
    }
  } catch (error) {
    console.log('❌ Stores check failed:', error);
    return;
  }
  
  // Test 4: Search for products
  console.log('4️⃣ Testing search...');
  try {
    const searchRes = await fetch(`${baseUrl}/api/search?q=ryzen`);
    const searchData = await searchRes.json();
    
    if (searchData.results && searchData.results.length > 0) {
      console.log(`✅ Search returned ${searchData.results.length} results`);
      console.log(`   Total products: ${searchData.total}`);
      console.log('   Sample result:');
      const first = searchData.results[0];
      console.log(`   - ${first.productTitle}`);
      console.log(`   - Price: ${first.lowestPrice} ${first.offers[0]?.currency || 'TND'}`);
      console.log(`   - Store: ${first.offers[0]?.storeName}\n`);
      console.log('🎉 Search flow is working!\n');
    } else {
      console.log('⚠️  Search returned 0 results');
      console.log('   This is expected if you haven\'t added products yet.');
      console.log('\n📝 To fix:');
      console.log('   Option 1: Add test products:');
      console.log('   curl -X POST ' + baseUrl + '/api/admin/add-test-products');
      console.log('\n   Option 2: Trigger a crawl:');
      console.log('   curl -X POST ' + baseUrl + '/api/admin/crawl -H "Content-Type: application/json" -d \'{"domain": "gameworld.tn", "maxPages": 5}\'\n');
    }
  } catch (error) {
    console.log('❌ Search test failed:', error);
  }
  
  // Test 5: Test autocomplete
  console.log('5️⃣ Testing autocomplete...');
  try {
    const acRes = await fetch(`${baseUrl}/api/autocomplete?q=ry`);
    const acData = await acRes.json();
    
    if (acData.suggestions && acData.suggestions.length > 0) {
      console.log(`✅ Autocomplete returned ${acData.suggestions.length} suggestions`);
      console.log(`   Examples: ${acData.suggestions.slice(0, 3).join(', ')}\n`);
    } else {
      console.log('⚠️  Autocomplete returned 0 suggestions (expected if no products)\n');
    }
  } catch {
    console.log('⚠️  Autocomplete test skipped\n');
  }
  
  console.log('✨ Test complete!\n');
}

testSearchFlow().catch(console.error);
