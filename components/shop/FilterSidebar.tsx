"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Category } from "@/types";
import { X, ChevronDown } from "lucide-react";
import clsx from "clsx";

interface FilterSidebarProps {
  categories: Category[];
  className?: string;
}

export function FilterSidebar({ categories, className }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  useEffect(() => {
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  const activeCategories = searchParams.get("category")?.split(",") || [];
  const inStock = searchParams.get("inStock") === "true";
  const currentSort = searchParams.get("sort") || "newest";
  const hasActiveFilters =
    activeCategories.length > 0 ||
    inStock ||
    searchParams.get("minPrice") ||
    searchParams.get("maxPrice");

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([name, value]) => {
        if (value === null) {
          params.delete(name);
        } else {
          if (name === "category") {
            const current = params.get("category")?.split(",") || [];
            if (current.includes(value)) {
              const next = current.filter((c) => c !== value);
              if (next.length > 0) params.set("category", next.join(","));
              else params.delete("category");
            } else {
              params.set("category", [...current, value].join(","));
            }
          } else {
            params.set(name, value);
          }
        }
      });
      params.set("page", "1");
      return params.toString();
    },
    [searchParams],
  );

  const pushFilter = (updates: Record<string, string | null>) => {
    router.push(`?${createQueryString(updates)}`, { scroll: false });
  };

  const applyPrice = () => {
    pushFilter({ minPrice: minPrice || null, maxPrice: maxPrice || null });
  };

  const handleClearAll = () => router.push("/shop");

  const removeFilter = (type: string, value?: string) => {
    if (type === "category" && value) pushFilter({ category: value });
    else if (type === "price") pushFilter({ minPrice: null, maxPrice: null });
    else if (type === "inStock") pushFilter({ inStock: null });
  };

  const getCategoryName = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name || slug;

  return (
    <div className={clsx("mb-10", className)}>
      {/* Filter Bar with Labels */}
      <div className="bg-white border border-gray-200 p-5 rounded-sm">
        <div className="flex flex-wrap items-end gap-6">
          {/* Sort By */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Sort By
            </label>
            <div className="relative">
              <select
                value={currentSort}
                onChange={(e) => pushFilter({ sort: e.target.value })}
                className="appearance-none bg-gray-50 border border-gray-200 hover:border-gray-400 px-4 py-2.5 pr-10 text-sm cursor-pointer focus:outline-none focus:border-black transition-colors min-w-[160px]"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="name">Alphabetical</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
              />
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Category
            </label>
            <div className="relative">
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) pushFilter({ category: e.target.value });
                }}
                className="appearance-none bg-gray-50 border border-gray-200 hover:border-gray-400 px-4 py-2.5 pr-10 text-sm cursor-pointer focus:outline-none focus:border-black transition-colors min-w-[160px]"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.slug}
                    disabled={activeCategories.includes(cat.slug)}
                  >
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
              />
            </div>
          </div>

          {/* Price Range */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Price Range (৳)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-20 bg-gray-50 border border-gray-200 hover:border-gray-400 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-400"
              />
              <span className="text-gray-400">—</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-20 bg-gray-50 border border-gray-200 hover:border-gray-400 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-400"
              />
              <button
                onClick={applyPrice}
                className="px-4 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors"
              >
                Go
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex flex-col gap-2 ml-auto pl-6 border-l border-gray-100">
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              View
            </label>
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-sm border border-gray-200">
              <button
                onClick={() => pushFilter({ view: "grid" })}
                className={clsx(
                  "p-1.5 rounded-sm transition-all",
                  !searchParams.get("view") ||
                    searchParams.get("view") === "grid"
                    ? "bg-white shadow-sm text-black"
                    : "text-gray-400 hover:text-black",
                )}
                title="Grid View"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </button>
              <button
                onClick={() => pushFilter({ view: "lookbook" })}
                className={clsx(
                  "p-1.5 rounded-sm transition-all",
                  searchParams.get("view") === "lookbook"
                    ? "bg-white shadow-sm text-black"
                    : "text-gray-400 hover:text-black",
                )}
                title="Lookbook View"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 14h18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Clear All */}
          {hasActiveFilters && (
            <div className="flex flex-col gap-2 justify-end pb-2">
              <button
                onClick={handleClearAll}
                className="text-sm text-red-600 hover:text-red-800 font-medium underline underline-offset-2"
              >
                Reset All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-xs text-gray-500 font-medium">
            Active Filters:
          </span>

          {activeCategories.map((slug) => (
            <button
              key={slug}
              onClick={() => removeFilter("category", slug)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-medium rounded-full hover:bg-gray-700 transition-colors"
            >
              {getCategoryName(slug)}
              <X size={12} />
            </button>
          ))}

          {(searchParams.get("minPrice") || searchParams.get("maxPrice")) && (
            <button
              onClick={() => removeFilter("price")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-medium rounded-full hover:bg-gray-700 transition-colors"
            >
              ৳{searchParams.get("minPrice") || "0"} — ৳
              {searchParams.get("maxPrice") || "∞"}
              <X size={12} />
            </button>
          )}

          {inStock && (
            <button
              onClick={() => removeFilter("inStock")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-medium rounded-full hover:bg-gray-700 transition-colors"
            >
              In Stock
              <X size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
