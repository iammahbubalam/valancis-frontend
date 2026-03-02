"use client";

import { Container } from "@/components/ui/Container";
import { useWishlist } from "@/context/WishlistContext";
import { ProductCard } from "@/components/ui/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function WishlistPage() {
  const { items, isLoading } = useWishlist();
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  if (isAuthLoading || (isLoading && items.length === 0)) {
    return (
      <Container className="py-20 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-20 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Heart className="h-16 w-16 text-gray-200 mb-6" />
        <h1 className="text-3xl font-serif mb-4">My Wishlist</h1>
        <p className="text-gray-500 mb-8 max-w-md font-light">
          Sign in to save items to your wishlist and access them from any
          device.
        </p>
        <Link href="/login?redirect=/wishlist">
          <Button className="px-8 py-6 rounded-full uppercase tracking-widest text-xs font-bold">
            Sign In
          </Button>
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-12 min-h-screen">
      {/* Premium Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="group flex items-center gap-2 text-secondary/60 hover:text-primary transition-all duration-300 mb-12 uppercase tracking-[0.2em] text-[10px] font-bold"
      >
        <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" strokeWidth={1.5} />
        Go Back
      </motion.button>

      <div className="flex items-end justify-between mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif mb-3 italic">My Wishlist</h1>
          <p className="text-secondary/50 uppercase tracking-[0.1em] text-xs">
            {items.length} {items.length === 1 ? "item" : "items"} saved for you
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-gray-50/50 rounded-2xl border border-primary/5">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
            <Heart className="h-6 w-6 text-gray-300" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-serif italic mb-3 text-primary">Your wishlist is empty</h2>
          <p className="text-secondary/50 mb-10 max-w-xs font-light text-sm">
            Explore our curated collections and save your favorite timeless pieces.
          </p>
          <Link href="/shop">
            <Button variant="secondary" className="px-10 py-6 rounded-full uppercase tracking-widest text-xs font-bold">
              Explore Collections
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6">
          {items.map((item, index) => (
            <ProductCard key={item.id} product={item.product} index={index} />
          ))}
        </div>
      )}
    </Container>
  );
}
