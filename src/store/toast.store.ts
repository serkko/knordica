"use client";

import { create } from "zustand";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: "default" | "success" | "danger" | "warning";
  duration?: number;
}

interface ToastStore {
  toasts: ToastMessage[];
  toast: (message: Omit<ToastMessage, "id">) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  toast: (message) => {
    const id = Math.random().toString(36).substring(7);
    const duration = message.duration ?? 3000;
    
    const newToast = { ...message, id };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },
  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
