"use client";

import { useState, useEffect } from "react";
import { Category } from "@/types";
import { FlatCategory } from "./CategoryRow";
import { Button } from "@/components/ui/Button";
import { X, ChevronDown, Upload, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { getApiUrl } from "@/lib/utils";

interface CategoryFormDrawerProps {
  isOpen: boolean;
  isCreating: boolean;
  selectedCategory: Category | null;
  items: FlatCategory[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CategoryFormDrawer({
  isOpen,
  isCreating,
  selectedCategory,
  items,
  onClose,
  onSuccess,
}: CategoryFormDrawerProps) {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: "",
    slug: "",
    parentId: undefined,
    isActive: true,
    showInNav: true,
    isFeatured: false,
    image: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Sync form data when selectedCategory changes
  useEffect(() => {
    if (selectedCategory && !isCreating) {
      setFormData({
        name: selectedCategory.name || "",
        slug: selectedCategory.slug || "",
        parentId: selectedCategory.parentId,
        isActive: selectedCategory.isActive ?? true,
        showInNav: selectedCategory.showInNav ?? true,
        isFeatured: selectedCategory.isFeatured ?? false,
        image: selectedCategory.image || "",
        metaTitle: selectedCategory.metaTitle || "",
        metaDescription: selectedCategory.metaDescription || "",
        keywords: selectedCategory.keywords || "",
      });
    } else if (isCreating) {
      setFormData({
        name: "",
        slug: "",
        parentId: undefined,
        isActive: false,
        showInNav: false,
        isFeatured: false,
        image: "",
        metaTitle: "",
        metaDescription: "",
        keywords: "",
      });
    }
  }, [selectedCategory, isCreating]);

  // Auto-suggest slug when name changes (only for new categories)
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      // Auto-suggest slug only if creating new or slug is empty
      slug: isCreating || !prev.slug ? generateSlug(name) : prev.slug,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", e.target.files[0]);
      const res = await fetch(getApiUrl("/upload"), {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, image: data.url }));
      } else {
        const errorText = await res.text();
        console.error("Upload failed:", res.status, errorText);
        setError(`Image upload failed: ${errorText || res.statusText}`);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(`Image upload error: ${err.message || "Network error"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    const url = isCreating
      ? getApiUrl("/admin/categories")
      : getApiUrl(`/admin/categories/${selectedCategory?.id}`);

    try {
      const res = await fetch(url, {
        method: isCreating ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const errorText = await res.text();
        setError(errorText || "Failed to save category.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {isCreating ? "New Category" : "Edit Category"}
                  </h2>
                  <p className="text-sm text-gray-500 font-medium mt-0.5">
                    {isCreating
                      ? "Add a new item to catalog"
                      : `ID: ${selectedCategory?.id}`}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <div className="flex-1 p-8 space-y-10">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                {/* Basic Info */}
                <section className="space-y-6">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-primary rounded-full"></span>
                    General Information
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Category Name
                      </label>
                      <input
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="e.g. Winter Collection"
                      />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        URL Slug
                      </label>
                      <input
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium font-mono text-sm"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            slug: e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, "-"),
                          })
                        }
                        placeholder="e.g. winter-collection"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Auto-generated from name. Edit if needed.
                      </p>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Parent Category
                      </label>
                      <div className="relative">
                        <select
                          className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 appearance-none outline-none font-medium text-gray-700"
                          value={formData.parentId || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              parentId: e.target.value || undefined,
                            })
                          }
                        >
                          <option value="">(Root Category)</option>
                          {items
                            .filter((i) => i.id !== selectedCategory?.id)
                            .map((i) => (
                              <option key={i.id} value={i.id}>
                                {"— ".repeat(i.depth) + i.name}
                              </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Settings */}
                <section className="space-y-6">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-gray-400 rounded-full"></span>
                    Visibility & Status
                  </h3>
                  <div className="space-y-4">
                    {/* Active Switch */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 transition-colors hover:border-gray-200">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-gray-900 text-sm">
                          Active Status
                        </span>
                        <span className="text-xs text-gray-500">
                          Visible to customers in the store
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isActive: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {/* Nav Switch */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 transition-colors hover:border-gray-200">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-gray-900 text-sm">
                          Include in Menu
                        </span>
                        <span className="text-xs text-gray-500">
                          Display in main navigation headers
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.showInNav}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              showInNav: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {/* Featured Switch */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 transition-colors hover:border-gray-200">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-gray-900 text-sm">
                          Featured Category
                        </span>
                        <span className="text-xs text-gray-500">
                          Highlight this category on the homepage
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isFeatured: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </section>

                <hr className="border-gray-100" />

                {/* Media */}
                <section className="space-y-6">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-amber-400 rounded-full"></span>
                    Visuals
                  </h3>
                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-white hover:border-primary transition-all relative group">
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />

                    {formData.image ? (
                      <div className="relative w-40 h-40 mx-auto rounded-lg overflow-hidden shadow-md bg-white">
                        <Image
                          src={formData.image}
                          alt=""
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-bold px-3 py-1.5 border border-white/50 rounded-full backdrop-blur-sm">
                            Change Image
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-gray-400 group-hover:text-primary group-hover:scale-110 transition-all">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          Click to upload image
                        </p>
                        <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto">
                          SVG, PNG, JPG supported. Recommended size 400x400px.
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* SEO */}
                <section className="space-y-6">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-purple-400 rounded-full"></span>
                    SEO Metadata
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                        Meta Title
                      </label>
                      <input
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all"
                        placeholder="SEO Title"
                        value={formData.metaTitle}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            metaTitle: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                        Meta Description
                      </label>
                      <textarea
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all resize-none"
                        rows={3}
                        placeholder="Brief description for search engines..."
                        value={formData.metaDescription}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            metaDescription: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                        Keywords
                      </label>
                      <input
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all"
                        placeholder="comma, separated, keywords"
                        value={formData.keywords}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            keywords: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className="px-8 py-6 border-t border-gray-100 bg-white flex items-center gap-4 sticky bottom-0 z-10">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 border-none relative top-0 hover:-top-0.5 transition-all"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-[2] py-3 shadow-xl shadow-primary/25 hover:shadow-primary/40 relative top-0 hover:-top-0.5 transition-all"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Save Category"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
