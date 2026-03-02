import { AboutRenderer } from "@/components/content/AboutRenderer";
import { getAboutPage } from "@/lib/data";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Valancis",
  description:
    "Redefining minimalist luxury. Learn about our story and craftsmanship.",
};

export default async function AboutPage() {
  const data = await getAboutPage();

  return <AboutRenderer data={data} />;
}
