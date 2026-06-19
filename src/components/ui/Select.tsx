import { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, placeholder, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-sm border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs",
          "text-[var(--text)] focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[var(--accent)] focus-visible:border-[var(--accent)]",
          "disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150 cursor-pointer",
          error && "border-[var(--danger)] focus-visible:ring-[var(--danger)] focus-visible:border-[var(--danger)]",
          className
        )}
        ref={ref}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[var(--surface)] text-[var(--text)]">
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = "Select";
