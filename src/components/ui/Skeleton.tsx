import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-sm bg-[var(--surface-2)] border border-[var(--border)]",
        className
      )}
      {...props}
    />
  );
}
