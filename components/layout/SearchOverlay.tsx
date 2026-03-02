"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Loader2 } from "lucide-react";
import { searchAPI, SearchProduct } from "@/lib/api/search";
import Link from "next/link";
import Image from "next/image";

export function SearchOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle Search with Debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsLoading(true);
        try {
          const response = await searchAPI.search(query);
          setResults(response.data);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm cursor-pointer"
          />

          {/* Glassmorphism Modal */}
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-[101] max-h-[85vh] overflow-hidden"
          >
            <div className="mx-auto max-w-3xl mt-8 md:mt-16 mx-4 md:mx-auto">
              {/* Glass Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
                {/* Search Header */}
                <div className="flex items-center gap-4 p-6 border-b border-black/5">
                  <Search className="w-6 h-6 text-primary/40 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search products..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent text-xl md:text-2xl font-light placeholder:text-primary/30 focus:outline-none text-primary"
                  />
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-accent-gold flex-shrink-0" />
                  ) : (
                    <button
                      onClick={onClose}
                      className="p-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer flex-shrink-0"
                    >
                      <X className="w-5 h-5 text-primary/60" />
                    </button>
                  )}
                </div>

                {/* Results Area */}
                <div className="max-h-[60vh] overflow-y-auto">
                  {/* Results */}
                  {results.length > 0 && (
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-widest text-primary/40 mb-4 px-2">
                        {results.length} Result{results.length > 1 ? "s" : ""}
                      </p>
                      <div className="space-y-1">
                        {results.map((product, idx) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <Link
                              href={`/product/${product.slug}`}
                              onClick={onClose}
                              className="flex items-center gap-4 p-3 rounded-xl hover:bg-black/5 transition-all group cursor-pointer"
                            >
                              {/* Thumbnail */}
                              <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-main-secondary flex-shrink-0">
                                <Image
                                  src={
                                    product.images?.[0] || "/placeholder.jpg"
                                  }
                                  alt={product.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-serif text-lg text-primary group-hover:text-accent-gold transition-colors truncate">
                                  {product.name}
                                </h4>
                                <p className="text-sm text-primary/50 truncate">
                                  Product
                                </p>
                              </div>

                              {/* Price */}
                              <span className="text-primary font-medium text-sm flex-shrink-0">
                                ৳{(product.basePrice || 0).toLocaleString()}
                              </span>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Results */}
                  {query.length > 1 && !isLoading && results.length === 0 && (
                    <div className="text-center py-16 px-6">
                      <p className="text-primary/60 text-lg">
                        No results for "{query}"
                      </p>
                      <p className="text-primary/40 text-sm mt-2">
                        Try "silk", "saree", or "kurti"
                      </p>
                    </div>
                  )}

                  {/* Initial State */}
                  {query.length <= 1 && (
                    <div className="text-center py-16 px-6">
                      <p className="text-primary/40 text-sm">
                        Start typing to search...
                      </p>
                      <div className="flex justify-center gap-2 mt-4">
                        {["Silk", "Saree", "Kurti"].map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setQuery(tag)}
                            className="px-4 py-2 text-xs uppercase tracking-wide border border-primary/10 rounded-full hover:bg-primary hover:text-white transition-all cursor-pointer"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Keyboard Hint */}
              <div className="text-center mt-4">
                <span className="text-white/50 text-xs">
                  Press{" "}
                  <kbd className="px-2 py-1 bg-white/10 rounded text-[10px]">
                    ESC
                  </kbd>{" "}
                  to close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
