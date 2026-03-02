"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: string;
  isAdmin?: boolean;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      // Safe check for window/localStorage
      if (typeof window === "undefined") return null;

      const token = localStorage.getItem("token");
      if (!token) return null;

      try {
        const res = await fetch(getApiUrl("/auth/me"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const userData = await res.json();
          return {
            ...userData,
            isAdmin: userData.role === "admin",
          };
        } else {
          // Token invalid/expired
          localStorage.removeItem("token");
          return null;
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        return null;
      }
    },
    // Don't retry on auth failure (usually means 401/403)
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(getApiUrl("/auth/logout"), {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (e) {
      console.error(e);
    }

    localStorage.removeItem("token");
    // Clear cookies too if used
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie =
      "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

    // Update query cache instantly
    queryClient.setQueryData(["user"], null);

    // Clear other user-related queries
    queryClient.removeQueries({ queryKey: ["cart"] });
    queryClient.removeQueries({ queryKey: ["wishlist"] });

    router.push("/");
    router.refresh();
  };

  const refreshUser = async () => {
    await queryClient.invalidateQueries({ queryKey: ["user"] });
  };

  return (
    <AuthContext.Provider
      // user defaults to undefined during loading in react-query, force null if undefined
      value={{ user: user ?? null, isLoading, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
