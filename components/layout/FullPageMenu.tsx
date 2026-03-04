"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, User, Heart, X } from "lucide-react";
import { CategoryNode } from "@/lib/data";
import { Collection } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

interface FullPageMenuProps {
    isOpen: boolean;
    onClose: () => void;
    categories: CategoryNode[];
    collections: Collection[];
    onSearchOpen: () => void;
}

export function FullPageMenu({
    isOpen,
    onClose,
    categories,
    collections,
    onSearchOpen,
}: FullPageMenuProps) {
    const [hoveredImage, setHoveredImage] = useState<string | null>(null);
    const { user } = useAuth();
    const { items } = useCart();

    // Prevent scrolling on body when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
            setHoveredImage(null); // reset image when closed
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const navCategories = categories
        .filter((c) => c.showInNav !== false)
        .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

    // Default image if nothing is hovered (e.g., first collection or category image)
    const defaultImage =
        collections.find((c) => c.image)?.image ||
        navCategories.find((c) => c.image)?.image ||
        "/placeholder.jpg";

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: "-100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "-100%" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-[40] bg-canvas/40 backdrop-blur-3xl saturate-150 flex flex-col pt-[58px]" // Deeper ultra-transparent glassmorphism
                >
                    {/* Top Bar removed since Navbar covers this area */}

                    {/* Big Close Button (Top Right) */}
                    <button
                        onClick={onClose}
                        className="absolute top-18 right-8 md:top-20 md:right-20 p-2 text-primary/40 hover:text-primary transition-all duration-300 hover:scale-110 z-[50]"
                        aria-label="Close menu"
                    >
                        <X size={40} strokeWidth={1.5} />
                    </button>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden lg:max-w-[1440px] lg:mx-auto w-full px-8 md:px-16">
                        <div
                            className="w-full lg:w-1/2 py-12 md:py-20 lg:py-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 lg:gap-x-16 gap-y-16"
                            onMouseLeave={() => setHoveredImage(null)}
                        >

                            {/* Section 1: Collections */}
                            <div className="flex flex-col gap-6">
                                <div className="border-b border-black/[0.15] pb-1 w-fit">
                                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-black/70">
                                        COLLECTIONS
                                    </h4>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {collections.map((col) => (
                                        <Link
                                            key={col.id}
                                            href={`/collection/${col.slug}`}
                                            onClick={onClose}
                                            onMouseEnter={() => setHoveredImage(col.image || null)}
                                            className="font-serif italic text-xl lg:text-[22px] text-primary hover:text-black/60 transition-colors duration-300 flex items-center gap-3"
                                        >
                                            <span className="text-[10px] opacity-40 translate-y-[1px]">●</span>
                                            {col.title}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Section 2: Categories */}
                            <div className="flex flex-col gap-6">
                                <div className="border-b border-black/[0.15] pb-1 w-fit">
                                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-black/70">
                                        CATEGORIES
                                    </h4>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {navCategories.map((cat) => (
                                        <div key={cat.id} className="flex flex-col gap-4">
                                            <Link
                                                href={`/category/${cat.slug}`}
                                                onClick={onClose}
                                                onMouseEnter={() => setHoveredImage(cat.image || null)}
                                                className="font-serif italic text-xl lg:text-[22px] text-primary hover:text-black/60 transition-colors duration-300 flex items-center gap-3"
                                            >
                                                <span className="text-[10px] opacity-40 translate-y-[1px]">●</span>
                                                {cat.name}
                                            </Link>
                                            {cat.children && cat.children.length > 0 && (
                                                <div className="flex flex-col gap-2 pl-6 ml-1">
                                                    {cat.children.map((child) => (
                                                        <Link
                                                            key={child.id}
                                                            href={`/category/${child.slug}`}
                                                            onClick={onClose}
                                                            onMouseEnter={() => setHoveredImage(child.image || cat.image || null)}
                                                            className="font-serif italic text-lg lg:text-xl text-primary/70 hover:text-primary transition-colors duration-300 transform origin-left flex items-center gap-3"
                                                        >
                                                            <span className="text-sm opacity-30">—</span>
                                                            {child.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section 3: World of Valancis (Combined with Shop) */}
                            <div className="flex flex-col gap-6">
                                <div className="border-b border-black/[0.15] pb-1 w-fit">
                                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-black/70">
                                        VALANCIS
                                    </h4>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {[
                                        { name: "Our Story", path: "/about" },
                                        { name: "The Campaign", path: "/campaign" },
                                        { name: "Shop All", path: "/shop" },
                                        { name: "Wishlist", path: "/wishlist" },
                                    ].map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.path}
                                            onClick={onClose}
                                            onMouseEnter={() => setHoveredImage(null)}
                                            className="font-serif italic text-xl lg:text-[22px] text-primary hover:text-black/60 transition-colors duration-300 flex items-center gap-3"
                                        >
                                            <span className="text-[10px] opacity-40 translate-y-[1px]">●</span>
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Dynamic Image Display */}
                        <div className="hidden lg:flex w-1/2 items-center justify-center py-16">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={hoveredImage || "placeholder"}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                    className="w-full max-w-[600px] aspect-square relative bg-[#f4f4f4] overflow-hidden flex items-center justify-center rounded-sm shadow-sm"
                                >
                                    {hoveredImage ? (
                                        <Image
                                            src={hoveredImage}
                                            alt="Featured"
                                            fill
                                            className="object-cover object-center"
                                            priority
                                        />
                                    ) : (
                                        <span className="font-serif text-5xl md:text-6xl text-black/[0.03] tracking-[0.2em] font-light">
                                            Valancis
                                        </span>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Footer of the Menu */}
                    <div className="flex items-center justify-between px-8 md:px-16 lg:px-24 py-4 border-t border-black/[0.03] mt-auto">
                        <div className="flex items-center gap-8">
                            <a href="#" className="font-sans text-[7px] md:text-[8px] uppercase tracking-[0.3em] font-medium text-black/40 hover:text-black/80 transition-colors">INSTAGRAM</a>
                            <a href="#" className="font-sans text-[7px] md:text-[8px] uppercase tracking-[0.3em] font-medium text-black/40 hover:text-black/80 transition-colors">TIKTOK</a>
                            <a href="#" className="font-sans text-[7px] md:text-[8px] uppercase tracking-[0.3em] font-medium text-black/40 hover:text-black/80 transition-colors">PINTEREST</a>
                        </div>
                        <div className="font-sans text-[7px] md:text-[8px] uppercase tracking-[0.3em] font-medium text-black/40">
                            VALANCIS © 2026
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
