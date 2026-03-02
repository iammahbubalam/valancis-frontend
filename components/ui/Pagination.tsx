"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface PaginationProps {
  totalPages: number;
}

export function Pagination({ totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handlePageChange = (page: number) => {
    router.push(createPageURL(page));
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-16 pb-8">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 border border-black/10 hover:border-black/50 disabled:opacity-30 disabled:hover:border-black/10 transition-colors"
        aria-label="Previous Page"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Simplified Page Numbers: Show current, match Amazon/International style */}
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          // Simple logic: If total < 5, show all.
          // Real robust logic would involve elipses, but usually overkill for MVP unless specifically requested.
          // Let's implement a standard "sliding window" if needed, but keeping it simple and visually clean is better for luxury.
          // Adjust logic to be safe:

          let p = i + 1;
          if (totalPages > 5) {
            // If we are far in, shift the window.
            // This is a simple implementation. For "Amazon Grade" usually we want [1] ... [4] [5] [6] ... [Last]
            // Let's stick to a robust simple list for now or just generic numbers if totalPages is small.
            // If pages > 5, this simple loop is insufficient.
            // Let's revert to a simpler "Page X of Y" or just Prev/Next if complex.
            // But valid pagination is requested.

            // Dynamic Window Logic
            if (currentPage > 3) {
              p = currentPage - 2 + i;
            }
            if (p > totalPages) return null;
          }

          if (p > totalPages) return null;

          return (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={clsx(
                "w-10 h-10 text-sm font-medium transition-colors border",
                currentPage === p
                  ? "bg-black text-white border-black"
                  : "bg-transparent text-black border-transparent hover:border-black/20",
              )}
            >
              {p}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 border border-black/10 hover:border-black/50 disabled:opacity-30 disabled:hover:border-black/10 transition-colors"
        aria-label="Next Page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
