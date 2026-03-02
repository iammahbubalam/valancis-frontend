
import { notFound } from "next/navigation";
import Image from "next/image";
import { getCollectionInfo, getProductsByCollection } from "@/lib/data";
import { SplitCollection } from "@/components/shop/SplitCollection";

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const info = await getCollectionInfo(slug);
  const products = await getProductsByCollection(slug);

  if (!info) {
    notFound();
  }

  // The SplitCollection component handles the layout internally.
  // We remove the Container and default layout wrappers.
  return (
    <SplitCollection 
      title={info.title}
      description={info.description}
      image={info.image}
      story={info.story}
      products={products}
    />
  );
}
