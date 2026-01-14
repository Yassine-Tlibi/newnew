'use client';

import { formatDistance } from 'date-fns';

interface ProductCardProps {
  product: {
    productId: string;
    productTitle: string;
    categoryName: string;
    lowestPrice: number;
    highestPrice: number;
    offerCount: number;
    offers: Array<{
      offerId: string;
      storeId: string;
      storeName: string;
      storeDomain: string;
      url: string;
      price: number;
      currency: string;
      inStock: boolean;
      imageUrl?: string;
      lastCheckedAt: Date;
    }>;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const lowestOffer = product.offers[0];
  
  const handleOpenStore = () => {
    const url = `/api/go?url=${encodeURIComponent(lowestOffer.url)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg transition-shadow">
      {lowestOffer.imageUrl && (
        <div className="aspect-square bg-zinc-100 dark:bg-zinc-700 relative">
          <img
            src={lowestOffer.imageUrl}
            alt={product.productTitle}
            className="w-full h-full object-contain"
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
          {product.categoryName}
        </div>
        
        <h3 className="font-semibold text-zinc-900 dark:text-white mb-2 line-clamp-2">
          {product.productTitle}
        </h3>
        
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              {lowestOffer.price.toFixed(3)} {lowestOffer.currency}
            </span>
            {product.offerCount > 1 && (
              <span className="text-sm text-zinc-500">
                from {product.offerCount} stores
              </span>
            )}
          </div>
          
          {!lowestOffer.inStock && (
            <div className="text-sm text-red-600 dark:text-red-400 mt-1">
              Out of stock
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {lowestOffer.storeName}
          </div>
          <div className="text-xs text-zinc-500">
            {formatDistance(new Date(lowestOffer.lastCheckedAt), new Date(), { addSuffix: true })}
          </div>
        </div>
        
        <button
          onClick={handleOpenStore}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
        >
          View in Store
        </button>
        
        {product.offerCount > 1 && (
          <button
            onClick={() => window.location.href = `/product/${product.productId}`}
            className="w-full mt-2 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            Compare {product.offerCount} offers
          </button>
        )}
      </div>
    </div>
  );
}
