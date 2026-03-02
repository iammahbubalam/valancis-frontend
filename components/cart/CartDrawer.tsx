"use client";

import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { analytics, GA4Item } from "@/lib/gtm";


export function CartDrawer() {
  const {
    items,
    isOpen,
    toggleCart,
    removeFromCart,
    updateQuantity,
    subtotal,
  } = useCart();

  useEffect(() => {
    if (isOpen && items.length > 0) {
      analytics.viewCart(
        items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.salePrice || item.price || item.basePrice,
          item_variant: item.variantName || item.variantId,
          quantity: item.quantity,
          item_category: item.categories?.[0]?.name,
        })),
        subtotal
      );
    }
  }, [isOpen, items, subtotal]);

  const handleCheckout = () => {
    analytics.beginCheckout(
      items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.salePrice || item.price || item.basePrice,
        item_variant: item.variantName || item.variantId,
        quantity: item.quantity,
        item_category: item.categories?.[0]?.name,
      })),
      subtotal
    );
    toggleCart();
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
              <h2 className="font-serif text-2xl text-primary">
                Shopping Bag ({items.length})
              </h2>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>



            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                    <ShoppingBag className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="font-serif text-xl text-primary">
                    Your bag is empty
                  </h3>
                  <p className="text-sm text-secondary max-w-[200px]">
                    Explore our collection and find something timeless.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={toggleCart}
                    className="mt-4"
                  >
                    Start Shopping
                  </Button>
                </div>
              ) : (
                items.map((item, index) => {
                  const isOutOfStock =
                    item.stock <= 0 || item.stockStatus === "out_of_stock";

                  // L9: Resolve Variant Details
                  const selectedVariant = item.variants?.find(v => v.id === item.variantId);
                  const isMaxStock = item.quantity >= (selectedVariant?.stock ?? item.stock);
                  const variantImage = selectedVariant?.images?.[0];

                  return (
                    <motion.div
                      layout
                      key={item.cartItemId || `${item.id}-${item.variantId || index}`}
                      className={clsx(
                        "flex gap-4 group",
                        isOutOfStock && "opacity-75 grayscale-[0.5]",
                      )}
                    >
                      <div className="relative w-24 h-32 bg-gray-100 flex-shrink-0 overflow-hidden rounded-sm">
                        <Image
                          src={item.variantImage || variantImage || item.images?.[0] || "/placeholder.png"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold uppercase tracking-widest border border-white px-2 py-1">
                              Sold Out
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start gap-4">
                            <Link
                              href={`/product/${item.slug}`}
                              onClick={toggleCart}
                            >
                              <h4 className="font-serif text-base text-primary leading-tight hover:text-accent-gold transition-colors">
                                {item.name}
                              </h4>
                              {item.variantName && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {item.variantName}
                                </p>
                              )}
                            </Link>
                            <span className="text-sm font-medium text-primary whitespace-nowrap">
                              ৳
                              {(
                                item.salePrice ||
                                item.basePrice ||
                                0
                              ).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-secondary uppercase tracking-wide mt-1">
                            {item.categories?.[0]?.name}
                          </p>

                          {/* L9: Exact Variant Info */}
                          {selectedVariant && (
                            <div className="mt-1 flex flex-col gap-0.5">
                              <p className="text-[10px] text-gray-500 font-medium bg-gray-50 inline-block px-1.5 py-0.5 rounded w-fit">
                                SKU: {selectedVariant.sku || item.id.slice(0, 8).toUpperCase()}
                              </p>
                              {selectedVariant.attributes && Object.entries(selectedVariant.attributes).map(([key, val]) => (
                                <p key={key} className="text-[10px] text-gray-500">
                                  {key}: <span className="text-gray-900 font-medium">{val}</span>
                                </p>
                              ))}
                            </div>
                          )}

                          {isMaxStock && !isOutOfStock && (
                            <p className="text-[10px] text-orange-500 mt-1">
                              Max available stock reached
                            </p>
                          )}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity */}
                          <div className="flex items-center border border-gray-200 rounded-sm">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.variantId, item.quantity - 1)
                              }
                              className="p-2 hover:bg-gray-100 active:bg-gray-200 active:scale-90 text-secondary hover:text-primary transition-all duration-150 disabled:opacity-30"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-medium text-primary">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.variantId, item.quantity + 1)
                              }
                              className="p-2 hover:bg-gray-100 active:bg-gray-200 active:scale-90 text-secondary hover:text-primary transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                              disabled={isMaxStock || isOutOfStock}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Remove */}
                          <button
                            onClick={() => removeFromCart(item.id, item.variantId || "")}
                            className="px-2 py-1 text-xs text-secondary hover:text-red-600 hover:bg-red-50 active:bg-red-100 active:scale-95 rounded transition-all duration-150"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-secondary">
                    <span>Subtotal</span>
                    <span>৳{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-secondary">
                    <span>Shipping</span>
                    <span className="text-primary italic">Calculated at checkout</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-lg font-serif text-primary pt-4 border-t border-gray-200">
                  <span>Total</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>

                {/* Checkout Button with Logic */}
                {items.some(
                  (i) => i.stock <= 0 || i.stockStatus === "out_of_stock",
                ) ? (
                  <div className="space-y-2">
                    <Button
                      disabled
                      className="w-full py-4 text-xs font-bold tracking-[0.15em] uppercase opacity-50 cursor-not-allowed"
                    >
                      Remove Sold Out Items
                    </Button>
                    <p className="text-xs text-red-500 text-center font-medium">
                      Please remove out of stock items to proceed.
                    </p>
                  </div>
                ) : (
                  <Link
                    href="/checkout"
                    onClick={handleCheckout}
                    className="block w-full"
                  >
                    <Button className="w-full py-4 text-xs font-bold tracking-[0.15em] uppercase">
                      Checkout Securely
                    </Button>
                  </Link>
                )}

                <p className="text-[10px] text-center text-gray-400">
                  Tax included. Returns accepted within 30 days.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
