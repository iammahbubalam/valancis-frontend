"use client";

import { useState, useEffect } from "react";
import { useCart, CartItem } from "@/context/CartContext";

export type CheckoutMode = "cart";
export type CheckoutStatus =
  | "initializing"
  | "ready"
  | "submitting"
  | "success"
  | "error";

export interface CheckoutState {
  status: CheckoutStatus;
  mode: CheckoutMode;
  items: CartItem[];
  total: number;
  error?: string;
}

export interface UseCheckoutFlowResult {
  state: CheckoutState;
  setState: React.Dispatch<React.SetStateAction<CheckoutState>>;
  refresh: () => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clearCart: () => void;
}

export function useCheckoutFlow(): UseCheckoutFlowResult {
  const { items: cartItems, subtotal: cartSubtotal, clearCart } = useCart();

  const [state, setState] = useState<CheckoutState>({
    status: "initializing",
    mode: "cart",
    items: [],
    total: 0,
    error: undefined,
  });

  // State Machine Trigger
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      status: "ready",
      mode: "cart",
      items: cartItems,
      total: cartSubtotal,
      error: undefined,
    }));
  }, [cartItems, cartSubtotal]);

  const refresh = () => {
    const currentUrl = new URL(window.location.href);
    window.location.href = currentUrl.toString();
  };

  const { updateQuantity: cartUpdateQuantity } = useCart();

  const updateQuantity = (productId: string, variantId: string | undefined, quantity: number) => {
    cartUpdateQuantity(productId, variantId, quantity);
  };

  return { state, setState, refresh, updateQuantity, clearCart };
}
