import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-100 shadow-sm", // Base styles
        className
      )}
      {...props}
    />
  );
}
