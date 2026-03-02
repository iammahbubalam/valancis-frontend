import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md" | "lg" | "xl";
}

export function LoadingSpinner({
    className,
    size = "md",
    ...props
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16",
    };

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-4",
                className
            )}
            {...props}
        >
            <Loader2
                className={cn("animate-spin text-accent-gold", sizeClasses[size])}
            />
            <span className="sr-only">Loading...</span>
        </div>
    );
}
