"use client";

import { Bell, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/layout/LocaleProvider";

interface PanelTopbarProps {
  title?: string;
  subtitle?: string;
  notificationCount?: number;
}

export function PanelTopbar({ title, subtitle, notificationCount = 0 }: PanelTopbarProps) {
  const { locale } = useLocale();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = document.documentElement.getAttribute("data-theme");
    if (stored) {
      setIsDark(stored === "dark");
    } else {
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    setIsDark(!isDark);
  };

  return (
    <header className="h-14 border-b border-[var(--border)] bg-[var(--background-alt)]/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 sticky top-0 z-10">
      {/* Left: title */}
      <div className="flex flex-col justify-center">
        {title && (
          <h1 className="text-sm font-bold text-[var(--text)] font-display tracking-tight leading-none">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          className="relative h-8 w-8 flex items-center justify-center rounded-sm border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
          aria-label={locale === "es" ? "Notificaciones" : "Notifications"}
        >
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-[var(--accent)] text-white text-[8px] font-bold flex items-center justify-center">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="h-8 w-8 flex items-center justify-center rounded-sm border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
