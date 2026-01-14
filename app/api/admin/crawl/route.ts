import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { addCrawlJob } from '@/lib/queue';

export const dynamic = 'force-dynamic';

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
    
    const body = await request.json();
    const { storeId, domain, maxPages = 10 } = body;
    
    let store;
    
    if (storeId) {
      store = await prisma.store.findUnique({
        where: { id: storeId },
      });
    } else if (domain) {
      store = await prisma.store.findUnique({
        where: { domain },
      });
    } else {
      return NextResponse.json(
        { error: 'Either storeId or domain is required' },
        { status: 400 }
      );
    }
    
    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }
    
    if (!store.active || !store.crawlEnabled) {
      return NextResponse.json(
        { error: 'Store is not active or crawl is disabled' },
        { status: 400 }
      );
    }
    
    const job = await addCrawlJob({
      storeId: store.id,
      domain: store.domain,
      maxPages,
    });
    
    return NextResponse.json({
      success: true,
      jobId: job.id,
      store: {
        id: store.id,
        name: store.name,
        domain: store.domain,
      },
    });
  } catch (error) {
    console.error('Admin crawl error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger crawl' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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
    
    const recentCrawls = await prisma.crawlLog.findMany({
      take: 20,
      orderBy: { startedAt: 'desc' },
      include: {
        store: {
          select: {
            name: true,
            domain: true,
          },
        },
      },
    });
    
    return NextResponse.json({ crawls: recentCrawls });
  } catch (error) {
    console.error('Admin crawl logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crawl logs' },
      { status: 500 }
    );
  }
}
