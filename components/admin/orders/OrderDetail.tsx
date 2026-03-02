"use client";

import { useState } from "react";
import { RefundModal } from "./RefundModal";
import { OrderTimeline } from "./OrderTimeline";
import { useSystemConfig } from "@/hooks/useSystemConfig";
import { StatusChangeModal } from "./StatusChangeModal";
import { useOrderDetail, useUpdateOrderStatus, useVerifyPayment, useOrderHistory, useUpdatePaymentStatus } from "@/hooks/useAdminOrderDetail";
import { format } from "date-fns";
import {
    User,
    MapPin,
    CreditCard,
    AlertTriangle,
    ArrowLeft,
    Printer,
    Copy,
    CheckCircle,
    Info,
    Clock
} from "lucide-react"; // Added Icons
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useDialog } from "@/context/DialogContext"; // For Toasts

interface OrderDetailProps {
    id: string;
}

export default function OrderDetail({ id }: OrderDetailProps) {
    const router = useRouter();
    const { toast } = useDialog();

    // Parallel Fetching: Start both requests immediately
    const { data: order, isLoading: isOrderLoading, error } = useOrderDetail(id);
    const { data: history, isLoading: isHistoryLoading } = useOrderHistory(id);

    const updateStatus = useUpdateOrderStatus();
    const updatePayment = useUpdatePaymentStatus();
    const verifyPayment = useVerifyPayment();
    const { data: config } = useSystemConfig(); // Unified Config Hook
    const [isRefundOpen, setIsRefundOpen] = useState(false);

    // Status Change Modal State
    const [statusModal, setStatusModal] = useState({
        isOpen: false,
        newStatus: ""
    });

    if (isOrderLoading) return <div className="p-12 text-center animate-pulse">Loading order details...</div>;
    if (error || !order) return <div className="p-12 text-center text-red-500">Order not found</div>;

    const handleVerify = async () => {
        if (confirm("Confirm payment verification? This will move order to Processing.")) {
            await verifyPayment.mutateAsync(id);
        }
    };

    const initiateStatusChange = (status: string) => {
        setStatusModal({ isOpen: true, newStatus: status });
    };

    const confirmStatusChange = async (note: string) => {
        await updateStatus.mutateAsync({
            id,
            status: statusModal.newStatus,
            note
        });
    };

    const handlePaymentUpdate = async (status: string) => {
        if (confirm(`Mark payment as ${status}?`)) {
            await updatePayment.mutateAsync({ id, status });
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ message: `${label} copied!`, variant: "success" });
    };

    // Filter Transitions Logic (Frontend Replica for UX)
    const getNextStatuses = (current: string) => {
        const fullList = config?.orderStatuses || [];
        // L9: Weight-based Forward Only Logic
        const weights: Record<string, number> = {
            "pending": 10,
            "pending_verification": 10,
            "processing": 20,
            "shipped": 30,
            "delivered": 40,
            "paid": 50,
            "returned": 60,
            "refunded": 70,
            "cancelled": 80,
            "fake": 90
        };

        const currentWeight = weights[current] || 0;

        // Return only statuses with weight >= current
        return fullList.filter((s: string) => {
            const w = weights[s] || 0;
            return w >= currentWeight;
        });
    };

    const availableStatuses = getNextStatuses(order.status);

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-start gap-4">
                    <Link href="/admin/orders" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-secondary" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-serif text-primary flex items-center gap-3">
                            Order #{order.id.slice(0, 8)}
                            <button onClick={() => copyToClipboard(order.id, "Order ID")} className="text-gray-400 hover:text-primary transition-colors">
                                <Copy className="w-4 h-4" />
                            </button>
                        </h1>
                        <div className="flex items-center gap-3 mt-2">
                            <div className={`px-3 py-1 text-xs font-sans font-medium rounded-full uppercase tracking-wide border
                                ${order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                                    order.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                            order.status === 'returned' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                {order.status.replace("_", " ")}
                            </div>
                            <span className="text-sm text-secondary flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(order.createdAt), "PPP p")}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    {/* Primary Workflow Buttons */}
                    {order.status === 'pending' && (
                        <button onClick={() => initiateStatusChange("processing")} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm active:scale-95">
                            Process Order
                        </button>
                    )}
                    {order.status === 'pending_verification' && (
                        <button onClick={handleVerify} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-all shadow-sm active:scale-95 shadow-amber-200">
                            Verify Payment
                        </button>
                    )}
                    {order.status === 'processing' && (
                        <button onClick={() => initiateStatusChange("shipped")} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm active:scale-95">
                            Ship Order
                        </button>
                    )}
                    {order.status === 'shipped' && (
                        <button onClick={() => initiateStatusChange("delivered")} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all shadow-sm active:scale-95">
                            Mark Delivered
                        </button>
                    )}
                    {order.status === 'delivered' && (
                        <button onClick={() => initiateStatusChange("paid")} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all shadow-sm active:scale-95 shadow-emerald-200">
                            Mark Paid (COD)
                        </button>
                    )}

                    {/* Status Dropdown (Filtered) */}
                    <div className="relative">
                        <select
                            value={order.status}
                            onChange={(e) => initiateStatusChange(e.target.value)}
                            className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none"
                        >
                            {availableStatuses.map((status: string) => (
                                <option key={status} value={status} className="capitalize">{status.replace("_", " ")}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Info className="w-3 h-3 text-gray-400" />
                        </div>
                    </div>

                    {(order.paymentStatus === 'paid' || order.paymentStatus === 'partial_paid' || order.paymentStatus === 'partial_refund') && (order.paidAmount - (order.refundedAmount || 0)) > 0.01 && (
                        <button
                            onClick={() => setIsRefundOpen(true)}
                            className="px-4 py-2 border border-orange-200 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-50"
                        >
                            Refund
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Order Items */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
                            <h3 className="font-serif font-medium text-primary">Items ({order.items.length})</h3>
                            <span className="text-secondary text-sm">Total Weight: N/A</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg relative overflow-hidden flex-shrink-0 border border-gray-200">
                                        {item.product?.media?.[0] && (
                                            <Image
                                                src={item.product.media[0]}
                                                alt={item.product?.name}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-primary truncate">{item.product?.name}</h4>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {item.variantId && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Var: {item.variantId}</span>}
                                            <span className="text-xs text-secondary">Qty: {item.quantity}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium text-primary">৳{(item.price * item.quantity).toLocaleString()}</div>
                                        <div className="text-xs text-secondary">৳{item.price.toLocaleString()} ea</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-gray-50/50 space-y-3">
                            <div className="flex justify-between text-sm text-secondary">
                                <span>Subtotal</span>
                                <span>৳{(order.totalAmount - (order.shippingFee || 0)).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-secondary">
                                <span>Shipping</span>
                                <span>৳{(order.shippingFee || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-primary pt-3 border-t border-gray-200">
                                <span>Grand Total</span>
                                <span>৳{order.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className={order.paidAmount >= order.totalAmount ? "text-green-600" : "text-orange-600"}>
                                    Paid: ৳{order.paidAmount.toLocaleString()}
                                </span>
                                <span className="text-red-500 font-medium">Due: ৳{Math.max(0, order.totalAmount - order.paidAmount).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline (Robust & Parallel) */}
                    <OrderTimeline history={history} isLoading={isHistoryLoading} />
                </div>

                {/* Sidebar */}
                <div className="print-hide space-y-6">
                    {/* Payment Info */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-serif font-medium flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-primary" />
                                Payment
                            </h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase
                                ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {order.paymentStatus}
                            </span>
                        </div>

                        {/* Payment Details */}
                        {order.paymentDetails && Object.keys(order.paymentDetails).length > 0 && (
                            <div className="space-y-2 pt-4 border-t border-gray-100">
                                {Object.entries(order.paymentDetails).map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center text-xs">
                                        <span className="text-secondary capitalize">{key.replace("_", " ")}:</span>
                                        <span className="font-mono text-gray-700 truncate max-w-[150px]" title={String(value)}>{String(value)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {order.paymentStatus !== 'paid' && order.status !== 'paid' && (
                        <button
                            onClick={() => handlePaymentUpdate("paid")}
                            className="w-full py-2 border border-green-200 text-green-700 rounded-lg text-xs font-medium hover:bg-green-50 uppercase tracking-wide transition-colors"
                        >
                            Mark Payment Received (Manual)
                        </button>
                    )}

                    {/* Customer Info */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="font-serif font-medium mb-4 flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" />
                            Customer
                        </h3>

                        {/* Customer Profile */}
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                            {(order.user?.avatar || order.shippingAddress?.avatar) ? (
                                <img
                                    src={order.user?.avatar || order.shippingAddress?.avatar}
                                    alt="Customer avatar"
                                    className="w-12 h-12 rounded-full object-cover shadow-md border-2 border-white"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold shadow-md text-lg">
                                    {(order.user?.firstName?.[0] || order.shippingAddress?.firstName?.[0] || "G").toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1">
                                <p className="font-medium text-base text-primary">
                                    {order.user?.firstName || order.shippingAddress?.firstName || 'Guest'} {order.user?.lastName || order.shippingAddress?.lastName || ''}
                                </p>
                                {(order.user?.email || order.shippingAddress?.email) && (
                                    <p className="text-sm text-secondary mt-0.5">
                                        {order.user?.email || order.shippingAddress?.email}
                                    </p>
                                )}
                                {order.shippingAddress?.phone && (
                                    <p className="text-sm text-secondary mt-0.5 font-mono">
                                        {order.shippingAddress.phone}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="space-y-3">
                            <div className="flex gap-3 items-start">
                                <MapPin className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                                <div className="text-sm text-gray-600 flex-1">
                                    <p className="font-medium text-primary mb-2">Delivery Address</p>

                                    {/* Street Address */}
                                    {order.shippingAddress?.address && (
                                        <p className="mb-1">{order.shippingAddress.address}</p>
                                    )}

                                    {/* Thana, District, Zip */}
                                    {(order.shippingAddress?.thana || order.shippingAddress?.district || order.shippingAddress?.zip) && (
                                        <p className="mb-1">
                                            {[
                                                order.shippingAddress?.thana,
                                                order.shippingAddress?.district
                                            ].filter(Boolean).join(', ')}
                                            {order.shippingAddress?.zip && ` - ${order.shippingAddress.zip}`}
                                        </p>
                                    )}

                                    {/* Division */}
                                    {order.shippingAddress?.division && (
                                        <p className="text-secondary text-xs">{order.shippingAddress.division}</p>
                                    )}

                                    {/* Delivery Location Badge */}
                                    {order.shippingAddress?.deliveryLocation && (
                                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-primary/5 border border-primary/10 rounded text-xs text-primary font-medium">
                                            <div className="w-2 h-2 rounded-full bg-primary/40 mr-1.5"></div>
                                            {order.shippingAddress.deliveryLocation.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <StatusChangeModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
                currentStatus={order?.status || ""}
                newStatus={statusModal.newStatus}
                onConfirm={confirmStatusChange}
            />

            {order && (
                <RefundModal
                    orderId={id}
                    maxRefundable={order.paidAmount - (order.refundedAmount || 0)}
                    isOpen={isRefundOpen}
                    onClose={() => setIsRefundOpen(false)}
                />
            )}
        </div>
    );
}
