import { Category } from "@/types";

export interface Breadcrumb {
  name: string;
  slug: string;
  href: string;
}

export interface FlatCategory extends Omit<Category, 'path'> {
  depth: number;
  path: string[];
}

/**
 * Find a category by slug in a tree structure
 */
export function findCategoryBySlug(
  slug: string,
  tree: Category[]
): Category | null {
  for (const category of tree) {
    if (category.slug === slug) return category;
    if (category.children?.length) {
      const found = findCategoryBySlug(slug, category.children);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Build breadcrumb navigation from root to target category
 */
export function buildBreadcrumbs(
  categoryId: string,
  tree: Category[]
): Breadcrumb[] {
  const path: Category[] = [];
  
  function findPath(nodes: Category[], target: string, currentPath: Category[]): boolean {
    for (const node of nodes) {
      const newPath = [...currentPath, node];
      if (node.id === target) {
        path.push(...newPath);
        return true;
      }
      if (node.children?.length && findPath(node.children, target, newPath)) {
        return true;
      }
    }
    return false;
  }
  
  findPath(tree, categoryId, []);
  
  return path.map(cat => ({
    name: cat.name,
    slug: cat.slug,
    href: `/category/${cat.slug}`
  }));
}

/**
 * Flatten category tree into a linear array with depth information
 */
export function flattenCategoryTree(tree: Category[], depth = 0, parentPath: string[] = []): FlatCategory[] {
  const result: FlatCategory[] = [];
  
  for (const category of tree) {
    const currentPath = [...parentPath, category.id];
    result.push({
      ...category,
      depth,
      path: currentPath
    });
    
    if (category.children?.length) {
      result.push(...flattenCategoryTree(category.children, depth + 1, currentPath));
    }
  }
  
  return result;
}

/**
 * Get the full hierarchical path of category IDs from root to target
 */
export function getCategoryPath(categoryId: string, tree: Category[]): string[] {
  const path: string[] = [];
  
  function findPath(nodes: Category[], target: string, currentPath: string[]): boolean {
    for (const node of nodes) {
      const newPath = [...currentPath, node.id];
      if (node.id === target) {
        path.push(...newPath);
        return true;
      }
      if (node.children?.length && findPath(node.children, target, newPath)) {
        return true;
      }
    }
    return false;
  }
  
  findPath(tree, categoryId, []);
  return path;
}

/**
 * Count total products in a category including subcategories
 */
export function countCategoryProducts(category: Category): number {
  // This would need to be implemented based on your product data structure
  // For now, returning 0 as placeholder
  return 0;
}
