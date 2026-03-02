"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { GoogleButton } from "@/components/auth/GoogleButton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

// Force dynamic rendering to avoid static build errors with useSearchParams
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* LEFT: Cinematic Visual (Hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-primary overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "linear" }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src="/assets/login_backdrop_image.png"
            alt="Authentic Lifestyle"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-[#3d0a0a]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2a0505] via-transparent to-[#2a0505]" />
        </motion.div>

        <div className="absolute inset-0 flex items-center justify-center p-20 z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-2xl text-white"
          >
            <div className="h-[1px] w-24 bg-primary mx-auto mb-10" />
            <h2 className="font-serif text-[72px] leading-[1] mb-8 tracking-tight">
              Honoring the <br /> Art of Living
            </h2>
            <div className="h-[1px] w-12 bg-white/20 mx-auto mb-8" />
            <p className="text-white/90 font-light text-2xl tracking-wide max-w-md mx-auto leading-relaxed">
              Curating heritage, craftsmanship, and <br /> a slower pace of life.
            </p>
          </motion.div>
        </div>
      </div>

      {/* RIGHT: Interaction Area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 relative">
        {/* Back Button */}
        <Link
          href="/"
          className="absolute top-8 left-8 lg:top-12 lg:left-12 flex items-center gap-2 text-xs uppercase tracking-widest text-primary/70 hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="w-full max-w-sm flex flex-col items-center text-center">
          {/* Logo or Monogram could go here */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h1 className="font-serif text-4xl text-primary mb-3">
              Welcome Back
            </h1>
            <p className="text-primary/70 text-sm">
              Sign in to continue your journey with Valancis.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="w-full space-y-6"
          >
            <Suspense
              fallback={
                <div className="w-full py-4 text-center text-xs text-primary/50">
                  Loading...
                </div>
              }
            >
              <GoogleButton />
            </Suspense>

            <p className="text-[10px] text-primary/50 leading-relaxed max-w-[280px] mx-auto">
              By clicking continue, you acknowledge that you have read and agree
              to our
              <a
                href="#"
                className="underline decoration-gray-300 hover:decoration-primary text-primary/60 mx-1"
              >
                Terms of Service
              </a>
              and
              <a
                href="#"
                className="underline decoration-gray-300 hover:decoration-primary text-primary/60 mx-1"
              >
                Privacy Policy
              </a>
              .
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-8 text-[10px] text-gray-300 uppercase tracking-widest">
          Valancis © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
