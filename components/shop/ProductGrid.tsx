"use client";

import { useEffect } from "react";
import { Product } from "@/types";
import { ProductCard } from "@/components/ui/ProductCard";
import { analytics } from "@/lib/gtm";

interface ProductGridProps {
  products: Product[];
  listName?: string;
  listId?: string;
}

export function ProductGrid({ products, listName = "Product Grid", listId }: ProductGridProps) {
  useEffect(() => {
    if (products.length > 0) {
      analytics.viewItemList(
        products.map((p, i) => ({
          item_id: p.id,
          item_name: p.name,
          price: p.salePrice || p.basePrice,
          item_category: p.categories?.[0]?.name,
          index: i + 1,
          item_list_id: listId,
          item_list_name: listName,
        })),
        listId,
        listName
      );
    }
  }, [products, listId, listName]);

  if (products.length === 0) {
    return (
      <div className="flex-1 min-h-[50vh] flex flex-col items-center justify-center text-center p-8 border border-dashed border-gray-200 rounded-lg">
        <p className="text-lg font-serif text-primary mb-2">
          No products found
        </p>
        <p className="text-sm text-secondary/60">
          Try adjusting your filters or search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          priority={index < 4} // LCP Boost for first row
          listName={listName}
          listId={listId}
        />
      ))}
    </div>
  );
}
