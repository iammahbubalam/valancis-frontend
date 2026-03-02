"use client";

import { useState, useEffect } from "react";
import { Collection } from "@/types";
import { Button } from "@/components/ui/Button";
import { X, Upload, Loader2, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { getApiUrl } from "@/lib/utils";
import clsx from "clsx";
import { CollectionProductManager } from "./CollectionProductManager";

interface CollectionFormDrawerProps {
  isOpen: boolean;
  isCreating: boolean;
  collection: Partial<Collection>;
  onClose: () => void;
  onSuccess: () => void;
}

export function CollectionFormDrawer({
  isOpen,
  isCreating,
  collection,
  onClose,
  onSuccess,
}: CollectionFormDrawerProps) {
  const [formData, setFormData] = useState<Partial<Collection>>({
    title: "",
    slug: "",
    description: "",
    story: "",
    image: "",
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (isCreating) {
        setFormData({
          title: "",
          slug: "",
          description: "",
          story: "",
          image: "",
          isActive: true,
        });
      } else {
        setFormData({ ...collection });
      }
      setError(null);
    }
  }, [isOpen, isCreating, collection]);

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: isCreating || !prev.slug ? generateSlug(title) : prev.slug,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    const url = isCreating
      ? getApiUrl("/admin/collections")
      : getApiUrl(`/admin/collections/${collection.id}`);

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
        setError(errorText || "Failed to save collection.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
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
                    {isCreating ? "New Collection" : "Edit Collection"}
                  </h2>
                  <p className="text-sm text-gray-500 font-medium mt-0.5">
                    {isCreating
                      ? "Create a curated edit"
                      : `ID: ${collection.id}`}
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
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                {/* General Info */}
                <section className="space-y-6">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-primary rounded-full"></span>
                    General Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Collection Title
                      </label>
                      <input
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                        value={formData.title || ""}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="e.g. Eid 2026 Edit"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Slug
                      </label>
                      <input
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none font-mono text-sm"
                        value={formData.slug || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                        placeholder="eid-2026-edit"
                      />
                    </div>
                  </div>
                </section>

                {/* Narrative */}
                <section className="space-y-6">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-accent-gold rounded-full"></span>
                    Narrative
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Short Description
                      </label>
                      <textarea
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                        rows={2}
                        value={formData.description || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Brief summary used in cards..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Story (Rich Text)
                      </label>
                      <textarea
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none font-serif text-lg leading-relaxed"
                        rows={6}
                        value={formData.story || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, story: e.target.value })
                        }
                        placeholder="Write the collection's story here..."
                      />
                    </div>
                  </div>
                </section>

                {/* Visuals */}
                <section className="space-y-6">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-purple-400 rounded-full"></span>
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
                      <div className="relative w-full aspect-video mx-auto rounded-lg overflow-hidden shadow-md bg-white">
                        <Image
                          src={formData.image}
                          alt=""
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-bold px-3 py-1.5 border border-white/50 rounded-full backdrop-blur-sm">
                            Change Hero Image
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-gray-400 group-hover:text-primary group-hover:scale-110 transition-all">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          Upload Hero Image
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Recommended: 1920x1080px or higher
                        </p>
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </section>

                {/* SEO */}
                <section className="space-y-6">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-green-500 rounded-full"></span>
                    SEO Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Meta Title
                      </label>
                      <input
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        value={formData.metaTitle || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            metaTitle: e.target.value,
                          })
                        }
                        placeholder="e.g. Best Eid Collection 2026"
                      />
                      <div className="text-right text-xs text-gray-400 mt-1">
                        {(formData.metaTitle || "").length}/60
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Meta Description
                      </label>
                      <textarea
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        rows={3}
                        value={formData.metaDescription || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            metaDescription: e.target.value,
                          })
                        }
                        placeholder="SEO description..."
                      />
                      <div className="text-right text-xs text-gray-400 mt-1">
                        {(formData.metaDescription || "").length}/160
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Keywords
                      </label>
                      <input
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        value={formData.keywords || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, keywords: e.target.value })
                        }
                        placeholder="comma, separated, keywords"
                      />
                    </div>
                  </div>
                </section>

                {/* Status */}
                <section className="space-y-6">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-gray-400 rounded-full"></span>
                    Status
                  </h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 transition-colors hover:border-gray-200">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-gray-900 text-sm">
                        Active
                      </span>
                      <span className="text-xs text-gray-500">
                        Visible to customers
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
                </section>

                {/* Products (only show when editing existing collection) */}
                {!isCreating && collection.id && (
                  <section className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-blue-400 rounded-full"></span>
                      Products in Collection
                    </h3>
                    <CollectionProductManager collectionId={collection.id} />
                  </section>
                )}
              </div>

              {/* Footer */}
              <div className="px-8 py-6 border-t border-gray-100 bg-white flex items-center gap-4 sticky bottom-0 z-10">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 py-3"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-[2] py-3"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isCreating ? "Create Collection" : "Save Changes"}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
