"use client";

import { Variant } from "@/types";
import { useState, useEffect, useMemo, useCallback } from "react";
import clsx from "clsx";
import Image from "next/image";

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId?: string;
  /**
   * Fired when a FULL variant is matched (all attributes selected).
   * Passes `undefined` if no exact match or not all attributes selected yet.
   */
  onSelect: (variant: Variant | undefined) => void;
  /**
   * Fired on EVERY attribute click (even partial selections).
   * Passes the complete selections map so the parent can compute
   * the best image to display.
   */
  onAttributeChange?: (selections: Record<string, string>) => void;
  /**
   * If true, forces a clear of all internal selections.
   */
  isReset?: boolean;
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onSelect,
  onAttributeChange,
  isReset,
}: VariantSelectorProps) {
  // ─── 1. Attribute Dimensions ─────────────────────────────
  const attributeKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const v of variants) {
      if (v.attributes) {
        for (const k of Object.keys(v.attributes)) keys.add(k);
      }
    }
    return Array.from(keys).sort((a, b) => {
      const aIsColor = /colou?r/i.test(a);
      const bIsColor = /colou?r/i.test(b);
      if (aIsColor && !bIsColor) return -1;
      if (!aIsColor && bIsColor) return 1;
      return 0;
    });
  }, [variants]);

  // ─── 2. Selection State ──────────────────────────────────
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    if (selectedVariantId) {
      const found = variants.find((v) => v.id === selectedVariantId);
      if (found?.attributes) return { ...found.attributes };
    }
    return {};
  });

  // Keep internal state in sync with parent's selectedVariantId
  useEffect(() => {
    if (selectedVariantId) {
      const found = variants.find((v) => v.id === selectedVariantId);
      if (found?.attributes) {
        setSelections((prev) => {
          const isDiff = Object.keys(found.attributes).some(
            (k) => found.attributes[k] !== prev[k]
          );
          return isDiff ? { ...found.attributes } : prev;
        });
      }
    }
  }, [selectedVariantId, variants]);

  // Handle external reset signal
  useEffect(() => {
    if (isReset) {
      setSelections({});
    }
  }, [isReset]);

  // ─── 3. Smart Pivot & Toggle Logic ───────────────────────
  const handleSelect = useCallback(
    (key: string, value: string) => {
      let next: Record<string, string>;

      // A. Toggle Behavior (Unselect)
      if (selections[key] === value) {
        next = { ...selections };
        delete next[key];
      } else {
        // B. Smart Pivot Logic
        const proposed = { ...selections, [key]: value };

        // Check if ANY variant matches this NEW combination
        const hasMatch = variants.some((v) =>
          Object.entries(proposed).every(([k, vVal]) => v.attributes?.[k] === vVal)
        );

        if (hasMatch) {
          next = proposed;
        } else {
          /**
           * NO MATCH found for this specific combination.
           * We pivot: Prioritize the NEWLY clicked attribute, then find
           * the "closest" matching variant among those with this attribute.
           */
          const variantsWithNewAttr = variants.filter(
            (v) => v.attributes?.[key] === value
          );

          if (variantsWithNewAttr.length > 0) {
            // Find variant with maximum overlapping attributes with former selection.
            let bestVariant = variantsWithNewAttr[0];
            let maxScore = -1;

            for (const v of variantsWithNewAttr) {
              let score = 0;
              for (const k of attributeKeys) {
                if (k === key) continue; // Skip newly selected
                if (selections[k] && v.attributes?.[k] === selections[k]) {
                  score++;
                }
              }
              if (score > maxScore) {
                maxScore = score;
                bestVariant = v;
              }
            }
            next = { ...bestVariant.attributes };
          } else {
            // Fallback (should not happen if data is consistent)
            next = proposed;
          }
        }
      }

      setSelections(next);
      onAttributeChange?.(next);

      // Notify parent of full match result
      const match = variants.find((v) => {
        const vAttrs = v.attributes || {};
        const vKeys = Object.keys(vAttrs);
        const nextKeys = Object.keys(next);
        if (vKeys.length !== nextKeys.length) return false;
        return vKeys.every((k) => vAttrs[k] === next[k]);
      });
      onSelect(match);
    },
    [selections, attributeKeys, variants, onSelect, onAttributeChange]
  );

  // ─── 4. Visual Rendering Helpers ─────────────────────────

  /**
   * Is this specific value compatible with ALL OTHER current selections?
   * Used for "dimming" logic (full opacity vs low opacity).
   */
  const isValueCompatible = (key: string, value: string): boolean => {
    const otherSelections = { ...selections };
    delete otherSelections[key];

    return variants.some((v) => {
      if (v.attributes?.[key] !== value) return false;
      return Object.entries(otherSelections).every(
        ([k, val]) => !val || v.attributes?.[k] === val
      );
    });
  };

  if (attributeKeys.length === 0) return null;

  return (
    <div className="space-y-8">
      {attributeKeys.map((key) => {
        const values = Array.from(
          new Set(
            variants
              .map((v) => v.attributes?.[key])
              .filter((v): v is string => Boolean(v))
          )
        );
        const isColor = /colou?r/i.test(key);

        return (
          <div key={key} className="space-y-4">
            {/* Contextual Label */}
            <div className="flex justify-between items-baseline text-xs uppercase tracking-[0.2em] font-bold text-secondary/40">
              <span>{key}</span>
              <span className="text-secondary italic">
                {selections[key] || "Not Selected"}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {values.map((value) => {
                const isSelected = selections[key] === value;
                const isCompatible = isValueCompatible(key, value);

                // --- Case A: Color Style (Circular Swatch with internal image) ---
                if (isColor) {
                  const variantForImage = variants.find(v => v.attributes?.[key] === value && v.images?.length > 0);
                  const swatchSrc = variantForImage?.images?.[0];

                  return (
                    <button
                      key={value}
                      onClick={() => handleSelect(key, value)}
                      className={clsx(
                        "group relative w-12 h-16 transition-all duration-300 ease-out flex items-center justify-center",
                        isSelected ? "scale-105" : "hover:scale-102"
                      )}
                      title={value}
                    >
                      {/* Border Ring */}
                      <div className={clsx(
                        "absolute inset-0 border transition-colors duration-300",
                        isSelected ? "border-primary" : "border-transparent group-hover:border-primary/20"
                      )} />

                      {/* Image/Color Container */}
                      <div className={clsx(
                        "relative w-[85%] h-[85%] bg-canvas overflow-hidden transition-all duration-300",
                        !isCompatible && !isSelected && "opacity-40 grayscale-[0.5]"
                      )}>
                        {swatchSrc ? (
                          <Image
                            src={swatchSrc}
                            alt={value}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full"
                            style={{ backgroundColor: value.toLowerCase() }}
                          />
                        )}
                      </div>

                      {/* Context Dot (Only shown if compatible but not selected) */}
                      {!isSelected && isCompatible && (
                        <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-primary/20 rounded-full" />
                      )}
                    </button>
                  );
                }

                // --- Case B: Pill Style (Size/Finish etc.) ---
                return (
                  <button
                    key={value}
                    onClick={() => handleSelect(key, value)}
                    className={clsx(
                      "min-w-[64px] h-10 px-5 text-xs font-bold tracking-widest uppercase transition-all duration-300 border flex items-center justify-center",
                      isSelected
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/10"
                        : "bg-transparent text-primary border-primary/10 hover:border-primary/40",
                      !isCompatible && !isSelected && "opacity-30"
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
