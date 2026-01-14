/**
 * Product search functionality
 */

import { prisma } from '../db/prisma';
import { normalizeProductTitle } from '../scraper/normalizer';
import { Prisma } from '@prisma/client';

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  storeId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'relevance';
  exactMatch?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  productId: string;
  productTitle: string;
  categoryName: string;
  offers: Array<{
    offerId: string;
    storeId: string;
    storeName: string;
    storeDomain: string;
    title: string;
    url: string;
    price: number;
    originalPrice?: number;
    currency: string;
    inStock: boolean;
    availability?: string;
    imageUrl?: string;
    lastCheckedAt: Date;
  }>;
  lowestPrice: number;
  highestPrice: number;
  offerCount: number;
}

/**
 * Search for products
 */
export async function searchProducts(filters: SearchFilters): Promise<{
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const {
    query,
    categoryId,
    storeId,
    minPrice,
    maxPrice,
    inStockOnly = false,
    sortBy = 'price_asc',
    exactMatch = false,
    limit = 20,
    offset = 0,
  } = filters;
  
  // Build where clause for products
  const productWhere: Prisma.ProductWhereInput = {};
  
  if (categoryId) {
    productWhere.categoryId = categoryId;
  }
  
  if (query) {
    const normalized = normalizeProductTitle(query);
    
    if (exactMatch) {
      // Exact match on normalized title
      productWhere.normalizedTitle = normalized.normalizedTitle;
    } else {
      // Fuzzy search using contains
      productWhere.OR = [
        { normalizedTitle: { contains: normalized.normalizedTitle, mode: 'insensitive' } },
        { originalTitle: { contains: query, mode: 'insensitive' } },
        { brand: { contains: normalized.brand || '', mode: 'insensitive' } },
        { model: { contains: normalized.model || '', mode: 'insensitive' } },
      ];
    }
  }
  
  // Build where clause for offers
  const offerWhere: Prisma.ProductOfferWhereInput = {};
  
  if (storeId) {
    offerWhere.storeId = storeId;
  }
  
  if (minPrice !== undefined || maxPrice !== undefined) {
    offerWhere.price = {};
    if (minPrice !== undefined) {
      offerWhere.price.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      offerWhere.price.lte = maxPrice;
    }
  }
  
  if (inStockOnly) {
    offerWhere.inStock = true;
  }
  
  // Get products with their offers
  const products = await prisma.product.findMany({
    where: productWhere,
    include: {
      category: true,
      productOffers: {
        where: offerWhere,
        include: {
          store: true,
        },
        orderBy: {
          price: 'asc',
        },
      },
    },
    skip: offset,
    take: limit,
  });
  
  // Filter products that have at least one offer matching the criteria
  const productsWithOffers = products.filter(p => p.productOffers.length > 0);
  
  // Transform to search results
  const results: SearchResult[] = productsWithOffers.map(product => {
    const offers = product.productOffers.map(offer => ({
      offerId: offer.id,
      storeId: offer.storeId,
      storeName: offer.store.name,
      storeDomain: offer.store.domain,
      title: offer.title,
      url: offer.url,
      price: Number(offer.price),
      originalPrice: offer.originalPrice ? Number(offer.originalPrice) : undefined,
      currency: offer.currency,
      inStock: offer.inStock,
      availability: offer.availability || undefined,
      imageUrl: offer.imageUrl || undefined,
      lastCheckedAt: offer.lastCheckedAt,
    }));
    
    const prices = offers.map(o => o.price);
    
    return {
      productId: product.id,
      productTitle: product.originalTitle,
      categoryName: product.category.name,
      offers,
      lowestPrice: Math.min(...prices),
      highestPrice: Math.max(...prices),
      offerCount: offers.length,
    };
  });
  
  // Sort results
  let sortedResults = results;
  if (sortBy === 'price_asc') {
    sortedResults = results.sort((a, b) => a.lowestPrice - b.lowestPrice);
  } else if (sortBy === 'price_desc') {
    sortedResults = results.sort((a, b) => b.lowestPrice - a.lowestPrice);
  } else if (sortBy === 'newest') {
    sortedResults = results.sort((a, b) => {
      const aNewest = Math.max(...a.offers.map(o => o.lastCheckedAt.getTime()));
      const bNewest = Math.max(...b.offers.map(o => o.lastCheckedAt.getTime()));
      return bNewest - aNewest;
    });
  }
  
  // Get total count
  const total = await prisma.product.count({ where: productWhere });
  
  return {
    results: sortedResults,
    total,
    page: Math.floor(offset / limit) + 1,
    pageSize: limit,
  };
}

/**
 * Get autocomplete suggestions
 */
export async function getAutocompleteSuggestions(query: string, limit = 10): Promise<string[]> {
  if (!query || query.length < 2) {
    return [];
  }
  
  const normalized = normalizeProductTitle(query);
  
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { normalizedTitle: { contains: normalized.normalizedTitle, mode: 'insensitive' } },
        { originalTitle: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      originalTitle: true,
    },
    take: limit,
  });
  
  return products.map(p => p.originalTitle);
}

/**
 * Get product by ID with all offers
 */
export async function getProductById(productId: string): Promise<SearchResult | null> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      productOffers: {
        include: {
          store: true,
        },
        orderBy: {
          price: 'asc',
        },
      },
    },
  });
  
  if (!product || product.productOffers.length === 0) {
    return null;
  }
  
  const offers = product.productOffers.map(offer => ({
    offerId: offer.id,
    storeId: offer.storeId,
    storeName: offer.store.name,
    storeDomain: offer.store.domain,
    title: offer.title,
    url: offer.url,
    price: Number(offer.price),
    originalPrice: offer.originalPrice ? Number(offer.originalPrice) : undefined,
    currency: offer.currency,
    inStock: offer.inStock,
    availability: offer.availability || undefined,
    imageUrl: offer.imageUrl || undefined,
    lastCheckedAt: offer.lastCheckedAt,
  }));
  
  const prices = offers.map(o => o.price);
  
  return {
    productId: product.id,
    productTitle: product.originalTitle,
    categoryName: product.category.name,
    offers,
    lowestPrice: Math.min(...prices),
    highestPrice: Math.max(...prices),
    offerCount: offers.length,
  };
}
