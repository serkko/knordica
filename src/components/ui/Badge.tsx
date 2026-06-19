import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "gold" | "success" | "danger" | "warning" | "info" | "outline";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1 rounded-sm px-2.5 py-0.5 text-xs font-semibold tracking-wider uppercase font-display border transition-colors select-none";

  const variants = {
    default:
      "bg-[var(--surface-2)] text-[var(--text-2)] border-[var(--border)]",
    accent:
      "bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--border-accent)]",
    gold:
      "bg-[var(--gold-dim)] text-[var(--gold)] border-[color-mix(in_srgb,var(--gold)_25%,transparent)]",
    success:
      "bg-[color-mix(in_srgb,var(--success)_10%,transparent)] text-[var(--success)] border-[color-mix(in_srgb,var(--success)_20%,transparent)]",
    danger:
      "bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-[var(--danger)] border-[color-mix(in_srgb,var(--danger)_20%,transparent)]",
    warning:
      "bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] text-[var(--warning)] border-[color-mix(in_srgb,var(--warning)_20%,transparent)]",
    info:
      "bg-[color-mix(in_srgb,var(--info)_10%,transparent)] text-[var(--info)] border-[color-mix(in_srgb,var(--info)_20%,transparent)]",
    outline:
      "bg-transparent text-[var(--text-2)] border-[var(--border-strong)]",
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
