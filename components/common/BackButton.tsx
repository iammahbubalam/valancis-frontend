"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors text-[10px] uppercase tracking-widest font-medium group"
        >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Back to Collection
        </button>
    );
}
