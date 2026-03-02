import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/utils";

export interface OrderFilter {
    page?: number;
    limit?: number;
    status?: string;
    payment_status?: string;
    is_preorder?: boolean | string;
    search?: string;
}

export interface Order {
    id: string;
    userId: string;
    status: string;
    totalAmount: number;
    shippingAddress: any;
    paymentMethod: string;
    paymentStatus: string;
    paidAmount: number;
    refundedAmount?: number;
    shippingFee?: number;
    discount?: number;
    paymentDetails: any;
    isPreOrder: boolean;
    items: any[];
    createdAt: string;
    updatedAt: string;
    user: {
        email: string;
        firstName?: string;
        lastName?: string;
        avatar?: string;
    };
}

export interface OrderListResponse {
    orders: Order[];
    total: number;
    page: number;
    limit: number;
}

async function fetchOrders(filter: OrderFilter): Promise<OrderListResponse> {
    const params = new URLSearchParams();
    if (filter.page) params.set("page", filter.page.toString());
    if (filter.limit) params.set("limit", filter.limit.toString());
    if (filter.status) params.set("status", filter.status);
    if (filter.payment_status) params.set("payment_status", filter.payment_status);
    if (filter.is_preorder !== undefined && filter.is_preorder !== "") {
        params.set("is_preorder", filter.is_preorder.toString());
    }
    if (filter.search) params.set("search", filter.search);

    const token = localStorage.getItem("token");
    const res = await fetch(getApiUrl(`/admin/orders?${params.toString()}`), {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
}

async function updateStatus(data: { id: string; status: string }) {
    const token = localStorage.getItem("token");
    const res = await fetch(getApiUrl(`/admin/orders/${data.id}/status`), {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: data.status }),
    });
    if (!res.ok) throw new Error("Failed to update status");
    return res.json();
}

async function verifyPayment(id: string) {
    const token = localStorage.getItem("token");
    const res = await fetch(getApiUrl(`/admin/orders/${id}/verify-payment`), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to verify payment");
    }
    return res.json();
}

export function useOrders(filter: OrderFilter) {
    return useQuery({
        queryKey: ["admin-orders", filter],
        queryFn: () => fetchOrders(filter),
    });
}

export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        },
    });
}

export function useVerifyPayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: verifyPayment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        },
    });
}
