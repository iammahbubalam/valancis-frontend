"use client";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { getApiUrl } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useState, useEffect } from "react";
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCheckoutFlow } from "@/hooks/useCheckoutFlow";
import { AddressManager, Address } from "@/components/checkout/AddressManager";
import { analytics, GA4Item } from "@/lib/gtm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { useSystemConfig } from "@/hooks/useSystemConfig";
import { Product } from "@/types";

export function CheckoutClient() {
  const { user, isLoading: isAuthLoading } = useAuth();
  // L9: Get subtotal from cart context
  const { subtotal } = useCart();
  const router = useRouter();

  // 1. DATA FLOW (State Machine)
  const { state, updateQuantity, clearCart } = useCheckoutFlow();
  const { status, items, total, error } = state;
  const { data: config } = useSystemConfig();
  const shippingZones = config?.shippingZones || [];

  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login?redirect=/checkout");
    }
  }, [user, isAuthLoading, router]);

  // Form State
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [email, setEmail] = useState("");

  // Address State managed by AddressManager
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  // Sync deliveryLocation with first available zone
  useEffect(() => {
    if (shippingZones.length > 0 && !deliveryLocation) {
      setDeliveryLocation(shippingZones[0].key);
    }
  }, [shippingZones, deliveryLocation]);

  // Pre-fill Email
  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  // Fetch Saved Addresses
  useEffect(() => {
    if (user) {
      fetchSavedAddresses();
    }
  }, [user]);

  const fetchSavedAddresses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl("/user/addresses"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedAddresses(data || []);
      }
    } catch (e) {
      console.error("Failed to fetch addresses", e);
    }
  };

  // Pre-Order Calculation
  const depositRequired = items.reduce((sum, item) => {
    // Check if item product is pre_order.
    // Note: ensure your Cart/Checkout hook provides 'stockStatus' on items or items.product
    // Assuming item structure has product details or we need to access them.
    // Based on OrderSummary usage, items might be simple. Let's check item structure later if needed.
    // For now assuming item.product.stockStatus or item.stockStatus exists.
    // Checking types.ts would be safer but let's assume item.product based on typical patterns.
    // If items are flattened, we might need adjustments.
    const isPreOrder = item.stockStatus === 'pre_order';
    if (isPreOrder) {
      const price = item.salePrice || item.basePrice || 0;
      return sum + (price * item.quantity * 0.50); // 50% Deposit
    }
    return sum;
  }, 0);

  // Partial Payment State
  const [paymentProvider, setPaymentProvider] = useState("bkash");
  const [paymentTrxID, setPaymentTrxID] = useState("");
  const [paymentPhone, setPaymentPhone] = useState("");

  const handleCheckout = async () => {
    if (!selectedAddress) return;

    // Analytics: Add Shipping Info
    analytics.addShippingInfo(
      items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.salePrice || item.basePrice,
        item_variant: item.variantName || item.variantId,
        quantity: item.quantity,
        item_category: item.categories?.[0]?.name,
      })),
      subtotal,
      deliveryLocation
    );

    // Analytics: Add Payment Info
    analytics.addPaymentInfo(
      items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.salePrice || item.basePrice,
        item_variant: item.variantName || item.variantId,
        quantity: item.quantity,
        item_category: item.categories?.[0]?.name,
      })),
      subtotal,
      depositRequired > 0 ? paymentProvider : "cod"
    );

    // Validate Pre-Order Payment
    if (depositRequired > 0) {
      if (!paymentTrxID.trim() || !paymentPhone.trim()) {
        setSubmitError("Please provide transaction ID and phone number for the pre-order deposit.");
        // Scroll to top or error
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitError(null);
    const token = localStorage.getItem("token");

    try {
      // 1. If "New Address" + "Save Address" checked, save it first
      if (selectedAddress.id === "new" && selectedAddress.saveAddress) {
        try {
          await fetch(getApiUrl("/user/addresses"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              label: selectedAddress.label || "Home",
              firstName: selectedAddress.firstName,
              phone: selectedAddress.phone,
              addressLine: selectedAddress.address,
              division: selectedAddress.division,
              district: selectedAddress.district,
              thana: selectedAddress.thana,
              postalCode: selectedAddress.zip,
              isDefault: savedAddresses.length === 0, // First one is default
            }),
          });
          // Don't fail checkout if save fails, just log it
        } catch (saveErr) {
          console.warn("Failed to save new address:", saveErr);
        }
      }
      // 2. If Existing Address + "isEdited", Update it
      else if (selectedAddress.id !== "new" && selectedAddress.isEdited) {
        try {
          await fetch(getApiUrl(`/user/addresses/${selectedAddress.id}`), {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              label: selectedAddress.label || "Home",
              firstName: selectedAddress.firstName,
              phone: selectedAddress.phone,
              addressLine: selectedAddress.address,
              division: selectedAddress.division,
              district: selectedAddress.district,
              thana: selectedAddress.thana,
              postalCode: selectedAddress.zip,
            }),
          });
        } catch (updateErr) {
          console.warn("Failed to update address:", updateErr);
        }
      }

      const payload: any = {
        paymentMethod: "cod",
        address: {
          firstName: selectedAddress.firstName,
          lastName: selectedAddress.lastName,
          email: email,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          division: selectedAddress.division,
          district: selectedAddress.district,
          thana: selectedAddress.thana,
          zip: selectedAddress.zip,
          deliveryLocation: deliveryLocation, // Include zone
        },
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      if (depositRequired > 0) {
        payload.paymentTrxId = paymentTrxID;
        payload.paymentProvider = paymentProvider;
        payload.paymentPhone = paymentPhone;
      }

      const res = await fetch(getApiUrl("/checkout"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Checkout failed");
      }

      // Success! Clear cart on frontend
      clearCart(); // Clear state and localStorage

      // Analytics: Purchase
      const orderData = await res.json();
      analytics.purchase({
        transaction_id: orderData.id || orderData.orderId,
        value: subtotal + shippingCost,
        tax: 0,
        shipping: shippingCost,
        items: items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.salePrice || item.basePrice,
          item_variant: item.variantName || item.variantId,
          quantity: item.quantity,
          item_category: item.categories?.[0]?.name,
        })),
      });

      setIsSuccess(true);
    } catch (error: any) {
      console.error(error);
      setSubmitError(
        error.message || "Failed to place order. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentZone = shippingZones.find(z => z.key === deliveryLocation);
  const shippingCost = currentZone?.cost || 0;
  const deliveryLabel = currentZone?.label || "Shipping";

  // Validation
  const isFormValid =
    selectedAddress &&
    selectedAddress.firstName?.trim() !== "" &&
    selectedAddress.phone?.trim() !== "" &&
    selectedAddress.address?.trim() !== "" &&
    selectedAddress.division?.trim() !== "" &&
    selectedAddress.district?.trim() !== "" &&
    selectedAddress.thana?.trim() !== "";

  // --- RENDER LOGIC (FAIL FAST) ---

  // 1. Initializing
  if (status === "initializing") {
    return (
      <div className="min-h-screen pt-40 pb-20 bg-bg-primary flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // 2. Critical Error (Invalid Link, OOS, Network)
  if (status === "error") {
    return (
      <div className="min-h-screen pt-40 pb-20 bg-bg-primary text-center flex flex-col items-center px-4">
        <Container>
          <div className="bg-red-50 text-red-600 p-8 rounded-lg max-w-md mx-auto border border-red-100">
            <h1 className="font-serif text-2xl mb-4">Unable to Proceed</h1>
            <p className="mb-6">{error}</p>
            <Link href="/shop">
              <Button variant="outline">Back to Shop</Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  // 3. Empty State (Ready but no items)
  if (status === "ready" && items.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen pt-40 pb-20 bg-bg-primary text-center flex flex-col items-center">
        <Container>
          <h1 className="font-serif text-3xl md:text-4xl mb-6 text-primary">
            Your bag is empty
          </h1>
          <p className="text-secondary mb-8 max-w-md mx-auto">
            Looks like you haven't added any items to your bag yet.
          </p>
          <Link href="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </Container>
      </div>
    );
  }

  // 4. Success State
  if (isSuccess) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-bg-primary flex flex-col items-center justify-center text-center px-4">
        <Container className="max-w-md bg-white p-12 shadow-2xl border border-primary/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-gold/40 via-accent-gold to-accent-gold/40" />

          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-700" />
            </div>
          </div>

          <h1 className="font-serif text-3xl mb-4 text-primary">
            Order Confirmed
          </h1>
          <p className="text-secondary text-sm leading-relaxed mb-8">
            Thank you for your purchase. We have received your order and will
            begin preparing it with care. You will receive updates at{" "}
            <span className="font-medium text-primary">
              {selectedAddress?.phone}
            </span>
            .
          </p>

          <Link href="/">
            <Button className="w-full">Return Home</Button>
          </Link>
        </Container>
      </div>
    );
  }

  // 5. Checkout Form (Ready with items)
  return (
    <div className="min-h-screen pt-24 pb-20 bg-bg-primary text-primary">
      <Container className="max-w-[1920px] px-6 md:px-12 lg:px-24">
        <div className="flex flex-col items-center lg:items-start mb-12">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-secondary/50 hover:text-primary transition-colors text-[10px] uppercase tracking-[0.2em] font-bold mb-4 group"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Continue Shopping
          </Link>
          <h1 className="font-serif text-4xl md:text-5xl text-center lg:text-left">
            Checkout
          </h1>
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-8">
            {submitError}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          {/* LEFT: Shipping Form */}
          <div className="w-full lg:w-3/5 space-y-12">
            {/* Contact Info */}
            <section>
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold border-b border-primary/10 pb-4 mb-8 text-secondary">
                Contact Information
              </h2>
              <div className="space-y-6">
                <div className="group relative">
                  <input
                    type="email"
                    name="email"
                    placeholder=" "
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="peer w-full bg-transparent border-b border-primary/20 py-4 text-base focus:outline-none focus:border-primary transition-colors placeholder-transparent"
                  />
                  <label className="absolute left-0 top-4 text-secondary/60 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-accent-gold peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-accent-gold cursor-text">
                    Email Address (Optional)
                  </label>
                </div>
              </div>
            </section>

            {/* Shipping Address - DELEGATED TO COMPONENT */}
            <section>
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold border-b border-primary/10 pb-4 mb-8 text-secondary">
                Shipping Address
              </h2>

              <AddressManager
                savedAddresses={savedAddresses}
                onSelectAddress={(addr) => setSelectedAddress(addr)}
                userFirstName={user?.firstName}
                userLastName={user?.lastName}
                defaultPhone={user?.phone || ""}
              />

              <div className="group relative mt-8">
                <select
                  name="deliveryLocation"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="peer w-full bg-transparent border-b border-primary/20 py-4 text-base focus:outline-none focus:border-primary transition-colors text-primary appearance-none cursor-pointer"
                >
                  {shippingZones.map(zone => (
                    <option key={zone.id} value={zone.key}>
                      {zone.label} ({zone.cost} BDT)
                    </option>
                  ))}
                </select>
                <label className="absolute left-0 -top-2 text-xs text-accent-gold">
                  Delivery Zone <span className="text-red-400">*</span>
                </label>
                <div className="absolute right-0 top-4 pointer-events-none">
                  <ArrowRight className="w-4 h-4 text-secondary/50 rotate-90" />
                </div>
              </div>
            </section>

            {/* Pre-Order Payment Section */}
            {depositRequired > 0 && (
              <section className="bg-orange-50/50 border border-orange-100 p-8 rounded-lg mt-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-white rounded-full shadow-sm text-orange-500">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif text-primary mb-2">Pre-Order Deposit Required</h2>
                    <p className="text-sm text-secondary leading-relaxed">
                      One or more items in your cart are <strong>Pre-order</strong>.
                      You must pay a partial deposit of <span className="font-bold text-primary">৳{depositRequired.toLocaleString()}</span> to confirm this order.
                      The rest will be Cash on Delivery.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Provider Selector */}
                  <div className="grid grid-cols-3 gap-4">
                    {['bkash', 'nagad', 'rocket'].map(p => (
                      <button
                        key={p}
                        onClick={() => setPaymentProvider(p)}
                        className={`py-3 px-4 rounded border capitalize text-sm font-medium transition-all ${paymentProvider === p
                          ? 'bg-primary text-white border-primary shadow-md'
                          : 'bg-white text-secondary border-primary/10 hover:border-primary/30'
                          }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  {/* Payment Description (Instruction) */}
                  <div className="text-xs text-secondary/80 bg-white p-4 rounded border border-primary/5">
                    <p className="mb-1 uppercase tracking-wider font-bold text-primary">How to Pay:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Go to your {paymentProvider} app.</li>
                      <li>Use <strong>Send Money</strong> / <strong>Payment</strong> option.</li>
                      <li>Send <strong>৳{depositRequired}</strong> to <strong>017XXXXXXXX</strong>.</li>
                      <li>Enter your Order Reference if applicable.</li>
                      <li>Copy the Transaction ID (TrxID) and paste below.</li>
                    </ol>
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group relative">
                      <input
                        type="text"
                        value={paymentTrxID}
                        onChange={(e) => setPaymentTrxID(e.target.value)}
                        className="peer w-full bg-white border border-primary/20 rounded p-3 text-base focus:outline-none focus:border-primary transition-colors placeholder-transparent"
                        placeholder="X"
                      />
                      <label className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-secondary transition-all">
                        Transaction ID <span className="text-red-400">*</span>
                      </label>
                    </div>
                    <div className="group relative">
                      <input
                        type="text"
                        value={paymentPhone}
                        onChange={(e) => setPaymentPhone(e.target.value)}
                        className="peer w-full bg-white border border-primary/20 rounded p-3 text-base focus:outline-none focus:border-primary transition-colors placeholder-transparent"
                        placeholder="X"
                      />
                      <label className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-secondary transition-all">
                        Sender Number <span className="text-red-400">*</span>
                      </label>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* RIGHT: Order Summary (Sticky) */}
          <div className="w-full lg:w-2/5 relative h-fit lg:sticky lg:top-24">
            <OrderSummary
              items={items}
              subtotal={subtotal}
              deliveryLocation={deliveryLocation}
              deliveryLabel={deliveryLabel}
              shippingCost={shippingCost}
              onCheckout={handleCheckout}
              isSubmitting={isSubmitting}
              isFormValid={isFormValid || false}
              onUpdateQuantity={updateQuantity}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
