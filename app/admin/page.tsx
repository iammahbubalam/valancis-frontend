import Link from "next/link";
import { getApiUrl } from "@/lib/utils";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // Calculate date range for KPIs (Last 30 Days)
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const start = formatDate(thirtyDaysAgo);
  const end = formatDate(today);

  // Parallel data fetching
  const stats = {
    products: 0,
    orders: 0,
    revenue: 0,
  };

  try {
    const [prodRes, kpiRes] = await Promise.all([
      fetch(getApiUrl("/products?limit=1"), {
        cache: "no-store",
      }),
      fetch(getApiUrl(`/admin/stats/kpis?start=${start}&end=${end}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }),
    ]);

    if (prodRes.ok) {
      const data = await prodRes.json();
      stats.products = data.pagination?.total || data.meta?.total || 0;
    }

    if (kpiRes.ok) {
      const data = await kpiRes.json();
      stats.orders = Number(data.total_orders) || 0;
      stats.revenue = Number(data.total_revenue) || 0;
    }
  } catch (e) {
    console.error("Dashboard fetch error:", e);
    // Defaults are already 0
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-serif font-bold mb-8">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="text-6xl font-serif">O</span>
          </div>
          <h3 className="text-sm uppercase tracking-wide text-secondary mb-2">
            Total Orders (30d)
          </h3>
          <p className="text-3xl font-bold">{stats.orders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="text-6xl font-serif">R</span>
          </div>
          <h3 className="text-sm uppercase tracking-wide text-secondary mb-2">
            Total Revenue (30d)
          </h3>
          <p className="text-3xl font-bold">
            BDT {stats.revenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="text-6xl font-serif">P</span>
          </div>
          <h3 className="text-sm uppercase tracking-wide text-secondary mb-2">
            Active Products
          </h3>
          <p className="text-3xl font-bold">{stats.products}</p>
          <span className="text-xs text-secondary">In stock inventory</span>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
        <p className="text-secondary mb-4">
          You are ready to start managing your store.
        </p>
        <div className="flex gap-4">
          <Link
            href="/admin/products"
            className="px-6 py-2 bg-primary text-white text-sm font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors rounded-sm"
          >
            Manage Products
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 border border-primary text-primary text-sm font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-colors rounded-sm"
          >
            View Live Store
          </a>
        </div>
      </div>
    </div>
  );
}
