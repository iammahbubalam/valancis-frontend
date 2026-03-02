import { getAllActiveCategories } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import Link from "next/link";
import Image from "next/image";
import { Category } from "@/types";

export const metadata = {
  title: "Categories | Valancis",
  description: "Explore our curated collections",
};

// Flatten categories for display
function flattenCategories(cats: Category[]): Category[] {
  let result: Category[] = [];
  for (const cat of cats) {
    result.push(cat);
    if (cat.children && cat.children.length > 0) {
      result = result.concat(flattenCategories(cat.children));
    }
  }
  return result;
}

export default async function CategoriesPage() {
  const categoryTree = await getAllActiveCategories();
  const categories = flattenCategories(categoryTree);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="pt-32 pb-20 text-center">
        <Container>
          <div className="w-12 h-[1px] bg-white/20 mx-auto mb-8" />
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white mb-6">
            Collections
          </h1>
          <p className="text-white/40 text-sm tracking-wide max-w-md mx-auto">
            Discover our curated selection of heritage craftsmanship
          </p>
          <div className="w-12 h-[1px] bg-white/20 mx-auto mt-8" />
        </Container>
      </section>

      {/* Categories Grid */}
      <section className="pb-32">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group relative aspect-[4/5] overflow-hidden bg-[#1a1a1a]"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {/* Background Image */}
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]" />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-white/40 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    Explore
                  </span>
                  <h2 className="font-serif text-2xl md:text-3xl text-white mb-2 group-hover:tracking-wider transition-all duration-500">
                    {category.name}
                  </h2>
                  <div className="w-0 group-hover:w-12 h-[1px] bg-white/50 transition-all duration-500 mt-4" />
                </div>

                {/* Corner Accents */}
                <div className="absolute top-4 left-4 w-4 h-4 border-l border-t border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-r border-b border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/30 text-sm tracking-widest uppercase">
                No collections available
              </p>
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}
