import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-sm border border-[var(--border)] bg-transparent px-3 py-2 text-xs",
            "text-[var(--text)] placeholder:text-[var(--text-muted)]",
            "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[var(--accent)] focus-visible:border-[var(--accent)]",
            "disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150",
            icon && "pl-9",
            error && "border-[var(--danger)] focus-visible:ring-[var(--danger)] focus-visible:border-[var(--danger)]",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
