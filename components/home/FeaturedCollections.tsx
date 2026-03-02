"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";
import { Collection } from "@/types";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";

interface FeaturedCollectionsProps {
  collections: Collection[];
}

export function FeaturedCollections({ collections }: FeaturedCollectionsProps) {
  if (!collections || collections.length === 0) return null;

  return <FeaturedCollectionsContent collections={collections} />;
}

function FeaturedCollectionsContent({ collections }: FeaturedCollectionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax for Background Text
  const textX = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  return (
    <section
      ref={containerRef}
      className="py-32 bg-main overflow-hidden relative border-t border-primary/5"
    >
      {/* Decorative Background Text (Parallax) */}
      <motion.div
        style={{ x: textX }}
        className="absolute top-10 left-0 whitespace-nowrap opacity-[0.04] pointer-events-none select-none z-0"
      >
        <h2 className="text-[12rem] md:text-[20rem] font-serif leading-none text-primary">
          Heritage Collections
        </h2>
      </motion.div>

      <div className="max-w-[1800px] mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 px-4 md:px-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-accent-gold mb-6 block">
              Curated Edits
            </span>
            <h2 className="font-serif text-5xl md:text-7xl text-primary leading-none">
              The Collections
            </h2>
          </div>

          <div className="hidden md:block mb-2">
            <Link
              href="/collections"
              className="group flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-primary hover:text-accent-gold transition-colors"
            >
              View All
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Horizontal Gallery */}
        <div className="flex gap-4 md:gap-8 overflow-x-auto pb-12 px-4 md:px-8 snap-x snap-mandatory no-scrollbar -mx-4 md:mx-0">
          {collections.map((collection, idx) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              index={idx}
            />
          ))}
        </div>

        {/* Mobile View All */}
        <div className="md:hidden flex justify-center mt-8">
          <Link
            href="/collections"
            className="text-xs uppercase tracking-[0.2em] border-b border-primary pb-1"
          >
            View All Collections
          </Link>
        </div>
      </div>
    </section>
  );
}

function CollectionCard({
  collection,
  index,
}: {
  collection: Collection;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="min-w-[80vw] md:min-w-[500px] lg:min-w-[600px] snap-start group cursor-pointer"
    >
      <Link href={`/collection/${collection.slug}`} className="block">
        {/* Image Container with Overflow Hidden for Zoom Effect */}
        <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden mb-8 bg-[#f0f0f0]">
          <Image
            src={collection.image || "/placeholder.jpg"}
            alt={collection.title}
            fill
            className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

          {/* Floating Number */}
          <div className="absolute top-6 right-6 text-white/50 text-6xl font-serif opacity-0 group-hover:opacity-100 transition-opacity duration-700 select-none">
            {String(index + 1).padStart(2, "0")}
          </div>
        </div>

        {/* Text Content */}
        <div className="pr-8 group-hover:pl-4 transition-all duration-500">
          <motion.h3
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
            className="font-serif text-3xl md:text-5xl text-primary leading-none mb-3 group-hover:text-accent-gold transition-colors"
          >
            {collection.title}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: index * 0.1 + 0.5 }}
            className="text-primary/60 text-sm md:text-base max-w-sm line-clamp-2"
          >
            {collection.description ||
              "Explore the timeless elegance of this exclusive collection."}
          </motion.p>
        </div>
      </Link>
    </motion.div>
  );
}
