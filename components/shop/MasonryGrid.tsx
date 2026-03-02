"use client";

import { Product } from "@/types";
import { ProductCard } from "@/components/ui/ProductCard";
import { motion } from "framer-motion";

interface MasonryGridProps {
  products: Product[];
}

export function MasonryGrid({ products }: MasonryGridProps) {
  if (!products) return null;

  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
      {products.map((product, i) => {
        // Pseudo-random-ish pattern for aspect ratios
        // Tall cards break up the grid visually
        const isTall = i % 3 === 0 || i % 7 === 0;
        const isExtraTall = i % 5 === 0 && !isTall;

        let aspectRatioClass = "aspect-[3/4.5]"; // Standard
        if (isTall) aspectRatioClass = "aspect-[3/5]";
        if (isExtraTall) aspectRatioClass = "aspect-[3/6]";

        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "50px" }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
            className="break-inside-avoid mb-8 md:mb-12"
          >
            <ProductCard product={product} index={i} />
          </motion.div>
        );
      })}
    </div>
  );
}
