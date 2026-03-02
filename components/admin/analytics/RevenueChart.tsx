"use client";

import dynamic from "next/dynamic";
import { ComponentType } from "react";
import { DailySalesStat } from "@/types";

interface RevenueChartInnerProps {
  data: DailySalesStat[];
}

// Lazy load the heavy recharts component
const RevenueChartInner = dynamic<RevenueChartInnerProps>(
  () => import("./RevenueChartInner").then((mod) => mod.RevenueChartInner),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
        <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    ),
  }
);

interface RevenueChartProps {
  data: DailySalesStat[];
  loading?: boolean;
}

export function RevenueChart({ data, loading }: RevenueChartProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
        <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  return <RevenueChartInner data={data} />;
}
