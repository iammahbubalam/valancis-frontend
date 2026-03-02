"use client";

import React from "react";
import {
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Archive,
  BarChart3,
} from "lucide-react";
import { ProductStats as ProductStatsType } from "@/types";

interface ProductStatsProps {
  stats: ProductStatsType | null;
  isLoading: boolean;
}

export function ProductStats({ stats, isLoading }: ProductStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-24 bg-gray-100 animate-pulse rounded-xl border border-gray-200"
          />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active",
      value: stats.activeProducts,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Inactive",
      value: stats.inactiveProducts,
      icon: Archive,
      color: "text-gray-600",
      bg: "bg-gray-50",
    },
    {
      label: "Out of Stock",
      value: stats.outOfStock,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Low Stock",
      value: stats.lowStock,
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Inventory Value",
      value: `৳${stats.totalInventoryValue.toLocaleString()}`,
      icon: BarChart3,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${card.bg}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {card.label}
            </p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">
              {card.value}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
}
