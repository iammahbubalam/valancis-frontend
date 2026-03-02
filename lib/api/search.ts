import { getApiUrl } from "@/lib/utils";

export interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  basePrice: number;
  salePrice?: number | null;
  stock: number;
  stockStatus: string;
  images: string[] | null;
  isFeatured: boolean;
  isActive: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface SearchResponse {
  success: boolean;
  data: SearchProduct[];
  meta: Pagination;
}

export const searchAPI = {
  search: async (
    query: string,
    page = 1,
    limit = 20,
  ): Promise<SearchResponse> => {
    try {
      const res = await fetch(
        getApiUrl(
          `/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
        ),
        { cache: "no-store" }, // Dynamic search
      );
      if (!res.ok) throw new Error("Search failed");
      const result: SearchResponse = await res.json();
      return result;
    } catch (error) {
      console.error("Search API error:", error);
      throw error;
    }
  },
};
