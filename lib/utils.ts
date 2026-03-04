import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getApiUrl(endpoint: string) {
  // During build/server-side, BACKEND_URL is more reliable as it's the direct origin
  // In the browser, NEXT_PUBLIC_API_URL (the public domain) is required
  const isServer = typeof window === "undefined";
  const base = (isServer ? process.env.BACKEND_URL : process.env.NEXT_PUBLIC_API_URL) || process.env.NEXT_PUBLIC_API_URL || "";

  // If base ends with /api/v1, use it. Otherwise append it.
  const cleanBase = base.endsWith("/api/v1") ? base : `${base}/api/v1`;
  // Ensure endpoint starts with / to safely join
  const safeEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  return `${cleanBase}${safeEndpoint}`;
}
