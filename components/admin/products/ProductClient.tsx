"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Product, Category } from "@/types";
import { getApiUrl } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ProductTable } from "@/components/admin/products/ProductTable";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDialog } from "@/context/DialogContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductStats as ProductStatsType } from "@/types";
import { ProductStats } from "@/components/admin/products/ProductStats";

interface ProductClientProps {
  initialProducts: Product[];
  initialTotal: number;
  categories: Category[];
}

export function ProductClient({
  initialProducts,
  initialTotal,
  categories,
}: ProductClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dialog = useDialog();
  const queryClient = useQueryClient();

  // 1. React Query for Client-Side Cache Priority
  // We seed it with initialProducts (SSR) so first load is instant.
  // Then we manage it entirely on client.
  const { data: products = initialProducts } = useQuery({
    queryKey: ["admin_products", searchParams.toString()], // Key depends on filters
    queryFn: async () => {
      // Only runs if we explicitly invalidate or refetch (which we try to avoid)
      // or if params change (pagination/search).
      const res = await fetch(getApiUrl(`/admin/products?${searchParams.toString()}`), {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Fetch failed");
      const json = await res.json();
      return json.data as Product[];
    },
    initialData: initialProducts,
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 mins unless mutation happens
  });

  // Local state for selection
  // Local state for selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, setIsPending] = useState(false); // Restored for bulk actions

  // 3. Stats Management via React Query
  // Replaces useEffect (Modern Standard)
  const { data: stats = null, refetch: refetchStats } = useQuery({
    queryKey: ["admin_product_stats"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl("/admin/products/stats"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json() as Promise<ProductStatsType>;
    }
  });

  // 2. Mutation with Surgical Cache Update (Zero Refetch)
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: boolean }) => {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl(`/admin/products/${id}/status`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json(); // Returns { id, isActive, ... }
    },
    onSuccess: (data) => {
      // SURGICAL UPDATE: Modifying cache directly without network call
      queryClient.setQueryData(
        ["admin_products", searchParams.toString()],
        (old: Product[] | undefined) => {
          if (!old) return [];
          return old.map((p) => (p.id === data.id ? { ...p, isActive: data.isActive } : p));
        }
      );

      // Query invalidation handles the update
      queryClient.invalidateQueries({ queryKey: ["admin_product_stats"] });
      dialog.toast({ message: "Status updated", variant: "success" });
    },
    onError: () => {
      dialog.toast({ message: "Failed to update status", variant: "danger" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl(`/admin/products/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove from list cache
      queryClient.setQueryData(
        ["admin_products", searchParams.toString()],
        (old: Product[] | undefined) => old ? old.filter(p => p.id !== deletedId) : []
      );
      // Decrease total count
      queryClient.setQueryData(["admin_product_stats"], (prev: ProductStatsType | undefined) => {
        if (!prev) return null;
        return { ...prev, totalProducts: prev.totalProducts - 1 };
      });
      dialog.toast({ message: "Product deleted", variant: "success" });
    },
    onError: () => dialog.toast({ message: "Delete failed", variant: "danger" })
  });

  // URL Helper
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams],
  );

  // Handlers adapted to URL state
  const handlePageChange = (newPageOffset: number) => {
    const currentPage = Number(searchParams.get("page")) || 1;
    const nextPage = currentPage + newPageOffset;
    if (nextPage < 1) return;

    router.push(
      pathname + "?" + createQueryString("page", nextPage.toString()),
    );
  };

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("search", term);
      params.set("page", "1"); // Reset page
    } else {
      params.delete("search");
    }
    router.push(pathname + "?" + params.toString());
  };

  const handleSort = (field: string) => {
    // Logic from previous: toggle asc/desc
    const currentSort = searchParams.get("sort") || "created_at desc";
    let direction = "asc";
    if (currentSort.startsWith(field) && currentSort.endsWith("asc")) {
      direction = "desc";
    }
    const newSort = `${field}_${direction}`;
    router.push(pathname + "?" + createQueryString("sort", newSort));
  };

  const handleFilterCategory = (catId: string) => {
    // Find the slug from the ID since backend filters by slug usually
    // But wait, the original code looked up slug.
    const findSlug = (cats: Category[], id: string): string => {
      for (const c of cats) {
        if (c.id === id) return c.slug;
        if (c.children) {
          const found = findSlug(c.children, id);
          if (found) return found;
        }
      }
      return "";
    };

    const slug = catId ? findSlug(categories, catId) : "";
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
      params.set("page", "1");
    } else {
      params.delete("category");
    }
    router.push(pathname + "?" + params.toString());
  };

  const handleFilterStatus = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status && status !== "all") {
      params.set("isActive", status); // "true" or "false"
      params.set("page", "1");
    } else {
      params.delete("isActive");
    }
    router.push(pathname + "?" + params.toString());
  };


  const handleBulkDelete = async () => {
    const confirmed = await dialog.confirm({
      title: `Delete ${selectedIds.length} Products`,
      message: "Are you sure? This action cannot be undone.",
      confirmText: "Delete All",
      variant: "danger",
    });
    if (!confirmed) return;

    setIsPending(true);
    try {
      const token = localStorage.getItem("token");
      await Promise.all(
        selectedIds.map((id) =>
          fetch(getApiUrl(`/admin/products/${id}`), {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }),
        ),
      );

      // We invalidating strictly necessary queries
      queryClient.invalidateQueries({ queryKey: ["admin_products"] });
      queryClient.invalidateQueries({ queryKey: ["admin_product_stats"] });

      dialog.toast({ message: "Bulk delete successful", variant: "success" });
      setSelectedIds([]);
      // router.refresh(); // No longer needed as we invalidated queries
    } catch (error) {
      dialog.toast({
        message: "Some items failed to delete",
        variant: "danger",
      });
    } finally {
      setIsPending(false);
    }
  };

  const handleBulkDeactivate = async () => {
    setIsPending(true);
    try {
      const token = localStorage.getItem("token");
      await Promise.all(
        selectedIds.map((id) =>
          fetch(getApiUrl(`/admin/products/${id}/status`), {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ isActive: false }),
          }),
        ),
      );

      // Invalidate to refresh list and stats
      queryClient.invalidateQueries({ queryKey: ["admin_products"] });
      queryClient.invalidateQueries({ queryKey: ["admin_product_stats"] });

      dialog.toast({ message: "Bulk update successful", variant: "success" });
      setSelectedIds([]);
      // router.refresh();
    } catch (error) {
      dialog.toast({ message: "Bulk update failed", variant: "danger" });
    } finally {
      setIsPending(false);
    }
  };

  // Selection handlers
  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(initialProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif font-bold">Products</h1>
        <Link href="/admin/products/new">
          <Button size="sm">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <ProductStats stats={stats} isLoading={!stats} />

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="mb-4 p-2 bg-primary/5 border border-primary/20 rounded-md flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium text-primary ml-2">
            {selectedIds.length} selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline-white"
              size="sm"
              onClick={handleBulkDeactivate}
              disabled={isPending}
            >
              Set Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white border-transparent"
              onClick={handleBulkDelete}
              disabled={isPending}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <ProductTable
        products={products}
        total={initialTotal} // Note: This might get out of sync slightly if we don't refetch, but acceptable for perf
        isLoading={false}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onSort={handleSort}
        onFilterCategory={handleFilterCategory}
        onFilterStatus={handleFilterStatus}
        categories={categories}
        onToggleStatus={(id, current) => toggleStatusMutation.mutate({ id, newStatus: !current })}
        onDelete={(id) => deleteMutation.mutate(id)}
        selectedIds={selectedIds}
        onSelectOne={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
        onSelectAll={(checked) => setSelectedIds(checked ? products.map(p => p.id) : [])}
        currentPage={Number(searchParams.get("page")) || 1}
        limit={Number(searchParams.get("limit")) || 20}
      />
    </div>
  );
}
