import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/utils";
import { ShippingZone } from "@/hooks/useSystemConfig";

export function useAdminShippingZones() {
    return useQuery<ShippingZone[]>({
        queryKey: ["admin-shipping-zones"],
        queryFn: async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(getApiUrl("/admin/config/shipping-zones"), {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch shipping zones");
            return res.json();
        }
    });
}

export function useUpdateShippingZone() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (zone: Partial<ShippingZone> & { id: number }) => {
            const token = localStorage.getItem("token");
            const res = await fetch(getApiUrl(`/admin/config/shipping-zones/${zone.id}`), {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(zone)
            });
            if (!res.ok) throw new Error("Failed to update shipping zone");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-shipping-zones"] });
            queryClient.invalidateQueries({ queryKey: ["system-config"] });
        }
    });
}

export function useCreateShippingZone() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (zone: Omit<ShippingZone, "id">) => {
            const token = localStorage.getItem("token");
            const res = await fetch(getApiUrl("/admin/config/shipping-zones"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(zone)
            });
            if (!res.ok) throw new Error("Failed to create shipping zone");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-shipping-zones"] });
            queryClient.invalidateQueries({ queryKey: ["system-config"] });
        }
    });
}

export function useDeleteShippingZone() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const token = localStorage.getItem("token");
            const res = await fetch(getApiUrl(`/admin/config/shipping-zones/${id}`), {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to delete shipping zone");
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-shipping-zones"] });
            queryClient.invalidateQueries({ queryKey: ["system-config"] });
        }
    });
}
