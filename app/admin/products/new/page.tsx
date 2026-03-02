"use client";

import { useEffect, useState } from "react";
import { Category, Collection } from "@/types";
import { getApiUrl } from "@/lib/utils";
import { ProductForm } from "@/components/admin/products/ProductForm";

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Parallel fetch - use flat categories endpoint for product forms
    Promise.all([
      fetch(getApiUrl("/admin/categories"), { headers }),
      fetch(getApiUrl("/admin/collections"), { headers }),
    ])
      .then(async ([catRes, colRes]) => {
        if (catRes.ok) {
          const cats = await catRes.json();
          setCategories(cats || []);
        }
        if (colRes.ok) {
          const cols = await colRes.json();
          setCollections(cols || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <ProductForm categories={categories} collections={collections} />;
}
