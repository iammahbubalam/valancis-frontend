"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { getApiUrl } from "@/lib/utils";
import { Product } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. QUERY: Fetch Wishlist
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["wishlist", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) return [];

      const res = await fetch(getApiUrl("/wishlist"), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        return (data.items || []) as WishlistItem[];
      }
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 min
  });

  // 2. MUTATION: Add
  const addMutation = useMutation({
    mutationFn: async (product: Product) => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(getApiUrl("/wishlist"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id }),
      });

      if (!res.ok) throw new Error("Failed to add");
    },
    onMutate: async (product) => {
      const key = ["wishlist", user?.id];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<WishlistItem[]>(key) || [];

      // Optimistic
      const optimisticItem: WishlistItem = {
        id: `temp-${Date.now()}`,
        productId: product.id,
        product: product,
        addedAt: new Date().toISOString(),
      };

      queryClient.setQueryData(key, [...previous, optimisticItem]);
      return { previous };
    },
    onError: (err, product, context) => {
      queryClient.setQueryData(["wishlist", user?.id], context?.previous);
      console.error(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", user?.id] });
    },
  });

  const addToWishlist = (product: Product) => {
    if (!user) return; // Or show login modal
    addMutation.mutate(product);
  };

  // 3. MUTATION: Remove
  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      await fetch(getApiUrl(`/wishlist/${productId}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onMutate: async (productId) => {
      const key = ["wishlist", user?.id];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<WishlistItem[]>(key) || [];

      queryClient.setQueryData(
        key,
        previous.filter((i) => i.product.id !== productId),
      );
      return { previous };
    },
    onError: (err, productId, context) => {
      queryClient.setQueryData(["wishlist", user?.id], context?.previous);
      console.error(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", user?.id] });
    },
  });

  const removeFromWishlist = (productId: string) => {
    if (!user) return;
    removeMutation.mutate(productId);
  };

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.product.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
export type { WishlistItem };
