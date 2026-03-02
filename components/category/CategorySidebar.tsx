'use client';

import { Category } from '@/types';
import { CategoryTree } from './CategoryTree';
import { ProductFilters } from '@/lib/api/categories';
import { Sliders, X } from 'lucide-react';
import { useState } from 'react';

interface CategorySidebarProps {
  categories: Category[];
  activeCategory: Category | null;
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
}

export function CategorySidebar({ 
  categories, 
  activeCategory, 
  filters, 
  onFiltersChange 
}: CategorySidebarProps) {
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || 0,
    max: filters.maxPrice || 10000
  });

  const handlePriceChange = () => {
    onFiltersChange({
      ...filters,
      minPrice: priceRange.min,
      maxPrice: priceRange.max
    });
  };

  const handleClearFilters = () => {
    setPriceRange({ min: 0, max: 10000 });
    onFiltersChange({});
  };

  const hasActiveFilters = 
    filters.minPrice || 
    filters.maxPrice || 
    filters.inStock !== undefined || 
    filters.sort;

  return (
    <aside className="w-full md:w-72 flex-shrink-0">
      <div className="sticky top-24 space-y-8">
        
        {/* Filters Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Sliders className="w-4 h-4" />
            <span>Filters</span>
          </div>
          
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        {/* Price Range */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Price Range
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                onBlur={handlePriceChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Min"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                onBlur={handlePriceChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Max"
              />
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Availability
          </h4>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.inStock || false}
              onChange={(e) => onFiltersChange({ ...filters, inStock: e.target.checked || undefined })}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">In Stock Only</span>
          </label>
        </div>

        {/* Sort */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Sort By
          </h4>
          
          <select
            value={filters.sort || ''}
            onChange={(e) => onFiltersChange({ ...filters, sort: e.target.value as any || undefined })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
          >
            <option value="">Default</option>
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        {/* Category Tree */}
        <div className="pt-8 border-t border-gray-200">
          <CategoryTree 
            categories={categories} 
            activeCategoryId={activeCategory?.id}
          />
        </div>
      </div>
    </aside>
  );
}
