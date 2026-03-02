import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProductBySlug, getProductReviews } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ShoppingBag, Ruler, Info } from "lucide-react";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { WishlistButton } from "@/components/common/WishlistButton";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductDescription } from "@/components/product/ProductDescription";
import ReviewList from "@/components/reviews/ReviewList";
import ReviewForm from "@/components/reviews/ReviewForm";
import { ProductSchema } from "@/components/seo/ProductSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { ProductInfo } from "@/components/product/ProductInfo";
import { BackButton } from "@/components/common/BackButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Product Not Found" };

  return {
    title: product.metaTitle || product.name,
    description:
      product.metaDescription || product.description.substring(0, 160),
    openGraph: {
      title: product.metaTitle || product.name,
      description:
        product.metaDescription || product.description.substring(0, 160),
      images:
        product.images && product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const reviews = await getProductReviews(product.id);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
  ];

  if (product.categories?.[0]) {
    breadcrumbs.push({
      name: product.categories[0].name,
      url: `/category/${product.categories[0].slug}`,
    });
  }

  breadcrumbs.push({
    name: product.name,
    url: `/product/${product.slug}`,
  });

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-16 md:pt-24 pb-20 md:pb-0">
      <ProductSchema
        product={product}
        rating={{ value: avgRating, count: reviews.length }}
      />
      <BreadcrumbSchema items={breadcrumbs} />
      <div className="hidden md:block max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 pt-4 pb-2">
        <BackButton />
      </div>

      {/* Mobile Back Button - Floating Top Left */}
      <div className="lg:hidden fixed top-20 left-6 z-[90]">
        <Link
          href="/shop"
          className="h-10 w-10 bg-white/60 backdrop-blur-md border border-gray-100 flex items-center justify-center rounded-none shadow-sm active:scale-90 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-900" strokeWidth={1.5} />
        </Link>
      </div>

      <div className="max-w-[1440px] mx-auto px-0 md:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-24">
        <div className="col-span-1">
          <ProductGallery images={product.images || []} />
        </div>
        <div className="col-span-1 px-6 md:px-0 pb-4 lg:pb-0">
          <ProductInfo product={product} />
        </div>
      </div>

      <ProductDescription product={product} />

      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 py-20 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-2xl lg:text-3xl mb-10 text-center text-gray-900">
            Customer Reviews
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h3 className="text-secondary uppercase text-xs tracking-widest mb-6 border-b border-gray-100 pb-2">
                Recent Feedback
              </h3>
              <ReviewList reviews={reviews} />
            </div>
            <div>
              <div className="sticky top-24">
                <ReviewForm productId={product.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
