"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { analytics } from "@/lib/gtm";

interface GoogleTagManagerProps {
    gtmId: string;
}

export default function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!gtmId) return;

        // L9: Exclude admin routes from tracking and technical health monitoring
        if (pathname?.startsWith("/admin")) {
            return;
        }

        // 1. Technical Health: Global Error Tracking
        const handleError = (error: ErrorEvent) => {
            analytics.trackException(`JS Error: ${error.message} at ${error.filename}:${error.lineno}`, false);
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            analytics.trackException(`Unhandled Rejection: ${event.reason}`, false);
        };

        window.addEventListener("error", handleError);
        window.addEventListener("unhandledrejection", handleUnhandledRejection);

        // 2. Observability: Core Web Vitals Tracking
        // Tracking LCP, FID, CLS, TTFB, FCP
        if ("PerformanceObserver" in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry: any) => {
                        // Map entry types to GA4-friendly names
                        const name = entry.name === "first-contentful-paint" ? "FCP" :
                            entry.entryType === "layout-shift" ? "CLS" :
                                entry.entryType === "largest-contentful-paint" ? "LCP" :
                                    entry.entryType === "first-input" ? "FID" : entry.name;

                        analytics.trackPerformance(name, entry.startTime || entry.value || 0, "CoreWebVitals");
                    });
                });

                observer.observe({ type: "largest-contentful-paint", buffered: true });
                observer.observe({ type: "first-input", buffered: true });
                observer.observe({ type: "layout-shift", buffered: true });
                observer.observe({ type: "paint", buffered: true });
            } catch (e) {
                console.warn("PerformanceObserver not supported for some types", e);
            }
        }

        return () => {
            window.removeEventListener("error", handleError);
            window.removeEventListener("unhandledrejection", handleUnhandledRejection);
        };
    }, [gtmId]);

    useEffect(() => {
        // History change tracking (redundant if GTM is configured for History Change trigger, but safer)
        if (pathname) {
            // Custom route change tracking could go here if needed
        }
    }, [pathname, searchParams]);

    if (!gtmId || pathname?.startsWith("/admin")) return null;

    return (
        <>
            <noscript>
                <iframe
                    src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                    height="0"
                    width="0"
                    style={{ display: "none", visibility: "hidden" }}
                />
            </noscript>
            {/* L9: Use Next.js Script component for reliable hydration execution */}
            <Script
                id="gtm-script"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer', '${gtmId}');
          `,
                }}
            />
        </>
    );
}
