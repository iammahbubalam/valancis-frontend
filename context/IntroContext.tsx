"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface IntroContextType {
  isIntroComplete: boolean;
  isLoading: boolean;
  completeIntro: () => void;
}

const IntroContext = createContext<IntroContextType | undefined>(undefined);

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  useEffect(() => {
    // Check session storage on mount
    const hasSeen = sessionStorage.getItem("valancis_intro_seen_v2");
    if (hasSeen) {
      setIsIntroComplete(true);
    }
    setHasCheckedStorage(true);
  }, []);

  const completeIntro = () => {
    setIsIntroComplete(true);
    sessionStorage.setItem("valancis_intro_seen_v2", "true");
  };

  return (
    <IntroContext.Provider value={{ isIntroComplete, completeIntro, isLoading: !hasCheckedStorage }}>
      {children}
    </IntroContext.Provider>
  );
}

export function useIntro() {
  const context = useContext(IntroContext);
  if (context === undefined) {
    throw new Error("useIntro must be used within an IntroProvider");
  }
  return context;
}
