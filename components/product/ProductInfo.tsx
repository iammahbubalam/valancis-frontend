"use client";

import { Product, Variant } from "@/types";
import Link from "next/link";
import { AddToCartButton } from "./AddToCartButton";
import { VariantSelector } from "./VariantSelector";
import { ProductDetailsAccordion } from "./ProductDetailsAccordion";
import { Heart, Truck, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { WishlistButton } from "../common/WishlistButton";
import { analytics } from "@/lib/gtm";
import clsx from "clsx";

export function ProductInfo({ product }: { product: Product }) {
   const router = useRouter();
   const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>();

   const currentPrice = selectedVariant?.salePrice || selectedVariant?.price || product.salePrice || product.basePrice;
   const originalPrice = (selectedVariant?.salePrice && selectedVariant.price) || (product.salePrice && product.basePrice) || undefined;

   // SKU display
   const activeSku = selectedVariant?.sku || product.id.substring(0, 8).toUpperCase();

   const totalStock = selectedVariant ? selectedVariant.stock : (product.variants?.reduce((sum, v) => sum + v.stock, 0) || product.stock || 0);
   const isPurchasable = (product.stockStatus === 'pre_order') || (totalStock > 0 && product.stockStatus !== 'out_of_stock');

   const { addToCart } = useCart();

   useEffect(() => {
      if (product.variants && product.variants.length === 1) {
         setSelectedVariant(product.variants[0]);
      }

      // Track view_item to GA4/GTM
      analytics.viewItem({
         item_id: product.id,
         item_name: product.name,
         price: product.salePrice || product.basePrice,
         item_category: product.categories?.[0]?.name,
      });
   }, [product.variants, product.id, product.name, product.salePrice, product.basePrice, product.categories]);

   return (
      <div className="relative h-full flex flex-col">
         <div className="lg:sticky lg:top-24 space-y-8">

            {/* 1. Header & SKU */}
            <div className="space-y-3 px-6 lg:px-0">
               <h1 className="font-serif text-3xl lg:text-5xl font-medium text-gray-900 leading-[1.2] tracking-tight italic">
                  {product.name}
               </h1>
               <div className="flex items-center gap-4 text-[9px] text-secondary/40 uppercase tracking-[0.25em] font-bold">
                  <span className="flex items-center gap-1.5">
                     <span>SKU</span>
                     <span className="text-primary font-bold">{activeSku}</span>
                  </span>
                  <div className="w-[1px] h-3 bg-gray-100" />
                  <Link
                     href={`/category/${product.categories?.[0]?.slug}`}
                     className="hover:text-accent-gold transition-colors text-secondary/60"
                  >
                     {product.categories?.[0]?.name}
                  </Link>
               </div>
            </div>

            {/* 2. Price */}
            <div className="flex items-baseline gap-4 border-b border-gray-100 pb-8 px-6 lg:px-0">
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
                     {product.stockStatus === 'out_of_stock' || (!isPurchasable && product.stockStatus !== 'pre_order') ? (
                        <span className="text-red-500/80 flex items-center gap-2.5 text-[11px] uppercase tracking-wider font-bold">
                           <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Out of Stock
                        </span>
                     ) : product.stockStatus === 'pre_order' ? (
                        <span className="text-amber-600 flex items-center gap-2.5 text-[11px] uppercase tracking-wider font-bold">
                           <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse" /> Pre-Order Available
                        </span>
                     ) : (
                        <span className="text-green-600 flex items-center gap-2.5 text-[11px] uppercase tracking-wider font-bold">
                           <span className="w-1.5 h-1.5 bg-green-600 rounded-full" /> In Stock
                        </span>
                     )}
                  </div>

                  {/* Stock Quantity Display */}
                  {totalStock > 0 && product.stockStatus !== 'out_of_stock' && (
                     <span className="text-[10px] text-secondary/40 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100 uppercase tracking-widest font-bold">
                        {totalStock} Available
                     </span>
                  )}
               </div>

               {/* Pre-Order Notice */}
               {product.stockStatus === 'pre_order' && (
                  <div className="bg-amber-50/50 border border-amber-100 text-amber-900/70 text-[10px] p-4 rounded-xl flex gap-3 items-start leading-relaxed shadow-sm">
                     <span className="text-sm">✨</span>
                     <span>Exclusive Pre-order: 50% advance secures your piece. Our artisans require extra time for perfection.</span>
                  </div>
               )}
            </div>

            {/* 3. Variants */}
            {product.variants && product.variants.length > 0 && (
               <div className="pb-4 px-6 lg:px-0">
                  <VariantSelector
                     variants={product.variants}
                     selectedVariantId={selectedVariant?.id}
                     onSelect={setSelectedVariant}
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
            <div className="flex flex-col gap-3 pt-4 pb-0 text-xs text-gray-600 px-6 lg:px-0">

               <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
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
