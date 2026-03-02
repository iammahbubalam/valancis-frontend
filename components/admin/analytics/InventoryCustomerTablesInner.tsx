"use client";

import {
    LowStockProduct,
    TopSellingProduct,
    TopCustomer,
    CustomerRetention,
} from "@/types";
import Link from "next/link";
import { AlertTriangle, TrendingUp, Users, UserCheck } from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from "recharts";

interface InventoryCustomerTablesInnerProps {
    lowStock: LowStockProduct[];
    topProducts: TopSellingProduct[];
    topCustomers: TopCustomer[];
    retention: CustomerRetention | null;
}

export function InventoryCustomerTablesInner({
    lowStock,
    topProducts,
    topCustomers,
    retention,
}: InventoryCustomerTablesInnerProps) {
    const retentionData = retention
        ? [
            {
                name: "New Customers",
                value: Number(retention.new_customers),
                color: "#3b82f6",
            },
            {
                name: "Returning",
                value: Number(retention.returning_customers),
                color: "#10b981",
            },
        ]
        : [];

    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Low Stock Products */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-orange-50 dark:bg-orange-900/20 px-6 py-4 border-b border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Low Stock Alert
                        </h3>
                    </div>
                </div>
                <div className="p-4 max-h-80 overflow-y-auto">
                    {lowStock.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            All products well-stocked!
                        </p>
                    ) : (
                        <table className="w-full">
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {lowStock.slice(0, 10).map((product) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-900"
                                    >
                                        <td className="py-3 pr-2">
                                            <Link
                                                href={`/admin/products`}
                                                className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600"
                                            >
                                                {product.name}
                                            </Link>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {product.sku}
                                            </p>
                                        </td>
                                        <td className="py-3 text-right">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                {product.stock} left
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Top Selling Products */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-green-50 dark:bg-green-900/20 px-6 py-4 border-b border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Top Selling Products
                        </h3>
                    </div>
                </div>
                <div className="p-4 max-h-80 overflow-y-auto">
                    {topProducts.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No sales data available
                        </p>
                    ) : (
                        <table className="w-full">
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {topProducts.slice(0, 10).map((product, index) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-900"
                                    >
                                        <td className="py-3 pr-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-400 dark:text-gray-600">
                                                    #{index + 1}
                                                </span>
                                                <div>
                                                    <Link
                                                        href={`/product/${product.slug}`}
                                                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600"
                                                    >
                                                        {product.name}
                                                    </Link>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {Number(product.total_sold)} sold
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                                            ৳{Number(product.total_revenue).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Top Customers */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-purple-50 dark:bg-purple-900/20 px-6 py-4 border-b border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Top Customers
                        </h3>
                    </div>
                </div>
                <div className="p-4 max-h-80 overflow-y-auto">
                    {topCustomers.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No customer data available
                        </p>
                    ) : (
                        <table className="w-full">
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {topCustomers.slice(0, 10).map((customer, index) => (
                                    <tr
                                        key={customer.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-900"
                                    >
                                        <td className="py-3 pr-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-400 dark:text-gray-600">
                                                    #{index + 1}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {customer.first_name} {customer.last_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {Number(customer.total_orders)} orders
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                                            ৳{Number(customer.lifetime_value).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Customer Retention */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-4 border-b border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Customer Retention
                        </h3>
                    </div>
                </div>
                <div className="p-6">
                    {!retention ||
                        (retention.new_customers === 0 &&
                            retention.returning_customers === 0) ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No retention data available
                        </p>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={retentionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {retentionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "rgb(31 41 55)",
                                        border: "1px solid rgb(55 65 81)",
                                        borderRadius: "0.5rem",
                                        color: "white",
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                    {retention &&
                        (retention.new_customers > 0 ||
                            retention.returning_customers > 0) && (
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {Number(retention.new_customers)}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        New
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {Number(retention.returning_customers)}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Returning
                                    </p>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
}
