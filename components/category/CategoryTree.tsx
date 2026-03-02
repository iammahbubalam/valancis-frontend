'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Category } from '@/types';
import { ChevronRight, ChevronDown, EyeOff } from 'lucide-react';
import { flattenCategoryTree } from '@/lib/category-utils';

interface CategoryTreeProps {
  categories: Category[];
  activeCategoryId?: string;
  className?: string;
}

interface TreeNodeProps {
  category: Category;
  isActive: boolean;
  level: number;
}

function TreeNode({ category, isActive, level }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(isActive || level === 0);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className="select-none">
      <div
        className={`
          flex items-center gap-2 py-2 px-3 rounded-lg transition-all cursor-pointer group
          ${isActive 
            ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary pl-2' 
            : 'hover:bg-gray-50 text-gray-700 hover:text-primary'
          }
        `}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
      >
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 hover:bg-gray-200 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        )}
        
        {!hasChildren && <div className="w-4" />}

        <Link 
          href={`/category/${category.slug}`}
          className="flex-1 flex items-center justify-between gap-2"
        >
          <span className="text-sm truncate">{category.name}</span>
          
          <div className="flex items-center gap-1">
            {!category.showInNav && (
              <span className="text-[9px] px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded-full font-medium" title="Hidden from navigation">
                <EyeOff className="w-2.5 h-2.5" />
              </span>
            )}
            {!category.isActive && (
              <span className="text-[9px] px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded-full font-medium">
                Inactive
              </span>
            )}
          </div>
        </Link>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-1">
          {category.children!.map((child) => (
            <TreeNode
              key={child.id}
              category={child}
              isActive={child.id === category.id}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTree({ categories, activeCategoryId, className = '' }: CategoryTreeProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 px-3">
        All Categories
      </h3>
      
      {categories.map((category) => (
        <TreeNode
          key={category.id}
          category={category}
          isActive={category.id === activeCategoryId}
          level={0}
        />
      ))}
    </div>
  );
}
