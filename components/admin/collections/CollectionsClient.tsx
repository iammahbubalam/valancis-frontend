"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Collection } from "@/types";
import { Loader2, Plus, Trash2, Edit2, ShoppingBag, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDialog } from "@/context/DialogContext";
import Image from "next/image";
import { CollectionFormDrawer } from "@/components/admin/collections/CollectionFormDrawer";
import Link from "next/link";
import { getApiUrl } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface CollectionsClientProps {
  initialCollections: Collection[];
}

export default function CollectionsClient({
  initialCollections,
}: CollectionsClientProps) {
  const router = useRouter();
  const dialog = useDialog();
  const queryClient = useQueryClient();

  // 1. React Query
  const { data: collections = initialCollections } = useQuery({
    queryKey: ["admin_collections"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/collections"), { cache: 'no-store' });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    initialData: initialCollections
  });

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCollection, setEditingCollection] =
    useState<Partial<Collection> | null>(null);

  const handleCreate = () => {
    setEditingCollection(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection);
    setIsDrawerOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl(`/admin/collections/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: (deletedId, variables) => {
      // Surgical Delete
      queryClient.setQueryData(["admin_collections"], (old: Collection[] | undefined) => {
        return old ? old.filter(c => c.id !== variables) : [];
      });
      dialog.toast({ message: "Collection deleted", variant: "success" });
    },
    onError: () => {
      dialog.toast({ message: "Failed to delete", variant: "danger" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (collection: Collection) => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        getApiUrl(`/admin/collections/${collection.id}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...collection,
            isActive: !collection.isActive,
          }),
        },
      );
      if (!res.ok) throw new Error("Failed to update");
    },
    onSuccess: (data, variables) => {
      // Surgical Toggle
      queryClient.setQueryData(["admin_collections"], (old: Collection[] | undefined) => {
        if (!old) return [];
        return old.map(c => c.id === variables.id ? { ...c, isActive: !c.isActive } : c);
      });
      dialog.toast({ message: "Status updated", variant: "success" });
    },
    onError: () => {
      dialog.toast({ message: "Failed to update status", variant: "danger" });
    },
  });

  const handleDelete = async (id: string) => {
    const confirmed = await dialog.confirm({
      title: "Delete Collection",
      message: "Are you sure? This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-primary">Collections</h1>
          <p className="text-gray-500 mt-1">
            Curate and manage your product compilations.
          </p>
        </div>
        <Button onClick={handleCreate} className="shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> New Collection
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {collections.map((collection: Collection) => (
          <div
            key={collection.id}
            className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
          >
            {/* Image Area */}
            <div className="relative aspect-[16/9] bg-gray-50 overflow-hidden">
              {collection.image ? (
                <Image
                  src={collection.image}
                  alt={collection.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-300 font-serif">
                  No Cover Image
                </div>
              )}

              {/* Overlay Actions */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex justify-end gap-2">
                <Link
                  href={`/collection/${collection.slug}`}
                  target="_blank"
                  className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-primary transition-colors"
                  title="View Public Page"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleEdit(collection)}
                  className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-primary transition-colors"
                  title="Edit Collection"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(collection.id)}
                  className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Status Toggle - Clickable */}
              <div className="absolute top-3 right-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMutation.mutate(collection);
                  }}
                  disabled={toggleMutation.isPending}
                  className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full shadow-sm backdrop-blur transition-all duration-200 hover:scale-105 ${collection.isActive
                    ? "bg-green-500/90 text-white hover:bg-green-600"
                    : "bg-gray-500/90 text-white hover:bg-gray-600"
                    } ${toggleMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {collection.isActive ? "Active" : "Draft"}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex-1">
                <h3 className="text-xl font-serif text-primary mb-2 line-clamp-1">
                  {collection.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed h-10">
                  {collection.description || (
                    <span className="italic text-gray-300">
                      No description provided
                    </span>
                  )}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-secondary">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="font-medium">
                    {collection.products?.length || 0}
                  </span>{" "}
                  Products
                </div>
                <Button
                  variant="secondary"
                  className="text-[10px] h-8 px-4 border-gray-200 text-gray-600 hover:border-primary hover:bg-primary hover:text-white shadow-none"
                  onClick={() => handleEdit(collection)}
                >
                  Manage Details
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State / Add CTA */}
        {initialCollections.length === 0 && (
          <button
            onClick={handleCreate}
            className="group border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-primary hover:text-primary hover:bg-gray-50 transition-all min-h-[300px]"
          >
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8" />
            </div>
            <span className="font-serif text-lg">Create First Collection</span>
          </button>
        )}
      </div>

      {/* Drawer */}
      <CollectionFormDrawer
        isOpen={isDrawerOpen}
        isCreating={!editingCollection}
        collection={editingCollection || {}}
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
