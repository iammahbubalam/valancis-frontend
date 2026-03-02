"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { Product } from "@/types";
import { ProductCard } from "@/components/ui/ProductCard";
import { useRef } from "react";

interface SplitCollectionProps {
  title: string;
  description: string;
  image: string;
  story?: string;
  products: Product[];
}

export function SplitCollection({
  title,
  description,
  image,
  story,
  products,
}: SplitCollectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Parallax effect for the image on the left
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col lg:flex-row min-h-screen relative"
    >
      {/* LEFT: Fixed Campaign Visual (50% w, 100vh h) */}
      <div className="lg:w-1/2 h-[60vh] lg:h-screen lg:sticky lg:top-0 relative overflow-hidden bg-primary order-1">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        {/* Professional Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

        <div className="absolute bottom-12 lg:bottom-16 left-8 lg:left-16 max-w-xl text-white p-6 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }} // smooth luxurious ease
          >
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-white/80 mb-6 block border-l-2 border-accent-gold pl-4">
              The Collection
            </span>
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight mb-8">
              {title}
            </h1>
            <p className="text-lg md:text-xl font-light leading-relaxed text-white/80 max-w-sm ml-1">
              {description}
            </p>
          </motion.div>
        </div>
      </div>

      {/* RIGHT: Scrollable Feed of Products */}
      <div className="lg:w-1/2 min-h-screen bg-bg-primary relative z-0 order-2">
        <div className="px-6 py-20 lg:px-20 lg:py-32 flex flex-col gap-24 lg:gap-32">
          {/* Context/Story Block at the top of the feed */}
          {story && (
            <div className="max-w-md">
              <span className="text-secondary uppercase tracking-[0.2em] text-xs mb-4 block">
                Editorial
              </span>
              <p className="font-serif text-3xl leading-snug text-primary">
                "{story}"
              </p>
            </div>
          )}

          {/* Product Feed - Single Col on mobile, Double on large? Let's do huge cards. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-20">
            {products.map((product, i) => {
              const isWide = i % 3 === 2;
              const aspectClass = isWide ? "aspect-[16/9]" : "aspect-[3/4.5]";

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: i % 2 === 0 ? 0 : 0.2 }}
                  className={isWide ? "md:col-span-2" : ""}
                >
                  <ProductCard product={product} index={i} />
                </motion.div>
              );
            })}
          </div>

          {products.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-secondary">Collection inventory updating...</p>
            </div>
          )}

          <div className="pt-20 border-t border-primary/10 flex justify-between items-end">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-widest text-secondary">
                Next Collection
              </span>
              <span className="font-serif text-2xl">Heritage 2024</span>
            </div>
            <button className="text-xs uppercase tracking-widest text-primary border-b border-primary pb-1">
              Discover
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
