"use client";
import { Button } from "@/components/ui/Button";
import { CartItem } from "@/context/CartContext";
import { Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  deliveryLocation: string;
  deliveryLabel: string;
  shippingCost: number;
  onCheckout?: () => void;
  isSubmitting?: boolean;
  isFormValid?: boolean;
  onUpdateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
}

export function OrderSummary({
  items,
  subtotal,
  deliveryLocation,
  deliveryLabel,
  shippingCost,
  onCheckout,
  isSubmitting = false,
  isFormValid = false,
  onUpdateQuantity,
}: OrderSummaryProps) {
  // L9: Final total includes shipping
  const finalTotal = subtotal + shippingCost;

  const depositRequired = items.reduce((sum, item) => {
    if (item.isPreorder) {
      return sum + ((item.preorderDepositAmount || 0) * item.quantity);
    }
    return sum;
  }, 0);

  const balanceDueOnDelivery = finalTotal - depositRequired;

  return (
    <div className="bg-white p-8 lg:p-10 shadow-xl border border-accent-subtle transition-all hover:shadow-2xl">
      <h2 className="font-serif text-2xl mb-8 border-b border-accent-subtle pb-4">
        Order Summary
      </h2>

      {/* ITEMS LIST */}
      <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto scrollbar-hide pr-2">
        {items.map((item, index) => (
          <div key={item.cartItemId || `${item.id}-${item.variantId || index}`} className="flex gap-4 group">
            <div className="relative w-20 h-24 bg-bg-secondary flex-shrink-0 overflow-hidden rounded-md border border-accent-subtle">
              {item.images?.[0] && (
                <Image
                  src={item.images[0]}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
            </div>
            <div className="flex-grow flex flex-col justify-between py-1">
              <div>
                <h4 className="font-serif text-base leading-tight">
                  {item.name}
                </h4>
                {item.variantName && (
                  <p className="text-xs text-primary/70 mt-1">
                    {item.variantName}
                  </p>
                )}
                {item.isPreorder && (
                  <span className="inline-block mt-1 text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    Pre-order
                  </span>
                )}
              </div>

              <div className="flex justify-between items-end mt-2">
                <div className="flex items-center border border-accent-subtle rounded-md">
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.variantId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="p-1.5 text-primary/70 hover:text-primary disabled:opacity-30 disabled:hover:text-primary/70 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-medium w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.variantId, item.quantity + 1)}
                    disabled={item.stock <= item.quantity}
                    className="p-1.5 text-primary/70 hover:text-primary disabled:opacity-30 disabled:hover:text-primary/70 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <p className="font-medium text-sm">
                  ৳
                  {(
                    (item.salePrice || item.price || item.basePrice || 0) * item.quantity
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>


      {/* PRICE BREAKDOWN */}
      <div className="space-y-4 py-6 border-t border-accent-subtle text-sm">
        <div className="flex justify-between text-primary/70">
          <span>Subtotal</span>
          <span>৳{subtotal.toLocaleString()}</span>
        </div>


        <div className="flex justify-between text-primary/70 items-center">
          <span>Shipping</span>
          <span className="text-xs text-secondary/60">
            ({deliveryLabel})
          </span>
          <span>৳{shippingCost.toLocaleString()}</span>
        </div>

        {depositRequired > 0 && (
          <>
            <div className="flex justify-between text-orange-600 font-bold pt-2">
              <span>Required Deposit</span>
              <span>৳{depositRequired.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-primary/50 text-xs italic">
              <span>(Payable now)</span>
            </div>
          </>
        )}
      </div>

      {/* TOTAL */}
      <div className="flex justify-between text-xl font-serif py-6 border-t border-accent-subtle mb-4 items-center bg-primary/5 -mx-8 px-8 border-b">
        <span className="font-bold text-primary">Total</span>
        <div className="text-right">
          <span className="block font-bold text-lg md:text-xl">
            ৳{finalTotal.toLocaleString()}
          </span>
          <span className="text-[10px] text-secondary/70 font-sans font-normal block mt-1">
            Including VAT
          </span>
        </div>
      </div>

      {depositRequired > 0 && (
        <div className="flex justify-between items-center py-4 bg-green-50/50 -mx-8 px-8 border-b border-green-100 mb-8">
          <span className="text-sm font-bold text-green-800">Due on Delivery</span>
          <span className="text-lg font-bold text-green-800">৳{balanceDueOnDelivery.toLocaleString()}</span>
        </div>
      )}

      {
        onCheckout && (
          <Button
            onClick={onCheckout}
            disabled={!isFormValid || isSubmitting}
            className="w-full h-12 text-base shadow-lg hover:shadow-xl transition-all active:scale-[0.99]"
          >
            {isSubmitting
              ? "Processing Order..."
              : isFormValid
                ? "Confirm Order"
                : "Complete Details"}
          </Button>
        )
      }

      {/* TRUST BADGES */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-accent-subtle">
        <div className="flex items-center gap-2 text-secondary/70 justify-center">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span className="text-[10px] uppercase tracking-wider font-medium">
            Secure
          </span>
        </div>
        <div className="flex items-center gap-2 text-secondary/70 justify-center">
          <Truck className="w-4 h-4 text-primary" />
          <span className="text-[10px] uppercase tracking-wider font-medium">
            Fast Delivery
          </span>
        </div>
      </div>
    </div >
  );
}
