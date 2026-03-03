"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Loader2,
  Upload,
  X,
  Plus,
  Save,
  LayoutGrid,
  DollarSign,
  Package,
  Layers,
  Image as ImageIcon,
  Settings,
  Trash2,
  Search,
  Check,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getApiUrl } from "@/lib/utils";
import { useDialog } from "@/context/DialogContext";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { Button } from "@/components/ui/Button";
import { Product, Category, Variant, Collection } from "@/types";
import { FancyMultiSelect } from "@/components/ui/FancyMultiSelect";
import { useQueryClient } from "@tanstack/react-query";

interface ProductFormProps {
  initialData?: Product | null;
  categories: Category[];
  collections: Collection[];
  isEditing?: boolean;
}

// Convert flat categories array to options format
const getCategoryOptions = (
  cats: Category[],
): { value: string; label: string }[] => {
  return cats
    .filter((c) => c.id && c.name) // Filter out invalid entries
    .map((c) => ({ value: c.id, label: c.name }));
};

export function ProductForm({
  initialData,
  categories,
  collections,
  isEditing = false,
}: ProductFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const dialog = useDialog();
  const queryClient = useQueryClient();

  // Initial State Setup
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [activeVariantIdx, setActiveVariantIdx] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    basePrice: initialData?.basePrice || 0,
    salePrice: initialData?.salePrice || 0,
    stockStatus: initialData?.stockStatus || "in_stock",
    isPreorder: initialData?.isPreorder || false,
    preorderDepositAmount: initialData?.preorderDepositAmount || 0,
    isActive: initialData?.isActive ?? true, // Default true for new
    isFeatured: initialData?.isFeatured || false,
    categoryIds: initialData?.categories?.map((c) => c.id) || ([] as string[]),
    collectionIds:
      initialData?.collections?.map((c) => c.id) || ([] as string[]),
    images: initialData?.images || ([] as string[]),
    variants: (initialData?.variants as Variant[]) || ([] as Variant[]),
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
    keywords: initialData?.keywords || "",
    brand: initialData?.brand || "",
    tags: initialData?.tags || ([] as string[]),
  });

  const tabs = [
    { id: "general", label: "General", icon: LayoutGrid },
    { id: "media", label: "Media", icon: ImageIcon },
    { id: "pricing", label: "Pricing", icon: DollarSign },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "variants", label: "Variants", icon: Layers },
    { id: "seo", label: "SEO", icon: Search },
  ];

  // --- Media Handlers ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    const files = Array.from(e.target.files);
    const token = localStorage.getItem("token");

    try {
      const uploadPromises = files.map(async (file) => {
        const uploadData = new FormData();
        uploadData.append("file", file);

        const res = await fetch(getApiUrl("/upload"), {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: uploadData,
        });

        if (!res.ok) throw new Error("Upload failed for " + file.name);
        const data = await res.json();
        return data.url;
      });

      const newUrls = await Promise.all(uploadPromises);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newUrls],
      }));
    } catch (err) {
      console.error(err);
      dialog.toast({
        message: "One or more uploads failed",
        variant: "danger",
      });
    } finally {
      setIsUploading(false);
      // Reset input value to allow re-uploading same files if needed
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // --- Variant Handlers ---
  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: "", // Empty ID = Backend will CREATE this variant
          productId: "",
          name: "",
          stock: 0,
          sku: "",
          attributes: {},
          images: [],
          lowStockThreshold: 5,
        },
      ],
    }));
  };

  const toggleVariantImage = (imgUrl: string) => {
    if (activeVariantIdx === null) return;

    const variant = formData.variants[activeVariantIdx];
    const currentImages = variant.images || [];
    const isSelected = currentImages.includes(imgUrl);

    let newImages;
    if (isSelected) {
      newImages = currentImages.filter((img) => img !== imgUrl);
    } else {
      newImages = [...currentImages, imgUrl];
    }

    updateVariant(activeVariantIdx, "images", newImages);
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  // --- Variant Generator Logic ---
  const [generatorInput, setGeneratorInput] = useState("");

  const generateVariants = () => {
    if (!generatorInput.trim()) return;

    // Parse input: "Color: Red, Blue; Size: S, M"
    const options: Record<string, string[]> = {};
    const parts = generatorInput.split(";");

    for (const part of parts) {
      const [key, values] = part.split(":");
      if (key && values) {
        const k = key.trim();
        options[k] = values
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
      }
    }

    if (Object.keys(options).length === 0) return;


    // Generate Cartesian Product
    const keys = Object.keys(options);
    const cartesian = (...a: any[][]) =>
      a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));

    // @ts-ignore - complex array reducing
    const combinations = cartesian(...keys.map((k) => options[k]));

    const newVariants: Variant[] = combinations.map(
      (combo: string | string[]) => {
        const comboArray = Array.isArray(combo) ? combo : [combo];
        const attrs: Record<string, string> = {};
        let nameParts: string[] = [];

        keys.forEach((key, idx) => {
          attrs[key] = comboArray[idx];
          nameParts.push(comboArray[idx]);
        });

        // Generate SKU Prefix from Name (Acronym)
        const nameAcronym = (formData.name || "PROD")
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 4);

        const sku = `${nameAcronym}-${nameParts
          .join("-")
          .toUpperCase()
          .replace(/[^A-Z0-9-]/g, "")}`;

        return {
          id: "", // Empty ID = Backend will CREATE this variant
          productId: "",
          name: nameParts.join(" / "),
          stock: 0,
          sku: sku,
          attributes: attrs,
          images: [],
          lowStockThreshold: 5,
        };
      },
    );

    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, ...newVariants],
    }));
    setGeneratorInput("");
    dialog.toast({
      message: `Generated ${newVariants.length} variants`,
      variant: "success",
    });
  };

  // --- Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const base = Number(formData.basePrice);
    const sale = formData.salePrice ? Number(formData.salePrice) : 0;

    if (sale > 0 && sale >= base) {
      dialog.toast({
        message: "Sale Price must be less than Base Price",
        variant: "danger",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const url = isEditing
        ? getApiUrl(`/admin/products/${initialData?.id}`)
        : getApiUrl("/admin/products");
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        ...formData,
        // Ensure number types
        basePrice: Number(formData.basePrice),
        // salePrice must be NULL or > 0 (DB constraint), so send null if 0 or empty
        salePrice: formData.salePrice ? Number(formData.salePrice) : null,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save product");

      queryClient.invalidateQueries({ queryKey: ["admin_products"] });
      queryClient.invalidateQueries({ queryKey: ["admin_product_stats"] });

      router.push("/admin/products");
      router.refresh(); // Still needed for server components, but query path is clear
    } catch (error) {
      console.error(error);
      dialog.toast({ message: "Failed to save product", variant: "danger" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="text-primary/60 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-xl font-serif font-bold text-gray-900">
              {isEditing ? "Edit Product" : "New Product"}
            </h1>
            <p className="text-xs text-primary/60 uppercase tracking-wider">
              {isEditing ? initialData?.name : "Create a new item"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-all ${activeTab === tab.id
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-gray-600 hover:bg-canvas"
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* General Tab */}
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              {/* Basic Info Card */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-primary/60 mb-1">
                    Product Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-primary focus:border-primary transition-all text-lg font-serif"
                    placeholder="e.g. Royal Blue Katan Silk"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-primary/60 mb-1">
                    Slugs (URL Friendly Name)
                  </label>
                  <div className="flex gap-2">
                    <input
                      required
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-primary font-mono text-sm text-gray-600"
                      placeholder="royal-blue-katan-silk"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const generated = formData.name
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, "");
                        setFormData({ ...formData, slug: generated });
                      }}
                    >
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-primary/60 mb-1">
                      Brand (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-primary"
                      placeholder="e.g. Aarong, Richman"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-primary/60 mb-1">
                      Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags.join(", ")}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tags: e.target.value.split(",").map((t) => t.trim()),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-primary"
                      placeholder="Summer, Sale, New Arrival"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-primary/60 mb-1">
                    Description
                  </label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(val) =>
                      setFormData({ ...formData, description: val })
                    }
                  />
                </div>
              </div>

              {/* Organization Card */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Organization
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categories
                    </label>
                    <FancyMultiSelect
                      options={getCategoryOptions(categories)}
                      selected={formData.categoryIds}
                      onChange={(ids) =>
                        setFormData({ ...formData, categoryIds: ids })
                      }
                      placeholder="Select categories..."
                    />
                    <p className="text-xs text-primary/60 mt-1">
                      Hierarchical selection supported.
                    </p>
                  </div>

                  {/* Collections */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Collections
                    </label>
                    <FancyMultiSelect
                      options={collections.map((c) => ({
                        value: c.id,
                        label: c.title,
                      }))}
                      selected={formData.collectionIds}
                      onChange={(ids) =>
                        setFormData({ ...formData, collectionIds: ids })
                      }
                      placeholder="Select collections..."
                    />
                    <p className="text-xs text-primary/60 mt-1">
                      Add to marketing collections.
                    </p>
                  </div>

                  {/* Preorder Settings */}
                  <div className="md:col-span-2 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <label className="flex items-center gap-2 cursor-pointer mb-4">
                      <input
                        type="checkbox"
                        checked={formData.isPreorder}
                        onChange={(e) =>
                          setFormData({ ...formData, isPreorder: e.target.checked })
                        }
                        className="rounded border-gray-300 text-primary focus:ring-primary w-5 h-5"
                      />
                      <span className="text-sm font-medium text-gray-900">Is Pre-order Product?</span>
                    </label>

                    {formData.isPreorder && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pre-order Deposit Amount (BDT)
                        </label>
                        <input
                          type="number"
                          value={formData.preorderDepositAmount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              preorderDepositAmount: parseFloat(e.target.value) || 0,
                            })
                          }
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-primary"
                        />
                        <p className="text-xs text-primary/60 mt-1">
                          Specify the fixed deposit amount required during checkout.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Visibility Card */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900">
                    Visibility Status
                  </span>
                  <span className="text-sm text-primary/60">
                    Control product availability
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="rounded border-gray-300 text-primary focus:ring-primary w-5 h-5"
                    />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isFeatured: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 text-primary focus:ring-primary w-5 h-5"
                    />
                    <span className="text-sm font-medium">Featured</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === "media" && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Product Images</h3>
                <label className="cursor-pointer bg-gray-900 text-white px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wide hover:bg-gray-800 transition-all flex items-center gap-2">
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Upload Image
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {formData.images.map((url, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-square bg-canvas rounded-lg overflow-hidden border border-gray-200"
                  >
                    <Image
                      src={url}
                      alt="Product"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => removeImage(idx)}
                        type="button"
                        className="bg-white p-2 rounded-full text-red-600 hover:scale-110 transition-transform"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {idx === 0 && (
                      <div className="absolute top-2 left-2 bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        MAIN
                      </div>
                    )}
                  </div>
                ))}
                {formData.images.length === 0 && (
                  <div className="col-span-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-primary/50">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs">No images uploaded</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === "pricing" && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-primary/60 mb-1">
                    Base Price (BDT)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50 font-serif">
                      ৳
                    </span>
                    <input
                      required
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          basePrice: e.target.value as any,
                        })
                      }
                      className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-primary text-lg font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-primary/60 mb-1">
                    Sale Price (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50 font-serif">
                      ৳
                    </span>
                    <input
                      type="number"
                      value={formData.salePrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          salePrice: e.target.value as any,
                        })
                      }
                      className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-primary text-lg font-medium text-red-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-primary/60 mb-1">
                    Stock Status
                  </label>
                  <select
                    value={formData.stockStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stockStatus: e.target.value as
                          | "in_stock"
                          | "out_of_stock",
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-primary bg-white"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-md flex items-start gap-3">
                <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-blue-900">
                    SKU-Centric Inventory
                  </h4>
                  <p className="text-xs text-blue-700 mt-1">
                    Stock and SKUs are now managed at the Variant level. Please
                    go to the <b>Variants</b> tab to manage inventory for each
                    SKU.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Variants Tab - L9 Command Center */}
          {activeTab === "variants" && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-bold text-gray-900">
                    Variant Command Center
                  </h3>
                  <p className="text-xs text-primary/60">
                    Manage complex options (Size, Color) and specific inventory.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      // Simple One-Click Generator Mockup
                      // In reality, we'd open a dialog to ask for Attributes
                      // For now, let's keep the manual add button + a "Smart Generate" placeholder
                      addVariant();
                    }}
                    type="button"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Manual Variant
                  </Button>
                </div>
              </div>

              {/* L9: Smart Generator Input (Concept) */}
              <div className="bg-canvas p-4 rounded-md border border-gray-200">
                <h4 className="text-xs font-bold uppercase text-primary/60 mb-2">
                  Smart Generator
                </h4>
                <p className="text-xs text-gray-600 mb-3">
                  Add options like "Color: Red, Blue" and "Size: S, M" to
                  auto-generate variants.
                </p>
                <div className="flex gap-2">
                  <input
                    value={generatorInput}
                    onChange={(e) => setGeneratorInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm"
                    placeholder="e.g. Color: Red, Blue; Size: S, M"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={generateVariants}
                  >
                    Generate
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {formData.variants.length === 0 && (
                  <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-lg text-primary/50 text-sm">
                    No variants added. Product uses base price & stock.
                  </div>
                )}

                {formData.variants.map((variant, idx) => (
                  <div
                    key={idx}
                    className="group border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Header Row */}
                    <div className="flex items-center gap-4 p-4 bg-canvas/50 border-b border-gray-100">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Variant Name (e.g. Red / XL)"
                          value={variant.name}
                          onChange={(e) =>
                            updateVariant(idx, "name", e.target.value)
                          }
                          className="w-full bg-transparent font-medium focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="text-primary/50 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Editor Body */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Column 1: Core Info */}
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase font-bold text-primary/50">
                          SKU & Stock
                        </label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="SKU (e.g. SHIRT-RED-XL)"
                            value={variant.sku}
                            onChange={(e) =>
                              updateVariant(idx, "sku", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-black/10 rounded text-sm font-mono"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="bg-canvas hover:bg-accent-subtle text-gray-600 px-3"
                            title="Auto-Generate SKU"
                            onClick={() => {
                              if (
                                variant.sku &&
                                !confirm("Overwrite existing SKU?")
                              ) {
                                return;
                              }

                              const values = Object.values(
                                variant.attributes || {},
                              );
                              const suffix =
                                values.length > 0
                                  ? values.join("-")
                                  : variant.name.replace(" / ", "-");

                              const nameAcronym = (formData.name || "PROD")
                                .split(" ")
                                .map((w) => w[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 4);

                              const autoSku = `${nameAcronym}-${suffix}`
                                .toUpperCase()
                                .replace(/[^A-Z0-9-]/g, "");
                              updateVariant(idx, "sku", autoSku);
                            }}
                          >
                            <Settings className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-primary/60">Stock:</span>
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) =>
                              updateVariant(
                                idx,
                                "stock",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-24 px-3 py-1 border border-black/10 rounded text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-primary/60">
                            Threshold:
                          </span>
                          <input
                            type="number"
                            value={variant.lowStockThreshold}
                            onChange={(e) =>
                              updateVariant(
                                idx,
                                "lowStockThreshold",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-24 px-3 py-1 border border-black/10 rounded text-sm"
                          />
                        </div>
                      </div>

                      {/* Column 2: Pricing Logic */}
                      <div className="space-y-3 border-l border-gray-100 pl-4">
                        <label className="text-[10px] uppercase font-bold text-primary/50 flex items-center gap-2">
                          <DollarSign className="w-3 h-3" /> Pricing Override
                        </label>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-primary/50">
                              Price
                            </span>
                            <input
                              type="number"
                              placeholder="Base"
                              value={variant.price || ""}
                              onChange={(e) =>
                                updateVariant(
                                  idx,
                                  "price",
                                  parseFloat(e.target.value) || undefined,
                                )
                              }
                              className="w-full px-2 py-1 border border-black/10 rounded text-sm"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-primary/50">
                              Sale
                            </span>
                            <input
                              type="number"
                              placeholder="None"
                              value={variant.salePrice || ""}
                              onChange={(e) =>
                                updateVariant(
                                  idx,
                                  "salePrice",
                                  parseFloat(e.target.value) || undefined,
                                )
                              }
                              className="w-full px-2 py-1 border border-black/10 rounded text-sm text-red-500"
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-primary/50">
                          Leave empty to use base product price.
                        </p>
                      </div>

                      {/* Column 3: Rich Media (JSONB) */}
                      <div className="space-y-3 border-l border-gray-100 pl-4">
                        <label className="text-[10px] uppercase font-bold text-primary/50 flex items-center gap-2">
                          <ImageIcon className="w-3 h-3" /> Variant Image
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {/* Selected Images */}
                          {(variant.images || []).map((img, imgIdx) => (
                            <div
                              key={imgIdx}
                              className="relative h-16 w-16 rounded overflow-hidden border border-gray-200 group/img"
                            >
                              <Image
                                src={img}
                                alt="Variant"
                                fill
                                className="object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newImages = variant.images.filter(
                                    (i) => i !== img,
                                  );
                                  updateVariant(idx, "images", newImages);
                                }}
                                className="absolute top-0 right-0 bg-red-500 text-white p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}

                          {/* Add Button */}
                          <div
                            onClick={() => {
                              setActiveVariantIdx(idx);
                              setImagePickerOpen(true);
                            }}
                            className="h-16 w-16 bg-canvas rounded flex flex-col items-center justify-center text-[10px] text-primary/60 cursor-pointer hover:bg-canvas border border-dashed border-gray-300 transition-colors"
                          >
                            <Plus className="w-4 h-4 mb-1" />
                            Select
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Attributes Editor Section */}
                    <div className="bg-canvas p-4 border-t border-gray-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase font-bold text-primary/60">
                          Attributes (Dynamic Specs)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const newAttrs = {
                              ...(variant.attributes || {}),
                              "": "", // New empty key
                            };
                            updateVariant(idx, "attributes", newAttrs);
                          }}
                          className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded hover:bg-canvas text-primary font-bold"
                        >
                          + Add Attribute
                        </button>
                      </div>

                      <div className="space-y-2">
                        {Object.entries(variant.attributes || {}).map(
                          ([key, val], attrIdx) => (
                            <div
                              key={attrIdx}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="text"
                                placeholder="Key (e.g. Color)"
                                value={key}
                                onChange={(e) => {
                                  const newKey = e.target.value;
                                  // Reconstruct object with new key order
                                  const newAttrs: Record<string, string> = {};
                                  Object.entries(variant.attributes).forEach(
                                    ([k, v], i) => {
                                      if (i === attrIdx) {
                                        newAttrs[newKey] = v;
                                      } else {
                                        newAttrs[k] = v;
                                      }
                                    },
                                  );
                                  updateVariant(idx, "attributes", newAttrs);
                                }}
                                className="w-1/3 px-2 py-1 text-xs border border-gray-200 rounded"
                              />
                              <span className="text-primary/50">:</span>
                              <input
                                type="text"
                                placeholder="Value (e.g. Red)"
                                value={val}
                                onChange={(e) => {
                                  const newAttrs = { ...variant.attributes };
                                  // Must find the key that corresponds to this index in iteration
                                  // This is slightly brittle if keys are duplicates, but for simple UI it works.
                                  // Better: use key directly if we assume keys are unique.
                                  // Since we just changed the key above, this might be tricky if key is empty.
                                  // Let's assume stability:
                                  newAttrs[key] = e.target.value;
                                  updateVariant(idx, "attributes", newAttrs);
                                }}
                                className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newAttrs = { ...variant.attributes };
                                  delete newAttrs[key];
                                  updateVariant(idx, "attributes", newAttrs);
                                }}
                                className="text-primary/50 hover:text-red-500"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ),
                        )}
                        {Object.keys(variant.attributes || {}).length === 0 && (
                          <div className="text-xs text-primary/50 italic">
                            No attributes defined. Use "Generate" or add manually.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === "seo" && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3">
                Search Engine Optimization
              </h3>

              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Meta Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-black transition-colors"
                    value={formData.metaTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, metaTitle: e.target.value })
                    }
                    placeholder="e.g. Luxurious Silk Saree | Valancis"
                  />
                  <div className="flex justify-between text-xs text-primary/60">
                    <span>Title tag shown in Google search results.</span>
                    <span
                      className={
                        formData.metaTitle.length > 60 ? "text-red-500" : ""
                      }
                    >
                      {formData.metaTitle.length}/60
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Meta Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-black transition-colors min-h-[100px]"
                    value={formData.metaDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metaDescription: e.target.value,
                      })
                    }
                    placeholder="A brief summary of the page content..."
                  />
                  <div className="flex justify-between text-xs text-primary/60">
                    <span>
                      Meta description shown in Google search results.
                    </span>
                    <span
                      className={
                        formData.metaDescription.length > 160
                          ? "text-red-500"
                          : ""
                      }
                    >
                      {formData.metaDescription.length}/160
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Keywords (Comma separated)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-black/10 rounded-lg focus:outline-none focus:border-black transition-colors"
                    value={formData.keywords}
                    onChange={(e) =>
                      setFormData({ ...formData, keywords: e.target.value })
                    }
                    placeholder="e.g. saree, silk, bangladesh fashion"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Image Picker Modal */}
      {imagePickerOpen && activeVariantIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col m-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-lg">Select Variant Images</h3>
              <button
                onClick={() => setImagePickerOpen(false)}
                className="text-primary/60 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {formData.images.length === 0 ? (
                <div className="text-center py-12 text-primary/50">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No product images uploaded yet.</p>
                  <p className="text-xs">
                    Go to "Media" tab to upload images first.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {formData.images.map((img, idx) => {
                    const isSelected =
                      activeVariantIdx !== null &&
                      (
                        formData.variants[activeVariantIdx]?.images || []
                      ).includes(img);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleVariantImage(img)}
                        className={`
                          relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all
                          ${isSelected ? "border-primary ring-2 ring-primary ring-offset-1" : "border-transparent hover:border-gray-300"}
                        `}
                      >
                        <Image
                          src={img}
                          alt="Product option"
                          fill
                          className="object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="bg-primary text-white rounded-full p-1">
                              <Check className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-canvas rounded-b-lg flex justify-end">
              <Button onClick={() => setImagePickerOpen(false)}>Done</Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
