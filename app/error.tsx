"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center px-4">
            <div className="space-y-2">
                <h2 className="text-3xl font-serif text-primary">
                    Something went wrong
                </h2>
                <p className="text-primary/60 max-w-md">
                    We encountered an unexpected error. Our team has been notified.
                </p>
            </div>
            <Button onClick={() => reset()} variant="outline">
                Try Again
            </Button>
        </div>
    );
}
