"use client";

import { useCart } from "@/context/CartContext";
import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function FloatingCart() {
    const { items, toggleCart } = useCart();
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");

    // Don't show on admin pages
    if (isAdmin) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="fixed bottom-8 right-6 z-[90] lg:hidden"
            >
                <button
                    onClick={toggleCart}
                    className="relative group p-4 bg-primary text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 ring-4 ring-white/10 backdrop-blur-sm"
                    aria-label="View Cart"
                >
                    <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />

                    {totalItems > 0 && (
                        <motion.span
                            key={totalItems}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent-gold text-[11px] font-bold text-white border-2 border-white shadow-sm"
                        >
                            {totalItems}
                        </motion.span>
                    )}

                    {/* Premium Pulse Effect when items are present */}
                    {totalItems > 0 && (
                        <span className="absolute inset-0 rounded-full animate-ping bg-accent-gold/20 -z-10" />
                    )}
                </button>
            </motion.div>
        </AnimatePresence>
    );
}
