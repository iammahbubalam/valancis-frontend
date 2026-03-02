"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types";
import { getApiUrl } from "@/lib/utils";
import { Plus, X, Loader2, Search } from "lucide-react";
import { useDialog } from "@/context/DialogContext";
import Image from "next/image";

interface CollectionProductManagerProps {
  collectionId: string;
}

export function CollectionProductManager({
  collectionId,
}: CollectionProductManagerProps) {
  const dialog = useDialog();
  const [collectionProducts, setCollectionProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState<string | null>(null);

  // Fetch collection details with products
  useEffect(() => {
    fetchCollectionProducts();
  }, [collectionId]);

  const fetchCollectionProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl(`/collections/${collectionId}`), {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setCollectionProducts(data.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl("/admin/products?limit=100"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAllProducts(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenPicker = () => {
    fetchAllProducts();
    setShowPicker(true);
    setSearch("");
  };

  const handleAddProduct = async (productId: string) => {
    setIsAdding(productId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        getApiUrl(`/admin/collections/${collectionId}/products`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId, action: "add" }),
        },
      );
      if (res.ok) {
        await fetchCollectionProducts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(null);
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    const confirmed = await dialog.confirm({
      title: "Remove Product",
      message: "Remove this product from the collection?",
      confirmText: "Remove",
      variant: "danger",
    });
    if (!confirmed) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(getApiUrl(`/admin/collections/${collectionId}/products`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, action: "remove" }),
      });
      await fetchCollectionProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const collectionProductIds = new Set(collectionProducts.map((p) => p.id));
  const availableProducts = allProducts.filter(
    (p) =>
      !collectionProductIds.has(p.id) &&
      (search === "" || p.name.toLowerCase().includes(search.toLowerCase())),
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Products */}
      <div className="grid grid-cols-3 gap-3">
        {collectionProducts.map((product) => (
          <div
            key={product.id}
            className="relative group bg-gray-50 rounded-lg overflow-hidden"
          >
            <div className="aspect-square relative">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                  No Image
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="text-xs font-medium text-gray-900 truncate">
                {product.name}
              </p>
            </div>
            <button
              onClick={() => handleRemoveProduct(product.id)}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Add Button */}
        <button
          onClick={handleOpenPicker}
          className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="w-6 h-6" />
          <span className="text-xs font-medium">Add</span>
        </button>
      </div>

      {collectionProducts.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-4">
          No products in this collection yet
        </p>
      )}

      {/* Product Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">Add Products</h3>
              <button
                onClick={() => setShowPicker(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {availableProducts.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  No products available to add
                </p>
              ) : (
                <div className="space-y-2">
                  {availableProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden relative flex-shrink-0">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                            N/A
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">{product.sku}</p>
                      </div>
                      <button
                        onClick={() => handleAddProduct(product.id)}
                        disabled={isAdding === product.id}
                        className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded hover:bg-primary/90 disabled:opacity-50"
                      >
                        {isAdding === product.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          "Add"
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
