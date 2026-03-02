"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Category, Collection } from "@/types";
import { clsx } from "clsx";

export function NavMenu({
  categories,
  collections,
}: {
  categories: Category[];
  collections: Collection[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const pathname = usePathname();

  const navCategories = categories
    .filter((c) => c.showInNav !== false)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  // Helper to check if a category or any of its children are active
  const isCategorySelected = useMemo(() => {
    return (category: Category) => {
      const categoryPath = category.path || `/category/${category.slug}`;
      if (pathname === categoryPath) return true;

      // Check sub-categories
      return category.children?.some((child) => {
        const childPath = child.path || `/category/${child.slug}`;
        if (pathname === childPath) return true;

        // Check L3 sub-categories
        return child.children?.some((sub) => {
          const subPath = sub.path || `/category/${sub.slug}`;
          return pathname === subPath;
        });
      });
    };
  }, [pathname]);

  const isCollectionsSelected = useMemo(() => {
    return pathname === "/collections" || pathname.startsWith("/collection/");
  }, [pathname]);

  return (
    <nav
      className="hidden lg:flex items-center gap-10"
      onMouseLeave={() => setActiveId(null)}
    >
      {navCategories.map((category) => (
        <div key={category.id} className="relative group">
          {/* Top Level Item */}
          <Link
            href={category.path || `/category/${category.slug}`}
            className={clsx(
              "text-[11px] uppercase tracking-[0.25em] py-2 inline-block font-bold transition-all duration-300",
              (activeId === category.id || isCategorySelected(category))
                ? "text-accent-gold"
                : "text-primary/70 hover:text-primary"
            )}
            onMouseEnter={() => setActiveId(category.id)}
          >
            {category.name}
            {/* Subtle Animated Underline */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-accent-gold origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: (activeId === category.id || isCategorySelected(category)) ? 1 : 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </Link>

          {/* Mega Dropdown */}
          <AnimatePresence>
            {activeId === category.id &&
              category.children &&
              category.children.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute top-full left-1/2 -translate-x-1/2 w-[720px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-black/5 p-10 z-50 grid grid-cols-3 gap-10 rounded-sm"
                >
                  {category.children.map((child) => (
                    <div key={child.id} className="group/item flex flex-col">
                      {child.image && (
                        <Link
                          href={child.path || `/category/${child.slug}`}
                          className="relative w-full aspect-[4/5] mb-5 overflow-hidden bg-gray-50 border border-black/[0.03]"
                        >
                          <Image
                            src={child.image}
                            alt={child.name}
                            fill
                            className="object-cover group-hover/item:scale-105 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/5 transition-colors duration-500" />
                        </Link>
                      )}

                      <Link
                        href={child.path || `/category/${child.slug}`}
                        className="font-serif text-xl text-primary hover:text-accent-gold transition-colors duration-300 inline-flex items-center gap-2 mb-3"
                      >
                        {child.name}
                      </Link>

                      {/* Sub Children (Level 3) */}
                      {child.children && (
                        <div className="flex flex-col gap-2.5 mt-2 border-l border-black/5 pl-4">
                          {child.children.map((sub) => (
                            <Link
                              key={sub.id}
                              href={sub.path || `/category/${sub.slug}`}
                              className="text-[10px] text-primary/50 hover:text-accent-gold transition-colors uppercase tracking-[0.15em] font-medium"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
          </AnimatePresence>
        </div>
      ))}

      {/* Collections - Fixed Menu Item */}
      <div className="relative group">
        <Link
          href="/collections"
          className={clsx(
            "text-[11px] uppercase tracking-[0.25em] py-2 inline-block font-bold transition-all duration-300",
            (activeId === "collections" || isCollectionsSelected)
              ? "text-accent-gold"
              : "text-primary/70 hover:text-primary"
          )}
          onMouseEnter={() => setActiveId("collections")}
        >
          Collections
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-accent-gold origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: (activeId === "collections" || isCollectionsSelected) ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </Link>
        <AnimatePresence>
          {activeId === "collections" && collections && collections.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="absolute top-full right-0 w-[840px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-black/5 p-10 z-50 grid grid-cols-3 gap-10 rounded-sm"
              style={{ right: "-120px" }}
            >
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collection/${collection.slug}`}
                  className="group/coll flex flex-col gap-4"
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-50 border border-black/[0.03]">
                    {collection.image ? (
                      <Image
                        src={collection.image}
                        alt={collection.title}
                        fill
                        className="object-cover group-hover/coll:scale-105 transition-transform duration-1000 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-primary/20 bg-gray-50">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover/coll:bg-black/10 transition-colors duration-500" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl text-primary group-hover:text-accent-gold transition-colors duration-300 mb-1">
                      {collection.title}
                    </h4>
                    <p className="text-[11px] text-primary/40 leading-relaxed line-clamp-2 uppercase tracking-wider font-medium">
                      {collection.description}
                    </p>
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
