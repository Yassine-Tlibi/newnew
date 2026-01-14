'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistance } from 'date-fns';

interface ProductData {
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
}

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/product/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setProduct(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Product fetch error:', err);
          setLoading(false);
        });
    }
  }, [params.id]);

  const handleOpenStore = (url: string) => {
    window.open(`/api/go?url=${encodeURIComponent(url)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-xl text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            Product Not Found
          </h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-zinc-900 dark:text-white">
            TN Game Price Finder
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              {product.offers[0]?.imageUrl && (
                <div className="w-full md:w-1/3">
                  <img
                    src={product.offers[0].imageUrl}
                    alt={product.productTitle}
                    className="w-full rounded-lg"
                  />
                </div>
              )}
              
              <div className="flex-1">
                <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                  {product.categoryName}
                </div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
                  {product.productTitle}
                </h1>
                
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                  <div className="text-sm text-green-700 dark:text-green-300 mb-1">
                    Lowest Price
                  </div>
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {product.lowestPrice.toFixed(3)} TND
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300 mt-2">
                    Available at {product.offers[0].storeName}
                  </div>
                </div>
                
                <div className="text-zinc-600 dark:text-zinc-400">
                  {product.offerCount} {product.offerCount === 1 ? 'offer' : 'offers'} from {
                    new Set(product.offers.map((o) => o.storeId)).size
                  } {new Set(product.offers.map((o) => o.storeId)).size === 1 ? 'store' : 'stores'}
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                Price Comparison
              </h2>
              
              <div className="space-y-3">
                {product.offers.map((offer) => (
                  <div
                    key={offer.offerId}
                    className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-zinc-900 dark:text-white">
                        {offer.storeName}
                      </div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        {offer.storeDomain}
                      </div>
                      <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        Checked {formatDistance(new Date(offer.lastCheckedAt), new Date(), { addSuffix: true })}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                          {offer.price.toFixed(3)} {offer.currency}
                        </div>
                        {!offer.inStock && (
                          <div className="text-sm text-red-600 dark:text-red-400">
                            Out of Stock
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleOpenStore(offer.url)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
                      >
                        Open Store
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
