// Alt Text Manager - Admin tool for bulk editing image alt text
// Status: Frontend component created, backend integration needed

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Save, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  productId: string;
  productName: string;
}

/**
 * AltTextManager - Bulk image alt text editor
 *
 * L9: Admin tool for SEO optimization - find and fix missing alt attributes.
 * Backend API: GET /admin/images/missing-alt, PATCH /admin/images/:id/alt
 */
export default function AltTextManagerPage() {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const res = await fetch("/api/admin/images/missing-alt");
      // const data = await res.json();

      // Mock data for demonstration
      const mockImages: ProductImage[] = [
        {
          id: "1",
          url: "https://via.placeholder.com/200",
          altText: null,
          productId: "p1",
          productName: "iPhone 15 Pro",
        },
        {
          id: "2",
          url: "https://via.placeholder.com/200",
          altText: "Samsung Galaxy S24",
          productId: "p2",
          productName: "Samsung Galaxy S24 Ultra",
        },
      ];

      setImages(mockImages);

      // Initialize edit values
      const initialValues: Record<string, string> = {};
      mockImages.forEach((img) => {
        initialValues[img.id] = img.altText || "";
      });
      setEditValues(initialValues);
    } catch (error) {
      console.error("Failed to fetch images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (imageId: string) => {
    try {
      setSaving(imageId);
      const newAltText = editValues[imageId];

      // TODO: Replace with actual API call
      // await fetch(`/api/admin/images/${imageId}/alt`, {
      //   method: "PATCH",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ altText: newAltText }),
      // });

      console.log(`Saving alt text for image ${imageId}:`, newAltText);

      // Update local state
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, altText: newAltText } : img,
        ),
      );

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      alert("Alt text updated successfully!");
    } catch (error) {
      console.error("Failed to update alt text:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(null);
    }
  };

  const handleChange = (imageId: string, value: string) => {
    setEditValues((prev) => ({ ...prev, [imageId]: value }));
  };

  const imagesWithoutAlt = images.filter((img) => !img.altText);
  const imagesWithAlt = images.filter((img) => img.altText);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          Loading images...
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Alt Text Manager
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and add alt text to product images for better SEO and
          accessibility
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Images
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {images.length}
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="text-sm text-red-600 dark:text-red-400">
            Missing Alt Text
          </div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">
            {imagesWithoutAlt.length}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="text-sm text-green-600 dark:text-green-400">
            With Alt Text
          </div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {imagesWithAlt.length}
          </div>
        </div>
      </div>

      {/* Missing Alt Text Section */}
      {imagesWithoutAlt.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Images Missing Alt Text ({imagesWithoutAlt.length})
            </h2>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Alt Text
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {imagesWithoutAlt.map((img) => (
                  <tr
                    key={img.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <td className="px-6 py-4">
                      <div className="relative w-20 h-20">
                        <Image
                          src={img.url}
                          alt={editValues[img.id] || "Product image"}
                          fill
                          className="object-cover rounded"
                          sizes="80px"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {img.productName}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editValues[img.id] || ""}
                        onChange={(e) => handleChange(img.id, e.target.value)}
                        placeholder="Enter alt text..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        onClick={() => handleSave(img.id)}
                        disabled={saving === img.id || !editValues[img.id]}
                        size="sm"
                      >
                        {saving === img.id ? "Saving..." : "Save"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Images With Alt Text */}
      {imagesWithAlt.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Images With Alt Text ({imagesWithAlt.length})
            </h2>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Alt Text
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {imagesWithAlt.map((img) => (
                  <tr
                    key={img.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <td className="px-6 py-4">
                      <div className="relative w-20 h-20">
                        <Image
                          src={img.url}
                          alt={img.altText!}
                          fill
                          className="object-cover rounded"
                          sizes="80px"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {img.productName}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editValues[img.id]}
                        onChange={(e) => handleChange(img.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        onClick={() => handleSave(img.id)}
                        disabled={saving === img.id}
                        size="sm"
                        variant="outline"
                      >
                        {saving === img.id ? "Saving..." : "Update"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            All Images Have Alt Text!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Great job! All product images have proper alt attributes for SEO and
            accessibility.
          </p>
        </div>
      )}
    </div>
  );
}
