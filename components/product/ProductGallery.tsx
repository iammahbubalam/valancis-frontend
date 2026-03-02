"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fallback if no images
  const displayImages = images.length > 0 ? images : ["/placeholder.jpg"];

  // --- Mobile Scroll Tracker ---
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const newIndex = Math.round(scrollLeft / clientWidth);
    setActiveIndex(newIndex);
  };

  const scrollToImage = (index: number) => {
    setActiveIndex(index);
    // Mobile scroll
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * scrollRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  };

  const nextImage = () => {
    const next = (activeIndex + 1) % displayImages.length;
    scrollToImage(next);
  };

  const prevImage = () => {
    const prev = (activeIndex - 1 + displayImages.length) % displayImages.length;
    scrollToImage(prev);
  };

  return (
    <div className="w-full">
      {/* 
        --- MOBILE VIEW (< lg) --- 
        Full-width Swipeable Carousel.
      */}
      <div className="lg:hidden relative w-full bg-gray-50 mb-6 overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        >
          {displayImages.map((url, idx) => (
            <div
              key={idx}
              className="w-screen aspect-[3/4] flex-shrink-0 snap-center relative"
            >
              <Image
                src={url}
                alt={`Product view ${idx + 1}`}
                fill
                className="object-cover"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>

        {/* Mobile Minimalist Pagination Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {displayImages.map((_, idx) => (
            <div
              key={idx}
              className={clsx(
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                activeIndex === idx ? "bg-primary w-4" : "bg-primary/20"
              )}
            />
          ))}
        </div>
      </div>

      {/* 
        --- DESKTOP VIEW (>= lg) ---
        Thumbnails Left + Main Stage Right (Reference Style).
      */}
      <div className="hidden lg:flex gap-4 w-[90%] mx-auto">
        {/* Thumbnails Column (Left) */}
        <div className="w-20 flex flex-col gap-3">
          {displayImages.map((url, idx) => (
            <button
              key={idx}
              onClick={() => scrollToImage(idx)}
              className={clsx(
                "relative w-full aspect-square bg-gray-50 transition-all duration-200 overflow-hidden",
                activeIndex === idx
                  ? "ring-1 ring-black ring-offset-1 opacity-100 border border-black"
                  : "opacity-60 hover:opacity-100 border border-transparent"
              )}
            >
              <Image
                src={url}
                alt={`Thumbnail ${idx}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {/* Main Stage (Right) */}
        <div className="flex-1 relative aspect-[3/4] bg-main group overflow-hidden border border-primary/5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={displayImages[activeIndex]}
                alt="Active Product View"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Arrows (Visible on Hover) */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5 text-black" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}
