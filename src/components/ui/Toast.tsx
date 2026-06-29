"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useToastStore, ToastMessage } from "@/store/toast.store";
import { cn } from "@/lib/utils/cn";

function ToastItem({ toast }: { toast: ToastMessage }) {
  const dismiss = useToastStore((state) => state.dismiss);
  const type = toast.type || "default";

  // Configuration map for styles
  const config = {
    default: {
      color: "#D4924A",
      bgCircle: "rgba(212, 146, 74, 0.12)",
      border: "1px solid rgba(212, 146, 74, 0.3)",
      glow: "0 16px 36px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 146, 74, 0.1)",
      icon: <Info size={14} style={{ color: "#D4924A" }} />,
    },
    success: {
      color: "#10b981",
      bgCircle: "rgba(16, 185, 129, 0.12)",
      border: "1px solid rgba(16, 185, 129, 0.3)",
      glow: "0 16px 36px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.1)",
      icon: <CheckCircle size={14} style={{ color: "#10b981" }} />,
    },
    danger: {
      color: "#ef4444",
      bgCircle: "rgba(239, 68, 68, 0.12)",
      border: "1px solid rgba(239, 68, 68, 0.3)",
      glow: "0 16px 36px rgba(0, 0, 0, 0.5), 0 0 20px rgba(239, 68, 68, 0.1)",
      icon: <AlertCircle size={14} style={{ color: "#ef4444" }} />,
    },
    warning: {
      color: "#f59e0b",
      bgCircle: "rgba(245, 158, 11, 0.12)",
      border: "1px solid rgba(245, 158, 11, 0.3)",
      glow: "0 16px 36px rgba(0, 0, 0, 0.5), 0 0 20px rgba(245, 158, 11, 0.1)",
      icon: <AlertTriangle size={14} style={{ color: "#f59e0b" }} />,
    },
  }[type];

  const durationSec = (toast.duration ?? 3000) / 1000;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }}
      style={{
        position: "relative",
        display: "flex",
        alignItems: toast.description ? "start" : "center",
        gap: 12,
        padding: "14px 18px",
        background: "rgba(30, 30, 32, 0.95)",
        backdropFilter: "blur(12px)",
        border: config.border,
        borderRadius: "12px",
        boxShadow: config.glow,
        width: "100%",
        maxWidth: "380px",
        pointerEvents: "auto",
        overflow: "hidden",
      }}
    >
      {/* Circle Icon */}
      <div 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          width: 28, 
          height: 28, 
          borderRadius: "50%", 
          background: config.bgCircle, 
          flexShrink: 0,
          marginTop: toast.description ? 1 : 0,
        }}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <h4 style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "var(--p-text)", lineHeight: "1.4" }}>
          {toast.title}
        </h4>
        {toast.description && (
          <p style={{ margin: 0, fontSize: "11px", fontWeight: 400, color: "var(--p-text-2)", lineHeight: "1.4" }}>
            {toast.description}
          </p>
        )}
      </div>

      {/* Dismiss Button */}
      <button
        onClick={() => dismiss(toast.id)}
        style={{ 
          background: "none", 
          border: "none", 
          color: "var(--p-text-3)", 
          cursor: "pointer", 
          fontSize: 12, 
          padding: 4, 
          marginTop: toast.description ? -2 : 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <X size={14} />
      </button>

      {/* Countdown animation bar */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: durationSec, ease: "linear" }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "3px",
          background: config.color,
          borderBottomLeftRadius: "12px",
          borderBottomRightRadius: "12px",
        }}
      />
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
