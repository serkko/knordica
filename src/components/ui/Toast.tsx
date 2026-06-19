"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useToastStore, ToastMessage } from "@/store/toast.store";
import { cn } from "@/lib/utils/cn";

function ToastItem({ toast }: { toast: ToastMessage }) {
  const dismiss = useToastStore((state) => state.dismiss);

  const icons = {
    default: <Info className="h-4 w-4 text-[var(--accent)]" />,
    success: <CheckCircle className="h-4 w-4 text-[var(--success)]" />,
    danger: <AlertCircle className="h-4 w-4 text-[var(--danger)]" />,
    warning: <AlertTriangle className="h-4 w-4 text-[var(--warning)]" />,
  };

  const borders = {
    default: "border-[var(--border)]",
    success: "border-[var(--success)]/20",
    danger: "border-[var(--danger)]/20",
    warning: "border-[var(--warning)]/20",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      className={cn(
        "flex w-full max-w-sm gap-3 border bg-[var(--surface)] p-4 shadow-lg rounded-sm glass pointer-events-auto",
        borders[toast.type || "default"]
      )}
    >
      <div className="mt-0.5 shrink-0">
        {icons[toast.type || "default"]}
      </div>
      <div className="flex-1 space-y-1">
        <h4 className="text-xs font-bold font-display text-[var(--text)]">
          {toast.title}
        </h4>
        {toast.description && (
          <p className="text-[11px] font-light text-[var(--text-2)] leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => dismiss(toast.id)}
        className="h-5 w-5 rounded-xs p-0.5 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function ToastProvider() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div
      aria-live="assertive"
      className="fixed bottom-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 space-y-4 space-y-reverse sm:max-w-sm pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
export { useToastStore };
