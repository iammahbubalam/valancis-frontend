"use client";

import { useState } from "react";
import { useOrders, useUpdateOrderStatus, useVerifyPayment, Order } from "@/hooks/useAdminOrders";
import { format } from "date-fns";
import {
    Search,
    Filter,
    Eye,
    MoreVertical,
    CheckCircle2,
    AlertCircle,
    Clock,
    Truck,
    Package
} from "lucide-react";
import Link from "next/link";

const TABS = [
    { id: "all", label: "All Orders" },
    { id: "pending", label: "Pending", filter: { status: "pending" } }, // Added Pending
    { id: "pre_order_verification", label: "Verification Needed", filter: { is_preorder: true, payment_status: "pending_verification" } },
    { id: "processing", label: "Processing", filter: { status: "processing" } },
    { id: "shipped", label: "Shipped", filter: { status: "shipped" } },
    { id: "delivered", label: "Delivered", filter: { status: "delivered" } },
    { id: "paid", label: "Paid", filter: { status: "paid" } }, // Added Paid
    { id: "returned", label: "Returned", filter: { status: "returned" } }, // Added Returned
    { id: "fake", label: "Fake", filter: { status: "fake" } }, // Added Fake
    { id: "cancelled", label: "Cancelled", filter: { status: "cancelled" } },
];

export default function OrderDataTable() {
    const [activeTab, setActiveTab] = useState("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    // Derive filter from active tab
    const currentTab = TABS.find(t => t.id === activeTab);
    const filter = {
        page,
        limit: 20,
        search: search || undefined,
        ...(currentTab?.filter || {})
    };

    const { data, isLoading, error, refetch } = useOrders(filter);
    const verifyMutation = useVerifyPayment();
    const updateStatusMutation = useUpdateOrderStatus();

    const handleVerify = async (id: string) => {
        if (confirm("Are you sure you want to verify this payment?")) {
            try {
                await verifyMutation.mutateAsync(id);
                // Optional: Show toast
            } catch (e) {
                alert("Failed to verify");
            }
        }
    }

    return (
        <div className="space-y-6">
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-serif text-primary">Orders</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/50" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className="pl-9 pr-4 py-2 border border-accent-subtle rounded-lg focus:outline-none focus:border-primary/30 w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabs list */}
            <div className="border-b border-accent-subtle flex gap-6 overflow-x-auto pb-px">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setPage(1); }}
                        className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap relative ${activeTab === tab.id
                            ? "text-primary border-b-2 border-primary"
                            : "text-primary/70 hover:text-primary/70 border-b-2 border-transparent"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white border border-accent-subtle rounded-lg shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-primary/70">Loading orders...</div>
                ) : error ? (
                    <div className="p-12 text-center text-red-500">Failed to load orders</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-canvas text-primary/70 border-b border-accent-subtle">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Order ID</th>
                                    <th className="px-6 py-4 font-medium">Customer</th>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Items</th>
                                    <th className="px-6 py-4 font-medium">Total</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Payment</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                {data?.orders.map((order: Order) => (
                                    <tr key={order.id} className="hover:bg-canvas/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-primary">
                                            #{order.id.slice(0, 8)}
                                            {order.isPreorder && (
                                                <span className="ml-2 px-1.5 py-0.5 text-[10px] uppercase bg-orange-100 text-orange-700 rounded tracking-wide">
                                                    Pre-Order
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-primary font-medium">
                                                    {order.user?.firstName || "Guest"} {order.user?.lastName}
                                                </span>
                                                <span className="text-xs text-primary/70">{order.user?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-primary/70">
                                            {format(new Date(order.createdAt), "MMM d, yyyy")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-primary font-medium">{order.items?.length || 0} items</span>
                                                {order.items && order.items.length > 0 && (
                                                    <span className="text-xs text-primary/50 truncate max-w-[150px]">
                                                        {order.items[0].product?.name || order.items[0].productName}
                                                        {order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            ৳{order.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <PaymentStatusBadge
                                                status={order.paymentStatus}
                                                method={order.paymentMethod}
                                                isPreorder={order.isPreorder}
                                                details={order.paymentDetails}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                {/* Quick Action: Verify Payment */}
                                                {order.status === 'pending_verification' && (
                                                    <button
                                                        onClick={() => handleVerify(order.id)}
                                                        title="Verify Payment"
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                )}

                                                <Link href={`/admin/orders/${order.id}`}>
                                                    <button className="p-1.5 text-primary/70 hover:bg-canvas rounded">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {data?.orders.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-primary/70">
                                            No orders found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {data && (
                    <div className="px-6 py-4 border-t border-accent-subtle flex justify-between items-center">
                        <span className="text-xs text-primary/70">
                            Showing {(data.page - 1) * data.limit + 1} to {Math.min(data.page * data.limit, data.total)} of {data.total}
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1 border rounded text-xs disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                disabled={data.orders.length < data.limit}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1 border rounded text-xs disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
        pending_verification: "bg-orange-50 text-orange-700 border-orange-100",
        processing: "bg-blue-50 text-blue-700 border-blue-100",
        shipped: "bg-purple-50 text-purple-700 border-purple-100",
        delivered: "bg-green-50 text-green-700 border-green-100",
        paid: "bg-emerald-50 text-emerald-700 border-emerald-100", // Added Paid
        returned: "bg-indigo-50 text-indigo-700 border-indigo-100", // Added Returned
        fake: "bg-canvas text-gray-700 border-gray-200", // Added Fake
        cancelled: "bg-red-50 text-red-700 border-red-100",
        refunded: "bg-canvas text-gray-700 border-gray-200",
    };

    const label = status.replace("_", " ");
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border capitalize ${styles[status] || "bg-canvas text-gray-600"}`}>
            {label}
        </span>
    );
}

function PaymentStatusBadge({ status, method, isPreorder, details }: { status: string, method: string, isPreorder: boolean, details?: any }) {
    if (status === 'partial_paid') {
        return (
            <div className="flex flex-col items-start gap-1">
                <div className="flex flex-col items-start gap-0.5">
                    <span className="text-xs font-bold text-primary">Partial Paid</span>
                    <span className="text-[10px] text-primary/70 uppercase tracking-wider">{method}</span>
                </div>
                {details?.transaction_id && (
                    <div className="text-[10px] items-center text-primary/60 border border-primary/10 rounded px-1.5 py-0.5 mt-0.5">
                        <span className="font-semibold uppercase mr-1">{details.provider || 'TRX'}:</span>
                        <span className="font-mono">{details.transaction_id}</span>
                    </div>
                )}
            </div>
        )
    }
    return (
        <div className="flex flex-col items-start gap-1">
            <div className="flex flex-col items-start gap-0.5">
                <span className={`text-xs font-medium capitalize ${status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                    {status.replace("_", " ")}
                </span>
                <span className="text-[10px] text-primary/70 uppercase tracking-wider">{method}</span>
            </div>
            {details?.transaction_id && status === 'pending_verification' && (
                <div className="text-[10px] items-center text-orange-600/80 bg-orange-50 border border-orange-100 rounded px-1.5 py-0.5 mt-0.5 shadow-sm">
                    <span className="font-semibold uppercase mr-1">{details.provider || 'TRX'}:</span>
                    <span className="font-mono">{details.transaction_id}</span>
                </div>
            )}
            {details?.transaction_id && status === 'paid' && (
                <div className="text-[10px] items-center text-green-600/80 bg-green-50 border border-green-100 rounded px-1.5 py-0.5 mt-0.5 shadow-sm">
                    <span className="font-semibold uppercase mr-1">{details.provider || 'TRX'}:</span>
                    <span className="font-mono">{details.transaction_id}</span>
                </div>
            )}
        </div>
    )
}
