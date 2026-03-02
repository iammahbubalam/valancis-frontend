import { PolicyViewer } from "@/components/content/PolicyViewer";
import { getPolicyPage } from "@/lib/data";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return Policy | Valancis",
  description:
    "Our commitment to quality, including our return and exchange guidelines.",
};

export default async function ReturnPage() {
  const data = await getPolicyPage("policy_return");

  return <PolicyViewer title="Returns & Exchanges" data={data} />;
}
