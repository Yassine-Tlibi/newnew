'use client';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryButtonsProps {
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
  selectedCategory?: string;
}

const categoryIcons: Record<string, string> = {
  consoles: '🎮',
  'video-games': '🕹️',
  'pc-components': '💻',
  accessories: '🎧',
  'gift-cards': '🎁',
  'pc-gaming': '⌨️',
  peripherals: '🖱️',
};

export default function CategoryButtons({
  categories,
  onCategoryClick,
  selectedCategory,
}: CategoryButtonsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryClick(category.id)}
          className={`p-6 rounded-lg border-2 transition-all ${
            selectedCategory === category.id
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700'
          }`}
        >
          <div className="text-4xl mb-2">
            {categoryIcons[category.slug] || '📦'}
          </div>
          <div className="font-semibold text-zinc-900 dark:text-white">
            {category.name}
          </div>
        </button>
      ))}
    </div>
  );
}
