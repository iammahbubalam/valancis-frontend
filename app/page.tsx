import { HeroCinematic } from "@/components/home/HeroCinematic";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { MasonryCategories } from "@/components/home/MasonryCategories";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";

import {
  getFeaturedProducts,
  getFeaturedCategories,
  getHeroSlides,
  getCollections,
} from "@/lib/data";

export default async function Home() {
  console.log("Rendering Home Page (Server)");

  // Parallel Data Fetching
  const [slides, products, categories, collections] = await Promise.all([
    getHeroSlides(),
    getFeaturedProducts(),
    getFeaturedCategories(),
    getCollections(),
  ]);

  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      {/* SECTION 1: Hero Slider (includes announcement ticker) */}
      <HeroCinematic slides={slides} />

      {/* SECTION 2: Shop by Category */}
      <MasonryCategories categories={categories} />

      {/* SECTION 3: Featured Collections */}
      <FeaturedCollections collections={collections} />

      {/* SECTION 4: New Arrivals / Featured Products */}
      <FeaturedProducts products={products} />
    </div>
  );
}
