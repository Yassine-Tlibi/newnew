import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        domain: true,
        name: true,
        logo: true,
      },
    });
    
    return NextResponse.json({ stores });
  } catch (error) {
    console.error('Stores fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    );
  }
}
