import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

/**
 * Initialize database with categories and stores
 * This can be called manually to seed the database
 */
export async function POST(request: NextRequest) {
  try {
    const adminToken = process.env.ADMIN_TOKEN;
    
    if (adminToken) {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      
      if (token !== adminToken) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }
    
    console.log('Initializing database...');
    
    // Create categories
    const categories = [
      { name: 'Consoles', slug: 'consoles', description: 'PlayStation, Xbox, Nintendo Switch and handhelds' },
      { name: 'Video Games', slug: 'video-games', description: 'Games for PC, PlayStation, Xbox, and Nintendo' },
      { name: 'PC Components', slug: 'pc-components', description: 'CPU, GPU, RAM, motherboard, PSU, storage' },
      { name: 'Accessories', slug: 'accessories', description: 'Controllers, headsets, mouse, keyboard, chairs' },
      { name: 'Gift Cards', slug: 'gift-cards', description: 'PSN, Xbox, Steam, Nintendo eShop cards' },
      { name: 'PC Gaming', slug: 'pc-gaming', description: 'Gaming PCs and laptops' },
      { name: 'Peripherals', slug: 'peripherals', description: 'Monitors, keyboards, mice, and gaming peripherals' },
    ];
    
    console.log('Creating categories...');
    const createdCategories = await Promise.all(
      categories.map(cat =>
        prisma.category.upsert({
          where: { slug: cat.slug },
          update: cat,
          create: cat,
        })
      )
    );
    
    // Create stores
    const stores = [
      {
        domain: 'gameworld.tn',
        name: 'Game World',
        active: true,
        crawlEnabled: true,
        rateLimit: 1000,
        sitemapUrl: 'https://gameworld.tn/sitemap.xml',
      },
      {
        domain: 'skymil-informatique.com',
        name: 'Skymil Informatique',
        active: true,
        crawlEnabled: true,
        rateLimit: 1000,
        sitemapUrl: 'https://skymil-informatique.com/sitemap.xml',
      },
      {
        domain: 'sbsinformatique.com',
        name: 'SBS Informatique',
        active: true,
        crawlEnabled: true,
        rateLimit: 1000,
        sitemapUrl: 'https://sbsinformatique.com/sitemap.xml',
      },
      {
        domain: 'mytek.tn',
        name: 'MyTek',
        active: true,
        crawlEnabled: true,
        rateLimit: 1000,
        sitemapUrl: 'https://mytek.tn/sitemap.xml',
      },
      {
        domain: 'bestbuytunisie.tn',
        name: 'Best Buy Tunisie',
        active: true,
        crawlEnabled: true,
        rateLimit: 1000,
        sitemapUrl: 'https://bestbuytunisie.tn/sitemap.xml',
      },
    ];
    
    console.log('Creating stores...');
    const createdStores = await Promise.all(
      stores.map(store =>
        prisma.store.upsert({
          where: { domain: store.domain },
          update: store,
          create: store,
        })
      )
    );
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      data: {
        categoriesCreated: createdCategories.length,
        storesCreated: createdStores.length,
      },
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
