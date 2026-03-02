import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { Breadcrumb } from '@/lib/category-utils';

interface CategoryBreadcrumbsProps {
  breadcrumbs: Breadcrumb[];
}

export function CategoryBreadcrumbs({ breadcrumbs }: CategoryBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      <Link 
        href="/" 
        className="text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">Home</span>
      </Link>

      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.slug} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gray-300" />
          {index === breadcrumbs.length - 1 ? (
            <span className="text-primary font-medium">{crumb.name}</span>
          ) : (
            <Link 
              href={crumb.href}
              className="text-gray-500 hover:text-primary transition-colors"
            >
              {crumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
