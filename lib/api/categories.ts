import { Category, Product } from "@/types";
import { getApiUrl } from "@/lib/utils";
import { mapBackendProductToFrontend, BackendProduct } from "@/lib/data";

// Types for Filters
export interface ProductFilters {
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "popular";
}

/**
 * Server Data Access Layer for Categories
 * Uses native fetch with caching for performance
 */

// 1. Get All Categories (Flat)
// Cache: 1 hour (3600s)
export async function getAllCategoriesFlat(): Promise<Category[]> {
  try {
    const res = await fetch(getApiUrl("/categories/tree"), {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const tree: Category[] = await res.json();
      return flattenCategoryTree(tree);
    }
    return [];
  } catch (error) {
    console.error("DAL Error [getAllCategoriesFlat]:", error);
    return [];
  }
}

// 2. Get Products by Category Slug
// Cache: No Store (Filtering is dynamic)
export async function getCategoryProducts(
  slug: string,
  filters?: ProductFilters,
): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    // Match backend key: category_slug
    params.set("category_slug", slug);

    if (filters?.minPrice) params.set("min_price", filters.minPrice.toString());
    if (filters?.maxPrice) params.set("max_price", filters.maxPrice.toString());
    if (filters?.inStock !== undefined)
      params.set("in_stock", filters.inStock.toString());
    if (filters?.sort) params.set("sort", filters.sort);

    const res = await fetch(getApiUrl(`/products?${params.toString()}`), {
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      // Backend returns { data: products[], pagination: ... }
      const products: BackendProduct[] = json.data || [];
      return products.map(mapBackendProductToFrontend);
    }
    return [];
  } catch (error) {
    console.error(`DAL Error [getCategoryProducts] for ${slug}:`, error);
    return [];
  }
}

// 3. Get Single Category Details (Metadata)
// Cache: 1 hour
export async function getCategoryDetails(
  slug: string,
): Promise<Category | null> {
  // Since we don't have a direct /categories/:slug endpoint in the mock description,
  // we fetch the tree and find it. Ideally, backend provides this.
  const all = await getAllCategoriesFlat();
  return all.find((c) => c.slug === slug) || null;
}

// Helper: Flatten Tree
function flattenCategoryTree(nodes: Category[]): Category[] {
  return nodes.reduce((acc, node) => {
    acc.push(node);
    if (node.children?.length) {
      acc.push(...flattenCategoryTree(node.children));
    }
    return acc;
  }, [] as Category[]);
}
