"use client";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  MapPin,
  User,
  LogOut,
  LayoutDashboard,
  Heart,
} from "lucide-react";
import { profileAPI, Address } from "@/lib/api/profile";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { OrderCard } from "@/components/profile/OrderCard";
import { useDialog } from "@/context/DialogContext";

type TabType = "dashboard" | "orders" | "addresses" | "profile";

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: any[];
}

export default function ProfilePage() {
  const { user, isLoading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const dialog = useDialog();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Auth Guard
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/profile");
    }
  }, [user, isLoading, router]);

  // Fetch Data
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const [ordersData, addressesData] = await Promise.all([
        profileAPI.getOrders(),
        profileAPI.getAddresses(),
      ]);
      setOrders(ordersData || []);
      setAddresses(addressesData || []);
    } catch (e) {
      console.error("Data fetch failed", e);
    } finally {
      setIsLoadingData(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen pt-40 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "orders", icon: Package, label: "My Orders" },
    { id: "addresses", icon: MapPin, label: "Addresses" },
    { id: "profile", icon: User, label: "Profile Details" },
  ] as const;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-bg-primary text-primary">
      <Container>
        <h1 className="text-3xl md:text-4xl font-serif mb-8 text-center md:text-left hidden md:block">
          My Account
        </h1>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <Card className="p-6 md:sticky md:top-24">
              <div className="mb-8 text-center">
                {user.avatar ? (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border border-primary/20 mx-auto mb-3">
                    <Image
                      src={user.avatar}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-bg-secondary rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-serif">
                    {user.firstName?.[0] || user.email?.[0]?.toUpperCase()}
                  </div>
                )}
                <h2 className="font-serif text-lg">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-secondary text-xs">{user.email}</p>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as TabType)}
                    className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors ${
                      activeTab === item.id
                        ? "bg-bg-secondary font-medium border-l-2 border-primary"
                        : "hover:bg-bg-secondary/50 border-l-2 border-transparent"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}

                <Link
                  href="/wishlist"
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors hover:bg-bg-secondary/50 border-l-2 border-transparent"
                >
                  <Heart className="w-4 h-4" /> Wishlist
                </Link>

                <button
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors text-red-500 hover:bg-red-50 mt-4 border-t border-primary/5"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-grow">
            <h2 className="font-serif text-2xl mb-6 capitalize border-b border-primary/10 pb-4 md:hidden">
              {activeTab}
            </h2>

            {/* DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                <Card className="p-8">
                  <p className="text-lg mb-4">
                    Hello,{" "}
                    <span className="font-bold">
                      {user.firstName || "there"}
                    </span>
                    !
                  </p>
                  <p className="text-secondary max-w-xl">
                    From your dashboard you can view your{" "}
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-primary hover:underline"
                    >
                      recent orders
                    </button>
                    , manage your{" "}
                    <button
                      onClick={() => setActiveTab("addresses")}
                      className="text-primary hover:underline"
                    >
                      shipping addresses
                    </button>
                    , and edit your{" "}
                    <button
                      onClick={() => setActiveTab("profile")}
                      className="text-primary hover:underline"
                    >
                      account details
                    </button>
                    .
                  </p>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      id: "orders",
                      icon: Package,
                      value: orders.length,
                      label: "Orders",
                      sub: "View History",
                    },
                    {
                      id: "addresses",
                      icon: MapPin,
                      value: addresses.length,
                      label: "Saved",
                      sub: "Manage Addresses",
                    },
                    {
                      id: "profile",
                      icon: User,
                      value: null,
                      label: "Profile",
                      sub: "Edit Details",
                    },
                  ].map((stat) => (
                    <Card
                      key={stat.id}
                      className="p-6 text-center cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setActiveTab(stat.id as TabType)}
                    >
                      <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary/60" />
                      <h3 className="font-serif text-lg mb-1">
                        {stat.value !== null
                          ? `${stat.value} ${stat.label}`
                          : stat.label}
                      </h3>
                      <p className="text-xs text-secondary uppercase tracking-wider">
                        {stat.sub}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ORDERS */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                {isLoadingData ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <Card className="text-center py-12">
                    <p className="text-secondary mb-4">
                      You haven&apos;t placed any orders yet.
                    </p>
                    <Link href="/shop">
                      <Button variant="secondary">Start Shopping</Button>
                    </Link>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {orders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ADDRESSES */}
            {activeTab === "addresses" && (
              <Card className="p-6">
                <h3 className="font-serif text-xl mb-6">Saved Addresses</h3>
                {isLoadingData ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-primary/20 rounded">
                    <p className="text-secondary mb-2">
                      No addresses saved yet.
                    </p>
                    <p className="text-xs text-secondary/60">
                      Addresses are automatically saved when you checkout.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="border border-primary/10 p-4 rounded-lg relative group hover:shadow-md transition-shadow"
                      >
                        {addr.isDefault && (
                          <span className="absolute top-2 right-2 text-[10px] uppercase tracking-wider bg-primary text-white px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                        <p className="font-medium text-sm mb-1">
                          {addr.label || "Shipping Address"}
                        </p>
                        <p className="text-sm">
                          {addr.firstName} {addr.lastName}
                        </p>
                        <p className="text-xs text-secondary mt-1">
                          {addr.phone}
                        </p>
                        <p className="text-xs text-secondary mt-2 leading-relaxed">
                          {addr.addressLine}
                          <br />
                          {[addr.thana, addr.district, addr.division]
                            .filter(Boolean)
                            .join(", ")}
                          {addr.postalCode && ` - ${addr.postalCode}`}
                        </p>
                        <div className="mt-3 pt-3 border-t border-primary/5">
                          <button
                            onClick={async () => {
                              const confirmed = await dialog.confirm({
                                title: "Delete Address",
                                message:
                                  "Are you sure you want to delete this address? This action cannot be undone.",
                                variant: "danger",
                                confirmText: "Delete",
                                cancelText: "Cancel",
                              });
                              if (confirmed) {
                                try {
                                  await profileAPI.deleteAddress(addr.id);
                                  setAddresses((prev) =>
                                    prev.filter((a) => a.id !== addr.id),
                                  );
                                  dialog.toast({
                                    message: "Address deleted",
                                    variant: "success",
                                  });
                                } catch (e) {
                                  dialog.toast({
                                    message: "Failed to delete address",
                                    variant: "danger",
                                  });
                                }
                              }
                            }}
                            className="text-xs text-red-500 hover:text-red-700 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* PROFILE */}
            {activeTab === "profile" && (
              <Card className="p-8">
                <h3 className="font-serif text-xl mb-6">Edit Profile</h3>
                <ProfileForm user={user} onUpdate={refreshUser} />

                <div className="mt-8 pt-6 border-t border-primary/10">
                  <label className="text-xs text-secondary uppercase tracking-wider block mb-2">
                    Email
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-100 text-secondary">
                    {user.email}
                  </div>
                  <p className="text-xs text-secondary/60 mt-2">
                    Email cannot be changed as it&apos;s linked to your Google
                    account.
                  </p>
                </div>
              </Card>
            )}
          </main>
        </div>
      </Container>
    </div>
  );
}
