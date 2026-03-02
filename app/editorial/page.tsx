import { getEditorialContent } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import Image from "next/image";
import { MoveRight } from "lucide-react";

export const metadata = {
  title: "The Atelier | Valancis Editorial",
  description: "Stories of heritage, craft, and the quiet luxury of Bengal.",
};

export default async function EditorialPage() {
  const content = await getEditorialContent();

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Magazine Header */}
      <div className="pt-32 pb-16 md:pt-48 md:pb-24 text-center px-6">
        <span className="inline-block text-accent-gold text-xs font-semibold uppercase tracking-[0.4em] mb-6">
          {content.tagline || "The Atelier"}
        </span>
        <h1 className="font-serif text-5xl md:text-8xl tracking-tight mb-8 max-w-5xl mx-auto leading-[0.9]">
          {content.title}
        </h1>
        <p className="text-lg md:text-2xl font-light text-neutral-500 max-w-2xl mx-auto leading-relaxed antialiased">
          {content.description}
        </p>
      </div>

      {/* Cinematic Visual - Conditional Render */}
      {content.image ? (
        <div className="w-full h-[60vh] md:h-[80vh] relative overflow-hidden group">
          <Image
            src={content.image}
            alt={content.title}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>
      ) : (
        /* Fallback Visual - Elegant Spacer */
        <div className="w-full h-[10vh] md:h-[20vh] flex items-center justify-center">
          <div className="h-px w-24 bg-neutral-200" />
        </div>
      )}

      {/* Editorial Content - Two Column Layout */}
      <Container className="py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">

          {/* Column 1: The Philosophy with Drop Cap */}
          <div className="md:col-span-7 space-y-8">
            <h2 className="font-serif text-3xl md:text-4xl mb-6 text-neutral-900">
              The Craft of Silence
            </h2>
            <div className="prose prose-lg prose-neutral font-light text-neutral-600 leading-loose">
              <p>
                <span className="float-left text-7xl font-serif pr-4 leading-[0.8] text-neutral-900">E</span>
                very thread tells a story of patience. In a world of instant gratification, we consciously choose the slow path. Our artisans spend weeks, sometimes months, on a single piece, ensuring that the legacy of Bengal's weaving heritage is preserved in every knot.
              </p>
              <p>
                We believe that true luxury is not about excess, but about the absence of it. It is the quiet confidence of a Jamdani motif, the weightless embrace of Muslin, and the structure of Katan silk that speaks without shouting.
              </p>
            </div>
          </div>

          {/* Column 2: Sticky Side Note */}
          <div className="md:col-span-5 relative">
            <div className="sticky top-32 p-8 bg-neutral-50 border border-neutral-100">
              <span className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
                The Promise
              </span>
              <h3 className="font-serif text-2xl mb-4 text-neutral-800">
                Heirlooms for Tomorrow
              </h3>
              <p className="text-neutral-600 font-light mb-8 leading-relaxed">
                A Valancis piece is designed to be an heirloom, passed down through generations, carrying with it the memories of the celebrations it witnessed.
              </p>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-neutral-900 group cursor-pointer hover:text-accent-gold transition-colors">
                Discover Collections <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

        </div>
      </Container>
    </div>
  );
}
