"use client";

import { useState } from "react";
import { KPICards } from "@/components/admin/analytics/KPICards";
import { RevenueChart } from "@/components/admin/analytics/RevenueChart";
import { InventoryCustomerTables } from "@/components/admin/analytics/InventoryCustomerTables";
import { useAdminStats } from "@/hooks/admin/useAdminStats";
import { subDays, format } from "date-fns";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });

  const {
    kpis,
    salesData,
    lowStock,
    topProducts,
    topCustomers,
    retention,
    isLoading,
  } = useAdminStats({
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  const handleDateRangeChange = (preset: string) => {
    const end = format(new Date(), "yyyy-MM-dd");
    let start = "";

    switch (preset) {
      case "7d":
        start = format(subDays(new Date(), 7), "yyyy-MM-dd");
        break;
      case "30d":
        start = format(subDays(new Date(), 30), "yyyy-MM-dd");
        break;
      case "90d":
        start = format(subDays(new Date(), 90), "yyyy-MM-dd");
        break;
      default:
        return;
    }

    setDateRange({ start, end });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your business performance and key metrics
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="flex gap-2 mb-6">
        {["7d", "30d", "90d"].map((preset) => (
          <button
            key={preset}
            onClick={() => handleDateRangeChange(preset)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange.start ===
              format(subDays(new Date(), parseInt(preset)), "yyyy-MM-dd")
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Last {preset}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <KPICards kpis={kpis} loading={isLoading} />

      {/* Revenue Chart */}
      <RevenueChart data={salesData} loading={isLoading} />

      {/* Inventory & Customer Analytics */}
      <InventoryCustomerTables
        lowStock={lowStock}
        topProducts={topProducts}
        topCustomers={topCustomers}
        retention={retention}
        loading={isLoading}
      />
    </div>
  );
}
