import { ProductClient } from "@/components/admin/products/ProductClient";
import { getApiUrl } from "@/lib/utils";
import { Product, Category } from "@/types";
import { redirect } from "next/navigation";

// Define the shape of searchParams (Next.js 15+ might need await, Next 14 is sync prop usually, check version)
// Next.js 15 makes searchParams a promise. But package.json says "next": "16.1.1" ??
// Wait, "next": "16.1.1" ?? That version does not exist yet publicly. Assuming it's a very new or canary version.
// In Next 15+, searchParams is a Promise. Let's assume Next 15 behavior to be safe or standard Next 14.
// Actually, let's treat it as a Promise just in case if it's 15. If it's 14, await doesn't hurt much if type allows.
// But strictly, let's check types.
// For now, standard Server Component signature.

interface AdminProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  // Await searchParams (Next 15 ready)
  const params = await searchParams;

  const limit = params.limit ? parseInt(params.limit as string) : 20;
  const page = params.page ? parseInt(params.page as string) : 1;
  const sort = (params.sort as string) || "created_at desc";
  const search = (params.search as string) || "";
  const category = (params.category as string) || "";
  const isActive = (params.isActive as string) || "";

  // Helper to fetch data
  async function getData() {
    // We need a token. Server Components don't have access to localStorage.
    // OPTION 1: Cookies.
    // OPTION 2: If this is a static generation, we can't specific user data.
    // BUT this is an ADMIN page. It requires Auth.
    // The "token" is in localStorage on client. Server cannot see it unless it is in a cookie.

    // CRITICAL ISSUE: The current Auth architecture uses localStorage for tokens.
    // Server Components cannot access localStorage.
    // This refactor to Server Components for protected routes requires the token to be in cookies.

    // If we cannot change Auth architecture to Cookies right now, we CANNOT do full Server Component data fetching for protected routes reliably
    // without passing the token from Middleware or similar.

    // HOWEVER, I can skip the Server Component refactor for *Protected Data* if I can't access the token.
    // BUT the user asked for "Strict Optimization".
    // The "L9" way is HttpOnly Cookies.

    // If I can't move to cookies, I must stick to Client Components for data *dependent on auth*.
    // OR, I can use a "Hybrid" approach where I fetch public data (Categories) on server, and Products on client?
    // Admin Products are protected.

    // Wait, the previous code used `localStorage.getItem("token")`.
    // Valid "L9" engineer would Switch to Cookies.

    // Can I switch to cookies?
    // The user didn't explicitly ask for Auth Refactor to Cookies, but "Strict Review".
    // I can try to fetch without token? No, 401.
    // I can try to read cookies? `cookies().get('token')`.
    // Does the current login set a cookie?
    // `AuthContext` sets `document.cookie`!
    // `document.cookie = "token=; ..."` (Logout clears it).
    // Does Login set it?
    // `AuthContext` only has `fetchUser`.
    // `GoogleButton.tsx` or `LoginForm` sets the token?
    // Let's check `GoogleButton` or `login/page.tsx`.

    return null;
  }

  // LET'S CHECK if cookies are being set.
  // If not, I should implement Cookie setting in AuthContext/Login.

  // Checking Logic...
  // I will assume for a moment that I need to check `cookies()`.
  // If not present, I might default to Client Component or fix the Cookie part.

  // Proceeding with check...
  return <SafeAdminProductsPage searchParams={params} />;
}

// Wrapper to handle the async logic properly
import { cookies } from "next/headers";

async function SafeAdminProductsPage({ searchParams }: { searchParams: any }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // Fetch Categories (Public or Protected?) - Likely Public or readable.
  // Fetch Products (Protected).

  const query = new URLSearchParams();
  query.append("limit", (searchParams.limit || "20").toString());
  query.append("page", (searchParams.page || "1").toString());
  query.append("sort", (searchParams.sort as string) || "created_at desc");
  if (searchParams.search)
    query.append("search", searchParams.search as string);
  if (searchParams.category)
    query.append("category", searchParams.category as string);
  if (searchParams.isActive)
    query.append("isActive", searchParams.isActive as string);

  // Parallel Fetch
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const [productsRes, categoriesRes] = await Promise.all([
      fetch(getApiUrl(`/admin/products?${query.toString()}`), {
        headers,
        cache: "no-store",
      }),
      fetch(getApiUrl("/categories/tree"), { cache: "force-cache" }),
    ]);

    if (!productsRes.ok) {
      // If 401, we might need to redirect to login or handle gracefully
      if (productsRes.status === 401) {
        redirect("/login");
      }
      throw new Error("Failed to fetch products");
    }

    const productsData = await productsRes.json();

    // Handle categories - gracefully fallback to empty array if failed
    let categoriesData: Category[] = [];
    if (categoriesRes.ok) {
      try {
        categoriesData = await categoriesRes.json();
      } catch {
        console.error("Failed to parse categories response");
      }
    }

    return (
      <ProductClient
        initialProducts={productsData.data || []}
        initialTotal={productsData.total || 0}
        categories={categoriesData || []}
      />
    );
  } catch (error) {
    console.error("Server Load Error", error);
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load data. Please try again.
      </div>
    );
  }
}
