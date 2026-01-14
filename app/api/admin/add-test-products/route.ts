import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { normalizeProductTitle } from '@/lib/scraper/normalizer';

export const dynamic = 'force-dynamic';

/**
 * Add test products to database for testing search functionality
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
    
    console.log('Adding test products...');
    
    // Get a category and store first
    const pcComponentsCategory = await prisma.category.findFirst({
      where: { slug: 'pc-components' }
    });
    
    const consolesCategory = await prisma.category.findFirst({
      where: { slug: 'consoles' }
    });
    
    const store = await prisma.store.findFirst({
      where: { domain: 'gameworld.tn' }
    });
    
    if (!pcComponentsCategory || !consolesCategory || !store) {
      return NextResponse.json(
        { error: 'Categories or stores not found. Initialize database first.' },
        { status: 400 }
      );
    }
    
    // Test products
    const testProducts = [
      {
        title: 'Processor AMD RYZEN 5 5500',
        category: pcComponentsCategory,
        price: 450.500,
        url: 'https://gameworld.tn/products/amd-ryzen-5-5500',
        imageUrl: 'https://via.placeholder.com/300x300?text=AMD+Ryzen+5+5500',
      },
      {
        title: 'AMD Ryzen 5 5600X Processor',
        category: pcComponentsCategory,
        price: 620.000,
        url: 'https://gameworld.tn/products/amd-ryzen-5-5600x',
        imageUrl: 'https://via.placeholder.com/300x300?text=AMD+Ryzen+5+5600X',
      },
      {
        title: 'PlayStation 5 Console',
        category: consolesCategory,
        price: 2450.000,
        url: 'https://gameworld.tn/products/ps5-console',
        imageUrl: 'https://via.placeholder.com/300x300?text=PS5',
      },
      {
        title: 'NVIDIA GeForce RTX 4060 Ti',
        category: pcComponentsCategory,
        price: 1850.000,
        url: 'https://gameworld.tn/products/rtx-4060-ti',
        imageUrl: 'https://via.placeholder.com/300x300?text=RTX+4060+Ti',
      },
      {
        title: 'Intel Core i5-12400F Processor',
        category: pcComponentsCategory,
        price: 520.000,
        url: 'https://gameworld.tn/products/intel-i5-12400f',
        imageUrl: 'https://via.placeholder.com/300x300?text=Intel+i5',
      },
    ];
    
    const createdProducts = [];
    
    for (const testProduct of testProducts) {
      // Normalize the product title
      const normalized = normalizeProductTitle(testProduct.title);
      
      // Check if product already exists
      const existingProduct = await prisma.product.findFirst({
        where: {
          normalizedTitle: normalized.normalizedTitle,
          categoryId: testProduct.category.id,
        },
      });
      
      // Create or get product
      const product = existingProduct || await prisma.product.create({
        data: {
          originalTitle: testProduct.title,
          normalizedTitle: normalized.normalizedTitle,
          brand: normalized.brand,
          model: normalized.model,
          categoryId: testProduct.category.id,
        },
      });
      
      // Check if offer already exists
      const existingOffer = await prisma.productOffer.findFirst({
        where: {
          productId: product.id,
          storeId: store.id,
        },
      });
      
      // Create or update offer
      const offer = existingOffer
        ? await prisma.productOffer.update({
            where: { id: existingOffer.id },
            data: {
              title: testProduct.title,
              url: testProduct.url,
              price: testProduct.price,
              inStock: true,
              imageUrl: testProduct.imageUrl,
              lastCheckedAt: new Date(),
            },
          })
        : await prisma.productOffer.create({
            data: {
              productId: product.id,
              storeId: store.id,
              title: testProduct.title,
              url: testProduct.url,
              price: testProduct.price,
              currency: 'TND',
              inStock: true,
              availability: 'in_stock',
              imageUrl: testProduct.imageUrl,
              lastCheckedAt: new Date(),
            },
          });
      
      createdProducts.push({
        product: product.originalTitle,
        price: offer.price,
        store: store.name,
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test products added successfully',
      data: {
        productsAdded: createdProducts.length,
        products: createdProducts,
      },
    });
  } catch (error) {
    console.error('Add test products error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to add test products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
