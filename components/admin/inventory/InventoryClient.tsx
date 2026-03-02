"use client";

import { useState, Fragment } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VariantWithProduct, Pagination } from "@/types";
import { Button } from "@/components/ui/Button";

import {
  History,
  Search,
  Package,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  Settings,
} from "lucide-react";
import {
  AdjustStockModal,
  HistoryModal,
  EditThresholdModal,
} from "@/components/admin/inventory/InventoryModals";

interface InventoryClientProps {
  initialData: VariantWithProduct[];
  pagination: Pagination;
}

export default function InventoryClient({
  initialData,
  pagination,
}: InventoryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedVariant, setSelectedVariant] =
    useState<VariantWithProduct | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showThresholdModal, setShowThresholdModal] = useState(false);

  // Local state for expanded rows
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});

  // Parse filters from URL
  const lowStockOnly = searchParams.get("lowStockOnly") === "true";

  // Grouping Logic (L9 Modular Pattern)
  const groupedInventory = initialData.reduce((acc, variance) => {
    const pid = variance.productId;
    if (!acc[pid]) {
      acc[pid] = {
        productId: pid,
        productName: variance.productName,
        totalStock: 0,
        variants: [],
      };
    }
    acc[pid].variants.push(variance);
    acc[pid].totalStock += variance.stock;
    return acc;
  }, {} as Record<string, { productId: string; productName: string; totalStock: number; variants: VariantWithProduct[] }>);

  const productGroups = Object.values(groupedInventory);

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset page on filter change
    if (key !== "page") params.set("offset", "0");
    router.push(`/admin/inventory?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("search", search);
  };

  const handlePageChange = (newPage: number) => {
    const offset = (newPage - 1) * pagination.limit;
    const params = new URLSearchParams(searchParams.toString());
    params.set("offset", offset.toString());
    router.push(`/admin/inventory?${params.toString()}`);
  };

  const openAdjust = (v: VariantWithProduct) => {
    setSelectedVariant(v);
    setShowAdjustModal(true);
  };

  const openHistory = (v: VariantWithProduct) => {
    setSelectedVariant(v);
    setShowHistoryModal(true);
  };

  const openThreshold = (v: VariantWithProduct) => {
    setSelectedVariant(v);
    setShowThresholdModal(true);
  };

  const refreshData = () => {
    router.refresh();
  };

  const toggleProduct = (productId: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">
            Inventory Management
          </h1>
          <div className="flex items-center gap-2 text-primary bg-primary/5 px-2 py-1 rounded w-fit mt-2">
            <Package className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Product-Centric View
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Low Stock Filter */}
          <Button
            variant={lowStockOnly ? "primary" : "outline"}
            size="sm"
            onClick={() =>
              updateFilters("lowStockOnly", lowStockOnly ? null : "true")
            }
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Low Stock Only
          </Button>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1 md:w-64">
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-400 p-1 hover:bg-transparent"
            >
              <Search className="w-4 h-4" />
            </Button>
            <input
              type="text"
              placeholder="Search SKU, Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary outline-none text-sm"
            />
          </form>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold sticky top-0">
              <tr>
                <th className="px-6 py-4 w-12 text-center"></th>
                <th className="px-6 py-4">Product / Variant</th>
                <th className="px-6 py-4 text-center">Total Stock</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productGroups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="w-8 h-8 opacity-20" />
                      <p>No inventory items found matching your filters.</p>
                      {activeFiltersCount(searchParams) > 0 && (
                        <Button
                          variant="link"
                          onClick={() => router.push("/admin/inventory")}
                          className="text-primary hover:underline"
                        >
                          Clear all filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                productGroups.map((group) => {
                  const isExpanded = expandedProducts[group.productId];
                  return (
                    <Fragment key={group.productId}>
                      <tr
                        className="bg-gray-50/50 hover:bg-gray-100/50 transition-colors cursor-pointer border-b border-gray-100"
                        onClick={() => toggleProduct(group.productId)}
                      ><td className="px-6 py-4 text-center">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400 mx-auto" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400 mx-auto" />
                          )}
                        </td><td className="px-6 py-4 font-bold text-gray-900">
                          {group.productName}
                          <span className="ml-2 text-[10px] uppercase bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                            {group.variants.length} Variants
                          </span>
                        </td><td className="px-6 py-4 text-center font-bold text-gray-700">
                          {group.totalStock}
                        </td><td className="px-6 py-4 text-center">
                        </td><td className="px-6 py-4 text-right"></td></tr>
                      {isExpanded &&
                        group.variants.map((row) => (
                          <tr
                            key={row.id}
                            className="hover:bg-gray-50 transition-colors bg-white animate-in slide-in-from-top-1 duration-200"
                          ><td className="px-6 py-4"></td><td className="px-6 py-4 pl-10 border-l-2 border-primary/10">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-700">
                                  {row.name === "Default"
                                    ? "Standard Variant"
                                    : row.name}
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  SKU: {row.sku || "-"}
                                </span>
                              </div>
                            </td><td className="px-6 py-4 text-center">
                              <span
                                className={`text-sm font-bold ${row.stock <= row.lowStockThreshold ? "text-red-600" : "text-gray-700"}`}
                              >
                                {row.stock}
                              </span>
                              <div className="text-[10px] text-gray-400">
                                Min: {row.lowStockThreshold}
                              </div>
                            </td><td className="px-6 py-4 text-center">
                              {row.stock <= 0 ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Out of Stock
                                </span>
                              ) : row.stock <= row.lowStockThreshold ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Low Stock
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  In Stock
                                </span>
                              )}
                            </td><td className="px-6 py-4 text-right flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openHistory(row);
                                }}
                                title="View Logs"
                              >
                                <History className="w-4 h-4 text-gray-500" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openThreshold(row);
                                }}
                                title="Set Low Stock Alert"
                              >
                                <Settings className="w-4 h-4 text-gray-500" />
                              </Button>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openAdjust(row);
                                }}
                              >
                                Adjust
                              </Button>
                            </td></tr>
                        ))}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-gray-50/50">
            <div className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(
                  pagination.page * pagination.limit,
                  Number(pagination.totalItems),
                )}
              </span>{" "}
              of <span className="font-medium">{pagination.totalItems}</span>{" "}
              results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAdjustModal && selectedVariant && (
        <AdjustStockModal
          productName={selectedVariant.productName}
          variant={selectedVariant}
          onClose={() => setShowAdjustModal(false)}
          onSuccess={() => {
            setShowAdjustModal(false);
            refreshData();
          }}
        />
      )}

      {showHistoryModal && selectedVariant && (
        <HistoryModal
          productName={selectedVariant.productName}
          variant={selectedVariant}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

      {showThresholdModal && selectedVariant && (
        <EditThresholdModal
          productName={selectedVariant.productName}
          variant={selectedVariant}
          onClose={() => setShowThresholdModal(false)}
          onSuccess={() => {
            setShowThresholdModal(false);
            refreshData();
          }}
        />
      )}
    </div>
  );
}

function activeFiltersCount(params: URLSearchParams) {
  let count = 0;
  if (params.has("search")) count++;
  if (params.has("lowStockOnly")) count++;
  return count;
}
