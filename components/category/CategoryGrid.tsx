import { Product } from '@/types';
import { ProductCard } from '@/components/ui/ProductCard';
import { Grid, List, Loader2, PackageX } from 'lucide-react';
import { useState } from 'react';

interface CategoryGridProps {
  products: Product[];
  isLoading?: boolean;
}

export function CategoryGrid({ products, isLoading }: CategoryGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-sm">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <PackageX className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">
          No Products Found
        </h3>
        <p className="text-gray-500 max-w-md">
          We're currently restocking this collection. Please check back soon or explore our other categories.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* View Toggle & Count */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{products.length}</span> {products.length === 1 ? 'product' : 'products'}
        </p>

        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Grid view"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Grid/List */}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12'
          : 'flex flex-col gap-6'
      }>
        {products.map((product, index) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
