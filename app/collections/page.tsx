import { getCollections } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";

export const metadata = {
  title: "Collections | Valancis",
  description: "Curated edits of timeless elegance and heritage craftsmanship.",
};

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="bg-white min-h-screen pt-32 pb-32">
      <Container>
        {/* Editorial Header */}
        <div className="text-center max-w-3xl mx-auto mb-32 space-y-6">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
            Editorial
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-primary leading-[0.9]">
            The Collections
          </h1>
          <p className="text-secondary/70 font-light text-lg md:text-xl leading-relaxed max-w-xl mx-auto">
            Stories woven in thread. Explore our seasonal edits and timeless
            signatures.
          </p>
        </div>

        {/* Collections List - Alternating Layout */}
        <div className="flex flex-col gap-32">
          {collections.map((collection, index) => (
            <div
              key={collection.id}
              className={clsx(
                "group grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center",
                // Mobile: Stacked. Desktop: Alternating.
              )}
            >
              {/* Image Section - Spans 7 columns */}
              <Link
                href={`/collection/${collection.slug}`}
                className={clsx(
                  "relative block aspect-[3/4] lg:aspect-[4/5] overflow-hidden bg-canvas lg:col-span-7",
                  index % 2 === 1 ? "lg:order-last" : "lg:order-first",
                )}
              >
                {collection.image ? (
                  <Image
                    src={collection.image}
                    alt={collection.title}
                    fill
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-200 font-serif text-6xl bg-canvas">
                    {collection.title[0]}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
              </Link>

              {/* Content Section - Spans 5 columns */}
              <div
                className={clsx(
                  "flex flex-col space-y-8 lg:col-span-5 text-center",
                  index % 2 === 1
                    ? "lg:text-right lg:items-end"
                    : "lg:text-left lg:items-start",
                )}
              >
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-secondary/40 block">
                    Collection {2024 + index}
                  </span>
                  <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight group-hover:text-primary transition-colors duration-300">
                    <Link href={`/collection/${collection.slug}`}>
                      {collection.title}
                    </Link>
                  </h2>
                  <p className="text-primary/70 font-light leading-relaxed text-lg max-w-sm mx-auto lg:mx-0">
                    {collection.description}
                  </p>
                </div>

                <Link
                  href={`/collection/${collection.slug}`}
                  className="inline-flex items-center gap-4 text-xs uppercase tracking-widest text-primary hover:text-primary transition-all group/btn"
                >
                  <span className="border-b border-primary/30 pb-1 group-hover/btn:border-primary transition-colors">
                    Explore Configuration
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}

          {collections.length === 0 && (
            <div className="py-20 text-center border-t border-gray-100">
              <p className="text-primary/70 text-lg">No collections found.</p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
