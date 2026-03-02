"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import clsx from "clsx";
import { WishlistButton } from "@/components/common/WishlistButton";
import { motion } from "framer-motion";

import { analytics } from "@/lib/gtm";

interface ProductCardProps {
  product: Product;
  index: number;
  priority?: boolean;
  listName?: string;
  listId?: string;
}

export function ProductCard({ product, index, priority = false, listName, listId }: ProductCardProps) {
  // Discount
  const hasDiscount =
    product.salePrice && product.salePrice < product.basePrice;
  const discountPercentage =
    hasDiscount && product.basePrice
      ? Math.round(
        ((product.basePrice - product.salePrice!) / product.basePrice) * 100,
      )
      : 0; // End Discount Logic

  const handleSelect = () => {
    analytics.selectItem({
      item_id: product.id,
      item_name: product.name,
      price: product.salePrice || product.basePrice,
      item_category: product.categories?.[0]?.name,
      index: index + 1,
      item_list_id: listId,
      item_list_name: listName,
    }, listId, listName);
  };

  const isOutOfStock =
    product.stock <= 0 || product.stockStatus === "out_of_stock";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: (index % 4) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative block w-full"
    >
      {/* Image Container - Taller Aspect Ratio [3/4] for Fashion */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-main">
        <Link href={`/product/${product.slug}`} className="block h-full w-full" onClick={handleSelect}>
          <Image
            src={product.images?.[0] || "/placeholder.jpg"}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={clsx(
              "object-cover transition-transform duration-1000 ease-out group-hover:scale-110",
              isOutOfStock && "opacity-60 grayscale",
            )}
          />
          {/* Hover Image Reveal */}
          {!isOutOfStock && product.images?.[1] && (
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 h-full w-full hidden md:block"
            >
              <Image
                src={product.images[1]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </motion.div>
          )}
        </Link>

        {/* Badges - Minimalist */}
        <div className="absolute top-0 left-0 p-3 flex flex-col gap-2 pointer-events-none z-10">
          {isOutOfStock ? (
            <span className="bg-neutral-900 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
              Sold Out
            </span>
          ) : (
            <>
              {discountPercentage > 0 && (
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                  -{discountPercentage}%
                </span>
              )}
              {product.isNew && (
                <span className="bg-white text-black text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                  New
                </span>
              )}
            </>
          )}
        </div>

        {/* Buttons Removed as per new UX - User must go to details page */}
        {/* Wishlist Button */}
        <WishlistButton
          product={product}
          className="absolute top-3 right-3 z-20 bg-white/80 hover:bg-white backdrop-blur-sm shadow-sm"
        />
      </div>

      {/* Product Info - Clean & Centered */}
      <div className="pt-4 text-center">
        {/* Category */}
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">
          {product.categories?.[0]?.name || "Collection"}
        </p>

        {/* Title */}
        <Link href={`/product/${product.slug}`} onClick={handleSelect}>
          <h3 className="text-base font-serif font-medium text-gray-900 group-hover:text-[#D4AF37] transition-colors line-clamp-1 mb-1 px-2">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center justify-center gap-3 text-sm">
          {hasDiscount ? (
            <>
              <span className="text-gray-400 line-through text-xs font-light">
                ৳{product.basePrice.toLocaleString()}
              </span>
              <span className="text-black font-semibold">
                ৳{product.salePrice?.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-black font-medium">
              ৳{product.basePrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
