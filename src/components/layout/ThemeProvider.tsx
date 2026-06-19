"use client";

// ThemeProvider — gestiona dark/light mode con data-theme en <html>
// Source of truth: data-theme. Respeta prefers-color-scheme inicial.
// Override manual persiste en localStorage de forma secundaria.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    // 1. Check localStorage override first
    const stored = localStorage.getItem("knordica-theme") as Theme | null;
    if (stored === "dark" || stored === "light") {
      applyTheme(stored);
      setThemeState(stored);
      return;
    }
    // 2. Fall back to system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial: Theme = prefersDark ? "dark" : "light";
    applyTheme(initial);
    setThemeState(initial);
  }, []);

  function applyTheme(t: Theme) {
    document.documentElement.setAttribute("data-theme", t);
  }

  function setTheme(t: Theme) {
    applyTheme(t);
    setThemeState(t);
    localStorage.setItem("knordica-theme", t);
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
