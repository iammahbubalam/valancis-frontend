"use client";

import { Category, Product } from "@/types";
import { motion } from "framer-motion";
import Image from "next/image";
import { Container } from "@/components/ui/Container";

interface CategoryHeroProps {
  category: Category;
  productCount: number;
}

export function CategoryHero({ category, productCount }: CategoryHeroProps) {
  const hasImage = category.image && category.image.length > 0;

  return (
    <section className="relative h-[55vh] min-h-[400px] overflow-hidden">
      {/* Background */}
      {hasImage ? (
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={category.image!}
            alt={category.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#0a0a0a]" />
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]" />
      )}

      {/* Hero Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-center px-6"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 60 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="h-[1px] bg-white/30 mx-auto mb-8"
          />

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white tracking-[0.02em] mb-6">
            {category.name}
          </h1>

          {category.metaDescription && (
            <p className="text-white/50 text-sm md:text-base tracking-wide max-w-md mx-auto mb-8">
              {category.metaDescription}
            </p>
          )}

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 60 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="h-[1px] bg-white/30 mx-auto mt-8"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-white/30 text-[10px] uppercase tracking-[0.4em] mt-10"
          >
            {productCount} Exclusive Pieces
          </motion.p>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent"
        />
      </motion.div>
    </section>
  );
}
