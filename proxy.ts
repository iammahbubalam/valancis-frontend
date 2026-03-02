import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
    const response = NextResponse.next();

    // Add Security Headers
    // 1. DNS Prefetch Control
    response.headers.set("X-DNS-Prefetch-Control", "on");

    // 2. Strict Transport Security (HSTS) - Force HTTPS
    // max-age=63072000 corresponds to 2 years
    response.headers.set(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload"
    );

    // 3. X-Frame-Options - Prevent Clickjacking
    response.headers.set("X-Frame-Options", "SAMEORIGIN");

    // 4. X-Content-Type-Options - Prevent MIME Sniffing
    response.headers.set("X-Content-Type-Options", "nosniff");

    // 5. Referrer Policy
    response.headers.set("Referrer-Policy", "origin-when-cross-origin");

    // 6. Content Security Policy (Basic)
    // We can make this stricter later, but this prevents basic XSS
    // response.headers.set(
    //   "Content-Security-Policy",
    //   "default-src 'self'; img-src 'self' https: data:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    // );

    return response;
}

export const config = {
    // Run on all routes except static files and API
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|assets|public).*)",
    ],
};
