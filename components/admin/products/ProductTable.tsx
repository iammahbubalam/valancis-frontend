"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowUpDown,
  Search,
  Filter,
} from "lucide-react";
import { Product, Category } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ProductTableProps {
  products: Product[];
  total: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onSearch: (term: string) => void;
  onSort: (field: string) => void;
  onFilterCategory: (categoryId: string) => void;
  onFilterStatus: (status: string) => void;
  categories: Category[];
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
  selectedIds: string[];
  onSelectOne: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
}

export function ProductTable({
  products,
  total,
  isLoading,
  onPageChange,
  onSearch,
  onSort,
  onFilterCategory,
  onFilterStatus,
  categories,
  onToggleStatus,
  onDelete,
  selectedIds,
  onSelectOne,
  onSelectAll,
  currentPage = 1,
  limit = 20,
}: ProductTableProps & { currentPage?: number; limit?: number }) {
  const [selectedDetail, setSelectedDetail] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const isFirstRender = useRef(true);

  // Debounce search - wait 400ms after user stops typing
  // Skip initial render to avoid empty search on mount
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const allSelected =
    products.length > 0 && selectedIds.length === products.length;
  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < products.length;

  // Flatten categories for dropdown - simple flat list
  const flatten = (cats: Category[]): { id: string; name: string }[] => {
    let res: { id: string; name: string }[] = [];
    cats.forEach((c) => {
      res.push({ id: c.id, name: c.name });
      if (c.children) {
        res = res.concat(flatten(c.children));
      }
    });
    return res;
  };
  const flatCats = flatten(categories);

  // Pagination calculations
  const totalPages = Math.ceil(total / limit);
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, SKU..."
            value={searchTerm}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            className="h-9 px-3 py-1 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white min-w-[120px]"
            onChange={(e) => onFilterStatus(e.target.value)}
            defaultValue=""
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <select
            className="h-9 px-3 py-1 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white min-w-[160px]"
            onChange={(e) => onFilterCategory(e.target.value)}
            defaultValue=""
          >
            <option value="">All Categories</option>
            {flatCats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <Button variant="outline-white" className="gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-100 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => onSelectAll(e.target.checked)}
                  />
                </th>
                <th className="px-6 py-4 font-medium text-secondary uppercase tracking-wider text-xs w-20">
                  Image
                </th>
                <th
                  className="px-6 py-4 font-medium text-secondary uppercase tracking-wider text-xs cursor-pointer hover:text-primary group"
                  onClick={() => onSort("name")}
                >
                  <div className="flex items-center gap-1">
                    Name{" "}
                    <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                  </div>
                </th>
                <th className="px-6 py-4 font-medium text-secondary uppercase tracking-wider text-xs">
                  Category
                </th>
                <th
                  className="px-6 py-4 font-medium text-secondary uppercase tracking-wider text-xs cursor-pointer hover:text-primary group"
                  onClick={() => onSort("price")}
                >
                  <div className="flex items-center gap-1">
                    Price{" "}
                    <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 font-medium text-secondary uppercase tracking-wider text-xs cursor-pointer hover:text-primary group"
                  onClick={() => onSort("stock")}
                >
                  <div className="flex items-center gap-1">
                    Stock{" "}
                    <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                  </div>
                </th>
                <th className="px-6 py-4 font-medium text-secondary uppercase tracking-wider text-xs">
                  Status
                </th>
                <th className="px-6 py-4 font-medium text-secondary uppercase tracking-wider text-xs text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No products found fitting criteria.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className={`hover:bg-gray-50/50 transition-colors group ${selectedIds.includes(product.id) ? "bg-blue-50/30" : ""
                      }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => onSelectOne(product.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 relative bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                            No Img
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="hover:underline"
                        >
                          {product.name}
                        </Link>
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">
                        {product.sku}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {product.categories?.[0]?.name || (
                        <span className="text-gray-400 italic">
                          Uncategorized
                        </span>
                      )}
                      {product.categories?.length > 1 && (
                        <span className="text-xs ml-1 text-gray-400">
                          +{product.categories.length - 1}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ৳ {product.basePrice.toLocaleString()}
                      {(product.salePrice || 0) > 0 && (
                        <span className="ml-2 text-xs text-red-500 line-through">
                          ৳ {(product.salePrice || 0).toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-medium ${product.stock <= (product.lowStockThreshold || 5)
                            ? "text-red-600"
                            : "text-gray-900"
                            }`}
                        >
                          {product.stock}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                          {product.stockStatus.replace("_", " ")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          onToggleStatus(product.id, product.isActive)
                        }
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${product.isActive
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                          }`}
                      >
                        {product.isActive ? "Active" : "Draft"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => onDelete(product.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (Simple for now) */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
          <span className="text-xs text-gray-500">
            Showing {products.length > 0 ? startItem : 0} to{" "}
            {products.length > 0 ? endItem : 0} of {total} products
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline-white"
              size="sm"
              onClick={() => onPageChange(-1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline-white"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
