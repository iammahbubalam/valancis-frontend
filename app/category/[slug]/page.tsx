import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getCategoryDetails, getAllCategoriesFlat } from "@/lib/api/categories";
import { getShopProducts, ShopParams } from "@/lib/api/shop";
import { Container } from "@/components/ui/Container";
import { CategoryHero } from "@/components/category/CategoryHero";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { ShopToolbar } from "@/components/shop/ShopToolbar";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Pagination } from "@/components/ui/Pagination";
import Link from "next/link";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ShopParams>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryDetails(slug);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: category.metaTitle || category.name,
    description:
      category.metaDescription ||
      `Shop the latest ${category.name} collection.`,
    openGraph: {
      images: category.image ? [category.image] : [],
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams
}: CategoryPageProps) {
  const [{ slug }, queryParams] = await Promise.all([params, searchParams]);

  // Merge the URL category slug with any category filters selected in the toolbar
  // In Category page, we strictly filter by the current category or its children
  // For simplicity, we'll ensure the current slug is always part of the filter
  const effectiveParams = {
    ...queryParams,
    category: queryParams.category || slug
  };

  const [category, allCategories, { products, pagination }] = await Promise.all([
    getCategoryDetails(slug),
    getAllCategoriesFlat(),
    getShopProducts(effectiveParams),
  ]);

  if (!category) {
    notFound();
  }

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: category.name, url: `/category/${category.slug}` },
  ];

  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbSchema items={breadcrumbs} />
      <CategoryHero category={category} productCount={pagination.total} />

      {/* Functional Toolbar */}
      <ShopToolbar
        categories={allCategories}
        totalProducts={pagination.total}
        breadcrumbLabel={category.name}
        isCategoryPage={true}
      />

      {/* Products Section */}
      <section className="py-12 md:py-20 lg:py-24">
        <Container>
          <Suspense fallback={<div className="h-96 animate-pulse bg-gray-50 rounded-lg" />}>
            {products.length > 0 ? (
              <>
                <ProductGrid products={products} />
                <div className="mt-12">
                  <Pagination totalPages={pagination.totalPages} />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-16 h-[1px] bg-black/10 mb-8" />
                <p className="text-secondary text-sm tracking-[0.2em] uppercase mb-4">
                  Selection Coming Soon
                </p>
                <p className="text-secondary/60 text-sm max-w-md font-light leading-relaxed">
                  We are curating specific pieces for this collection. Please
                  check back later or try adjusting your filters.
                </p>
                <Link
                  href={`/category/${slug}`}
                  className="mt-8 text-xs uppercase tracking-widest border-b border-primary pb-1 hover:border-accent-gold hover:text-accent-gold transition-all"
                >
                  Clear Filters
                </Link>
              </div>
            )}
          </Suspense>
        </Container>
      </section>
    </div>
  );
}
