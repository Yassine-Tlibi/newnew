'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import CategoryButtons from '@/components/CategoryButtons';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function Home() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
      .catch(err => console.error('Failed to load categories:', err));
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/search?category=${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-zinc-900 dark:text-white">
            TN Game Price Finder
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            Find the best gaming deals across Tunisia 🎮
          </p>
        </header>

        <div className="max-w-3xl mx-auto mb-12">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-zinc-800 dark:text-zinc-200">
            Browse by Category
          </h2>
          <CategoryButtons 
            categories={categories} 
            onCategoryClick={handleCategoryClick}
          />
        </div>

        <footer className="mt-16 text-center text-sm text-zinc-500">
          <p>Price comparison for gaming products in Tunisia</p>
          <p className="mt-2">Prices are updated regularly from official stores</p>
        </footer>
      </div>
    </div>
  );
}
