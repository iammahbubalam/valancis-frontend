"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/ui/ProductCard";

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-32 bg-white border-t border-primary/5">
      <div className="max-w-[1600px] mx-auto px-6">
        {/* Minimal Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-20"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-gold mb-4 block">
            New Season
          </span>
          <h2 className="font-serif text-5xl md:text-6xl text-primary leading-none">
            Latest Arrivals
          </h2>
        </motion.div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {products.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              index={idx}
              priority={idx < 4} // Optimize LCP for first row
            />
          ))}
        </div>

        {/* View All Footer */}
        <div className="text-center mt-20">
          <Link
            href="/shop"
            className="inline-block border-b border-primary pb-1 text-xs uppercase tracking-[0.2em] hover:text-accent-gold hover:border-accent-gold transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
