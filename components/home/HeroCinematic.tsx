"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { HeroSlide } from "@/lib/data";
import { useIntro } from "@/context/IntroContext";
import { AnnouncementTicker } from "@/components/layout/AnnouncementBar";

interface HeroCinematicProps {
  slides: HeroSlide[];
}

export function HeroCinematic({ slides }: HeroCinematicProps) {
  const [current, setCurrent] = useState(0);
  const { isIntroComplete } = useIntro();

  // Preload next image for performance
  useEffect(() => {
    if (slides.length > 1) {
      const next = (current + 1) % slides.length;
      if (slides[next]?.image) {
        const img = new window.Image();
        img.src = slides[next].image;
      }
    }
  }, [current, slides]);

  // Auto-rotate slides - Slower for premium feel (8s)
  useEffect(() => {
    if (!isIntroComplete || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length, isIntroComplete]);

  if (!slides || slides.length === 0) return null;

  // Helper to get alignment classes
  const getAlignmentClasses = (align: string = "center") => {
    switch (align) {
      case "left":
        return "items-start text-left pl-10 md:pl-20";
      case "right":
        return "items-end text-right pr-10 md:pr-20";
      case "center":
      default:
        return "items-center text-center";
    }
  };

  // Helper to get text color classes
  const getTextClasses = (color: string = "white") => {
    return color === "black" ? "text-black" : "text-white";
  };

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[current];
  const alignClass = getAlignmentClasses(currentSlide.alignment);
  const textClass = getTextClasses(currentSlide.textColor);
  const isDarkText = currentSlide.textColor === "black";

  return (
    // Hero fits viewport exactly on desktop, half split on mobile
    <section className="relative h-[50dvh] md:h-[100dvh] w-full overflow-hidden bg-primary">
      {/* Background Images with Ken Burns Effect */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={current}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          {currentSlide.image ? (
            <motion.div
              className="relative w-full h-full"
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 10, ease: "linear" }}
            >
              <Image
                src={currentSlide.image}
                alt={currentSlide.title}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              {/* Dynamic Overlay */}
              <div
                className="absolute inset-0 bg-black transition-opacity duration-1000"
                style={{
                  opacity: (currentSlide.overlayOpacity || 30) / 100,
                }}
              />
            </motion.div>
          ) : (
            <div className="w-full h-full bg-[#1a1a1a]" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Content Layer */}
      <div
        className={`absolute inset-0 z-10 flex flex-col justify-center px-6 transition-all duration-1000 ${alignClass}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className={`w-full max-w-[95vw] md:max-w-6xl flex flex-col ${currentSlide.alignment === "left"
              ? "items-start"
              : currentSlide.alignment === "right"
                ? "items-end"
                : "items-center"
              }`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.5 } }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            {/* Subtitle */}
            {currentSlide.subtitle && (
              <motion.span
                className={`inline-block text-[10px] md:text-xs font-semibold uppercase tracking-[0.4em] mb-4 md:mb-6 whitespace-pre-line ${isDarkText ? "text-neutral-800" : "text-accent-gold"
                  }`}
                initial={{ opacity: 0, letterSpacing: "0.2em" }}
                animate={{ opacity: 1, letterSpacing: "0.4em" }}
                transition={{ duration: 1.2, delay: 0.3 }}
              >
                {currentSlide.subtitle}
              </motion.span>
            )}

            {/* Title */}
            <h1
              className={`font-serif text-3xl md:text-6xl lg:text-8xl leading-[1.1] mb-6 md:mb-8 opacity-90 whitespace-pre-line text-balance ${textClass}`}
              style={{ textWrap: "balance" }}
            >
              {currentSlide.title}
            </h1>

            {/* Description */}
            {currentSlide.description && (
              <p
                className={`text-[10px] md:text-lg font-light w-full max-w-2xl leading-relaxed mb-8 md:mb-12 antialiased whitespace-pre-line ${isDarkText ? "text-neutral-700" : "text-white/80"
                  }`}
              >
                {currentSlide.description}
              </p>
            )}

            {/* CTA Button - Dynamic */}
            <Link
              href={currentSlide.buttonLink || "/shop"}
              className={`group relative inline-flex items-center gap-3 px-6 py-3 md:px-8 md:py-4 text-[10px] md:text-xs uppercase tracking-[0.25em] transition-all duration-500 overflow-hidden border ${isDarkText
                ? "border-black/20 hover:border-black/60 text-black bg-black/5"
                : "border-white/20 hover:border-white/60 text-white bg-white/10 backdrop-blur-md"
                }`}
            >
              <span className="relative z-10">
                {currentSlide.buttonText || "Discover"}
              </span>
              <div
                className={`absolute inset-0 -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-500 ease-out ${isDarkText ? "bg-black/10" : "bg-white/10"
                  }`}
              />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="absolute bottom-20 md:bottom-10 left-0 right-0 z-20 px-6 md:px-10 flex justify-between items-end pointer-events-none">
        {/* Progress Bar Indicators */}
        <div className="flex gap-4 pointer-events-auto">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className="group relative h-10 w-10 flex items-center justify-center cursor-pointer"
              aria-label={`Go to slide ${idx + 1}`}
            >
              <span
                className={`block h-[1px] w-full transition-all duration-500 ${idx === current
                  ? "bg-white opacity-100"
                  : "bg-white/30 group-hover:bg-white/60"
                  }`}
              />
            </button>
          ))}
        </div>

        {/* Scroll Indicator - Fashion Rotating Badge */}
        <motion.div
          className="hidden md:flex items-center justify-center absolute bottom-12 right-12 z-30"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          {/* Rotating Text Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 relative drop-shadow-lg"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
              <defs>
                <path
                  id="circlePath"
                  d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                />
              </defs>
              <text className="text-[11px] font-serif uppercase tracking-[0.25em] fill-white font-medium">
                <textPath xlinkHref="#circlePath">
                  Scroll For More • Scroll For More •
                </textPath>
              </text>
            </svg>
          </motion.div>

          {/* Center Arrow */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              className="drop-shadow-md"
            >
              <path d="M12 4v16m0 0l-6-6m6 6l6-6" strokeLinecap="square" />
            </svg>
          </motion.div>
        </motion.div>
      </div>

      {/* L9: News Ticker at bottom of hero - overlaid */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <AnnouncementTicker />
      </div>
    </section>
  );
}
