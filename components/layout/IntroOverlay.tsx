"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useIntro } from "@/context/IntroContext";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function IntroOverlay() {
  const { isIntroComplete, completeIntro, isLoading } = useIntro();
  const pathname = usePathname();

  // Only show intro on the home page
  const isHomePage = pathname === "/";

  useEffect(() => {
    // If not on home page, skip intro immediately
    if (!isHomePage && !isIntroComplete) {
      completeIntro();
      return;
    }

    if (!isIntroComplete && !isLoading && isHomePage) {
      const timer = setTimeout(() => {
        completeIntro();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isIntroComplete, isLoading, completeIntro, isHomePage]);

  if (isLoading && isHomePage) {
    return <div className="fixed inset-0 z-[99999] bg-[#142934]" />;
  }

  // Don't render anything on non-home pages
  if (!isHomePage) return null;

  return (
    <AnimatePresence>
      {!isIntroComplete && (
        <motion.div
          className="fixed inset-0 z-[99999] bg-[#142934] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Ambient Radial Glow */}
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)",
            }}
            animate={{
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Outer Orbiting Particles */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-[2px] h-[2px] bg-white/30 rounded-full"
              style={{
                top: "50%",
                left: "50%",
              }}
              animate={{
                x: [
                  Math.cos((i * Math.PI) / 3) * 120,
                  Math.cos((i * Math.PI) / 3 + Math.PI) * 160,
                  Math.cos((i * Math.PI) / 3) * 120,
                ],
                y: [
                  Math.sin((i * Math.PI) / 3) * 120,
                  Math.sin((i * Math.PI) / 3 + Math.PI) * 160,
                  Math.sin((i * Math.PI) / 3) * 120,
                ],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 5 + i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4,
              }}
            />
          ))}

          {/* Golden Ring System */}
          <div className="relative flex items-center justify-center">
            {/* Outer Ring – Slow Rotate */}
            <motion.div
              className="absolute w-52 h-52 border border-white/[0.06] rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />

            {/* Middle Ring – Counter Rotate */}
            <motion.div
              className="absolute w-36 h-36 border border-white/[0.08] rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            />

            {/* Inner Ring – Fast Rotate */}
            <motion.div
              className="absolute w-20 h-20 border border-white/[0.12] rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />

            {/* Breathing Diamond */}
            <motion.div
              className="absolute w-8 h-8 border border-white/20 rotate-45"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.5, 0.2],
                rotate: [45, 135, 225],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Center Dot */}
            <motion.div
              className="w-1 h-1 bg-white rounded-full"
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Brand + Loading Indicator */}
          <motion.div
            className="absolute bottom-16 md:bottom-24 flex flex-col items-center gap-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1
              className="text-white/80 text-2xl md:text-3xl tracking-[0.35em] uppercase font-light"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              Valancis
            </h1>

            {/* Progress Bar */}
            <div className="h-[1px] w-48 md:w-64 bg-white/10 overflow-hidden rounded-full">
              <motion.div
                className="h-full bg-white/60 w-full origin-left rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: 3.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </div>

            {/* Percentage Counter */}
            <motion.p
              className="text-[11px] text-white/30 uppercase tracking-[0.3em] font-light tabular-nums"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                Loading...
              </motion.span>
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
