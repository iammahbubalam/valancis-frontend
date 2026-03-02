import { Product } from "@/types";
import { getApiUrl } from "@/lib/utils";

export interface ShopParams {
  page?: number;
  limit?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "name";
  category?: string; // comma-separated slugs for multi-select
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  view?: "grid" | "lookbook";
}

export interface ShopResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function getShopProducts(
  params: ShopParams,
): Promise<ShopResponse> {
  // BFF Pattern: Fetch ALL products and filter/sort in Next.js Server
  // This bypasses the backend's missing filter logic

  try {
    const searchParams = new URLSearchParams();
    searchParams.set("limit", "500"); // Fetch all for filtering
    searchParams.set("page", "1");

    // OPTIMIZATION: Cache this heavy fetch for 60 seconds
    const res = await fetch(getApiUrl(`/products?${searchParams.toString()}`), {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error("Backend fetch failed");
    }

    const data = await res.json();
    let products: Product[] = data.data || [];

    // --- 1. FILTERING ---

    // Category (Multi-Select via comma)
    if (params.category) {
      const selectedSlugs = params.category.split(",");
      products = products.filter((p) =>
        p.categories?.some((c) => selectedSlugs.includes(c.slug)),
      );
    }

    // Price Range
    if (params.minPrice !== undefined) {
      products = products.filter((p) => p.basePrice >= params.minPrice!);
    }
    if (params.maxPrice !== undefined) {
      products = products.filter((p) => p.basePrice <= params.maxPrice!);
    }

    // Stock
    if (params.inStock) {
      products = products.filter((p) => p.stock > 0);
    }

    // Search
    if (params.search) {
      const q = params.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      );
    }

    // --- 2. SORTING ---
    const sortMode = params.sort || "newest";
    products.sort((a, b) => {
      switch (sortMode) {
        case "price_asc":
          return getPrice(a) - getPrice(b);
        case "price_desc":
          return getPrice(b) - getPrice(a);
        case "name":
          return a.name.localeCompare(b.name);
        case "newest":
        default:
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
      }
    });

    // --- 3. PAGINATION ---
    const page = params.page || 1;
    const limit = params.limit || 12;
    const startIndex = (page - 1) * limit;
    const paginatedProducts = products.slice(startIndex, startIndex + limit);

    return {
      products: paginatedProducts,
      pagination: {
        total: products.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(products.length / limit),
      },
    };
  } catch (error) {
    console.error("Shop API Error:", error);
    return {
      products: [],
      pagination: { total: 0, page: 1, limit: 12, totalPages: 0 },
    };
  }
}

// Helper to get effective price for sorting
function getPrice(p: Product): number {
  return p.salePrice && p.salePrice < p.basePrice ? p.salePrice : p.basePrice;
}

export async function getProductById(id: string): Promise<Product | null> {
  // Use the dedicated endpoint for single product fetch
  // This bypasses the search/filter limit of 500 items
  try {
    const res = await fetch(getApiUrl(`/product/${id}`), {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.warn(`Product fetch failed: ${id} - ${res.statusText}`);
      return null;
    }

    // Backend returns the product object directly, not wrapped in { data: ... }
    const product: Product = await res.json();
    return product;
  } catch (error) {
    console.error("GetProductById Error:", error);
    return null;
  }
}
