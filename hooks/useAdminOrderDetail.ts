import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/utils";
import { useDialog } from "@/context/DialogContext"; // Import Dialog Context
import { Order } from "./useAdminOrders";

async function fetchOrder(id: string): Promise<Order> {
    const token = localStorage.getItem("token");
    const res = await fetch(getApiUrl(`admin/orders/${id}`), {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Failed to fetch order");
    return res.json();
}

export function useOrderDetail(id: string) {
    return useQuery({
        queryKey: ["admin-order", id],
        queryFn: () => fetchOrder(id),
        enabled: !!id,
    });
}

export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();
    const { toast } = useDialog(); // L9: Use UI Toast

    return useMutation({
        mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
            const token = localStorage.getItem("token");
            const res = await fetch(getApiUrl(`admin/orders/${id}/status`), {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status, note }),
            });
            if (!res.ok) {
                // L9: Bulletproof Error Parsing (Read stream ONCE)
                let text = "";
                try {
                    text = await res.text();
                } catch (e) {
                    // Stream issue
                }

                let errorMessage = text || `Failed to update status (HTTP ${res.status})`;

                // Try to parse as JSON to get pretty message
                try {
                    const json = JSON.parse(text);
                    if (json && json.error) {
                        errorMessage = json.error;
                    }
                } catch (e) {
                    // Not JSON, use raw text
                }

                throw new Error(errorMessage);
            }
            return res.json();
        },
        onSuccess: (_, { id, status }) => {
            queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
            queryClient.invalidateQueries({ queryKey: ["admin-order-history", id] });

            // L9: specific reminders for manual actions
            switch (status) {
                case "cancelled":
                    toast({
                        message: "Order Cancelled. REMINDER: Manually restock items if needed.",
                        variant: "warning",
                        duration: 5000
                    });
                    break;
                case "returned":
                    toast({
                        message: "Order Returned. REMINDER: Check inventory & process refund manually.",
                        variant: "warning",
                        duration: 5000
                    });
                    break;
                case "refunded":
                    toast({
                        message: "Order Refunded. REMINDER: Ensure financial records are updated.",
                        variant: "warning",
                        duration: 5000
                    });
                    break;
                case "fake":
                    toast({
                        message: "Order marked Fake. REMINDER: Adjust stock if previously deducted.",
                        variant: "warning",
                        duration: 5000
                    });
                    break;
                default:
                    toast({ message: "Order status updated successfully", variant: "success" });
            }
        },
        onError: (error: Error) => {
            console.error("Status Update Failed:", error);
            // L9: Show the specific error message to user
            toast({ message: error.message, variant: "danger" });
        }
    });
}

export function useUpdatePaymentStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const token = localStorage.getItem("token");
            const res = await fetch(getApiUrl(`admin/orders/${id}/payment-status`), {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error("Failed to update payment status");
            return res.json();
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
            queryClient.invalidateQueries({ queryKey: ["admin-order-history", id] });
        }
    });
}

export function useVerifyPayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const token = localStorage.getItem("token");
            const res = await fetch(getApiUrl(`admin/orders/${id}/verify-payment`), {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to verify payment");
            return res.json();
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
            queryClient.invalidateQueries({ queryKey: ["admin-order-history", id] });
        }
    });
}

export interface RefundReq {
    id: string;
    amount: number;
    reason: string;
    restock: boolean;
}

export function useRefundOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: RefundReq) => {
            const token = localStorage.getItem("token");
            const res = await fetch(getApiUrl(`admin/orders/${data.id}/refund`), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: data.amount,
                    reason: data.reason,
                    restock: data.restock
                }),
            });
            if (!res.ok) {
                const err = await res.text();
                throw new Error(err || "Failed to process refund");
            }
            return res.json();
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
            queryClient.invalidateQueries({ queryKey: ["admin-order-history", id] });
        }
    });
}

export interface OrderHistory {
    id: string;
    orderId: string;
    previousStatus?: string;
    newStatus: string;
    reason?: string;
    createdBy?: string;
    createdName?: string;
    createdAt: string;
}

async function fetchOrderHistory(id: string): Promise<OrderHistory[]> {
    const token = localStorage.getItem("token");
    const res = await fetch(getApiUrl(`admin/orders/${id}/history`), {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Failed to fetch order history");
    return res.json();
}

export function useOrderHistory(id: string) {
    return useQuery({
        queryKey: ["admin-order-history", id],
        queryFn: () => fetchOrderHistory(id),
        enabled: !!id,
    });
}
