"use client";

import Image from "next/image";
import { Package } from "lucide-react";

interface OrderItem {
  id: string;
  productId: string;
  product?: {
    name: string;
    images?: string[];
  };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  paymentMethod?: string;
}

interface OrderCardProps {
  order: Order;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export function OrderCard({ order }: OrderCardProps) {
  return (
    <div className="bg-white border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start p-6 border-b border-primary/5">
        <div>
          <p className="text-xs text-secondary uppercase tracking-widest">
            Order #{order.id.slice(0, 8)}
          </p>
          <p className="text-sm mt-1">
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <span
          className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded-full ${
            STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {order.status}
        </span>
      </div>

      {/* Items Preview */}
      <div className="p-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {order.items.slice(0, 4).map((item, idx) => (
            <div
              key={idx}
              className="relative w-16 h-20 flex-shrink-0 bg-gray-50 rounded overflow-hidden"
            >
              {item.product?.images?.[0] ? (
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name || "Product"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-300" />
                </div>
              )}
              {item.quantity > 1 && (
                <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 rounded">
                  ×{item.quantity}
                </span>
              )}
            </div>
          ))}
          {order.items.length > 4 && (
            <div className="w-16 h-20 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center text-xs text-secondary">
              +{order.items.length - 4}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center p-4 bg-gray-50/50 border-t border-primary/5">
        <span className="text-sm text-secondary">
          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
        </span>
        <span className="font-serif text-lg">
          ৳{order.totalAmount?.toLocaleString() || 0}
        </span>
      </div>
    </div>
  );
}
