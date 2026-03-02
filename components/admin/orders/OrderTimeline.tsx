import { OrderHistory } from "@/hooks/useAdminOrderDetail";
import { format } from "date-fns";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";

interface TimelineProps {
    history?: OrderHistory[];
    isLoading: boolean;
}

export function OrderTimeline({ history, isLoading }: TimelineProps) {
    // Data is passed from parent to avoid waterfall

    if (isLoading) return <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">Loading history...</div>;

    if (!history || history.length === 0) {
        return (
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-serif font-medium mb-4">Order History</h3>
                <p className="text-sm text-secondary">No history recorded yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-serif font-medium mb-6">Order History</h3>
            <div className="space-y-8 pl-0 ml-1"> {/* Adjusted container */}
                {history.map((item, index) => (
                    // L9: Continuous Line Logic
                    <div key={item.id} className="relative pl-8 border-l-2 border-gray-200 last:border-l-0 pb-0">
                        {/* Status Icon Indicator */}
                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full ring-4 ring-white flex items-center justify-center
                            ${getStatusColor(item.newStatus)}
                        `}>
                            {/* Inner dot handled by bg color */}
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-start">
                                <p className="font-medium text-sm capitalize text-primary">
                                    {item.newStatus.replace("_", " ")}
                                </p>
                                <span className="text-xs text-secondary whitespace-nowrap ml-2">
                                    {format(new Date(item.createdAt), "MMM d, h:mm a")}
                                </span>
                            </div>

                            {item.previousStatus && item.previousStatus !== item.newStatus && (
                                <p className="text-xs text-secondary">
                                    Changed from <span className="capitalize font-medium">{item.previousStatus}</span>
                                </p>
                            )}

                            {item.reason && (
                                <div className="mt-1 text-xs bg-gray-50 p-2 rounded text-gray-600 italic border border-gray-100">
                                    {item.reason}
                                </div>
                            )}

                            {item.createdName && (
                                <p className="text-xs text-secondary mt-0.5">
                                    by {item.createdName}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function getStatusColor(status: string): string {
    switch (status) {
        case "delivered": return "bg-green-500";
        case "shipped": return "bg-blue-500";
        case "processing": return "bg-blue-400";
        case "cancelled": return "bg-red-500";
        case "returned": return "bg-orange-500";
        case "fake": return "bg-gray-800";
        case "refunded": return "bg-purple-500";
        default: return "bg-gray-300";
    }
}
