import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/utils";
import CollectionsClient from "@/components/admin/collections/CollectionsClient";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  let collections = [];

  try {
    const res = await fetch(getApiUrl("/admin/collections"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (res.ok) {
      collections = await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch collections", e);
  }

  return <CollectionsClient initialCollections={collections || []} />;
}
