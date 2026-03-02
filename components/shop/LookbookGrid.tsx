"use client";

import { motion } from "framer-motion";
import { Product } from "@/types";
import Image from "next/image";
import clsx from "clsx";
import { useCart } from "@/context/CartContext";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

interface LookbookGridProps {
  products: Product[];
}

export function LookbookGrid({ products }: LookbookGridProps) {
  const { addToCart } = useCart();

  return (
    <div className="flex flex-col gap-24 md:gap-40 py-12">
      {products.map((product, index) => {
        const isEven = index % 2 === 0;

        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={clsx(
              "flex flex-col md:flex-row items-center gap-12 md:gap-24",
              !isEven && "md:flex-row-reverse",
            )}
          >
            {/* Large Editorial Image */}
            <Link
              href={`/product/${product.slug}`}
              className="w-full md:w-3/5 aspect-[3/4] md:aspect-[4/5] relative bg-[#f4f4f4] overflow-hidden group cursor-pointer"
            >
              <Image
                src={product.images?.[0] || ""}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
            </Link>

            {/* Product Details & Purchase Card */}
            <div className="w-full md:w-2/5 flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.4em] font-medium mb-6">
                Collection 2026
              </span>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-primary mb-6 leading-tight">
                <Link
                  href={`/product/${product.slug}`}
                  className="hover:text-black/70 transition-colors"
                >
                  {product.name}
                </Link>
              </h2>
              <p className="text-secondary/70 font-light leading-relaxed mb-10 max-w-md">
                {product.description ||
                  "Defined by exceptional craftsmanship and timeless elegance. This piece embodies the essence of modern luxury."}
              </p>

              {/* Custom Elegant Action Area */}
              <div className="flex flex-col items-center md:items-start gap-4 w-full max-w-[280px]">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-serif text-primary">
                    ৳{(product.salePrice || product.basePrice).toLocaleString()}
                  </span>
                  {product.salePrice &&
                    product.salePrice < product.basePrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ৳{product.basePrice.toLocaleString()}
                      </span>
                    )}
                </div>

                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className="group w-full bg-black text-white hover:bg-[#D4AF37] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed px-8 py-4 flex items-center justify-center gap-3 transition-colors duration-300"
                >
                  <ShoppingBag size={18} />
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">
                    {product.stock > 0 ? "Add to Bag" : "Sold Out"}
                  </span>
                </button>
                <div className="h-px w-full bg-gray-100 mt-2" />
                <Link
                  href={`/product/${product.slug}`}
                  className="text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors border-b border-transparent hover:border-black pb-1"
                >
                  View Details
                </Link>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
