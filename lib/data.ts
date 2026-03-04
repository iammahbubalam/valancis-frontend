import { Review } from "@/types";
import {
  GlobalSettings,
  AboutPage,
  PolicyPage,
  FAQPage,
} from "@/lib/content-types";

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price?: number;
  stock: number;
  options: { [key: string]: string };
}

export interface ProductSEO {
  title: string;
  description: string;
  keywords: string[];
}

export interface ProductMedia {
  id: string;
  type: "image" | "video";
  url: string;
  alt: string;
  isThumbnail?: boolean;
}

export interface ProductPricing {
  basePrice: number;
  salePrice?: number;
  currency: string;
}

export interface ProductInventory {
  stockLevel: number;
  lowStockThreshold: number;
  trackQuantity: boolean;
  status: "in_stock" | "out_of_stock";
}

export interface ProductDimensions {
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
}

import { Product, Category } from "@/types";

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  path?: string;
  children?: CategoryNode[];
  image?: string;
  icon?: string;
  orderIndex?: number;
  isActive?: boolean;
  showInNav?: boolean;
}

// --- MOCK CONSTANTS (STATIC DATA) ---

export const CATEGORY_TREE: CategoryNode[] = [
  {
    id: "c1",
    name: "Women",
    slug: "women",
    children: [
      {
        id: "c1-1",
        name: "Ethnic Wear",
        slug: "ethnic-wear",
        children: [
          { id: "c1-1-1", name: "Sarees (Katan)", slug: "sarees-katan" },
          { id: "c1-1-2", name: "Sarees (Jamdani)", slug: "sarees-jamdani" },
          { id: "c1-1-3", name: "Salwar Kameez", slug: "salwar-kameez" },
          { id: "c1-1-4", name: "Kurtis", slug: "kurtis" },
        ],
      },
      {
        id: "c1-2",
        name: "Fabrics",
        slug: "fabrics",
        children: [
          { id: "c1-2-1", name: "Unstitched", slug: "unstitched" },
          { id: "c1-2-2", name: "Silk", slug: "silk-fabric" },
        ],
      },
    ],
  },
  {
    id: "c2",
    name: "Collections",
    slug: "collections",
    children: [
      {
        id: "c2-1",
        name: "Eid 2026",
        slug: "eid-2026",
        path: "/collection/eid-2026",
      },
      {
        id: "c2-2",
        name: "Wedding Guest",
        slug: "wedding-guest",
        path: "/collection/wedding-guest",
      },
      {
        id: "c2-3",
        name: "Heritage",
        slug: "heritage",
        path: "/collection/heritage",
      },
    ],
  },
];

export interface HeroSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  // Advanced Styling
  alignment?: "left" | "center" | "right";
  textColor?: "white" | "black";
  overlayOpacity?: number; // 0 to 100
  // Button Config
  buttonText?: string;
  buttonLink?: string;
  buttonStyle?: "primary" | "outline" | "white";
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c",
    title: "Moonlit Silence",
    subtitle: "The Eid 2026 Edit",
    description:
      "In the stillness of the crescent moon, find the luxury of connection.",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b",
    title: "Legacy of Loom",
    subtitle: "The Eid Heritage Edit",
    description:
      "Celebrate the hands that weave history. Authentic Katan, Muslin, and Silk.",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1544441893-675973e31985",
    title: "Royal Weaves",
    subtitle: "Katan Collection",
    description: "The sheen of pure silk, the weight of gold zari.",
  },
];

export interface PhilosophyContent {
  tagline: string;
  headline: { line1: string; line2: string };
  paragraphs: string[];
  ctaText: string;
  image: string;
  imageAlt: string;
}

export const PHILOSOPHY_CONTENT: PhilosophyContent = {
  tagline: "The Artisan's Prayer",
  headline: {
    line1: "Celebration is found in",
    line2: "the details we share.",
  },
  paragraphs: [
    "Eid is more than a holiday; it is a return to what matters.",
    "Valancis weaves that thread back together.",
  ],
  ctaText: "Explore the Eid Edit",
  image: "",
  imageAlt: "Artisan hands weaving gold thread",
};

export interface EditorialContent {
  tagline: string;
  title: string;
  description: string;
  image: string;
}

export const EDITORIAL_CONTENT: EditorialContent = {
  tagline: "The Gathering",
  title: "Stitching Memories",
  description:
    "A tribute to the warmth of community. Our Heritage Collection is designed for the golden hours of reunion.",
  image: "",
};

export interface SiteConfig {
  name: string;
  description: string;
  logo: string;
  logoWhite: string;
  copyright: string;
  contact: { email: string; phone: string; address: string };
  socials: { platform: string; url: string }[];
  favicon?: string;
}

export const SITE_CONFIG: SiteConfig = {
  name: "Valancis",
  description:
    "Defining quiet luxury through texture, form, and timeless restraint.",
  logo: "/logo/logo-color.svg",
  logoWhite: "/logo/logo-white.svg",
  copyright: "© 2026 Valancis. All rights reserved.",
  contact: {
    email: "support@valancis.com",
    phone: "+1 (555) 000-0000",
    address: "123 Fashion Ave, New York, NY 10001",
  },
  socials: [
    { platform: "Instagram", url: "#" },
    { platform: "Pinterest", url: "#" },
    { platform: "Twitter", url: "#" },
  ],
};

export interface FooterLink {
  label: string;
  href: string;
}
export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: "Shop",
    links: [
      { label: "Ready to Wear", href: "/category/ready-to-wear" },
      { label: "Accessories", href: "/category/women-accessories" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Shipping & Returns", href: "/shipping" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

// Old Mock Collection Info removed

export interface FeaturedCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  size: "large" | "small";
}

export const FEATURED_CATEGORIES: FeaturedCategory[] = [
  {
    id: "fc1",
    name: "Katan Sarees",
    slug: "sarees-katan",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c",
    description: "The queen of silks. Woven for grandeur.",
    size: "large",
  },
  {
    id: "fc2",
    name: "Salwar Kameez",
    slug: "salwar-kameez",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b",
    size: "small",
  },
  {
    id: "fc3",
    name: "Designer Kurtis",
    slug: "kurtis",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985",
    size: "small",
  },
];

// --- BACKEND API INTEGRATION ---

export interface BackendProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  basePrice: number;
  salePrice?: number;
  stock: number;
  stockStatus: string;
  isFeatured: boolean;
  isPreorder?: boolean;
  preorderDepositAmount?: number;
  categories?: { id: string; name: string; slug: string }[];
  media: string[] | { images?: string[] }; // Backend can return either format
  variants?: any[]; // Allow any for now to avoid circular ref or complex mapping if strict
}

interface APIResponse<T> {
  data: T;
  pagination?: { total: number; page: number; limit: number };
}

export function mapBackendProductToFrontend(bp: BackendProduct): Product {
  // Handle both media formats: array or object
  let images: string[] = [];
  if (Array.isArray(bp.media)) {
    images = bp.media;
  } else if (bp.media?.images) {
    images = bp.media.images;
  }

  return {
    id: bp.id,
    name: bp.name,
    slug: bp.slug,
    sku: bp.sku || "N/A",
    categories: bp.categories || [],
    description: bp.description,
    isActive: true, // simplified
    basePrice: bp.basePrice,
    salePrice: bp.salePrice,
    stock: bp.stock,
    stockStatus: bp.stockStatus as any,
    images: images,
    isPreorder: bp.isPreorder,
    preorderDepositAmount: bp.preorderDepositAmount,
    lowStockThreshold: 5,
    variants: bp.variants || [], // Pass variants through
  };
}

import { getApiUrl } from "@/lib/utils";
import { Collection } from "@/types";

// Helper to smooth out loading
export async function delay(ms: number = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ... REAL API FUNCTIONS ...

/**
 * Enhanced fetch that includes a 5-second timeout.
 * This prevents the build process from hanging for 60 seconds (522 error) 
 * if the backend is sleeping or unreachable.
 */
async function safeFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 10000); // 10 second timeout for safety

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === "AbortError") {
      console.warn(`[DATA] Fetch timed out for: ${url}`);
    }
    throw error;
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const res = await safeFetch(getApiUrl("/products?limit=100"), {
      next: { revalidate: 60 * 60 }, // 1 hour for large dumps
    });
    if (!res.ok) throw new Error("Failed to fetch products");
    const json: APIResponse<BackendProduct[]> = await res.json();
    return json.data.map(mapBackendProductToFrontend);
  } catch (error) {
    console.error("Values fetch error:", error);
    console.error(
      "Attempted URL:",
      getApiUrl("/products?limit=100"),
    );
    return [];
  }
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  try {
    const res = await safeFetch(getApiUrl(`/products/${slug}`), {
      next: { revalidate: 60 },
    });
    if (!res.ok) return undefined;
    const json: BackendProduct = await res.json();
    return mapBackendProductToFrontend(json);
  } catch (error) {
    console.error("Product fetch error:", error);
    return undefined;
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  const products = await getAllProducts();
  if (!query) return [];
  const lowerQuery = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.categories.some((c) => c.name.toLowerCase().includes(lowerQuery)) ||
      p.description.toLowerCase().includes(lowerQuery),
  );
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    const res = await safeFetch(getApiUrl(`/products/${productId}/reviews`), {
      next: { revalidate: 60 * 5 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.reviews || [];
  } catch (error) {
    console.error("Reviews fetch error:", error);
    return [];
  }
}

// --- STATIC / HYBRID API FUNCTIONS ---

// --- CONTENT API FUNCTIONS ---

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const url = getApiUrl("/content/home_hero");
  try {
    const res = await safeFetch(url, {
      next: { revalidate: 300 }, // 5 mins
    });
    if (res.ok) {
      const data = await res.json();
      if (data.content && data.content.slides && data.content.slides.length > 0) {
        console.log(`[DATA] Fetched ${data.content.slides.length} hero slides`);
        return data.content.slides;
      }
      console.log(`[DATA] Hero slides API returned empty, using fallback`);
    } else {
      console.warn(`[DATA] Hero slides fetch failed with status ${res.status}`);
    }
  } catch (e) {
    console.error(`[DATA] Failed to fetch hero slides from ${url}`, e);
  }
  return HERO_SLIDES;
}

export async function getCategoryTree(): Promise<CategoryNode[]> {
  try {
    const res = await safeFetch(getApiUrl("/categories/tree"), {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        // Filter for navbar: only active AND showInNav categories
        const filterForNav = (cats: CategoryNode[]): CategoryNode[] => {
          return cats
            .filter((c) => c.isActive && c.showInNav)
            .map((c) => ({
              ...c,
              children: c.children ? filterForNav(c.children) : [],
            }));
        };
        return filterForNav(data);
      }
    }
  } catch (e) {
    console.error("Category Tree fetch failed", e);
  }

  // Fallback to Mock
  return CATEGORY_TREE;
}

// Get ALL active categories (not just showInNav) - for category listing pages
export async function getAllActiveCategories(): Promise<CategoryNode[]> {
  try {
    const res = await safeFetch(getApiUrl("/categories/tree"), {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        // Filter for active only (ignore showInNav)
        const filterActive = (cats: CategoryNode[]): CategoryNode[] => {
          return cats
            .filter((c) => c.isActive)
            .map((c) => ({
              ...c,
              children: c.children ? filterActive(c.children) : [],
            }));
        };
        return filterActive(data);
      }
    }
  } catch (e) {
    console.error("Category fetch failed", e);
  }
  return CATEGORY_TREE;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const url = getApiUrl("/products?is_featured=true&limit=50");
  try {
    const res = await safeFetch(url, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const json: APIResponse<BackendProduct[]> = await res.json();
    console.log(`[DATA] Fetched ${json.data?.length || 0} featured products`);
    return json.data.map(mapBackendProductToFrontend);
  } catch (error) {
    console.error(`[DATA] Featured products fetch error from ${url}:`, error);
    return [];
  }
}

export async function getPhilosophyContent(): Promise<PhilosophyContent> {
  await delay(200);
  return PHILOSOPHY_CONTENT;
}

export async function getEditorialContent(): Promise<EditorialContent> {
  await delay(200);
  return EDITORIAL_CONTENT;
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const globalSettings = await getGlobalSettings();

  if (globalSettings) {
    return {
      name: globalSettings.branding.siteName,
      description: globalSettings.branding.tagline,
      logo: globalSettings.branding.logoUrl || "/logo/logo-color.svg",
      logoWhite: "/logo/logo-white.svg",
      favicon: globalSettings.branding.faviconUrl || "/logo/logo-color.svg",
      copyright: `© ${new Date().getFullYear()} ${globalSettings.branding.siteName
        }. All rights reserved.`,
      contact: {
        email: globalSettings.contact.supportEmail,
        phone: globalSettings.contact.phonePrimary,
        address: `${globalSettings.contact.address.line1}, ${globalSettings.contact.address.city}`,
      },
      socials: [
        { platform: "Facebook", url: globalSettings.socials.facebook },
        { platform: "Instagram", url: globalSettings.socials.instagram },
        { platform: "TikTok", url: globalSettings.socials.tiktok },
        { platform: "YouTube", url: globalSettings.socials.youtube },
      ].filter((s) => s.url), // Only show active links
    };
  }

  // Fallback if backend is down/empty
  return SITE_CONFIG;
}

export async function getFooterSections(): Promise<FooterSection[]> {
  try {
    const res = await safeFetch(getApiUrl("/content/home_footer"), {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.content && Array.isArray(data.content.sections)) {
        return data.content.sections;
      }
    }
  } catch (e) {
    console.error("Failed to fetch footer sections", e);
  }
  return FOOTER_SECTIONS;
}

// Re-export Collection type or align with it
export type CollectionInfo = Collection;

export async function getCollectionInfo(
  slug: string,
): Promise<Collection | undefined> {
  try {
    const res = await safeFetch(getApiUrl(`/collections/${slug}`), {
      next: { revalidate: 300 },
    });
    if (!res.ok) return undefined;
    const collection: Collection = await res.json();
    return collection;
  } catch (error) {
    console.error("Failed to fetch collection", error);
    return undefined;
  }
}

export async function getCollections(): Promise<Collection[]> {
  const url = getApiUrl("/collections");
  try {
    const res = await safeFetch(url, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      console.warn(`[DATA] Collections fetch failed with status ${res.status}`);
      return [];
    }
    const collections: Collection[] = await res.json();
    console.log(`[DATA] Fetched ${collections?.length || 0} collections`);
    return collections;
  } catch (error) {
    console.error(`[DATA] Failed to fetch collections from ${url}:`, error);
    return [];
  }
}

export async function getProductsByCollection(
  slug: string,
): Promise<Product[]> {
  const collection = await getCollectionInfo(slug);
  if (!collection || !collection.products) return [];

  // Map backend products to frontend products if necessary
  // The backend `Collection` struct returns `[]Product`.
  // We might need to map them using `mapBackendProductToFrontend`.
  // But `mapBackendProductToFrontend` is local.
  // I should check if `collection.products` are `BackendProduct[]` or just IDs.
  // My backend logic Preloads `Products`.
  return collection.products.map((p: any) => mapBackendProductToFrontend(p));
}

// Helper to flatten tree
function flattenCategories(nodes: any[]): any[] {
  let flat: any[] = [];
  for (const node of nodes) {
    flat.push(node);
    if (node.children && node.children.length > 0) {
      flat = flat.concat(flattenCategories(node.children));
    }
  }
  return flat;
}

export async function getFeaturedCategories(): Promise<FeaturedCategory[]> {
  const url = getApiUrl("/categories");
  try {
    const res = await safeFetch(url, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const tree = await res.json();
      const allCategories = flattenCategories(tree);

      // Filter isFeatured
      const featured = allCategories.filter((c: any) => c.isFeatured === true);

      if (featured.length > 0) {
        console.log(`[DATA] Found ${featured.length} featured categories`);
        // Map to FeaturedCategory
        return featured.map((c: any, index: number) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          image:
            c.image ||
            "https://images.unsplash.com/photo-1579546929518-9e396f3cc809", // Fallback image
          description: c.metaDescription || "Shop now",
          size: index === 0 ? "large" : "small",
        }));
      }
      console.log("[DATA] No categories marked as featured, using fallback");
    } else {
      console.warn(`[DATA] Featured categories fetch failed with status ${res.status}`);
    }
  } catch (error) {
    console.error(`[DATA] Failed to fetch categories from ${url}:`, error);
  }
  // Fallback if no featured categories found
  return FEATURED_CATEGORIES;
}

// --- ORDER / FILTER METADATA (MOCKS FOR NOW) ---

export interface FilterMetadata {
  priceRange: { min: number; max: number };
  colors: string[];
  sizes: string[];
  categories: { slug: string; name: string; count: number }[];
}

export async function getFilterMetadata(
  categorySlug?: string,
): Promise<FilterMetadata> {
  await delay(300);
  return {
    priceRange: { min: 1500, max: 45000 },
    colors: [
      "Royal Blue",
      "Peach",
      "Emerald Green",
      "White",
      "Midnight Blue",
      "Gold",
    ],
    sizes: ["S", "M", "L", "XL", "Unstitched"],
    categories: [
      { slug: "sarees", name: "Sarees", count: 12 },
      { slug: "kurtis", name: "Kurtis", count: 8 },
      { slug: "salwar-kameez", name: "Salwar Kameez", count: 15 },
    ],
  };
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  status:
  | "pending_payment"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
  total: number;
  items: OrderItem[];
  paymentMethod: "cod" | "sslcommerz";
  trackingNumber?: string;
  timeline: { status: string; time: string; description: string }[];
}

const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-2025-8832",
    date: "2025-12-10T14:30:00Z",
    status: "delivered",
    total: 12500,
    paymentMethod: "cod",
    items: [
      {
        productId: "p1",
        name: "Royal Blue Katan Silk",
        quantity: 1,
        price: 12500,
        image: "",
      },
    ],
    timeline: [
      {
        status: "placed",
        time: "2025-12-10T14:30:00Z",
        description: "Order placed successfully",
      },
      {
        status: "delivered",
        time: "2025-12-12T11:00:00Z",
        description: "Package delivered",
      },
    ],
  },
];

export async function getUserOrders(): Promise<Order[]> {
  // TODO: Connect to GET /api/v1/orders when user auth is fully ready in frontend context
  await delay(500);
  return MOCK_ORDERS;
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  await delay(500);
  return MOCK_ORDERS.find((o) => o.id === id);
}

export async function subscribeToNewsletter(
  email: string,
): Promise<{ success: boolean; message: string }> {
  await delay(1000);
  return { success: true, message: "Welcome to the circle." };
}

export async function submitContactForm(
  data: any,
): Promise<{ success: boolean }> {
  await delay(1000);
  return { success: true };
}

// --- NEW PHASE 4 FETCHERS ---

export async function getGlobalSettings(): Promise<GlobalSettings | null> {
  try {
    const res = await safeFetch(getApiUrl("/content/settings_global"), {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      return data.content as GlobalSettings;
    }
  } catch (e) {
    console.error("Failed to fetch global settings", e);
  }
  return null;
}

export async function getAboutPage(): Promise<AboutPage | null> {
  try {
    const res = await safeFetch(getApiUrl("/content/content_about"), {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      return data.content as AboutPage;
    }
  } catch (e) {
    console.error("Failed to fetch about page", e);
  }
  return null;
}

export async function getPolicyPage(
  key: "policy_shipping" | "policy_return",
): Promise<PolicyPage | null> {
  try {
    const res = await safeFetch(getApiUrl(`/content/${key}`), {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      return data.content as PolicyPage;
    }
  } catch (e) {
    console.error(`Failed to fetch policy ${key}`, e);
  }
  return null;
}

export async function getFAQ(): Promise<FAQPage | null> {
  try {
    const res = await safeFetch(getApiUrl("/content/content_faq"), {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      return data.content as FAQPage;
    }
  } catch (e) {
    console.error("Failed to fetch FAQ", e);
  }
  return null;
}
