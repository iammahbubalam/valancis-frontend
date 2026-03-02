import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getApiUrl(endpoint: string) {
    const base = process.env.NEXT_PUBLIC_API_URL || "";
    // If base ends with /api/v1, use it. Otherwise append it.
    const cleanBase = base.endsWith("/api/v1") ? base : `${base}/api/v1`;
    // Ensure endpoint starts with / to safely join
    const safeEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    // Special Case: Auth routes often sit at root /api/v1/auth OR just /auth depending on backend setup.
    // My backend `main.go` registers `/api/v1/auth/...`
    // So standardized `/api/v1` is correct for everything.
    
    return `${cleanBase}${safeEndpoint}`;
}
