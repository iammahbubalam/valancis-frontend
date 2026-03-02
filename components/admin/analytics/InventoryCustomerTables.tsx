"use client";

import dynamic from "next/dynamic";
import {
  LowStockProduct,
  TopSellingProduct,
  TopCustomer,
  CustomerRetention,
} from "@/types";

interface InventoryCustomerTablesInnerProps {
  lowStock: LowStockProduct[];
  topProducts: TopSellingProduct[];
  topCustomers: TopCustomer[];
  retention: CustomerRetention | null;
}

// Lazy load the heavy recharts component
const InventoryCustomerTablesInner = dynamic<InventoryCustomerTablesInnerProps>(
  () =>
    import("./InventoryCustomerTablesInner").then(
      (mod) => mod.InventoryCustomerTablesInner
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
          >
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    ),
  }
);

interface InventoryCustomerTablesProps {
  lowStock: LowStockProduct[];
  topProducts: TopSellingProduct[];
  topCustomers: TopCustomer[];
  retention: CustomerRetention | null;
  loading?: boolean;
}

export function InventoryCustomerTables({
  lowStock,
  topProducts,
  topCustomers,
  retention,
  loading,
}: InventoryCustomerTablesProps) {
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
          >
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <InventoryCustomerTablesInner
      lowStock={lowStock}
      topProducts={topProducts}
      topCustomers={topCustomers}
      retention={retention}
    />
  );
}
