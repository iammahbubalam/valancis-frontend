"use client";

import { Product, Variant } from "@/types";
import Link from "next/link";
import { AddToCartButton } from "./AddToCartButton";
import { VariantSelector } from "./VariantSelector";
import { ProductDetailsAccordion } from "./ProductDetailsAccordion";
import { Heart, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { WishlistButton } from "../common/WishlistButton";
import { analytics } from "@/lib/gtm";
import clsx from "clsx";

interface ProductInfoProps {
   product: Product;
   /** Fully matched variant (for purchase). */
   selectedVariant: Variant | undefined;
   /** Best matching variant for current attributes (for display). */
   activeVariant?: Variant | undefined;
   /** Callback to notify parent of variant changes (full match). */
   onVariantChange: (variant: Variant | undefined) => void;
   /** Callback for ANY attribute change (partial or full) — drives image sync. */
   onAttributeChange?: (selections: Record<string, string>) => void;
   /** Callback to reset all selections. */
   onReset: () => void;
}

export function ProductInfo({ product, selectedVariant, activeVariant, onVariantChange, onAttributeChange, onReset }: ProductInfoProps) {
   const router = useRouter();

   const currentPrice = activeVariant?.salePrice || activeVariant?.price || product.salePrice || product.basePrice;
   const originalPrice = (activeVariant?.salePrice && activeVariant.price) || (product.salePrice && product.basePrice) || undefined;

   // SKU display (follows the preview variant)
   const activeSku = activeVariant?.sku || product.id.substring(0, 8).toUpperCase();

   // Stock display (follows the preview variant)
   const totalStock = activeVariant
      ? activeVariant.stock
      : (product.variants?.reduce((sum, v) => sum + v.stock, 0) || product.stock || 0);
   const isPurchasable = (product.isPreorder) || (totalStock > 0 && product.stockStatus !== 'out_of_stock');

   const { addToCart } = useCart();

   useEffect(() => {
      // Track view_item to GA4/GTM
      analytics.viewItem({
         item_id: product.id,
         item_name: product.name,
         price: product.salePrice || product.basePrice,
         item_category: product.categories?.[0]?.name,
      });
   }, [product.id, product.name, product.salePrice, product.basePrice, product.categories]);

   return (
      <div className="relative h-full flex flex-col">
         <div className="lg:sticky lg:top-24 space-y-5 lg:space-y-8">

            {/* 1. Header & SKU */}
            <div className="space-y-2 px-6 lg:px-0">
               <h1 className="font-serif text-3xl lg:text-5xl font-medium text-gray-900 leading-[1.2] tracking-tight italic">
                  {product.name}
               </h1>
               <div className="flex items-center gap-4 text-xs text-secondary/40 uppercase tracking-[0.15em] font-bold">
                  <span className="flex items-center gap-1.5 focus-within:text-primary transition-colors">
                     <span>SKU</span>
                     <span className="text-primary font-bold">{activeSku}</span>
                  </span>
                  <div className="w-[1px] h-3 bg-gray-100" />
                  <Link
                     href={`/category/${product.categories?.[0]?.slug}`}
                     className="hover:text-primary transition-colors text-secondary/60"
                  >
                     {product.categories?.[0]?.name}
                  </Link>
                  {selectedVariant && (
                     <>
                        <div className="w-[1px] h-3 bg-gray-100" />
                        <button
                           onClick={onReset}
                           className="text-primary hover:tracking-[0.3em] transition-all duration-300"
                        >
                           Clear
                        </button>
                     </>
                  )}
               </div>
            </div>

            {/* 2. Price */}
            <div className="flex items-baseline gap-4 border-b border-gray-100 pb-5 px-6 lg:px-0">
               <span className="text-2xl font-bold text-primary">
                  Tk {currentPrice.toLocaleString()}
               </span>
               {originalPrice && (
                  <span className="text-sm line-through text-secondary/30 font-light">
                     Tk {originalPrice.toLocaleString()}
                  </span>
               )}
            </div>

            {/* 2.5 Stock Status & Notices */}
            <div className="space-y-4 px-6 lg:px-0">
               {/* Status Badge */}
               <div className="flex items-center justify-between text-sm font-medium">
                  <div className="flex items-center gap-2">
                     {!isPurchasable ? (
                        <span className="text-red-500/80 flex items-center gap-2.5 text-xs uppercase tracking-wider font-bold">
                           <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Out of Stock
                        </span>
                     ) : product.isPreorder ? (
                        <span className="text-amber-600 flex items-center gap-2.5 text-xs uppercase tracking-wider font-bold">
                           <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse" /> Pre-Order Available
                        </span>
                     ) : (
                        <span className="text-green-600 flex items-center gap-2.5 text-xs uppercase tracking-wider font-bold">
                           <span className="w-1.5 h-1.5 bg-green-600 rounded-full" /> In Stock
                        </span>
                     )}
                  </div>

                  {/* Stock Quantity Display */}
                  {totalStock > 0 && product.stockStatus !== 'out_of_stock' && (
                     <span className="text-xs text-secondary/40 bg-canvas px-2.5 py-1 rounded-full border border-gray-100 uppercase tracking-widest font-bold">
                        {totalStock} Available
                     </span>
                  )}
               </div>

               {/* Pre-Order Notice */}
               {product.isPreorder && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm p-4 rounded-xl flex gap-3 items-start leading-relaxed shadow-sm font-medium">
                     <span className="text-lg">✨</span>
                     <span>Exclusive Pre-order: A partial deposit of ৳{product.preorderDepositAmount?.toLocaleString() || 0} is required to secure your piece. This product takes 13 to 17 days to reach. Our artisans require extra time for perfection.</span>
                  </div>
               )}
            </div>

            {/* 3. Variants */}
            {product.variants && product.variants.length > 0 && (
               <div className="pb-4 px-6 lg:px-0">
                  <VariantSelector
                     variants={product.variants}
                     selectedVariantId={selectedVariant?.id}
                     onSelect={onVariantChange}
                     onAttributeChange={onAttributeChange}
                     isReset={!activeVariant}
                  />
               </div>
            )}

            {/* 4. Actions (Desktop) - Reference Style */}
            <div className="hidden lg:flex flex-col gap-3">
               <div className="flex gap-2">
                  {/* Reuse customized AddToCartButton logic but apply class via prop if supported, or wrapper */}
                  <div className="flex-1">
                     <AddToCartButton
                        product={product}
                        disabled={!isPurchasable}
                        selectedVariantId={selectedVariant?.id}
                        onSuccess={() => { }}
                        className="w-full h-12 bg-gray-900 text-white hover:bg-black uppercase tracking-[0.2em] text-xs font-bold transition-all disabled:opacity-50"
                     />
                  </div>
                  <div className="h-12 w-12 border border-gray-200 flex items-center justify-center">
                     <WishlistButton product={product} className="w-full h-full rounded-none hover:bg-transparent" />
                  </div>
               </div>
            </div>


            {/* 5. Benefits / Meta */}
            <div className="flex flex-col gap-3 pt-5 pb-0 mt-2 border-t border-gray-100 text-sm text-gray-600 px-6 lg:px-0">

               <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-primary/50" strokeWidth={1.5} />
                  <span>Authentic products guaranteed</span>
               </div>
            </div>
         </div>

         {/* Mobile Sticky Action - Floating Left Capsule */}
         <div className="fixed bottom-8 left-6 right-[100px] z-[80] lg:hidden">
            <div className="flex gap-2 items-center">
               <div className="h-14 w-14 bg-white border border-gray-100 flex items-center justify-center shadow-xl shadow-black/5 active:scale-95 transition-transform">
                  <WishlistButton product={product} className="w-full h-full rounded-none hover:bg-transparent" />
               </div>
               <div className="flex-1 shadow-xl shadow-black/5">
                  <AddToCartButton
                     product={product}
                     disabled={!isPurchasable}
                     selectedVariantId={selectedVariant?.id}
                     onSuccess={() => { }}
                  />
               </div>
            </div>
         </div>
      </div>
   );
}
