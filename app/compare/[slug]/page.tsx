import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getProductBySlug } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { Check, X, ArrowRight, ArrowLeft } from "lucide-react";
import { AddToCartButton } from "@/components/product/AddToCartButton";

interface ComparePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ComparePageProps): Promise<Metadata> {
  const { slug } = await params;
  // Parse slugs: "product-a-vs-product-b"
  const parts = slug.split("-vs-");
  if (parts.length !== 2) {
    return { title: "Invalid Comparison" };
  }

  const [slugA, slugB] = parts;
  const [productA, productB] = await Promise.all([
    getProductBySlug(slugA),
    getProductBySlug(slugB),
  ]);

  if (!productA || !productB) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${productA.name} vs ${productB.name} - Which is Better? | Valancis`,
    description: `Compare ${productA.name} and ${productB.name} side by side. Check prices, specs, features, and find which product suits you best.`,
    openGraph: {
      title: `${productA.name} vs ${productB.name} Comparison`,
      description: `Detailed comparison to help you choose between ${productA.name} and ${productB.name}`,
      images:
        productA.images && productA.images.length > 0
          ? [productA.images[0]]
          : [],
    },
  };
}

export default async function ComparePage({ params }: ComparePageProps) {
  const { slug } = await params;
  const parts = slug.split("-vs-");

  if (parts.length !== 2) {
    notFound();
  }

  const [slugA, slugB] = parts;
  const [productA, productB] = await Promise.all([
    getProductBySlug(slugA),
    getProductBySlug(slugB),
  ]);

  if (!productA || !productB) {
    notFound();
  }

  const priceA = productA.salePrice || productA.basePrice;
  const priceB = productB.salePrice || productB.basePrice;
  const priceDiff = Math.abs(priceA - priceB);
  const cheaperProduct = priceA < priceB ? productA : productB;

  // JSON-LD ItemList Schema for comparison
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${productA.name} vs ${productB.name} Comparison`,
    description: `Side-by-side comparison of ${productA.name} and ${productB.name}`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "Product",
          name: productA.name,
          image:
            productA.images && productA.images.length > 0
              ? productA.images[0]
              : "",
          offers: {
            "@type": "Offer",
            price: priceA,
            priceCurrency: "BDT",
          },
        },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@type": "Product",
          name: productB.name,
          image:
            productB.images && productB.images.length > 0
              ? productB.images[0]
              : "",
          offers: {
            "@type": "Offer",
            price: priceB,
            priceCurrency: "BDT",
          },
        },
      },
    ],
  };

  return (
    <>
      {/* Inject ItemList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-primary/50 hover:text-blue-600 dark:hover:text-blue-400 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {productA.name} vs {productB.name}
          </h1>
          <p className="text-gray-600 dark:text-primary/50 text-lg">
            Detailed side-by-side comparison to help you choose
          </p>
        </div>

        {/* Product Headers */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {[productA, productB].map((product, index) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700"
            >
              {product.images && product.images.length > 0 && (
                <div className="relative aspect-square mb-4">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-contain rounded-lg"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {product.name}
              </h2>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ৳{(product.salePrice || product.basePrice).toLocaleString()}
                </span>
                {product.salePrice && (
                  <span className="text-lg text-primary/60 dark:text-primary/50 line-through">
                    ৳{product.basePrice.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="space-y-2 mb-4">
                <div
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                    product.stock > 0
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </div>
              </div>
              {product.stock > 0 && <AddToCartButton product={product} />}
              <Link href={`/product/${product.slug}`}>
                <Button variant="outline" className="w-full mt-2">
                  View Details
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Price Comparison */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Price Comparison
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-primary/50 mb-1">
                {productA.name}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ৳{priceA.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-primary/50 mb-1">
                {productB.name}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ৳{priceB.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{cheaperProduct.name}</span> is
              cheaper by ৳{priceDiff.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Specifications Comparison */}
        {(productA.specs || productB.specs) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
            <div className="bg-canvas dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Specifications Comparison
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-canvas dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-primary/60 dark:text-primary/50">
                      Specification
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-primary/60 dark:text-primary/50">
                      {productA.name}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-primary/60 dark:text-primary/50">
                      {productB.name}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {/* Combine all spec keys */}
                  {Array.from(
                    new Set([
                      ...Object.keys(productA.specs || {}),
                      ...Object.keys(productB.specs || {}),
                    ]),
                  ).map((specKey, index) => (
                    <tr
                      key={specKey}
                      className={
                        index % 2 === 0
                          ? "bg-white dark:bg-gray-800"
                          : "bg-canvas dark:bg-gray-900"
                      }
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-200">
                        {specKey}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {productA.specs?.[specKey] || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {productB.specs?.[specKey] || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Verdict Comparison */}
        {(productA.verdict || productB.verdict) && (
          <div className="grid md:grid-cols-2 gap-6">
            {[productA, productB].map(
              (product) =>
                product.verdict && (
                  <div
                    key={product.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
                      {product.name} Verdict
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {product.verdict.summary}
                    </p>
                    {product.verdict.rating && (
                      <div className="mb-4">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {product.verdict.rating}/5
                        </span>
                      </div>
                    )}
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">
                          Pros
                        </p>
                        <ul className="space-y-1">
                          {product.verdict.pros.slice(0, 3).map((pro, i) => (
                            <li
                              key={i}
                              className="text-sm text-gray-600 dark:text-primary/50 flex items-start gap-2"
                            >
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {product.verdict.cons.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
                            Cons
                          </p>
                          <ul className="space-y-1">
                            {product.verdict.cons.slice(0, 3).map((con, i) => (
                              <li
                                key={i}
                                className="text-sm text-gray-600 dark:text-primary/50 flex items-start gap-2"
                              >
                                <X className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ),
            )}
          </div>
        )}
      </div>
    </>
  );
}
