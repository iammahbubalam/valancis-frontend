"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface CollectionHeroProps {
  title: string;
  description?: string;
  image?: string;
}

export function CollectionHero({ 
  title, 
  description = "Curated pieces for the modern wardrobe.",
  image = "/assets/hero-bg-3.jpg" // Default fallback
}: CollectionHeroProps) {
  return (
    <div className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden flex items-center justify-center">
      {/* Background Image with Parallax-like feel (static for now) */}
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-2xl">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-white/80 text-xs uppercase tracking-[0.3em] mb-4 block"
        >
          Collection
        </motion.span>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif text-5xl md:text-7xl text-white mb-6 leading-tight"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white/90 text-lg font-light leading-relaxed font-body"
        >
          {description}
        </motion.p>
      </div>
    </div>
  );
}
