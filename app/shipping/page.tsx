import { PolicyViewer } from "@/components/content/PolicyViewer";
import { getPolicyPage } from "@/lib/data";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy | Valancis",
  description:
    "Learn about our delivery areas, timelines, and shipping partners.",
};

export default async function ShippingPage() {
  const data = await getPolicyPage("policy_shipping");

  return <PolicyViewer title="Shipping & Delivery" data={data} />;
}
