"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { Product } from "@/types";
import { getApiUrl } from "@/lib/utils";
import { useAuth } from "./AuthContext";
import { useDialog } from "./DialogContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { analytics } from "@/lib/gtm";

interface CartItem extends Product {
  quantity: number;
  // L9: Capture unique IDs for rendering & logic
  cartItemId?: string;
  variantId?: string;
  variantName?: string;
  variantImage?: string;
  price?: number;
  salePrice?: number;
}

// L9: Centralized Error Constants
export const CART_ERRORS = {
  ALREADY_IN_CART: "ALREADY_IN_CART",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  VARIANT_REQUIRED: "VARIANT_REQUIRED",
} as const;

// L9: Extended interface for coupon support
interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addToCart: (product: Product, variantId?: string) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  subtotal: number;
  grandTotal: number;
  // Pricing
  // Coupon actions
  isCouponLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const dialog = useDialog();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // L9: Debounce timeouts
  const updateTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const activeMutations = useRef(0);

  // 1. QUERY: Fetch Cart (Guest from LS, User from API)
  const { data: items = [] } = useQuery({
    queryKey: ["cart", user?.id || "guest"],
    queryFn: async () => {
      // GUEST MODE
      if (!user) {
        if (typeof window === "undefined") return [];
        const saved = localStorage.getItem("valancis-cart");
        return saved ? (JSON.parse(saved) as CartItem[]) : [];
      }

      // USER MODE
      const token = localStorage.getItem("token");
      if (!token) return [];

      const res = await fetch(getApiUrl("/cart"), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        return [];
      }

      const data = await res.json();
      if (data.items) {
        return data.items.map((i: any) => ({
          ...i.product,
          quantity: i.quantity,
          cartItemId: i.id,
          variantId: i.variantId || i.variant_id || undefined,
          variantName: i.variantName,
          variantImage: i.variantImage,
          price: i.price,
          salePrice: i.salePrice,
        })) as CartItem[];
      }
      return [];
    },
    staleTime: user ? 1000 * 60 : Infinity,
  });

  // 2. MUTATION: Add to Cart
  const addMutation = useMutation({
    mutationFn: async ({
      product,
      variantId,
    }: {
      product: Product;
      variantId?: string;
    }) => {
      // L9: Strict Variant Enforcement
      // If product has variants, variantId MUST be provided. No auto-selection.
      const hasVariants = product.variants && product.variants.length > 0;
      if (hasVariants && !variantId) {
        throw new Error("VARIANT_REQUIRED"); // Frontend should catch this before calling, but double safety
      }

      // If no variants, variantId stays undefined
      const finalVariantId = hasVariants ? variantId : undefined;

      // L9: Stock Constraint (Double Check)
      // Only Pre-Order or In-Stock allowed
      const isPreOrder = product.stockStatus === "pre_order";
      // Find variant stock if applicable
      const variantStock = hasVariants && variantId
        ? product.variants?.find(v => v.id === variantId)?.stock || 0
        : product.stock || 0;

      if (!isPreOrder && variantStock <= 0 && product.stockStatus !== "pre_order") {
        throw new Error("OUT_OF_STOCK");
      }

      // Guest Mode
      if (!user) {
        const key = ["cart", "guest"];
        const current = queryClient.getQueryData<CartItem[]>(key) || [];

        // L9: Check for exact variant match
        const existing = current.find(
          (i) => i.id === product.id && i.variantId === finalVariantId
        );

        if (existing) {
          throw new Error(CART_ERRORS.ALREADY_IN_CART);
        }

        const newItem = { ...product, quantity: 1, variantId: finalVariantId, cartItemId: `${product.id}-${finalVariantId}` };
        const newItems = [...current, newItem];

        localStorage.setItem("valancis-cart", JSON.stringify(newItems));
        // Update cache manually since onMutate is skipped
        queryClient.setQueryData(key, newItems);
        return newItems;
      }

      // L9: User Mode - API handles data (Check moved to onMutate to avoid race condition)
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl("/cart"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          variantId: finalVariantId,
          quantity: 1,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to add");
      }
    },
    onMutate: async ({ product, variantId }) => {
      activeMutations.current++;
      // Skip for Guest (logic handled in mutationFn to avoid cache pollution race)
      if (!user) return { previous: [] };

      const key = ["cart", user.id];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<CartItem[]>(key) || [];

      // Check if exact variant exists (Blocking per user request)
      const existing = previous.find((i) => i.id === product.id && i.variantId === variantId);
      if (existing) {
        // Find existing to check if we should block
        // We throw here to stop the mutation
        throw new Error("ALREADY_IN_CART");
      }
      // Note: React Query's onError will catch this throw. 
      // But onError needs to know if it's a "real" error or logic block.
      // Actually throwing in onMutate might not trigger onError in the same way?
      // Docs: "If onMutate throws, the mutation will not proceed."

      const optimistic = [...previous, { ...product, quantity: 1, variantId }];
      queryClient.setQueryData(key, optimistic);
      return { previous };
    },

    onError: (err: any, newTodo, context) => {
      queryClient.setQueryData(
        ["cart", user?.id || "guest"],
        context?.previous,
      );
      if (err.message === "ALREADY_IN_CART") {
        dialog.toast({ message: "This variant is already in your bag.", variant: "info" });
      } else if (err.message === "VARIANT_REQUIRED") {
        dialog.toast({ message: "Please select a style/size first.", variant: "danger" });
      } else if (err.message === "OUT_OF_STOCK") {
        dialog.toast({ message: "Seelect variant is out of stock.", variant: "danger" });
      } else if (err.message) {
        // Show actual backend error if available
        dialog.toast({ message: err.message, variant: "danger" });
      } else {
        dialog.toast({ message: "Failed to add to cart", variant: "danger" });
      }
    },
    onSettled: () => {
      activeMutations.current--;
      if (activeMutations.current === 0) {
        if (user) queryClient.invalidateQueries({ queryKey: ["cart", user.id] });
        else queryClient.invalidateQueries({ queryKey: ["cart", "guest"] });
      }
    },
  });

  const addToCart = (product: Product, variantId?: string) => {
    addMutation.mutate({ product, variantId });
  };

  // 3. MUTATION: Remove
  const removeMutation = useMutation({
    mutationFn: async ({ productId, variantId }: { productId: string; variantId: string }) => {
      if (!user) {
        const current =
          queryClient.getQueryData<CartItem[]>(["cart", "guest"]) || [];
        const newItems = current.filter((i) => !(i.id === productId && i.variantId === variantId));
        localStorage.setItem("valancis-cart", JSON.stringify(newItems));
        return;
      }

      const token = localStorage.getItem("token");
      await fetch(getApiUrl(`/cart/${productId}?variantId=${variantId}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onMutate: async ({ productId, variantId }) => {
      activeMutations.current++;
      const key = ["cart", user?.id || "guest"];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<CartItem[]>(key) || [];
      queryClient.setQueryData(
        key,
        previous.filter((i) => !(i.id === productId && i.variantId === variantId)),
      );
      return { previous };
    },
    onError: (err, vars, context) => {
      queryClient.setQueryData(
        ["cart", user?.id || "guest"],
        context?.previous,
      );
      dialog.toast({ message: "Failed to remove item", variant: "danger" });
    },
    onSettled: () => {
      activeMutations.current--;
      if (activeMutations.current === 0) {
        if (user) queryClient.invalidateQueries({ queryKey: ["cart", user.id] });
        else queryClient.invalidateQueries({ queryKey: ["cart", "guest"] });
      }
    },
  });

  const removeFromCart = (productId: string, variantId: string) => {
    // Analytics: Find item before it's removed
    const item = items.find(i => i.id === productId && i.variantId === variantId);
    if (item) {
      analytics.removeFromCart({
        item_id: item.id,
        item_name: item.name,
        price: item.salePrice || item.price || item.basePrice,
        item_variant: item.variantName || item.variantId,
        quantity: item.quantity,
        item_category: item.categories?.[0]?.name,
      });
    }
    removeMutation.mutate({ productId, variantId });
  };

  // 4. MUTATION: Update Quantity
  const updateMutation = useMutation({
    mutationFn: async ({ productId, variantId, quantity }: { productId: string; variantId?: string; quantity: number }) => {
      if (!user) {
        const current =
          queryClient.getQueryData<CartItem[]>(["cart", "guest"]) || [];
        const newItems = current.map((i) =>
          i.id === productId && i.variantId === variantId ? { ...i, quantity } : i,
        );
        localStorage.setItem("valancis-cart", JSON.stringify(newItems));
        return;
      }

      const token = localStorage.getItem("token");
      await fetch(getApiUrl("/cart"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, variantId, quantity }),
      });
    },
    onMutate: () => {
      activeMutations.current++;
    },
    onError: (err: any) => {
      // On error, we invalidate to refetch true state
      // Note: We don't check activeMutations here because an error 
      // is a critical state change that likely needs a reset/refetch
      if (user) queryClient.invalidateQueries({ queryKey: ["cart", user.id] });
      else queryClient.invalidateQueries({ queryKey: ["cart", "guest"] });

      const msg = err.message || "Failed to update quantity";
      dialog.toast({ message: msg, variant: "danger" });
    },
    onSettled: () => {
      activeMutations.current--;
      if (activeMutations.current === 0) {
        if (user) queryClient.invalidateQueries({ queryKey: ["cart", user.id] });
        else queryClient.invalidateQueries({ queryKey: ["cart", "guest"] });
      }
    },
  });

  const updateQuantity = (productId: string, variantId: string | undefined, quantity: number) => {
    if (quantity < 1) {
      if (variantId) {
        removeFromCart(productId, variantId);
      }
      return;
    }

    // 1. Immediate Optimistic Update (No flicker)
    const key = ["cart", user?.id || "guest"];
    const current = queryClient.getQueryData<CartItem[]>(key) || [];

    // Validation: Check Stock
    const targetItem = current.find((i) => i.id === productId && i.variantId === variantId);
    if (targetItem && targetItem.stockStatus !== "pre_order") {
      // Assuming item.stock is available (from updated backend)
      // If stock is missing, fallback to safe high number or 0? 
      // Backend guarantees stock int now.
      if (quantity > targetItem.stock) {
        dialog.toast({ message: `Only ${targetItem.stock} items available.`, variant: "danger" });
        return;
      }
    }

    const newItems = current.map((i) =>
      i.id === productId && i.variantId === variantId ? { ...i, quantity } : i
    );
    queryClient.setQueryData(key, newItems);

    // 2. Guest Mode: Sync immediately (Local Storage)
    if (!user) {
      localStorage.setItem("valancis-cart", JSON.stringify(newItems));
      return;
    }

    // 3. User Mode: Debounce API Call
    const timeoutKey = `${productId}-${variantId || "novar"}`;
    if (updateTimeouts.current[timeoutKey]) {
      clearTimeout(updateTimeouts.current[timeoutKey]);
    }

    updateTimeouts.current[timeoutKey] = setTimeout(() => {
      updateMutation.mutate({ productId, variantId, quantity });
    }, 500);
  };

  const clearCart = () => {
    if (!user) {
      localStorage.removeItem("valancis-cart");
      queryClient.setQueryData(["cart", "guest"], []);
    } else {
      queryClient.setQueryData(["cart", user.id], []);
    }
  };

  const toggleCart = () => setIsOpen((prev) => !prev);

  // L9: Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    // Priority: Item level SalePrice > Item level Price (these are resolved by backend)
    const price = item.salePrice || item.price || item.basePrice || 0;
    return sum + price * item.quantity;
  }, 0);

  // L9: Calculate grandTotal
  const grandTotal = subtotal;


  // 5. MERGE LOGIC (Effect)
  useEffect(() => {
    if (user) {
      const guestCartRaw = localStorage.getItem("valancis-cart");
      if (guestCartRaw) {
        const guestItems: CartItem[] = JSON.parse(guestCartRaw);
        if (guestItems.length > 0) {
          const token = localStorage.getItem("token");
          Promise.all(
            guestItems.map((item) =>
              fetch(getApiUrl("/cart"), {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  productId: item.id,
                  quantity: item.quantity,
                }),
              }),
            ),
          )
            .then(() => {
              localStorage.removeItem("valancis-cart");
              queryClient.invalidateQueries({ queryKey: ["cart", user.id] });
              dialog.toast({
                message: "Cart merged from previous session",
                variant: "info",
              });
            })
            .catch(console.error);
        }
      }
    }
  }, [user, queryClient, dialog]);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleCart,
        subtotal,
        grandTotal,
        isCouponLoading: false
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
export type { CartItem };
