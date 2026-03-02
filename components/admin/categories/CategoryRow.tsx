'use client';

import { Category } from '@/types';
import { ChevronRight, ChevronDown, Edit2, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Eye, EyeOff, Package, Tag, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export interface FlatCategory extends Category {
  depth: number;
  parentId?: string;
  index: number;
  productCount?: number;
}

interface CategoryRowProps {
  category: FlatCategory;
  expanded: Record<string, boolean>;
  toggleExpand: (id: string) => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
  onIndent: (id: string) => void;
  onOutdent: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onToggleActive: (id: string, value: boolean) => void;
  onToggleNav: (id: string, value: boolean) => void;
  isFirst: boolean;
  isLast: boolean;
  allCategories: FlatCategory[];
}

const INDENT_WIDTH = 32;

export function CategoryRow({
  category,
  expanded,
  toggleExpand,
  onEdit,
  onDelete,
  onIndent,
  onOutdent,
  onMoveUp,
  onMoveDown,
  onToggleActive,
  onToggleNav,
  isFirst,
  isLast,
  allCategories
}: CategoryRowProps) {
  const hasChildren = category.children && category.children.length > 0;
  const parentCategory = category.parentId ? allCategories.find(c => c.id === category.parentId) : null;

  return (
    <div className="group relative transition-all duration-200 hover:bg-blue-50/30 border-b border-gray-100 last:border-0">
      <div className="grid grid-cols-12 gap-4 items-center py-3 pr-6" style={{ paddingLeft: `${category.depth * INDENT_WIDTH + 20}px` }}>
        
        {/* Hierarchy Lines */}
        {category.depth > 0 && (
          <>
            <div className="absolute left-0 top-0 bottom-0 border-l-2 border-gray-200" style={{ left: `${(category.depth * INDENT_WIDTH) - (INDENT_WIDTH / 2) + 20}px` }} />
            <div className="absolute w-4 border-t-2 border-gray-200" style={{ left: `${(category.depth * INDENT_WIDTH) - (INDENT_WIDTH / 2) + 20}px`, top: '50%' }} />
          </>
        )}

        {/* Column 1: Name & Hierarchy (5 cols) */}
        <div className="col-span-5 flex items-center gap-3 relative z-10 min-w-0">
          <button
            onClick={() => toggleExpand(category.id)}
            className={`flex-shrink-0 p-1.5 rounded-md transition-all ${hasChildren ? 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm' : 'opacity-0 pointer-events-none'}`}
          >
            {expanded[category.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <div className="w-10 h-10 rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
            {category.image ? (
              <Image src={category.image} alt="" width={40} height={40} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-gray-400">{category.name.substring(0, 2).toUpperCase()}</span>
            )}
          </div>

          <div onClick={() => onEdit(category)} className="cursor-pointer flex-1 min-w-0 group-hover:text-primary transition-colors">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-gray-900 truncate">{category.name}</h4>
              {category.metaTitle && <Tag className="w-3 h-3 text-purple-500 flex-shrink-0" />}
            </div>
            <p className="text-xs text-gray-500 font-mono truncate">{category.slug}</p>
          </div>
        </div>

        {/* Column 2: Parent (2 cols) */}
        <div className="col-span-2 text-xs">
          {parentCategory ? (
            <div className="flex items-center gap-1.5 text-gray-600">
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{parentCategory.name}</span>
            </div>
          ) : (
            <span className="text-gray-400 italic">Root</span>
          )}
        </div>

        {/* Column 3: Products (1 col) */}
        <div className="col-span-1 text-center">
          <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-full">
            <Package className="w-3 h-3 text-gray-400" />
            <span className="text-xs font-semibold text-gray-700">{category.productCount || 0}</span>
          </div>
        </div>

        {/* Column 4: Status (2 cols) - CLICKABLE */}
        <div className="col-span-2 flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onToggleActive(category.id, !category.isActive)}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer hover:shadow-md ${
              category.isActive 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.isActive ? '● Active' : '○ Inactive'}
          </button>
          
          <button
            onClick={() => onToggleNav(category.id, !category.showInNav)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer hover:shadow-md ${
              category.showInNav 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            }`}
          >
            {category.showInNav ? (
              <><Eye className="w-2.5 h-2.5" /> Nav</>
            ) : (
              <><EyeOff className="w-2.5 h-2.5" /> Hidden</>
            )}
          </button>
        </div>

        {/* Column 5: Actions (2 cols) */}
        <div className="col-span-2 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-0.5 bg-gray-100 p-0.5 rounded-lg">
            <button onClick={() => onMoveUp(category.id)} disabled={isFirst} className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:text-gray-900 hover:bg-white transition-all disabled:opacity-20" title="Move Up">
              <ArrowUp className="w-3 h-3" />
            </button>
            <button onClick={() => onMoveDown(category.id)} disabled={isLast} className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:text-gray-900 hover:bg-white transition-all disabled:opacity-20" title="Move Down">
              <ArrowDown className="w-3 h-3" />
            </button>
            <div className="w-px h-4 bg-gray-300 mx-0.5" />
            <button onClick={() => onOutdent(category.id)} disabled={category.depth === 0} className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:text-gray-900 hover:bg-white transition-all disabled:opacity-20" title="Outdent">
              <ArrowLeft className="w-3 h-3" />
            </button>
            <button onClick={() => onIndent(category.id)} className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:text-gray-900 hover:bg-white transition-all" title="Indent">
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <button onClick={() => onEdit(category)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:text-primary hover:bg-primary/10 transition-all" title="Edit">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(category.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
