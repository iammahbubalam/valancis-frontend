"use client";

import { useCart } from "@/context/CartContext";
import { Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import { analytics } from "@/lib/gtm";

interface AddToCartButtonProps {
  product: Product;
  disabled?: boolean;
  selectedVariantId?: string;
  onSuccess?: () => void;
  className?: string;
}

export function AddToCartButton({ product, disabled, selectedVariantId, onSuccess, className }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showError, setShowError] = useState(false);

  const hasVariants = product.variants && product.variants.length > 0;
  const isSelectionRequired = hasVariants && !selectedVariantId;



  const handleAddToCart = async () => {
    if (isSelectionRequired) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setIsAdding(true);
    setShowError(false);
    try {
      await addToCart(product, selectedVariantId);

      // Analytics Tracking
      const price = product.salePrice || product.basePrice;
      const variant = product.variants?.find(v => v.id === selectedVariantId);

      analytics.addToCart({
        item_id: product.id,
        item_name: product.name,
        price: price,
        item_variant: variant?.name || selectedVariantId,
        quantity: 1
      });

      if (onSuccess) onSuccess();
    } finally {
      setTimeout(() => setIsAdding(false), 500);
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="text-red-500 text-[9px] font-bold uppercase tracking-[0.2em] text-center mb-1"
          >
            Please select your size
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={handleAddToCart}
        disabled={disabled || isAdding}
        variant="primary"
        className={twMerge(
          "w-full h-14 md:h-16 uppercase tracking-[0.3em] text-[10px] font-bold transition-all duration-500 rounded-none",
          "bg-primary text-white hover:bg-black border-none",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          showError && "bg-red-50 text-red-500",
          className
        )}
      >
        {isAdding ? (
          <span className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            Adding
          </span>
        ) : (
          <span className="flex items-center gap-4">
            <ShoppingBag className="w-4 h-4" strokeWidth={1} />
            {disabled ? "Sold Out" : showError ? "Select Size" : "Add to Bag"}
          </span>
        )}
      </Button>
    </div>
  );
}
