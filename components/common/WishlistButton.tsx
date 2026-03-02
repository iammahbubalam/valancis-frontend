"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

import { Product } from "@/types";

interface WishlistButtonProps {
  product: Product;
  className?: string;
  variant?: "icon" | "full";
}

export function WishlistButton({
  product,
  className,
  variant = "icon",
}: WishlistButtonProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const productId = product.id;
  const isSaved = isInWishlist(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/auth/login?redirect=" + window.location.pathname);
      return;
    }

    setLoading(true);
    if (isSaved) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(product);
    }
    setLoading(false);
  };

  if (variant === "full") {
    return (
      <Button
        variant="outline"
        onClick={handleClick}
        disabled={loading}
        className={cn("w-full gap-2", className)}
      >
        <Heart
          className={cn("h-4 w-4", isSaved && "fill-current text-red-500")}
        />
        {isSaved ? "Saved to Wishlist" : "Add to Wishlist"}
      </Button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "rounded-full p-2 transition-colors hover:bg-black/5",
        isSaved ? "text-red-500" : "text-gray-400 hover:text-black",
        className,
      )}
      aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={cn("h-5 w-5", isSaved && "fill-current")} />
    </button>
  );
}
