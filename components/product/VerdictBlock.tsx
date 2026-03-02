"use client";

import { Star } from "lucide-react";
import { ProductVerdict } from "@/types";

interface VerdictBlockProps {
  verdict: ProductVerdict;
  productName: string;
  productUrl: string;
}

/**
 * VerdictBlock - "The Answer Key" component
 *
 * AI-optimized editorial verdict with JSON-LD Review schema for:
 * - Google Featured Snippets
 * - AI search engines (ChatGPT, Perplexity)
 * - Rich results in SERPs
 */
export function VerdictBlock({
  verdict,
  productName,
  productUrl,
}: VerdictBlockProps) {
  // L9: Validate required fields
  if (!verdict.summary || verdict.pros.length === 0) {
    return null; // Don't render incomplete verdicts
  }

  const rating = verdict.rating ?? 4.0; // Default rating if not provided

  // JSON-LD Review Schema for AI crawlers
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Product",
      name: productName,
      url: productUrl,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: rating,
      bestRating: 5,
      worstRating: 1,
    },
    author: {
      "@type": "Organization",
      name: "Valancis Editorial Team",
    },
    reviewBody: verdict.summary,
    positiveNotes: {
      "@type": "ItemList",
      itemListElement: verdict.pros.map((pro, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: pro,
      })),
    },
    negativeNotes:
      verdict.cons.length > 0
        ? {
            "@type": "ItemList",
            itemListElement: verdict.cons.map((con, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: con,
            })),
          }
        : undefined,
  };

  return (
    <>
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
      />

      {/* Visual Component */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 my-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              />
            ))}
          </div>
          <span className="font-semibold text-blue-900 dark:text-blue-100">
            {rating.toFixed(1)}/5.0
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          Editorial Verdict
        </h3>

        <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6 font-medium">
          {verdict.summary}
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Pros */}
          <div>
            <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
              <span className="text-xl">✓</span> Pros
            </h4>
            <ul className="space-y-1.5">
              {verdict.pros.map((pro, i) => (
                <li
                  key={i}
                  className="text-sm text-gray-700 dark:text-gray-300 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-green-600"
                >
                  {pro}
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          {verdict.cons.length > 0 && (
            <div>
              <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                <span className="text-xl">✗</span> Cons
              </h4>
              <ul className="space-y-1.5">
                {verdict.cons.map((con, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-700 dark:text-gray-300 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-red-600"
                  >
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
          <p className="text-xs text-primary/60 dark:text-primary/50 italic">
            {" "}
            By Valancis Editorial Team
          </p>
        </div>
      </div>
    </>
  );
}
