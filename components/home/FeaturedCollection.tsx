"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Product } from "@/types";
import { ArrowRight } from "lucide-react";

export function FeaturedCollection({ products }: { products: Product[] }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-24 md:py-32 bg-main">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-accent-gold mb-4 block">
              Featured
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-primary leading-tight">
              New Arrivals
            </h2>
          </div>

          <Link
            href="/shop"
            className="group flex items-center gap-2 text-sm uppercase tracking-widest text-primary/70 hover:text-primary transition-colors cursor-pointer"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product Grid - Clean 4 Column */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 8).map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
            >
              <Link
                href={`/product/${product.slug}`}
                className="group block cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-main-secondary">
                  <Image
                    src={product.images?.[0] || "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                  {/* Badge if new or on sale */}
                  {product.isNew && (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-primary text-white text-[10px] uppercase tracking-wider">
                      New
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-1">
                  <h3 className="font-serif text-base md:text-lg text-primary group-hover:text-accent-gold transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-primary/50 uppercase tracking-wider">
                    {product.categories?.[0]?.name || "Collection"}
                  </p>
                  <p className="text-sm font-medium text-primary pt-1">
                    ৳{(product.basePrice || 0).toLocaleString()}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA - Mobile Only */}
        <div className="mt-12 text-center md:hidden">
          <Link
            href="/shop"
            className="inline-block px-8 py-3 border border-primary/20 text-sm uppercase tracking-widest hover:bg-primary hover:text-white transition-all cursor-pointer"
          >
            Shop All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
