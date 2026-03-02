"use client";

import { useAuth } from "@/context/AuthContext";
import { User, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center justify-center text-primary hover:text-accent-gold transition-colors"
      >
        <User className="w-5 h-5" />
      </Link>
    );
  }

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none"
      >
        {user.avatar ? (
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-primary/20">
            <Image
              src={user.avatar}
              alt={user.firstName || "User"}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
            <span className="text-[10px] font-bold font-serif">
              {(user.firstName?.[0] || "U").toUpperCase()}
            </span>
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 mt-2 w-48 bg-white shadow-lg border border-primary/10 py-2 z-50 flex flex-col"
            >
              <div className="px-4 py-3 border-b border-primary/5 mb-1">
                <p className="text-sm font-bold truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-secondary truncate">{user.email}</p>
              </div>

              <Link
                href="/profile"
                className="px-4 py-2 text-sm hover:bg-primary/5 transition-colors flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4" /> Profile
              </Link>

              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 text-left w-full"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
