// AI/SEO Optimization Types
export interface ProductSpecs {
  [key: string]: string; // e.g., { "RAM": "8GB", "Storage": "128GB", "Battery": "5000mAh" }
}

export interface ProductFAQ {
  question: string;
  answer: string;
}

export interface ProductVerdict {
  summary: string; // Main verdict statement
  pros: string[]; // List of advantages
  cons: string[]; // List of disadvantages
  rating?: number; // Optional 1-5 rating
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface VariantWithProduct extends Variant {
  productName: string;
  productSlug: string;
  productBasePrice: number;
  productImage?: string;
}

// Analytics/Stats Types
export interface DailySalesStat {
  date: string;
  order_count: number;
  total_revenue: number;
  avg_order_value: number;
}

export interface RevenueKPIs {
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  unique_customers: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  slug: string;
  stock: number;
  base_price: number;
  sale_price?: number;
  sku: string;
  media?: any;
  stock_status: string;
}

export interface TopSellingProduct {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  sale_price?: number;
  media?: any;
  total_sold: number;
  total_revenue: number;
}

export interface TopCustomer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  total_orders: number;
  lifetime_value: number;
}

export interface CustomerRetention {
  new_customers: number;
  returning_customers: number;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  outOfStock: number;
  lowStock: number;
  totalInventoryValue: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  children?: Category[];
  orderIndex?: number;
  icon?: string;
  image?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  showInNav?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  path?: string;
}

export interface Collection {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  story: string;
  isActive: boolean;
  products?: Product[];
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogImage?: string;
}

export interface Variant {
  id: string;
  productId: string;
  name: string;
  stock: number;
  sku: string;
  // L9 Fields
  attributes: Record<string, string>; // e.g., { Color: "Red", Size: "XL" }
  price?: number; // Override base price
  salePrice?: number;
  images: string[];
  weight?: number;
  dimensions?: { l: number; w: number; h: number };
  barcode?: string;
  lowStockThreshold: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string; // Added for SEO/Schema
  description: string;
  basePrice: number;
  salePrice?: number;
  stock: number; // Added for checkout validation
  lowStockThreshold?: number;
  stockStatus: "in_stock" | "out_of_stock" | "pre_order";
  images: string[];
  categories: Category[];
  collections?: Collection[];
  isActive: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  createdAt?: string;
  updatedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogImage?: string;
  variants?: Variant[];
  // AI/SEO Optimization fields
  specs?: ProductSpecs;
  faqs?: ProductFAQ[];
  verdict?: ProductVerdict;
  // L9 Fields
  brand?: string;
  tags?: string[];
  warrantyInfo?: any;
}

export interface InventoryLog {
  id: number;
  productId: string;
  variantId?: string;
  changeAmount: number;
  reason: string;
  referenceId: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Order {
  id: string;
  status:
  | "pending"
  | "pending_verification" // Add missing status
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";
  totalAmount: number;
  paidAmount: number;
  refundedAmount?: number;
  shippingCost?: number;
  discount?: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentDetails?: any;
  createdAt: string;
  updatedAt?: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address: string;
    thana?: string;
    district?: string;
    division?: string;
    zip?: string;
    deliveryLocation?: string;
    avatar?: string;
  };
  items: {
    productName: string;
    quantity: number;
    price: number;
    variant?: string;
    product?: {
      name: string;
      images: string[];
    };
  }[];
}
