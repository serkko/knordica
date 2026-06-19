"use client";

import { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "onDrag" | "onDragStart" | "onDragEnd"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gold" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-display font-medium tracking-wide rounded-sm cursor-pointer select-none transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      primary:
        "bg-[var(--accent)] text-[var(--bg)] shadow-[var(--shadow-sm)] hover:bg-[color-mix(in_srgb,var(--accent)_85%,#000)] dark:hover:bg-[color-mix(in_srgb,var(--accent)_85%,#fff)]",
      secondary:
        "bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)]",
      outline:
        "bg-transparent text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]",
      ghost:
        "bg-transparent text-[var(--text-2)] hover:bg-[var(--surface)] hover:text-[var(--text)]",
      gold:
        "bg-[var(--gold)] text-[var(--bg)] shadow-[var(--shadow-sm)] hover:bg-[color-mix(in_srgb,var(--gold)_85%,#000)] dark:hover:bg-[color-mix(in_srgb,var(--gold)_85%,#fff)]",
      danger:
        "bg-[var(--danger)] text-white shadow-[var(--shadow-sm)] hover:bg-red-600",
    };

    const sizes = {
      sm: "h-9 px-4 text-xs gap-1.5",
      md: "h-11 px-6 text-sm gap-2",
      lg: "h-14 px-8 text-base gap-2.5",
    };

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Cargando...</span>
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
