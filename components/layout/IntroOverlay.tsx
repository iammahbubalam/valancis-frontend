"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useIntro } from "@/context/IntroContext";
import { useEffect, useState } from "react";

export function IntroOverlay() {
  const { isIntroComplete, completeIntro, isLoading } = useIntro();
  const [shouldRender, setShouldRender] = useState(true);

  // Sync internal render state with context to allow exit animation
  useEffect(() => {
    if (isIntroComplete) {
      // Wait for exit animation to finish before unmounting (if needed)
      // But AnimatePresence handles this. 
      // We just need to stop blocking scroll if necessary?
    }
  }, [isIntroComplete]);

  // If loading, show simple black screen
  if (isLoading) {
    return <div className="fixed inset-0 z-[99999] bg-[#1a1a1a]" />;
  }

  // If complete and no exit animation running, we can return null to clean up DOM?
  // AnimatePresence will handle the "removing from DOM" part.
  
  return (
    <AnimatePresence>
      {!isIntroComplete && (
        <motion.div
          className="fixed inset-0 z-[99999] bg-[#1a1a1a] flex items-center justify-center overflow-hidden"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
        >
           {/* Brand Vector Reveal */}
           <div className="relative z-10 p-8">
             <BrandLogo 
               className="w-[90vw] md:w-[80vw] max-w-[1200px] h-auto text-white" 
               animated={true}
               duration={2.0}
               onComplete={completeIntro}
             />
           </div>
           
           {/* Subtle Subtext */}
           <motion.div 
             className="absolute bottom-12 text-accent-gold text-xs uppercase tracking-[0.3em]"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ delay: 1, duration: 0.8 }}
           >
             Loading Experience
           </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
