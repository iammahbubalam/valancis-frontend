import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Category } from "@/types";
import { FlatCategory } from "@/components/admin/categories/CategoryRow";
import {
  flattenCategories,
  resolveHierarchy,
} from "@/lib/admin/category-operations";
import { getApiUrl } from "@/lib/utils";
import { useDialog } from "@/context/DialogContext";

export function useAdminCategories() {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<FlatCategory[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // 1. Fetch Categories
  const {
    data: categories = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin_categories"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl("/admin/categories/tree"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch categories");
      return (await res.json()) as Category[];
    },
    staleTime: 60 * 1000, // 1 minute cache
  });

  // 2. Sync Server State to Local State (if not dirty)
  useEffect(() => {
    if (categories.length > 0 && !isDirty) {
      setItems(flattenCategories(categories));
    }
  }, [categories, isDirty]);

  const updateLocalState = (newItems: FlatCategory[]) => {
    setItems(newItems);
    setIsDirty(true);
  };

  const handleMoveUp = (id: string) => {
    const index = items.findIndex((i) => i.id === id);
    if (index <= 0) return;

    const current = items[index];
    const target = items[index - 1];

    if (current.depth !== target.depth) return;

    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [
      newItems[index],
      newItems[index - 1],
    ];
    updateLocalState(newItems);
  };

  const handleMoveDown = (id: string) => {
    const index = items.findIndex((i) => i.id === id);
    if (index < 0 || index >= items.length - 1) return;

    const current = items[index];
    const target = items[index + 1];

    if (current && target.depth !== target.depth) return;

    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [
      newItems[index + 1],
      newItems[index],
    ];
    updateLocalState(newItems);
  };

  const handleIndent = (id: string) => {
    const index = items.findIndex((i) => i.id === id);
    if (index <= 0) return;

    const prevItem = items[index - 1];
    const newItems = [...items];
    newItems[index] = { ...newItems[index], depth: prevItem.depth + 1 };
    updateLocalState(newItems);
  };

  const handleOutdent = (id: string) => {
    const index = items.findIndex((i) => i.id === id);
    if (index < 0) return;

    const item = items[index];
    if (item.depth === 0) return;

    const newItems = [...items];
    newItems[index] = { ...newItems[index], depth: item.depth - 1 };
    updateLocalState(newItems);
  };

  // 3. Mutations
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl("/admin/categories/reorder"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ updates: payload }),
      });
      if (!res.ok) throw new Error("Failed to save hierarchy");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_categories"] });
      setIsDirty(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl(`/admin/categories/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete category");
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin_categories"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Category>;
    }) => {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl(`/admin/categories/${id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update category");
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin_categories"] }),
  });

  // Action Wrappers
  const saveChanges = async () => {
    const payload = resolveHierarchy(items);
    try {
      await saveMutation.mutateAsync(payload);
      return true;
    } catch (error) {
      console.error("Save error:", error);
      return false;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    try {
      await toggleMutation.mutateAsync({ id, data });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return {
    categories,
    items,
    isLoading,
    isDirty,
    expanded,
    setExpanded,
    handleMoveUp,
    handleMoveDown,
    handleIndent,
    handleOutdent,
    saveChanges,
    refetch: () => refetch(),
    deleteCategory,
    updateCategory,
  };
}
