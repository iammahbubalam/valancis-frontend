"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  FolderTree,
  Layers,
  ClipboardList,
  FileText,
  ExternalLink,
  TicketPercent,
  BarChart3,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Hydration-safe: wait for client mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Admin Guard
  useEffect(() => {
    if (isMounted && !isLoading) {
      if (!user || user.role !== "admin") {
        router.push("/"); // Redirect non-admins to home
      }
    }
  }, [user, isLoading, router, isMounted]);

  // Consistent SSR/CSR: Always render null until mounted
  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Admin...
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  const navItems = [
    { label: "Overview", icon: LayoutDashboard, href: "/admin" },
    { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
    { label: "Products", icon: Package, href: "/admin/products" },
    { label: "Inventory", icon: ClipboardList, href: "/admin/inventory" },
    { label: "Categories", icon: FolderTree, href: "/admin/categories" },
    { label: "Collections", icon: Layers, href: "/admin/collections" },
    { label: "Orders", icon: ShoppingBag, href: "/admin/orders" },
    { label: "Customers", icon: Users, href: "/admin/customers" },
    { label: "Content", icon: FileText, href: "/admin/content" },
    { label: "Shipping", icon: Truck, href: "/admin/settings/shipping" },
    { label: "Payment Policies", icon: Settings, href: "/admin/settings/payment-policies" },
    { label: "Settings", icon: Settings, href: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col fixed top-[57px] bottom-0 left-0 text-primary z-40">
        <div className="p-6 border-b border-gray-100">
          <Link
            href="/"
            className="font-serif text-2xl font-bold tracking-tight"
          >
            VALANCIS
            <span className="text-xs block font-sans font-normal text-primary/70 tracking-widest mt-1">
              ADMIN PORTAL
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-primary/70 hover:bg-canvas hover:text-primary",
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary hover:bg-canvas rounded-md w-full transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            Live Store
          </a>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen pt-[57px]">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-40">
          <span className="font-serif text-lg font-bold">Admin</span>
          <button onClick={() => setIsMobileOpen(!isMobileOpen)}>
            {isMobileOpen ? <X /> : <Menu />}
          </button>
        </header>

        {/* Mobile Menu */}
        {isMobileOpen && (
          <div className="lg:hidden fixed inset-0 z-30 bg-white pt-20 px-4">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-4 text-base font-medium rounded-md border border-transparent",
                    pathname === item.href
                      ? "bg-primary text-white"
                      : "hover:bg-canvas",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
              <a
                href="/"
                target="_blank"
                className="flex items-center gap-3 px-4 py-4 text-base font-medium rounded-md border border-transparent text-primary hover:bg-canvas"
                onClick={() => setIsMobileOpen(false)}
              >
                <ExternalLink className="w-5 h-5" />
                Live Store
              </a>
            </nav>
          </div>
        )}

        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
