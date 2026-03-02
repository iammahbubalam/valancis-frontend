"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "white"
    | "outline-white"
    | "outline"
    | "ghost"
    | "link"
    | "destructive";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  className,
  ...props
}: ButtonProps) {
  // Magnetic effect removed for stability and professional feel

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={clsx(
        "relative uppercase tracking-[0.2em] font-medium transition-all duration-300 rounded-none border border-transparent",
        "flex items-center justify-center gap-2", // Ensure centered content

        // Sizes
        size === "sm" && "px-4 py-2 text-[10px]",
        size === "md" && "px-10 py-4 text-[11px]",
        size === "lg" && "px-12 py-5 text-[12px]",

        // Primary: Solid Dark -> Solid Gold

        // Primary: Solid Dark -> Solid Gold
        variant === "primary" &&
          "bg-primary text-white hover:bg-accent-gold hover:text-white",

        // Secondary: Outline Dark -> Solid Dark
        variant === "secondary" &&
          "bg-transparent border-primary text-primary hover:bg-primary hover:text-white",

        // White: Solid White -> Solid Dark (Standard luxury inverse)
        variant === "white" &&
          "bg-white text-primary hover:bg-primary hover:text-white shadow-lg",

        // Outline White: Outline White -> White Fill
        variant === "outline-white" &&
          "bg-transparent border-white text-white hover:bg-white hover:text-primary",

        // Generic Outline: Border Primary -> Primary Fill
        variant === "outline" &&
          "bg-transparent border-primary text-primary hover:bg-primary hover:text-white",

        // Ghost: Transparent -> Light Gray
        variant === "ghost" &&
          "bg-transparent border-transparent text-gray-500 hover:bg-gray-100 hover:text-primary shadow-none px-2",

        // Link: Text Only
        variant === "link" &&
          "bg-transparent border-transparent text-primary underline underline-offset-4 hover:text-accent-gold shadow-none px-0",

        // Destructive
        variant === "destructive" &&
          "bg-red-500 text-white hover:bg-red-600 border-red-500 shadow-sm",

        className
      )}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
