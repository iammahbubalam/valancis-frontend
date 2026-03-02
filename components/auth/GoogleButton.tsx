"use client";
import { useGoogleLogin } from "@react-oauth/google";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { getApiUrl } from "@/lib/utils";
import { motion } from "framer-motion";



export function GoogleButton() {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const login = useGoogleLogin({
    flow: "auth-code", // Secure Flow
    onSuccess: async (codeResponse) => {
        try {
            console.log("Google Code Response:", codeResponse);
            // Send authorization code to backend
            const res = await fetch(getApiUrl("/auth/google"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: codeResponse.code }),
            });
            const data = await res.json();
            console.log("Backend Auth:", data);
            
            if (data.accessToken) {
                // 1. Save Token
                localStorage.setItem("token", data.accessToken);
                // Set cookie for middleware (optional but good for SSR protection later)
                document.cookie = `token=${data.accessToken}; path=/; max-age=86400; SameSite=Lax`;
                
                // 2. Redirect
                console.log("Redirecting to:", redirectPath);
                window.location.href = redirectPath; // Force reload to update Auth Context
            }
        } catch (error) {
            console.error(error);
        }
    },
    onError: () => console.log('Login Failed'),
  });

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="w-full py-4 text-xs font-bold tracking-[0.15em] uppercase flex items-center justify-center gap-3 shadow-sm border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-primary transition-all duration-200 group relative overflow-hidden"
      onClick={() => login()}
    >
      <div className="w-5 h-5 relative flex items-center justify-center bg-transparent p-0.5">
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      </div>
      <span className="opacity-90 group-hover:opacity-100 transition-opacity">Continue with Google</span>
    </motion.button>
  );
}
