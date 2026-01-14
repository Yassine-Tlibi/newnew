import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    
    const stats = await prisma.$transaction([
      prisma.product.count(),
      prisma.productOffer.count(),
      prisma.store.count({ where: { active: true } }),
      prisma.category.count(),
    ]);
    
    const [productCount, offerCount, activeStoreCount, categoryCount] = stats;
    
    const recentCrawl = await prisma.crawlLog.findFirst({
      orderBy: { completedAt: 'desc' },
      select: {
        completedAt: true,
        status: true,
        productsFound: true,
        store: {
          select: { name: true },
        },
      },
    });
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      stats: {
        products: productCount,
        offers: offerCount,
        stores: activeStoreCount,
        categories: categoryCount,
      },
      lastCrawl: recentCrawl ? {
        store: recentCrawl.store.name,
        completedAt: recentCrawl.completedAt,
        status: recentCrawl.status,
        productsFound: recentCrawl.productsFound,
      } : null,
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
