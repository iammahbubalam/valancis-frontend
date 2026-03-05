"use client";

import { useState } from "react";
import { RefundModal } from "./RefundModal";
import { OrderTimeline } from "./OrderTimeline";
import { InvoicePrintTemplate } from "./InvoicePrintTemplate";
import { useSystemConfig } from "@/hooks/useSystemConfig";
import { StatusChangeModal } from "./StatusChangeModal";
import { useOrderDetail, useUpdateOrderStatus, useVerifyPayment, useOrderHistory, useUpdateShippingZone } from "@/hooks/useAdminOrderDetail";
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
    Clock,
    Edit2,
    Check,
    X
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
    const verifyPayment = useVerifyPayment();
    const updateShippingZone = useUpdateShippingZone();
    const { data: config } = useSystemConfig(); // Unified Config Hook
    const [isRefundOpen, setIsRefundOpen] = useState(false);

    // Shipping Zone Edit State
    const [isEditingZone, setIsEditingZone] = useState(false);
    const [selectedZone, setSelectedZone] = useState("");

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

    const initiateEditZone = () => {
        setSelectedZone(order.shippingAddress?.deliveryLocation || "");
        setIsEditingZone(true);
    };

    const handleUpdateZone = async () => {
        if (selectedZone && selectedZone !== order.shippingAddress?.deliveryLocation) {
            await updateShippingZone.mutateAsync({ id, zone: selectedZone });
        }
        setIsEditingZone(false);
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


    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ message: `${label} copied!`, variant: "success" });
    };

    // Filter Transitions Logic (Frontend Replica for UX)
    const getNextStatuses = (current: string) => {
        // L9: Strict Finite State Machine Replica (Matches backend constants.go)
        const validTransitions: Record<string, string[]> = {
            "pending": ["pending_verification", "processing", "cancelled", "fake"],
            "pending_verification": ["processing", "shipped", "cancelled", "fake"],
            "processing": ["shipped", "cancelled", "fake"],
            "shipped": ["delivered", "returned", "cancelled", "fake"],
            "delivered": ["paid", "returned", "refunded", "fake"],
            "paid": ["refunded", "returned", "fake"],

            // Recovery / Terminal States
            "cancelled": ["processing", "pending"], // Recovery block (Re-deducts stock on backend)
            "fake": ["processing", "pending"],      // Recovery block
            "returned": ["processing", "refunded"], // Re-ship or refund
            "refunded": [],                         // Fully Terminal
        };

        const allowedNext = validTransitions[current] || [];

        // We always include the current status in the dropdown so it doesn't default-select the next one
        const fullList = config?.orderStatuses || [];
        return fullList.filter((s: string) => s === current || allowedNext.includes(s));
    };

    const availableStatuses = getNextStatuses(order.status);

    return (
        <div className="min-h-screen">
            {/* Standard Dashboard View - Hidden when window.print() is called */}
            <div className="print:hidden max-w-7xl mx-auto space-y-6 pb-12">
                {/* Top Header Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/orders" className="p-2 hover:bg-canvas rounded-full transition-colors flex-shrink-0">
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-serif text-gray-900 font-medium">Order #{order.id.slice(0, 8)}</h1>
                                {order.isPreorder ? (
                                    <span className="px-2.5 py-0.5 text-xs font-bold uppercase bg-orange-100 text-orange-800 rounded-md tracking-wide">
                                        Pre-Order
                                    </span>
                                ) : order.paymentMethod === 'cod' ? (
                                    <span className="px-2.5 py-0.5 text-xs font-bold uppercase bg-purple-100 text-purple-800 rounded-md tracking-wide">
                                        COD
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 text-xs font-bold uppercase bg-blue-100 text-blue-800 rounded-md tracking-wide">
                                        {order.paymentMethod.replace("_", " ")}
                                    </span>
                                )}
                                <button onClick={() => copyToClipboard(order.id, "Order ID")} className="text-gray-400 hover:text-gray-600 transition-colors" title="Copy ID">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Status Badges */}
                        <div className={`px-3 py-1 text-sm font-medium rounded-md capitalize border
                        ${order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                                order.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                        order.status === 'returned' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                            order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                order.status === 'pending_verification' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                    order.status === 'refunded' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                        order.status === 'fake' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                                                            'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            {order.status.replace("_", " ")}
                        </div>
                        <div className={`px-3 py-1 text-sm font-medium rounded-md capitalize border
                        ${order.paymentStatus === 'paid' ? 'bg-green-50 text-green-700 border-green-200' :
                                order.paymentStatus === 'pending_verification' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                    order.paymentStatus === 'partial_paid' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        order.paymentStatus === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                                            order.paymentStatus === 'refunded' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                order.paymentStatus === 'partial_refund' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                    'bg-gray-50 text-gray-700 border-gray-200'}`}>
                            Payment: {order.paymentStatus.replace("_", " ")}
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-wrap justify-between items-center gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-gray-500 mr-2 flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4" />
                            Quick Actions:
                        </span>

                        {order.status === 'pending' && (
                            <button onClick={() => initiateStatusChange("processing")} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all shadow-sm">
                                Confirm & Process
                            </button>
                        )}
                        {order.status === 'pending_verification' && (
                            <button onClick={handleVerify} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-all shadow-sm">
                                Verify Transaction
                            </button>
                        )}
                        {order.status === 'processing' && (
                            <button onClick={() => initiateStatusChange("shipped")} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm">
                                Mark as Shipped
                            </button>
                        )}
                        {order.status === 'shipped' && (
                            <button onClick={() => initiateStatusChange("delivered")} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all shadow-sm">
                                Mark Delivered
                            </button>
                        )}
                        {order.status === 'delivered' && (
                            <button onClick={() => initiateStatusChange("paid")} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all shadow-sm">
                                Collect Final Payment
                            </button>
                        )}

                        {(order.paymentStatus === 'paid' || order.paymentStatus === 'partial_paid' || order.paymentStatus === 'partial_refund') && (order.paidAmount - (order.refundedAmount || 0)) > 0.01 && (
                            <button
                                onClick={() => setIsRefundOpen(true)}
                                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors bg-white"
                            >
                                Issue Refund
                            </button>
                        )}

                        <div className="w-px h-6 bg-gray-200 mx-1"></div>

                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors bg-white shadow-sm flex items-center gap-2"
                        >
                            <Printer className="w-4 h-4" />
                            Print Invoice
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4" />
                            Override Status:
                        </span>
                        <div className="relative">
                            <select
                                value={order.status}
                                onChange={(e) => initiateStatusChange(e.target.value)}
                                className="pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/20 cursor-pointer appearance-none"
                            >
                                {availableStatuses.map((status: string) => (
                                    <option key={status} value={status} className="capitalize">{status.replace("_", " ")}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Info className="w-3 h-3 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left Column: Order Items & Timeline */}
                    <div className="xl:col-span-2 space-y-6">

                        {/* Line Items Card */}
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                                <h3 className="font-semibold text-gray-900 text-lg">Order Items</h3>
                                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md">{order.items.length} Product(s)</span>
                            </div>

                            {/* Items List */}
                            <div className="divide-y divide-gray-100">
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:bg-gray-50/50 transition-colors">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg relative overflow-hidden flex-shrink-0 border border-gray-200 shadow-sm">
                                            {item.product?.media?.[0] && (
                                                <Image src={item.product.media[0]} alt={item.product?.name} fill className="object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 text-base">{item.product?.name}</h4>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {item.variantName && <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-xs font-medium text-gray-700">{item.variantName}</span>}
                                                {item.variantSku && <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-mono font-medium tracking-tight">SKU: {item.variantSku}</span>}
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <div className="font-semibold text-gray-900 text-lg">৳{(item.price * item.quantity).toLocaleString()}</div>
                                            <div className="text-sm text-gray-500 flex items-center gap-1.5">
                                                <span>৳{item.price.toLocaleString()}</span>
                                                <span className="text-gray-300">×</span>
                                                <span className="font-medium text-gray-700">{item.quantity}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Financial Summary inside Items Card */}
                            <div className="border-t border-gray-200 bg-gray-50 p-6 flex flex-col items-end pt-6">
                                <div className="w-full sm:w-80 space-y-3">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="font-medium">৳{(order.totalAmount - (order.shippingFee || 0)).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Shipping Fee</span>
                                        <span className="font-medium">৳{(order.shippingFee || 0).toLocaleString()}</span>
                                    </div>

                                    <div className="pt-3 border-t border-gray-200 flex justify-between text-base font-bold text-gray-900">
                                        <span>Grand Total</span>
                                        <span>৳{order.totalAmount.toLocaleString()}</span>
                                    </div>

                                    <div className="pt-2 flex justify-between text-sm">
                                        <span className={`font-medium ${order.paidAmount >= order.totalAmount ? "text-green-600" : "text-gray-600"}`}>
                                            Total Paid
                                        </span>
                                        <span className={`font-semibold ${order.paidAmount >= order.totalAmount ? "text-green-600" : "text-gray-900"}`}>
                                            ৳{order.paidAmount.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="pt-2 border-t border-gray-200 flex justify-between text-base">
                                        <span className="font-bold text-red-600">Amount Due</span>
                                        <span className="font-bold text-red-600">৳{Math.max(0, order.totalAmount - order.paidAmount).toLocaleString()}</span>
                                    </div>

                                    {(order.refundedAmount || 0) > 0 && (
                                        <div className="mt-2 p-3 bg-orange-50 rounded-lg flex justify-between text-sm font-medium text-orange-700 border border-orange-100">
                                            <span>Total Refunded</span>
                                            <span>৳{order.refundedAmount?.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <OrderTimeline history={history} isLoading={isHistoryLoading} />
                    </div>

                    {/* Right Column: Customer & Details */}
                    <div className="space-y-6">

                        {/* Customer Details Card */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2 text-lg">
                                <User className="w-5 h-5 text-gray-400" />
                                Customer Profile
                            </h3>

                            <div className="flex items-center gap-4 mb-6">
                                {(order.user?.avatar || order.shippingAddress?.avatar) ? (
                                    <img src={order.user?.avatar || order.shippingAddress?.avatar} alt="Avatar" className="w-14 h-14 rounded-full object-cover border border-gray-100 shadow-sm" />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                                        {(order.user?.firstName?.[0] || order.shippingAddress?.firstName?.[0] || "G").toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-gray-900 text-base">
                                        {order.user?.firstName || order.shippingAddress?.firstName || 'Guest'} {order.user?.lastName || order.shippingAddress?.lastName || ''}
                                    </p>
                                    {(order.user?.email || order.shippingAddress?.email) && (
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            <a href={`mailto:${order.user?.email || order.shippingAddress?.email}`} className="hover:text-blue-600 transition-colors">
                                                {order.user?.email || order.shippingAddress?.email}
                                            </a>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="pt-5 border-t border-gray-100">
                                <h4 className="font-medium text-gray-900 text-sm mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    Shipping Details
                                </h4>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3">
                                    {order.shippingAddress?.phone && (
                                        <div className="flex justify-between items-start gap-4 pb-2 border-b border-gray-200/60">
                                            <span className="text-sm text-gray-500 min-w-16">Phone:</span>
                                            <a href={`tel:${order.shippingAddress.phone}`} className="text-sm font-medium hover:text-blue-600 transition-colors font-mono text-right text-gray-900">
                                                {order.shippingAddress.phone}
                                            </a>
                                        </div>
                                    )}

                                    {order.shippingAddress?.address && (
                                        <div className="flex justify-between items-start gap-4 pb-2 border-b border-gray-200/60">
                                            <span className="text-sm text-gray-500 min-w-16">Street:</span>
                                            <span className="text-sm font-medium text-gray-900 text-right">
                                                {order.shippingAddress.address}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start gap-4 pb-2 border-b border-gray-200/60">
                                        <span className="text-sm text-gray-500 min-w-16">Area:</span>
                                        <span className="text-sm font-medium text-gray-900 text-right">
                                            {[order.shippingAddress?.thana, order.shippingAddress?.district].filter(Boolean).join(', ')}
                                            {order.shippingAddress?.zip && ` - ${order.shippingAddress.zip}`}
                                        </span>
                                    </div>

                                    {order.shippingAddress?.division && (
                                        <div className="flex justify-between items-start gap-4 pb-2 border-b border-gray-200/60">
                                            <span className="text-sm text-gray-500 min-w-16">Division:</span>
                                            <span className="text-sm font-medium text-gray-900 text-right">
                                                {order.shippingAddress.division}
                                            </span>
                                        </div>
                                    )}

                                    {order.shippingAddress?.deliveryLocation && (
                                        <div className="pt-1 flex justify-end items-center gap-2">
                                            {isEditingZone ? (
                                                <div className="flex items-center gap-1">
                                                    <select
                                                        className="text-xs border border-gray-300 rounded-md py-1 px-1.5 text-black bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        value={selectedZone}
                                                        onChange={(e) => setSelectedZone(e.target.value)}
                                                        disabled={updateShippingZone.isPending}
                                                    >
                                                        {config?.shippingZones?.map((z: any) => (
                                                            <option key={z.key} value={z.key}>
                                                                {z.label || z.key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button onClick={handleUpdateZone} disabled={updateShippingZone.isPending} className="p-1 text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Save">
                                                        <Check size={14} />
                                                    </button>
                                                    <button onClick={() => setIsEditingZone(false)} disabled={updateShippingZone.isPending} className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Cancel">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-700 shadow-sm">
                                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                        {order.shippingAddress.deliveryLocation.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                                    </div>
                                                    {!isEditingZone && (
                                                        <button onClick={initiateEditZone} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit Shipping Zone">
                                                            <Edit2 size={14} />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Payment Information Card */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2 text-lg">
                                <CreditCard className="w-5 h-5 text-gray-400" />
                                Payment Information
                            </h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-500 font-medium">Method</span>
                                    <span className="text-sm font-semibold text-gray-900 uppercase tracking-wider">{order.paymentMethod.replace("_", " ")}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-500 font-medium">Status</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider
                                    ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                                            order.paymentStatus === 'pending_verification' ? 'bg-orange-100 text-orange-700' :
                                                'bg-gray-100 text-gray-700'}`}>
                                        {order.paymentStatus.replace("_", " ")}
                                    </span>
                                </div>

                                {order.paymentDetails && Object.keys(order.paymentDetails).length > 0 && (
                                    <div className="pt-2 space-y-3">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Transaction Details</h4>
                                        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100/50 space-y-3">
                                            {Object.entries(order.paymentDetails).map(([key, value]) => {
                                                // Format keys like 'transaction_id' to 'Transaction Id'
                                                const formattedKey = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

                                                // Special highlighting for Transaction ID
                                                const isTrxId = key === 'transaction_id';

                                                return (
                                                    <div key={key} className="flex flex-col gap-1.5">
                                                        <span className="text-xs text-blue-600/70 font-semibold uppercase">{formattedKey}</span>
                                                        <span className={`text-sm text-gray-900 break-all ${isTrxId ? 'font-mono font-bold bg-white px-2 py-1.5 rounded border border-blue-100 inline-block w-full' : 'font-medium'}`}>
                                                            {String(value)}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
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

            {/* Print View - Only shown when printing */}
            <InvoicePrintTemplate order={order} config={config} />
        </div>
    );
}
