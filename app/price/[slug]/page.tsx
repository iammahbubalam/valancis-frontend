import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getProductBySlug } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { ShoppingBag, TrendingDown, TrendingUp, ArrowLeft } from "lucide-react";
import { AddToCartButton } from "@/components/product/AddToCartButton";

interface PricePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PricePageProps): Promise<Metadata> {
  const { slug } = await params;
  // Extract product slug (remove "-in-bd" suffix)
  const productSlug = slug.replace(/-in-bd$/, "");
  const product = await getProductBySlug(productSlug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const currentPrice = product.salePrice || product.basePrice;

  return {
    title: `${product.name} Price in Bangladesh - BDT ${currentPrice.toLocaleString()} | Valancis`,
    description: `Latest ${product.name} price in Bangladesh is BDT ${currentPrice.toLocaleString()}. Check current prices, availability, and buy online at Valancis.`,
    openGraph: {
      title: `${product.name} Price in Bangladesh`,
      description: `BDT ${currentPrice.toLocaleString()} - Best price for ${product.name} in BD`,
      images:
        product.images && product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

export default async function PricePage({ params }: PricePageProps) {
  const { slug } = await params;
  const productSlug = slug.replace(/-in-bd$/, "");
  const product = await getProductBySlug(productSlug);

  if (!product) {
    notFound();
  }

  const currentPrice = product.salePrice || product.basePrice;
  const hasDiscount = !!product.salePrice;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.basePrice - product.salePrice!) / product.basePrice) * 100,
      )
    : 0;

  // JSON-LD Offer Schema for price information
  const offerSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images && product.images.length > 0 ? product.images[0] : "",
    description: product.description,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      url: `https://valancis.com/product/${product.slug}`,
      priceCurrency: "BDT",
      price: currentPrice,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 30 days
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Valancis",
      },
    },
  };

  return (
    <>
      {/* Inject Offer Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offerSchema) }}
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb */}
        <Link
          href={`/product/${product.slug}`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Product Page
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {product.name} Price in Bangladesh
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Latest pricing information and availability for {product.name}
          </p>
        </div>

        {/* Main Price Card */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Product Image */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            {product.images && product.images.length > 0 && (
              <div className="relative aspect-square">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
          </div>

          {/* Price Information */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-8 border border-blue-200 dark:border-blue-800">
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Current Price in Bangladesh
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400">
                  ৳{currentPrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                    ৳{product.basePrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {hasDiscount && (
              <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <TrendingDown className="w-5 h-5" />
                  <span className="font-semibold">
                    Save ৳
                    {(product.basePrice - product.salePrice!).toLocaleString()}{" "}
                    ({discountPercent}% OFF)
                  </span>
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-3 h-3 rounded-full ${product.stock > 0 ? "bg-green-500" : "bg-red-500"}`}
                />
                <span className="font-medium text-gray-900 dark:text-white">
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>
              {product.stock > 0 && product.stock < 10 && (
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  Only {product.stock} units left!
                </p>
              )}
            </div>

            {/* CTA */}
            {product.stock > 0 && <AddToCartButton product={product} />}

            <Link href={`/product/${product.slug}`}>
              <Button variant="outline" className="w-full mt-3">
                View Full Details
              </Button>
            </Link>
          </div>
        </div>

        {/* Price Information Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Price Details
            </h2>
          </div>
          <div className="p-6">
            <table className="w-full">
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="py-3 text-gray-600 dark:text-gray-400">
                    Product Name
                  </td>
                  <td className="py-3 text-right font-medium text-gray-900 dark:text-white">
                    {product.name}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-600 dark:text-gray-400">
                    Current Price
                  </td>
                  <td className="py-3 text-right font-medium text-gray-900 dark:text-white">
                    BDT {currentPrice.toLocaleString()}
                  </td>
                </tr>
                {hasDiscount && (
                  <>
                    <tr>
                      <td className="py-3 text-gray-600 dark:text-gray-400">
                        Original Price
                      </td>
                      <td className="py-3 text-right text-gray-500 dark:text-gray-400 line-through">
                        BDT {product.basePrice.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-600 dark:text-gray-400">
                        Discount
                      </td>
                      <td className="py-3 text-right font-medium text-green-600 dark:text-green-400">
                        {discountPercent}% OFF
                      </td>
                    </tr>
                  </>
                )}
                <tr>
                  <td className="py-3 text-gray-600 dark:text-gray-400">
                    Availability
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`font-medium ${product.stock > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-600 dark:text-gray-400">SKU</td>
                  <td className="py-3 text-right font-mono text-sm text-gray-900 dark:text-white">
                    {product.sku}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                What is the current price of {product.name} in Bangladesh?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                The current price of {product.name} in Bangladesh is BDT{" "}
                {currentPrice.toLocaleString()}.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                Is {product.name} available in stock?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {product.stock > 0
                  ? `Yes, ${product.name} is currently in stock and ready to ship.`
                  : `Unfortunately, ${product.name} is currently out of stock. Check back soon for availability.`}
              </p>
            </div>
            {hasDiscount && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  Is there any discount on {product.name}?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes! Get {discountPercent}% OFF and save BDT{" "}
                  {(product.basePrice - product.salePrice!).toLocaleString()} on
                  your purchase.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
