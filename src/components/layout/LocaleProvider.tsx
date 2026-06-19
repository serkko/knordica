"use client";

// LocaleProvider — Context liviano para locale actual en Client Components.
// El locale viene siempre de la URL — esto es solo un helper de acceso.

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/es";

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends object
    ? T[K] extends (...args: any[]) => any
      ? T[K]
      : DeepStringify<T[K]>
    : string;
};

interface LocaleContextType {
  locale: Locale;
  dict: DeepStringify<Dictionary>;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

export function LocaleProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: DeepStringify<Dictionary>;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ locale, dict }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
