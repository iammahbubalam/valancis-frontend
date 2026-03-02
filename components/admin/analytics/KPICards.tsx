"use client";

import { RevenueKPIs } from "@/types";
import { TrendingUp, ShoppingCart, Users, DollarSign } from "lucide-react";

interface KPICardsProps {
  kpis: RevenueKPIs | null;
  loading?: boolean;
}

export function KPICards({ kpis, loading }: KPICardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
          >
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!kpis) return null;

  const cards = [
    {
      title: "Total Revenue",
      value: `৳${Number(kpis.total_revenue).toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Total Orders",
      value: Number(kpis.total_orders).toLocaleString(),
      icon: ShoppingCart,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Avg Order Value",
      value: `৳${Number(kpis.avg_order_value).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })}`,
      icon: TrendingUp,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Unique Customers",
      value: Number(kpis.unique_customers).toLocaleString(),
      icon: Users,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${card.bg}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {card.title}
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
