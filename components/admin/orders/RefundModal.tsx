"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRefundOrder } from "@/hooks/useAdminOrderDetail";
import { X } from "lucide-react";

interface RefundModalProps {
    orderId: string;
    maxRefundable: number;
    isOpen: boolean;
    onClose: () => void;
}

export function RefundModal({ orderId, maxRefundable, isOpen, onClose }: RefundModalProps) {
    const refundOrder = useRefundOrder();
    const [amount, setAmount] = useState(maxRefundable);
    const [reason, setReason] = useState("");
    const [restock, setRestock] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await refundOrder.mutateAsync({
                id: orderId,
                amount,
                reason,
                restock
            });
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to refund: " + (error as Error).message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Issue Refund</h2>
                        <p className="text-sm text-gray-500">Max Refundable: ৳{maxRefundable.toLocaleString()}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Amount</label>
                        <Input
                            type="number"
                            value={amount}
                            max={maxRefundable}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Reason</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] text-sm"
                            placeholder="Reason for refund..."
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="restock"
                            checked={restock}
                            onChange={(e) => setRestock(e.target.checked)}
                            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary/20"
                        />
                        <label htmlFor="restock" className="text-sm text-gray-700 cursor-pointer select-none">
                            Restock items to inventory?
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={refundOrder.isPending}>
                            {refundOrder.isPending ? "Processing..." : "Confirm Refund"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
