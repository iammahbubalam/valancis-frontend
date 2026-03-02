import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { User as UserIcon, Mail, Calendar, Shield, ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  role: string;
  createdAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UsersResponse {
  users: Customer[];
  meta: Meta;
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const limit = Number(resolvedSearchParams.limit) || 10;

  let customers: Customer[] = [];
  let meta: Meta = { total: 0, page: 1, limit: 10, totalPages: 0 };
  let error = null;

  try {
    const res = await fetch(getApiUrl(`/admin/users?page=${page}&limit=${limit}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      // Handle both old format (array/object with users) and new format (including meta) support
      if (data.users && data.meta) {
        customers = data.users;
        meta = data.meta;
      } else if (data.users) {
        customers = data.users;
      } else if (Array.isArray(data)) {
        customers = data;
      }
    } else {
      error = "Failed to fetch customers";
    }
  } catch (e) {
    error = "Failed to load customers";
    console.error(e);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">
            Customers
          </h1>
          <p className="text-secondary mt-1">Manage your customer accounts</p>
        </div>
        <div className="text-sm text-secondary">
          Total:{" "}
          <span className="font-semibold text-primary">{meta.total || customers.length}</span>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-primary uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-secondary"
                    >
                      No customers found
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => {
                    const fullName = [customer.firstName, customer.lastName]
                      .filter(Boolean)
                      .join(" ") || customer.email.split("@")[0];

                    return (
                      <tr
                        key={customer.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {customer.avatar ? (
                              <div className="w-10 h-10 rounded-full overflow-hidden relative">
                                <Image
                                  src={customer.avatar}
                                  alt={fullName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-primary" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-primary">
                                {fullName}
                              </p>
                              <p className="text-xs text-secondary">
                                ID: {customer.id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-secondary">
                            <Mail className="w-4 h-4" />
                            {customer.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-secondary" />
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${customer.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                                }`}
                            >
                              {customer.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-secondary text-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-secondary">
                Showing <span className="font-medium">{Math.min((page - 1) * limit + 1, meta.total)}</span> to{" "}
                <span className="font-medium">{Math.min(page * limit, meta.total)}</span> of{" "}
                <span className="font-medium">{meta.total}</span> results
              </div>
              <div className="flex gap-2">
                <Link
                  href={`?page=${page - 1}&limit=${limit}`}
                  className={`p-2 rounded hover:bg-gray-100 ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
                  aria-disabled={page <= 1}
                >
                  <ChevronLeft className="w-5 h-5 text-secondary" />
                </Link>
                <div className="flex items-center px-2 text-sm text-secondary">
                  Page {page} of {meta.totalPages}
                </div>
                <Link
                  href={`?page=${page + 1}&limit=${limit}`}
                  className={`p-2 rounded hover:bg-gray-100 ${page >= meta.totalPages ? "pointer-events-none opacity-50" : ""}`}
                  aria-disabled={page >= meta.totalPages}
                >
                  <ChevronRight className="w-5 h-5 text-secondary" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

