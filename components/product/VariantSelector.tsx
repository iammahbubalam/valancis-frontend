"use client";

import { Variant } from "@/types";
import { useState, useEffect, useMemo } from "react";
import clsx from "clsx";
import Image from "next/image";

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId?: string;
  onSelect: (variant: Variant | undefined) => void;
}

export function VariantSelector({ variants, selectedVariantId, onSelect }: VariantSelectorProps) {
  // 1. Extract all available attribute keys (e.g., ["Color", "Size"])
  const attributeKeys = useMemo(() => {
    const keys = new Set<string>();
    variants.forEach((v) => {
      if (v.attributes) {
        Object.keys(v.attributes).forEach((k) => keys.add(k));
      }
    });
    return Array.from(keys).sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      // Color first
      if (aLower.includes("color") || aLower.includes("colour")) return -1;
      if (bLower.includes("color") || bLower.includes("colour")) return 1;
      return 0;
    });
  }, [variants]);

  // 2. State for selections
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    if (selectedVariantId) {
      const found = variants.find(v => v.id === selectedVariantId);
      if (found?.attributes) return { ...found.attributes };
    }
    return {};
  });

  useEffect(() => {
    if (selectedVariantId) {
      const found = variants.find(v => v.id === selectedVariantId);
      if (found?.attributes) {
        setSelections(prev => {
          const isDiff = Object.keys(found.attributes).some(k => found.attributes[k] !== prev[k]);
          return isDiff ? { ...found.attributes } : prev;
        });
      }
    }
  }, [selectedVariantId, variants]);

  const handleSelect = (key: string, value: string) => {
    const newSelections = { ...selections, [key]: value };
    setSelections(newSelections);

    const allSelected = attributeKeys.every(k => newSelections[k]);

    if (allSelected) {
      const match = variants.find((v) => {
        if (!v.attributes) return false;
        return attributeKeys.every((k) => v.attributes[k] === newSelections[k]);
      });
      onSelect(match);
    } else {
      onSelect(undefined);
    }
  };

  const isValueAvailable = (key: string, value: string) => {
    const otherSelections = { ...selections };
    delete otherSelections[key];
    return variants.some((v) => {
      if (v.stock <= 0) return false;
      if (!v.attributes) return false;
      if (v.attributes[key] !== value) return false;
      return Object.entries(otherSelections).every(([k, val]) => {
        return !val || v.attributes[k] === val;
      });
    });
  };

  if (attributeKeys.length === 0) return null;

  return (
    <div className="space-y-6">
      {attributeKeys.map((key) => {
        const values = Array.from(new Set(variants.map(v => v.attributes?.[key]).filter(Boolean)));
        const isColor = key.toLowerCase() === "color" || key.toLowerCase() === "colour";

        return (
          <div key={key} className="space-y-3">
            <div className="flex justify-between items-center text-xs uppercase tracking-widest text-gray-500 font-medium">
              <span>{key}: <span className="text-black font-bold ml-1">{selections[key]}</span></span>
            </div>

            <div className="flex flex-wrap gap-3">
              {values.map((value) => {
                const isSelected = selections[key] === value;
                const isAvailable = isValueAvailable(key, value);

                // For Color: Try to find a variant image
                let variantImage = null;
                if (isColor) {
                  const variantWithColor = variants.find(v => v.attributes?.[key] === value && v.images && v.images.length > 0);
                  if (variantWithColor) {
                    variantImage = variantWithColor.images[0];
                  }
                }

                if (isColor) {
                  return (
                    <button
                      key={value}
                      onClick={() => handleSelect(key, value)}
                      title={`${value}${!isAvailable ? ' - Unavailable' : ''}`}
                      className={clsx(
                        "w-12 h-16 border rounded-sm flex items-center justify-center transition-all relative overflow-hidden",
                        isSelected
                          ? "ring-1 ring-black ring-offset-1 border-black"
                          : "border-gray-200 hover:border-black",
                        !isAvailable && "opacity-50 cursor-not-allowed"
                      )}
                      style={!variantImage ? { backgroundColor: value?.toLowerCase() } : undefined}
                    >
                      {variantImage ? (
                        <Image src={variantImage} alt={value} fill className="object-cover" />
                      ) : (
                        // Fallback if no image and potentially invalid CSS color
                        <span className={clsx("text-xs font-bold", !variantImage && "text-transparent")}>{value.charAt(0)}</span>
                      )}

                      {!isAvailable && (
                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                          <div className="w-full h-px bg-gray-400 -rotate-45" />
                        </div>
                      )}
                    </button>
                  );
                }

                // Standard Pill/Circle for Size etc.
                return (
                  <button
                    key={value}
                    onClick={() => handleSelect(key, value)}
                    className={clsx(
                      "min-w-[40px] h-10 px-0 border border-gray-200 rounded-full text-xs font-bold transition-all duration-200 uppercase flex items-center justify-center relative",
                      isSelected
                        ? "border-black bg-black text-white"
                        : "text-gray-900 hover:border-black bg-white",
                      !isAvailable && "opacity-50 text-gray-300 border-gray-100 bg-gray-50 cursor-not-allowed decorated-through"
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
