import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/utils";
import InventoryClient from "@/components/admin/inventory/InventoryClient";

export const dynamic = "force-dynamic";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const lowStockOnly = params.lowStockOnly || "";
  const offset = params.offset || "0";

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let variants = [];
  let pagination = {
    page: 1,
    limit: 50,
    totalItems: 0,
    totalPages: 1,
  };

  try {
    const url = new URL(getApiUrl("/admin/inventory/variants"));
    url.searchParams.set("limit", "20"); // Default page size
    url.searchParams.set("offset", offset);
    if (search) url.searchParams.set("search", search);
    if (lowStockOnly) url.searchParams.set("lowStockOnly", "true");

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        variants = json.data || [];
        pagination = json.meta || pagination;
      }
    }
  } catch (e) {
    console.error("Failed to fetch inventory", e);
  }

  return <InventoryClient initialData={variants} pagination={pagination} />;
}
