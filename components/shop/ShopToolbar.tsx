"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Category } from "@/types";
import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { ChevronDown, Filter, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface ShopToolbarProps {
  categories: Category[];
  totalProducts: number;
  breadcrumbLabel?: string;
  isCategoryPage?: boolean;
}

export function ShopToolbar({
  categories,
  totalProducts,
  breadcrumbLabel = "Shop All",
  isCategoryPage = false,
}: ShopToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter States
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  // Sync state with URL
  useEffect(() => {
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  // Logic from FilterSidebar
  const activeCategories = searchParams.get("category")?.split(",") || [];
  const currentSort = searchParams.get("sort") || "newest";

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
      // Reset page when filtering
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

  const clearAll = () => {
    router.push("/shop");
    setIsFilterOpen(false);
  };

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case "price_asc":
        return "Price: Low to High";
      case "price_desc":
        return "Price: High to Low";
      case "name":
        return "Alphabetical";
      default:
        return "Newest";
    }
  };

  return (
    <>
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-black/5 py-4 transition-all duration-300">
        <Container className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-secondary">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span className="text-black/20">/</span>
            <span className="text-primary font-medium">{breadcrumbLabel}</span>
          </div>

          <div className="flex items-center gap-8 text-xs uppercase tracking-widest text-primary">
            <span className="hidden md:inline-block text-secondary">
              {totalProducts} Products
            </span>

            <div className="flex items-center gap-6 relative">
              {/* Sort Dropdown Trigger */}
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 hover:text-accent-gold transition-colors group"
              >
                Sort
                <ChevronDown
                  className={clsx(
                    "w-3 h-3 group-hover:text-accent-gold transition-transform",
                    isSortOpen && "rotate-180",
                  )}
                />
              </button>

              {/* Sort Dropdown Menu */}
              <AnimatePresence>
                {isSortOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-transparent"
                      onClick={() => setIsSortOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-4 w-48 bg-white shadow-xl border border-gray-100 py-2 z-50 rounded-sm"
                    >
                      {[
                        { label: "Newest", value: "newest" },
                        { label: "Price: Low to High", value: "price_asc" },
                        { label: "Price: High to Low", value: "price_desc" },
                        { label: "Alphabetical", value: "name" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            pushFilter({ sort: option.value });
                            setIsSortOpen(false);
                          }}
                          className={clsx(
                            "w-full text-left px-4 py-2.5 text-xs uppercase tracking-wider hover:bg-gray-50 hover:text-accent-gold transition-colors flex items-center justify-between",
                            currentSort === option.value
                              ? "text-accent-gold"
                              : "text-secondary",
                          )}
                        >
                          {option.label}
                          {currentSort === option.value && <Check size={12} />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Filter Trigger */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 hover:text-accent-gold transition-colors group"
              >
                Filter
                <Filter className="w-3 h-3 group-hover:text-accent-gold" />
                {activeCategories.length > 0 && (
                  <span className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
                )}
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* Filter Drawer Overlay */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/40 z-[50] backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[60] w-full max-w-sm bg-white shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <span className="font-serif text-xl text-primary">Filters</span>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 hover:bg-gray-50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-secondary" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Categories */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-secondary">
                    Categories
                  </h3>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div
                          className={clsx(
                            "w-4 h-4 border transition-colors flex items-center justify-center",
                            activeCategories.includes(cat.slug)
                              ? "bg-black border-black"
                              : "border-gray-300 group-hover:border-black",
                          )}
                        >
                          {activeCategories.includes(cat.slug) && (
                            <Check size={10} className="text-white" />
                          )}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={activeCategories.includes(cat.slug)}
                          onChange={() => pushFilter({ category: cat.slug })}
                        />
                        <span
                          className={clsx(
                            "text-sm transition-colors",
                            activeCategories.includes(cat.slug)
                              ? "text-primary font-medium"
                              : "text-secondary group-hover:text-primary",
                          )}
                        >
                          {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-secondary">
                    Price Range
                  </h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors rounded-sm"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors rounded-sm"
                    />
                  </div>
                  <button
                    onClick={applyPrice}
                    className="w-full bg-black text-white text-xs uppercase tracking-widest py-3 hover:bg-primary/90 transition-colors"
                  >
                    Apply Price
                  </button>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={clearAll}
                  className="w-full border border-gray-300 text-secondary text-xs uppercase tracking-widest py-3 hover:bg-white hover:text-red-500 hover:border-red-200 transition-all font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
