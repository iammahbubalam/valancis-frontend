"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface MicrosoftClarityProps {
    projectId: string;
}

export default function MicrosoftClarity({ projectId }: MicrosoftClarityProps) {
    const pathname = usePathname();
    const { user } = useAuth();

    // Clarity Identify logic: Link session to user ID for better L9 attribution
    useEffect(() => {
        if (typeof window !== "undefined" && (window as any).clarity) {
            if (user?.id) {
                (window as any).clarity("identify", user.id, {
                    email: user.email,
                    name: `${user.firstName || ""} ${user.lastName || ""}`.trim()
                });
                // L9 Custom Tags: Allows filtering Clarity dashboard by user characteristics
                (window as any).clarity("set", "user_role", user.role || "customer");
                (window as any).clarity("set", "account_status", "logged_in");
            } else {
                (window as any).clarity("set", "user_role", "guest");
                (window as any).clarity("set", "account_status", "anonymous");
            }
        }
    }, [user]);

    // L9 Rule: Perfectly secure. Don't even load the script on Admin routes.
    if (!projectId || pathname?.startsWith("/admin")) {
        return null;
    }

    return (
        <Script
            id="microsoft-clarity"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
                __html: `
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${projectId}");
        `,
            }}
        />
    );
}
