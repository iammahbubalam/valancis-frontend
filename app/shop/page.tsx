import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { getAllCategoriesFlat } from "@/lib/api/categories";
import { getShopProducts, ShopParams } from "@/lib/api/shop";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Pagination } from "@/components/ui/Pagination";
import { LookbookGrid } from "@/components/shop/LookbookGrid";
import { ShopToolbar } from "@/components/shop/ShopToolbar";
import Link from "next/link";

export const metadata = {
  title: "Shop All | Valancis",
  description: "Explore our complete collection of heritage craftsmanship.",
};

interface ShopPageProps {
  searchParams: Promise<ShopParams>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  const [categories, { products, pagination }] = await Promise.all([
    getAllCategoriesFlat(),
    getShopProducts(params),
  ]);

  const isLookbookView = params.view === "lookbook";

  return (
    <div className="min-h-screen bg-white">
      {/* Hero with Left-Aligned Content */}
      <section className="relative h-[35vh] min-h-[280px] max-h-[400px] overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-right bg-no-repeat"
          style={{
            backgroundImage: `url('/images/shop-hero.png')`,
          }}
        />
        {/* Strong Left Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />

        {/* Content - Left Aligned */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
            <div className="max-w-md">
              <span className="inline-block text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-3 font-semibold">
                Curated Collection
              </span>
              <h1 className="font-serif text-4xl md:text-5xl text-white mb-3 leading-[1.1]">
                Shop All
              </h1>
              <p className="text-white/60 text-sm leading-relaxed">
                Explore our complete heritage collection.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ShopToolbar categories={categories} totalProducts={pagination.total} />

      <Container className="py-12 md:py-16">
        {/* Product Grid or Lookbook Grid */}
        <Suspense
          fallback={
            <div className="h-96 animate-pulse bg-canvas rounded-lg" />
          }
        >
          {products.length > 0 ? (
            isLookbookView ? (
              <LookbookGrid products={products} />
            ) : (
              <ProductGrid products={products} />
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-16 h-[1px] bg-black/10 mb-8" />
              <p className="text-primary/70 text-sm tracking-[0.2em] uppercase mb-4">
                No Products Found
              </p>
              <p className="text-secondary/60 text-sm max-w-md font-light leading-relaxed">
                Try adjusting your filters or check back later for new arrivals.
              </p>
              <Link
                href="/shop"
                className="mt-8 text-xs uppercase tracking-widest border-b border-primary pb-1 hover:border-primary hover:text-primary transition-all"
              >
                Clear Filters
              </Link>
            </div>
          )}
        </Suspense>

        <div className="mt-12">
          <Pagination totalPages={pagination.totalPages} />
        </div>
      </Container>
    </div>
  );
}
