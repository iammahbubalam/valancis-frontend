"use client";

import { useState, useCallback, useMemo } from "react";
import { Product, Variant } from "@/types";
import { ProductGallery } from "./ProductGallery";
import { ProductInfo } from "./ProductInfo";

/**
 * ProductDetailClient
 *
 * Orchestrator that owns two pieces of shared state:
 *
 *   1. selectedVariant  – fully matched variant (for price/cart)
 *   2. activeImageIndex – which gallery image is currently displayed
 *
 * Three lookup structures (memoized):
 *   • mergedImages       – deduplicated product.images ∪ variant.images
 *   • imageToVariantMap  – URL → Variant (first owner)
 *   • variantToImageIdx  – variant.id → first index in mergedImages
 *
 * Three handlers implement full bidirectional sync:
 *   • handleVariantChange     – full variant   → jump to its first image
 *   • handleAttributeChange   – ANY attribute   → find best match, jump image
 *   • handleImageSelect       – image clicked  → auto‑select owning variant
 */
export function ProductDetailClient({ product }: { product: Product }) {
    // ──────────────────────────────────────────────
    //  1. Derived lookup tables (stable across renders)
    // ──────────────────────────────────────────────

    const { mergedImages, imageToVariantMap, variantToImageIdx } = useMemo(() => {
        const seen = new Set<string>();
        const merged: string[] = [];
        const imgToVar = new Map<string, Variant>();
        const varToIdx = new Map<string, number>();

        // Product‑level images come first (hero images).
        for (const url of product.images ?? []) {
            if (!seen.has(url)) {
                seen.add(url);
                merged.push(url);
            }
        }

        // Append each variant's images, tracking ownership.
        for (const variant of product.variants ?? []) {
            if (!variant.images?.length) continue;

            let firstIdxRecorded = false;
            for (const url of variant.images) {
                if (!seen.has(url)) {
                    seen.add(url);
                    merged.push(url);
                }

                // First variant that owns this image wins.
                if (!imgToVar.has(url)) {
                    imgToVar.set(url, variant);
                }

                // Record first gallery index for this variant.
                if (!firstIdxRecorded) {
                    const idx = merged.indexOf(url);
                    if (idx !== -1) {
                        varToIdx.set(variant.id, idx);
                        firstIdxRecorded = true;
                    }
                }
            }
        }

        return {
            mergedImages: merged,
            imageToVariantMap: imgToVar,
            variantToImageIdx: varToIdx,
        };
    }, [product.images, product.variants]);

    // ──────────────────────────────────────────────
    //  2. Shared state
    // ──────────────────────────────────────────────

    const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(
        () => {
            if (product.variants?.length === 1) return product.variants[0];
            return undefined;
        }
    );

    /**
     * activeVariant
     * The variant currently being "previewed" (best match for current attributes).
     * Drives the display of Price, SKU, Stock, and Image.
     */
    const [activeVariant, setActiveVariant] = useState<Variant | undefined>(
        () => {
            if (product.variants?.length === 1) return product.variants[0];
            return undefined;
        }
    );

    const [activeImageIndex, setActiveImageIndex] = useState(() => {
        // If single variant, jump to its first image.
        if (product.variants?.length === 1) {
            const firstImg = product.variants[0].images?.[0];
            if (firstImg) {
                const allImages = [...(product.images ?? [])];
                const idx = allImages.indexOf(firstImg);
                return idx !== -1 ? idx : 0;
            }
        }
        return 0;
    });

    // ──────────────────────────────────────────────
    //  3. Helpers
    // ──────────────────────────────────────────────

    /**
     * Given a partial selections map, find the first variant that
     * matches ALL selected attributes and has images.
     */
    const findBestVariantForSelections = useCallback(
        (selections: Record<string, string>): Variant | undefined => {
            const selectedEntries = Object.entries(selections).filter(
                ([, val]) => Boolean(val)
            );

            if (selectedEntries.length === 0) return undefined;

            // Find first variant matching all currently selected attributes.
            for (const variant of product.variants ?? []) {
                if (!variant.attributes) continue;

                const matches = selectedEntries.every(([k, v]) => {
                    const vValue = variant.attributes[k];
                    if (!vValue) return false;
                    return vValue.trim().toLowerCase() === v.trim().toLowerCase();
                });
                if (matches) return variant;
            }
            return undefined;
        },
        [product.variants]
    );

    // ──────────────────────────────────────────────
    //  4. Bidirectional handlers
    // ──────────────────────────────────────────────

    const handleVariantChange = useCallback(
        (variant: Variant | undefined) => {
            setSelectedVariant(variant);

            // Only update display state if we have a full selection match.
            // (Partial matches are handled by handleAttributeChange).
            if (variant) {
                setActiveVariant(variant);
                const idx = variantToImageIdx.get(variant.id);
                if (idx !== undefined) {
                    setActiveImageIndex(idx);
                }
            }
        },
        [variantToImageIdx]
    );

    /**
     * Clears all selections and resets the UI to the base product.
     */
    const handleReset = useCallback(() => {
        setSelectedVariant(undefined);
        setActiveVariant(undefined);
        setActiveImageIndex(0);
    }, []);

    /**
     * ANY attribute change (even partial) → find best matching
     * variant (for Price/SKU/Stock) and jump gallery image.
     */
    const handleAttributeChange = useCallback(
        (selections: Record<string, string>) => {
            const bestVariant = findBestVariantForSelections(selections);
            setActiveVariant(bestVariant);

            if (bestVariant) {
                const bestIdx = variantToImageIdx.get(bestVariant.id);
                if (bestIdx !== undefined) {
                    setActiveImageIndex(bestIdx);
                }
            } else {
                // Reset to first hero image if no match or unselected
                setActiveImageIndex(0);
            }
        },
        [findBestVariantForSelections, variantToImageIdx]
    );

    /**
     * Image clicked → auto‑select the owning variant.
     */
    const handleImageSelect = useCallback(
        (index: number) => {
            setActiveImageIndex(index);

            const url = mergedImages[index];
            if (!url) return;

            const owningVariant = imageToVariantMap.get(url);
            if (owningVariant) {
                setSelectedVariant((prev) =>
                    prev?.id === owningVariant.id ? prev : owningVariant
                );
                setActiveVariant(owningVariant);
            }
        },
        [mergedImages, imageToVariantMap]
    );

    // ──────────────────────────────────────────────
    //  5. Render
    // ──────────────────────────────────────────────

    return (
        <div className="max-w-[1536px] mx-auto px-0 md:px-12 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-16">
            <div className="col-span-1 lg:col-span-6">
                <ProductGallery
                    images={mergedImages}
                    activeIndex={activeImageIndex}
                    onImageSelect={handleImageSelect}
                />
            </div>
            <div className="col-span-1 lg:col-span-6 px-6 md:px-0 pb-4 lg:pb-0">
                <ProductInfo
                    product={product}
                    selectedVariant={selectedVariant}
                    activeVariant={activeVariant}
                    onVariantChange={handleVariantChange}
                    onAttributeChange={handleAttributeChange}
                    onReset={handleReset}
                />
            </div>
        </div>
    );
}
