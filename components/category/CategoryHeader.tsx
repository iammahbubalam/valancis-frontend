import Image from 'next/image';
import { Category } from '@/types';
import { CategoryBreadcrumbs } from './CategoryBreadcrumbs';
import { Breadcrumb } from '@/lib/category-utils';
import { PackageSearch } from 'lucide-react';

interface CategoryHeaderProps {
  category: Category;
  breadcrumbs: Breadcrumb[];
  productCount: number;
}

export function CategoryHeader({ category, breadcrumbs, productCount }: CategoryHeaderProps) {
  return (
    <div className="relative">
      {/* Background Image/Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent-gold/5 -z-10" />
      
      {category.image && (
        <div className="absolute inset-0 -z-20 opacity-10">
          <Image 
            src={category.image} 
            alt="" 
            fill 
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <CategoryBreadcrumbs breadcrumbs={breadcrumbs} />
        </div>

        {/* Title & Metadata */}
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-primary mb-4">
              {category.name}
            </h1>
            
            {category.metaDescription && (
              <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
                {category.metaDescription}
              </p>
            )}

            <div className="flex items-center gap-6 mt-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <PackageSearch className="w-4 h-4" />
                <span>{productCount} {productCount === 1 ? 'Product' : 'Products'}</span>
              </div>
              
              {!category.isActive && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  Inactive
                </span>
              )}
            </div>
          </div>

          {/* Category Icon/Image */}
          {category.image && (
            <div className="hidden lg:block w-32 h-32 rounded-2xl overflow-hidden shadow-lg bg-white p-4">
              <div className="relative w-full h-full">
                <Image 
                  src={category.image} 
                  alt={category.name}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
