'use client';

interface FilterPanelProps {
  categories: Array<{ id: string; name: string }>;
  stores: Array<{ id: string; name: string }>;
  selectedCategory?: string;
  selectedStore?: string;
  sortBy?: string;
  inStockOnly?: boolean;
  onFilterChange: (key: string, value: string) => void;
}

export default function FilterPanel({
  categories,
  stores,
  selectedCategory,
  selectedStore,
  sortBy = 'price_asc',
  inStockOnly = false,
  onFilterChange,
}: FilterPanelProps) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6 sticky top-24">
      <h3 className="font-bold text-lg mb-4 text-zinc-900 dark:text-white">Filters</h3>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => onFilterChange('sortBy', e.target.value)}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
        >
          <option value="price_asc">Lowest Price</option>
          <option value="price_desc">Highest Price</option>
          <option value="newest">Newest</option>
          <option value="relevance">Relevance</option>
        </select>
      </div>
      
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onFilterChange('inStockOnly', e.target.checked ? 'true' : '')}
            className="rounded"
          />
          In Stock Only
        </label>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
          Store
        </label>
        <select
          value={selectedStore}
          onChange={(e) => onFilterChange('store', e.target.value)}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
        >
          <option value="">All Stores</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>
      
      <button
        onClick={() => {
          onFilterChange('category', '');
          onFilterChange('store', '');
          onFilterChange('sortBy', 'price_asc');
          onFilterChange('inStockOnly', '');
        }}
        className="w-full py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
      >
        Clear Filters
      </button>
    </div>
  );
}
