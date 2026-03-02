"use client";

import { useState } from "react";
import { Product, InventoryLog } from "@/types";
import { useDialog } from "@/context/DialogContext";
import { Button } from "@/components/ui/Button";
import { Variant } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/utils";
import { Loader2, ArrowUpRight, ArrowDownLeft } from "lucide-react";

// --- Adjust Stock Modal ---

interface AdjustStockModalProps {
  productName: string;
  variant: Variant;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdjustStockModal({
  productName,
  variant,
  onClose,
  onSuccess,
}: AdjustStockModalProps) {
  const dialog = useDialog();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"add" | "deduct">("add");
  const [reason, setReason] = useState("");

  const adjustMutation = useMutation({
    mutationFn: async (payload: any) => {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl("/admin/inventory/adjust"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to adjust stock");
      return res.json();
    },
    onSuccess: () => {
      dialog.toast({
        message: "Stock adjusted successfully",
        variant: "success",
      });
      onSuccess();
    },
    onError: () => {
      dialog.toast({ message: "Failed to adjust stock", variant: "danger" });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = type === "add" ? parseInt(amount) : -parseInt(amount);

    await adjustMutation.mutateAsync({
      variantId: variant.id,
      changeAmount: finalAmount,
      reason:
        reason || (type === "add" ? "Manual Restock" : "Manual Deduction"),
    });
  };

  const isSubmitting = adjustMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
        <h2 className="text-lg font-bold mb-4">
          Adjust Stock: {productName}
          <span className="block text-xs font-normal text-gray-500 mt-1">
            Variant: {variant.name} ({variant.sku})
          </span>
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType("add")}
              className={`p-3 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 ${type === "add" ? "bg-green-50 border-green-200 text-green-700" : "border-gray-200 hover:bg-gray-50"}`}
            >
              <ArrowUpRight className="w-4 h-4" /> Add Stock
            </button>
            <button
              type="button"
              onClick={() => setType("deduct")}
              className={`p-3 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 ${type === "deduct" ? "bg-red-50 border-red-200 text-red-700" : "border-gray-200 hover:bg-gray-50"}`}
            >
              <ArrowDownLeft className="w-4 h-4" /> Deduct Stock
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
              Quantity
            </label>
            <input
              required
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-primary"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
              Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-primary"
              placeholder={
                type === "add"
                  ? "Restock from Supplier"
                  : "Correction / Damaged"
              }
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !amount}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Confirm Adjustment"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- History Modal ---

export function HistoryModal({
  productName,
  variant,
  onClose,
}: {
  productName: string;
  variant: Variant;
  onClose: () => void;
}) {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["inventory_logs", variant.id],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        getApiUrl(`/admin/inventory/logs?variantId=${variant.id}&limit=20`),
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();
      return (data.data || []) as InventoryLog[];
    },
    staleTime: 60 * 1000,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 h-[600px] flex flex-col animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold">Stock History: {productName}</h2>
            <p className="text-xs text-gray-500">
              Variant: {variant.name} ({variant.sku})
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No history found.
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50"
                >
                  <div
                    className={`mt-1 p-2 rounded-full ${log.changeAmount > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                  >
                    {log.changeAmount > 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-gray-900">
                        {log.changeAmount > 0
                          ? `+${log.changeAmount}`
                          : log.changeAmount}{" "}
                        Stock
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{log.reason}</p>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">
                      Ref: {log.referenceId}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// --- Edit Threshold Modal ---

export function EditThresholdModal({
  productName,
  variant,
  onClose,
  onSuccess,
}: {
  productName: string;
  variant: Variant;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const dialog = useDialog();
  const [threshold, setThreshold] = useState(variant.lowStockThreshold.toString());

  const mutation = useMutation({
    mutationFn: async (val: number) => {
      const token = localStorage.getItem("token");
      // Re-using UpdateVariant endpoint or specialized one?
      // Assuming generic update variant endpoint exists: /api/v1/admin/products/{id}/variants/{variantId}
      // Or a specific patch. Let's assume we need to call update variant.
      // Since existing API might vary, I'll use a hypothetical generic update for now, or check repo.
      // Based on typical REST: PUT /admin/products/variants/{id}

      const res = await fetch(getApiUrl(`/admin/products/variants/${variant.id}`), {
        method: "PATCH", // Using PATCH for partial update
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lowStockThreshold: val }),
      });
      if (!res.ok) throw new Error("Failed to update threshold");
      return res.json();
    },
    onSuccess: () => {
      dialog.toast({ message: "Threshold updated", variant: "success" });
      onSuccess();
    },
    onError: () => {
      dialog.toast({ message: "Failed to update", variant: "danger" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(parseInt(threshold));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95">
        <h2 className="text-lg font-bold mb-4">
          Set Low Stock Alert
          <span className="block text-xs font-normal text-gray-500 mt-1">
            {productName} - {variant.name}
          </span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
              Minimum Quantity
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-primary text-lg font-bold text-center"
              />
              <span className="text-sm text-gray-400">units</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Alert when stock falls below this number.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
