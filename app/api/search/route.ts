import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/search';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const query = searchParams.get('q') || undefined;
    const categoryId = searchParams.get('category') || undefined;
    const storeId = searchParams.get('store') || undefined;
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const inStockOnly = searchParams.get('inStockOnly') === 'true';
    const sortBy = (searchParams.get('sortBy') as any) || 'price_asc';
    const exactMatch = searchParams.get('exactMatch') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const offset = (page - 1) * limit;
    
    const results = await searchProducts({
      query,
      categoryId,
      storeId,
      minPrice,
      maxPrice,
      inStockOnly,
      sortBy,
      exactMatch,
      limit,
      offset,
    });
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    );
  }
}
