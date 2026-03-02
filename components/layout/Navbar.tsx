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
import { NavMenu } from "./NavMenu";
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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
          isAdmin
            ? "fixed top-0 left-0 right-0 z-50 bg-canvas py-2 border-b border-accent-subtle"
            : clsx(
              "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out border-b",
              isScrolled
                ? "bg-canvas/95 backdrop-blur-md py-1 shadow-sm border-accent-subtle"
                : "bg-canvas/70 backdrop-blur-sm py-2 border-transparent",
            ),
        )}
      >
        <Container className="flex items-center justify-between gap-4 md:gap-8 min-h-[42px]">
          {/* 1. Mobile Left Area / Desktop Menu (Hidden on Desktop) */}
          <div className="flex-1 flex items-center lg:hidden">
            <button
              className="text-primary hover:text-primary transition-colors cursor-pointer p-1"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* 2. Logo Section - Centered on Mobile, Left on Desktop */}
          <div className="flex justify-center lg:justify-start lg:flex-shrink-0 relative z-50">
            <Link href="/" className="cursor-pointer">
              <div className="relative h-7 w-24 md:h-10 md:w-36 lg:w-40 transition-all duration-300">
                <Image
                  src="/assets/logo_valancis.png"
                  alt="Valancis"
                  fill
                  className="object-contain object-center lg:object-left"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* 3. Desktop Navigation (Hidden on Mobile) */}
          <div className="hidden lg:block flex-1 pl-12">
            <NavMenu
              categories={categories}
              collections={collections}
            />
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
            />

            {/* Side Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 w-[85vw] max-w-sm bg-canvas z-[70] flex flex-col p-8 lg:hidden shadow-2xl"
            >
              <div className="flex justify-between items-center mb-12 border-b border-accent-subtle pb-6">
                <span className="text-xl font-serif uppercase tracking-widest text-primary">
                  Menu
                </span>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="cursor-pointer p-2 hover:bg-canvas rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-primary" />
                </button>
              </div>

              {/* Primary Mobile Navigation (Mirrors Desktop Hierarchy) */}
              <nav className="flex flex-col gap-8 overflow-y-auto pr-4">
                {categories
                  .filter((cat) => cat.showInNav !== false)
                  .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                  .map((cat) => (
                    <div key={cat.id} className="flex flex-col gap-5">
                      <Link
                        href={`/category/${cat.slug}`}
                        className="text-2xl font-serif text-primary cursor-pointer hover:text-primary transition-all duration-300"
                        onClick={() => setIsMobileOpen(false)}
                      >
                        {cat.name}
                      </Link>

                      {/* Nested Children (Sub-categories) */}
                      {cat.children && cat.children.length > 0 && (
                        <div className="pl-5 flex flex-col gap-5 border-l border-accent-subtle">
                          {cat.children.map((child) => (
                            <div key={child.id} className="flex flex-col gap-3">
                              <Link
                                href={`/category/${child.slug}`}
                                onClick={() => setIsMobileOpen(false)}
                                className="text-sm font-medium uppercase tracking-[0.1em] text-primary/70 hover:text-primary transition-colors"
                              >
                                {child.name}
                              </Link>

                              {/* L3 Children if any (Small uppercase style like desktop) */}
                              {child.children && child.children.length > 0 && (
                                <div className="pl-4 flex flex-col gap-2.5 mt-1 border-l border-accent-subtle">
                                  {child.children.map((sub) => (
                                    <Link
                                      key={sub.id}
                                      href={`/category/${sub.slug}`}
                                      onClick={() => setIsMobileOpen(false)}
                                      className="text-[10px] uppercase tracking-widest text-secondary/50 hover:text-primary transition-colors font-medium"
                                    >
                                      {sub.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                {/* Collections Section with Hierarchy */}
                <div className="flex flex-col gap-5 pt-2">
                  <Link
                    href="/collections"
                    className="text-2xl font-serif text-primary cursor-pointer hover:text-primary transition-all duration-300"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    Collections
                  </Link>
                  <div className="pl-5 flex flex-col gap-5 border-l border-accent-subtle">
                    {collections.map((col) => (
                      <Link
                        key={col.id}
                        href={`/collection/${col.slug}`}
                        className="text-sm font-medium uppercase tracking-[0.1em] text-primary/70 hover:text-primary transition-colors"
                        onClick={() => setIsMobileOpen(false)}
                      >
                        {col.title}
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  href="/shop"
                  className="text-2xl font-serif text-primary mt-4 cursor-pointer hover:text-primary transition-all duration-300"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Shop All
                </Link>

                <div className="pt-8 border-t border-accent-subtle mt-4 space-y-6">
                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 text-sm uppercase tracking-widest text-primary font-medium cursor-pointer"
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        {user.firstName} {user.lastName}
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center gap-3 text-sm uppercase tracking-widest text-primary/70 hover:text-primary transition-colors cursor-pointer"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Sign In / Join
                    </Link>
                  )}

                  <Link
                    href="/wishlist"
                    className="flex items-center gap-3 text-sm uppercase tracking-widest text-primary/70 hover:text-primary transition-colors cursor-pointer"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Heart className="w-4 h-4" />
                    My Wishlist
                  </Link>

                  {user && (
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileOpen(false);
                      }}
                      className="flex items-center gap-3 text-sm uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors cursor-pointer w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  )}
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
