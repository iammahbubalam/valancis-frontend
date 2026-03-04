"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  User,
  Shield,
  Heart,
  LogOut,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FullPageMenu } from "./FullPageMenu";
import { UserMenu } from "./UserMenu";
import { CategoryNode, SiteConfig } from "@/lib/data";
import { SearchOverlay } from "./SearchOverlay";
import { useIntro } from "@/context/IntroContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import clsx from "clsx";
import { Collection } from "@/types";

interface NavbarProps {
  categories: CategoryNode[];
  collections: Collection[];
  siteConfig: SiteConfig;
}

export function Navbar({ categories, collections, siteConfig }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { items, toggleCart } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, logout } = useAuth();
  const { isIntroComplete, isLoading } = useIntro();
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={clsx(
          "print:hidden transition-all duration-300 ease-out",
          isAdmin
            ? "fixed top-0 left-0 right-0 z-50 bg-canvas py-2 border-b border-accent-subtle"
            : clsx(
              "fixed top-0 left-0 right-0 z-50",
              isMenuOpen
                ? "bg-transparent border-transparent py-6 md:py-2"
                : clsx(
                  "border-b",
                  isScrolled
                    ? "bg-canvas/95 backdrop-blur-md py-1 shadow-sm border-accent-subtle"
                    : "bg-canvas/70 backdrop-blur-sm py-2 border-transparent"
                )
            ),
        )}
      >
        <Container className="flex items-center justify-between gap-4 md:gap-8 min-h-[42px]">
          {/* 1. Menu Button - Left Aligned */}
          <div className="flex-1 flex items-center">
            <button
              className="text-[10px] uppercase tracking-[0.15em] font-medium text-primary hover:text-black/60 transition-colors cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)} // Toggle state
              aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
            >
              {isMenuOpen ? "CLOSE" : "MENU"}
            </button>
          </div>

          {/* 2. Logo Section - Absolutely Centered */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <Link href="/" className="cursor-pointer block">
              <div className="relative h-8 w-40 md:h-10 md:w-48 lg:w-56 transition-all duration-300">
                <Image
                  src={isMenuOpen ? siteConfig.logoWhite : siteConfig.logo}
                  alt={siteConfig.name}
                  fill
                  className="object-contain object-center"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* 3. Empty Center Space (to maintain 3 column flex layout) */}
          <div className="hidden lg:block flex-1 pl-12">
            {/* NavMenu removed. Using FullPageMenu instead. */}
          </div>

          {/* 4. Right Actions: Mobile "Shop" or Desktop Full Actions */}
          <div className="flex-1 flex items-center justify-end">
            {/* Desktop Full Actions Group */}
            <div className="hidden lg:flex items-center gap-6">
              {/* Shop CTA */}
              <Link
                href="/shop"
                className="px-5 py-1.5 border border-accent-subtle rounded-full text-[10px] uppercase tracking-[0.15em] font-bold text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 cursor-pointer"
              >
                Shop
              </Link>

              {/* Vertical Divider */}
              <div className="h-5 w-px bg-accent-subtle" />

              {/* Icon Group */}
              <div className="flex items-center gap-5">
                <button
                  className="text-primary/80 hover:text-primary transition-all duration-200 hover:scale-110 cursor-pointer"
                  onClick={() => setIsSearchOpen(true)}
                  title="Search"
                >
                  <Search className="w-[18px] h-[18px]" strokeWidth={2} />
                </button>

                {user?.isAdmin && (
                  <Link
                    href="/admin"
                    className="text-primary/80 hover:text-primary transition-all duration-200 hover:scale-110 cursor-pointer"
                    title="Admin Panel"
                  >
                    <Shield className="w-[18px] h-[18px]" strokeWidth={2} />
                  </Link>
                )}

                <Link
                  href="/wishlist"
                  className="text-primary/80 hover:text-primary transition-all duration-200 hover:scale-110 cursor-pointer flex items-center relative"
                  title="Wishlist"
                >
                  <Heart className="w-[18px] h-[18px]" strokeWidth={2} />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full font-bold">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>

                <button
                  onClick={toggleCart}
                  className="text-primary/80 hover:text-primary transition-all duration-200 relative hover:scale-110 cursor-pointer"
                  title="Cart"
                >
                  <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={2} />
                  {items.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-white text-[9px] flex items-center justify-center rounded-full font-bold">
                      {items.length}
                    </span>
                  )}
                </button>

                <UserMenu />
              </div>
            </div>

            {/* Mobile Actions: Wishlist + Shop */}
            <div className="lg:hidden flex items-center gap-4">
              <Link
                href="/wishlist"
                className="text-primary/70 hover:text-primary transition-all relative p-1"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" strokeWidth={2} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border border-white">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              <Link
                href="/shop"
                className="px-4 py-1.5 border border-accent-subtle rounded-full text-[10px] uppercase tracking-widest font-bold text-primary active:bg-primary active:text-white transition-all duration-300"
              >
                Shop
              </Link>
            </div>
          </div>
        </Container>
      </header>

      {/* Full Page Interactive Menu */}
      <FullPageMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        categories={categories}
        collections={collections}
        onSearchOpen={() => setIsSearchOpen(true)}
      />

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
