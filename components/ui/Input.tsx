"use client";

import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-xs uppercase tracking-widest text-secondary font-medium">
          {label}
        </label>
      )}
      <input
        className={clsx(
          "bg-transparent border-b border-main-secondary py-3 text-primary placeholder:text-secondary/40 outline-none transition-all duration-300",
          "focus:border-accent-gold",
          error && "border-status-error",
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-xs text-status-error">{error}</span>
      )}
    </div>
  );
}
