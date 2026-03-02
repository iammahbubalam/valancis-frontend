"use client";

import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/utils";
import {
  DailySalesStat,
  RevenueKPIs,
  LowStockProduct,
  TopSellingProduct,
  TopCustomer,
  CustomerRetention,
} from "@/types";

interface UseAdminStatsParams {
  startDate: string;
  endDate: string;
}

export function useAdminStats({ startDate, endDate }: UseAdminStatsParams) {
  // Revenue KPIs
  const kpisQuery = useQuery({
    queryKey: ["admin-stats-kpis", startDate, endDate],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        getApiUrl(`/admin/stats/kpis?start=${startDate}&end=${endDate}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch KPIs");
      return res.json() as Promise<RevenueKPIs>;
    },
    enabled: !!startDate && !!endDate,
    staleTime: 30 * 60 * 1000,
  });

  // Daily Sales
  const salesQuery = useQuery({
    queryKey: ["admin-stats-sales", startDate, endDate],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        getApiUrl(`/admin/stats/revenue?start=${startDate}&end=${endDate}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch sales");
      return res.json() as Promise<DailySalesStat[]>;
    },
    enabled: !!startDate && !!endDate,
    staleTime: 30 * 60 * 1000,
  });

  // Low Stock Products
  const lowStockQuery = useQuery({
    queryKey: ["admin-stats-low-stock"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        getApiUrl(`/admin/stats/inventory/low-stock?threshold=5&limit=10`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch low stock");
      return res.json() as Promise<LowStockProduct[]>;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Top Selling Products
  const topProductsQuery = useQuery({
    queryKey: ["admin-stats-top-products", startDate, endDate],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        getApiUrl(
          `/admin/stats/products/top-selling?start=${startDate}&end=${endDate}&limit=10`
        ),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        // If 400 bad request, it usually means date range issue or empty results.
        // We can return empty array or throw.
        // Let's check status.
        if (res.status === 400) {
          console.error("Top products failed: Bad Request");
          return [];
        }
        throw new Error("Failed to fetch top products");
      }
      return res.json() as Promise<TopSellingProduct[]>;
    },
    enabled: !!startDate && !!endDate,
    staleTime: 30 * 60 * 1000,
  });

  // Top Customers
  const topCustomersQuery = useQuery({
    queryKey: ["admin-stats-top-customers", startDate, endDate],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        getApiUrl(
          `/admin/stats/customers/top?start=${startDate}&end=${endDate}&limit=10`
        ),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch top customers");
      return res.json() as Promise<TopCustomer[]>;
    },
    enabled: !!startDate && !!endDate,
    staleTime: 30 * 60 * 1000,
  });

  // Customer Retention
  const retentionQuery = useQuery({
    queryKey: ["admin-stats-retention", startDate, endDate],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        getApiUrl(
          `/admin/stats/customers/retention?start=${startDate}&end=${endDate}`
        ),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch retention");
      return res.json() as Promise<CustomerRetention>;
    },
    enabled: !!startDate && !!endDate,
    staleTime: 30 * 60 * 1000,
  });

  return {
    kpis: kpisQuery.data ?? null,
    salesData: salesQuery.data ?? [],
    lowStock: lowStockQuery.data ?? [],
    topProducts: topProductsQuery.data ?? [],
    topCustomers: topCustomersQuery.data ?? [],
    retention: retentionQuery.data ?? null,
    isLoading:
      kpisQuery.isLoading ||
      salesQuery.isLoading ||
      lowStockQuery.isLoading ||
      topProductsQuery.isLoading ||
      topCustomersQuery.isLoading ||
      retentionQuery.isLoading,
  };
}
