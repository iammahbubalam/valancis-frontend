"use client";

import { DailySalesStat } from "@/types";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { format, parseISO } from "date-fns";

interface RevenueChartInnerProps {
    data: DailySalesStat[];
}

export function RevenueChartInner({ data }: RevenueChartInnerProps) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
                <p className="text-center text-gray-500 dark:text-gray-400 py-20">
                    No revenue data available for selected period
                </p>
            </div>
        );
    }

    // Format data for recharts
    const chartData = data.map((item) => ({
        date: format(parseISO(item.date), "MMM dd"),
        revenue: Number(item.total_revenue),
        orders: item.order_count,
        aov: Number(item.avg_order_value),
    }));

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Revenue Trend
            </h3>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-gray-200 dark:stroke-gray-700"
                    />
                    <XAxis
                        dataKey="date"
                        className="text-xs text-gray-600 dark:text-gray-400"
                        tick={{ fill: "currentColor" }}
                    />
                    <YAxis
                        className="text-xs text-gray-600 dark:text-gray-400"
                        tick={{ fill: "currentColor" }}
                        tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgb(31 41 55)",
                            border: "1px solid rgb(55 65 81)",
                            borderRadius: "0.5rem",
                            color: "white",
                        }}
                        formatter={(value: any, name?: any): any => {
                            const numValue = Number(value);
                            if (name === "revenue")
                                return [`৳${numValue.toLocaleString()}`, "Revenue"];
                            if (name === "orders") return [numValue, "Orders"];
                            if (name === "aov")
                                return [`৳${numValue.toLocaleString()}`, "AOV"];
                            return [numValue, name];
                        }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6", r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Revenue"
                    />
                    <Line
                        type="monotone"
                        dataKey="orders"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: "#10b981", r: 4 }}
                        name="Orders"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
