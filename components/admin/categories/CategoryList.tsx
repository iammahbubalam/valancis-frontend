'use client';

import { FlatCategory, CategoryRow } from './CategoryRow';
import { Loader2, LayoutList } from 'lucide-react';

interface CategoryListProps {
  items: FlatCategory[];
  expanded: Record<string, boolean>;
  isLoading: boolean;
  onToggleExpand: (id: string) => void;
  onEdit: (cat: any) => void;
  onDelete: (id: string) => void;
  onIndent: (id: string) => void;
  onOutdent: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onToggleActive: (id: string, value: boolean) => void;
  onToggleNav: (id: string, value: boolean) => void;
  onOpenCreate: () => void;
}

export function CategoryList({
  items,
  expanded,
  isLoading,
  onToggleExpand,
  onEdit,
  onDelete,
  onIndent,
  onOutdent,
  onMoveUp,
  onMoveDown,
  onToggleActive,
  onToggleNav,
  onOpenCreate
}: CategoryListProps) {

  if (isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
        <p>Loading catalog...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300 shadow-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LayoutList className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">No Categories Found</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">No categories match this filter.</p>
        <button onClick={onOpenCreate} className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 shadow-lg transition-colors font-semibold">
          Create Category
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
        <div className="col-span-5 text-xs font-bold text-gray-700 uppercase tracking-wider pl-2">Category</div>
        <div className="col-span-2 text-xs font-bold text-gray-700 uppercase tracking-wider">Parent</div>
        <div className="col-span-1 text-xs font-bold text-gray-700 uppercase tracking-wider text-center">Products</div>
        <div className="col-span-2 text-xs font-bold text-gray-700 uppercase tracking-wider">Status</div>
        <div className="col-span-2 text-xs font-bold text-gray-700 uppercase tracking-wider text-right pr-6">Actions</div>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100">
        {items.map((item, index) => (
          <CategoryRow
            key={item.id}
            category={item}
            expanded={expanded}
            toggleExpand={onToggleExpand}
            onEdit={onEdit}
            onDelete={onDelete}
            onIndent={onIndent}
            onOutdent={onOutdent}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onToggleActive={onToggleActive}
            onToggleNav={onToggleNav}
            isFirst={index === 0}
            isLast={index === items.length - 1}
            allCategories={items}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center gap-6">
        <span>Showing {items.length} categories</span>
        <span className="text-gray-300">|</span>
        <span>Click status badges to toggle instantly</span>
      </div>
    </div>
  );
}
