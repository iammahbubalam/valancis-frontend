"use client";

import { useState, useEffect } from "react";
import { useAdminCategories } from "@/hooks/admin/useAdminCategories";
import { CategoryList } from "@/components/admin/categories/CategoryList";
import { CategoryFormDrawer } from "@/components/admin/categories/CategoryFormDrawer";
import { Button } from "@/components/ui/Button";
import {
  FolderTree,
  Plus,
  Save,
  CheckCircle,
  LayoutList,
  TrendingUp,
  Eye,
  EyeOff,
} from "lucide-react";
import { Category } from "@/types";
import { getApiUrl } from "@/lib/utils";
import { useDialog } from "@/context/DialogContext";

type ViewTab = "all" | "active" | "inactive" | "nav" | "hidden";

export default function AdminCategoriesPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeView, setActiveView] = useState<ViewTab>("all");
  const dialog = useDialog();

  const {
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
    refetch,
    deleteCategory,
    updateCategory,
  } = useAdminCategories(); // Deconstruct new actions

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter categories based on active view
  const filteredItems = items.filter((item) => {
    switch (activeView) {
      case "active":
        return item.isActive;
      case "inactive":
        return !item.isActive;
      case "nav":
        return item.showInNav;
      case "hidden":
        return !item.showInNav;
      default:
        return true;
    }
  });

  // Stats
  const totalCount = items.length;
  const activeCount = items.filter((i) => i.isActive).length;
  const navCount = items.filter((i) => i.showInNav).length;
  const hiddenCount = items.filter((i) => !i.showInNav).length;

  const openCreate = () => {
    setSelectedCategory(null);
    setIsCreating(true);
    setIsDrawerOpen(true);
  };

  const openEdit = (cat: Category) => {
    setSelectedCategory(cat);
    setIsCreating(false);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setSelectedCategory(null);
      setIsCreating(false);
    }, 300);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await dialog.confirm({
      title: "Delete Category",
      message: "Delete this category? This cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;

    await deleteCategory(id);
  };

  const handleToggleActive = async (id: string, value: boolean) => {
    await updateCategory(id, { isActive: value });
  };

  const handleToggleNav = async (id: string, value: boolean) => {
    await updateCategory(id, { showInNav: value });
  };

  const handleSave = async () => {
    const success = await saveChanges();
    if (!success)
      dialog.toast({ message: "Failed to save changes", variant: "danger" });
    else
      dialog.toast({
        message: "Changes saved successfully",
        variant: "success",
      });
  };

  if (!isMounted) return null;

  const tabs = [
    {
      id: "all" as ViewTab,
      label: "Total Categories",
      count: totalCount,
      color: "from-blue-500 to-blue-600",
      icon: LayoutList,
    },
    {
      id: "active" as ViewTab,
      label: "Active",
      count: activeCount,
      color: "from-green-500 to-green-600",
      icon: TrendingUp,
    },
    {
      id: "inactive" as ViewTab,
      label: "Inactive",
      count: totalCount - activeCount,
      color: "from-red-500 to-red-600",
      icon: EyeOff,
    },
    {
      id: "nav" as ViewTab,
      label: "In Navigation",
      count: navCount,
      color: "from-purple-500 to-purple-600",
      icon: Eye,
    },
    {
      id: "hidden" as ViewTab,
      label: "Hidden from Nav",
      count: hiddenCount,
      color: "from-amber-500 to-amber-600",
      icon: EyeOff,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Product Categories
              </h1>
              <p className="text-xs text-gray-500">
                Click cards below to filter view
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isDirty && (
              <Button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg px-6"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            )}

            {!isDirty && !isLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-400 px-3 py-1.5 bg-gray-50 rounded-full">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                Synced
              </div>
            )}

            <div className="h-8 w-px bg-gray-200"></div>

            <Button onClick={openCreate} className="shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Add Category
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Clickable Tab Cards */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`bg-gradient-to-br ${tab.color} rounded-xl p-5 text-white shadow-lg transition-all duration-200 text-left ${
                  isActive
                    ? "ring-4 ring-offset-2 ring-gray-400 scale-[1.02]"
                    : "opacity-80 hover:opacity-100 hover:scale-[1.01]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-80">
                      {tab.label}
                    </p>
                    <p className="text-3xl font-bold mt-1">{tab.count}</p>
                  </div>
                  <Icon className="w-10 h-10 opacity-40" />
                </div>
                {isActive && (
                  <div className="mt-3 text-xs font-bold uppercase tracking-wider opacity-90">
                    ▼ Viewing
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Category List */}
        <CategoryList
          items={filteredItems}
          expanded={expanded}
          isLoading={isLoading}
          onToggleExpand={(id) =>
            setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
          }
          onEdit={openEdit}
          onDelete={handleDelete}
          onIndent={handleIndent}
          onOutdent={handleOutdent}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onToggleActive={handleToggleActive}
          onToggleNav={handleToggleNav}
          onOpenCreate={openCreate}
        />
      </div>

      {/* Form Drawer */}
      <CategoryFormDrawer
        isOpen={isDrawerOpen}
        isCreating={isCreating}
        selectedCategory={selectedCategory}
        items={items}
        onClose={closeDrawer}
        onSuccess={refetch}
      />
    </div>
  );
}
