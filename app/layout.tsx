import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, Pinyon_Script } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { IntroProvider } from "@/context/IntroContext";
import { IntroOverlay } from "@/components/layout/IntroOverlay";

// Force dynamic rendering to prevent static build errors with no-store fetches
// Force dynamic rendering removed to enable Static Site Generation (SSG)
// export const dynamic = "force-dynamic";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700"],
});

const pinyon = Pinyon_Script({
  variable: "--font-pinyon",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: {
      default: config.name,
      template: `%s | ${config.name}`,
    },
    description: config.description,
    icons: {
      icon: config.favicon || "/favicon.ico",
      shortcut: config.favicon || "/favicon.ico",
      apple: config.favicon || "/favicon.ico",
    },
    openGraph: {
      images: [config.logo], // Fallback/Default OG
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
      other: {
        "msvalidate.01": [process.env.NEXT_PUBLIC_BING_VERIFICATION || ""],
      },
    },
  };
}

import {
  getCategoryTree,
  getFooterSections,
  getSiteConfig,
  getCollections,
} from "@/lib/data";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

import { GoogleAuthProvider } from "@/components/auth/AuthProvider";
import { AuthContextProvider } from "@/context/AuthContext";

import { WishlistProvider } from "@/context/WishlistContext";
import { DialogProvider } from "@/context/DialogContext";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { MainWrapper } from "@/components/layout/MainWrapper";

import { OrganizationSchema } from "@/components/seo/OrganizationSchema";
import { FloatingCart } from "@/components/layout/FloatingCart";
import GoogleTagManager from "@/components/analytics/GoogleTagManager";
import MicrosoftClarity from "@/components/analytics/MicrosoftClarity";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch global data on server
  const [siteConfig, categories, footerSections, collections] =
    await Promise.all([
      getSiteConfig(),
      getCategoryTree(),
      getFooterSections(),
      getCollections(),
    ]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${cormorant.variable} ${manrope.variable} ${pinyon.variable} antialiased bg-main text-primary flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <Suspense fallback={null}>
          <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID || ""} />
        </Suspense>
        <OrganizationSchema siteConfig={siteConfig} />
        <QueryProvider>
          <AuthContextProvider>
            <Suspense fallback={null}>
              <MicrosoftClarity projectId={process.env.NEXT_PUBLIC_CLARITY_ID || ""} />
            </Suspense>
            <GoogleAuthProvider>
              <DialogProvider>
                <IntroProvider>
                  <IntroOverlay />
                  <CartProvider>
                    <WishlistProvider>
                      <Navbar
                        categories={categories}
                        collections={collections}
                        siteConfig={siteConfig}
                      />
                      <MainWrapper>
                        <Suspense fallback={null}>
                          {children}
                        </Suspense>
                      </MainWrapper>
                      <Footer
                        siteConfig={siteConfig}
                        footerSections={footerSections}
                      />
                      <CartDrawer />
                      <FloatingCart />
                    </WishlistProvider>
                  </CartProvider>
                </IntroProvider>
              </DialogProvider>
            </GoogleAuthProvider>
          </AuthContextProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
