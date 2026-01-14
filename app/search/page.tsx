/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import ProductCard from '@/components/ProductCard';
import FilterPanel from '@/components/FilterPanel';

interface SearchResult {
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

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Store {
  id: string;
  domain: string;
  name: string;
  logo?: string;
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  
  const query = searchParams.get('q') || '';
  const categoryId = searchParams.get('category') || '';
  const storeId = searchParams.get('store') || '';
  const sortBy = searchParams.get('sortBy') || 'price_asc';
  const inStockOnly = searchParams.get('inStockOnly') === 'true';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/stores').then(res => res.json()),
    ]).then(([catData, storeData]) => {
      setCategories(catData.categories || []);
      setStores(storeData.stores || []);
    }).catch(err => console.error('Failed to load filters:', err));
  }, []);

  useEffect(() => {
    setLoading(true);
    
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (categoryId) params.set('category', categoryId);
    if (storeId) params.set('store', storeId);
    if (sortBy) params.set('sortBy', sortBy);
    if (inStockOnly) params.set('inStockOnly', 'true');
    params.set('page', page.toString());
    
    fetch(`/api/search?${params}`)
      .then(res => res.json())
      .then(data => {
        setResults(data.results || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error('Search error:', err);
        setLoading(false);
      });
  }, [query, categoryId, storeId, sortBy, inStockOnly, page]);

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams);
    if (newQuery) {
      params.set('q', newQuery);
    } else {
      params.delete('q');
    }
    params.delete('page');
    router.push(`/search?${params}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/search?${params}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="text-2xl font-bold text-zinc-900 dark:text-white">
              TN Game Price Finder
            </Link>
          </div>
          <SearchBar onSearch={handleSearch} initialQuery={query} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="w-64 flex-shrink-0">
            <FilterPanel
              categories={categories}
              stores={stores}
              selectedCategory={categoryId}
              selectedStore={storeId}
              sortBy={sortBy}
              inStockOnly={inStockOnly}
              onFilterChange={handleFilterChange}
            />
          </aside>

          <main className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                {query ? `Results for "${query}"` : 'All Products'}
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                {loading ? 'Searching...' : `${total} products found`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-zinc-200 dark:bg-zinc-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((product) => (
                  <ProductCard key={product.productId} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-zinc-600 dark:text-zinc-400">
                  No products found. Try adjusting your filters.
                </p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="mt-8 flex justify-center gap-2">
                {page > 1 && (
                  <button
                    onClick={() => handleFilterChange('page', (page - 1).toString())}
                    className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700"
                  >
                    Previous
                  </button>
                )}
                <span className="px-4 py-2 text-zinc-900 dark:text-white">
                  Page {page}
                </span>
                {results.length === 20 && (
                  <button
                    onClick={() => handleFilterChange('page', (page + 1).toString())}
                    className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700"
                  >
                    Next
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
