import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { Suspense } from "react";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-main-secondary" />}>
      <CheckoutClient />
    </Suspense>
  );
}
