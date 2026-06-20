"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Sun,
  Moon,
  Phone,
  ChevronDown,
  User,
} from "lucide-react";
import { KnordicaLogo } from "@/components/ui/KnordicaLogo";
import { useTheme } from "@/components/layout/ThemeProvider";
import { useLocale } from "@/components/layout/LocaleProvider";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/i18n/config";

// ─── Nav links definition ──────────────────────────────────
function useNavLinks() {
  const { dict, locale } = useLocale();
  return [
    { href: `/${locale}/propiedades`, label: dict.nav.propiedades },
    { href: `/${locale}/mapa`, label: dict.nav.mapa },
    { href: `/${locale}/blog`, label: dict.nav.blog },
    { href: `/${locale}/herramientas`, label: dict.nav.herramientas },
    { href: `/${locale}/nosotros`, label: dict.nav.nosotros },
    { href: `/${locale}/contacto`, label: dict.nav.contacto },
  ];
}

// ─── Language Switcher ─────────────────────────────────────
function LanguageSwitcher() {
  const { locale } = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: Locale) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  }

  return (
    <div className="flex items-center gap-1.5 text-[0.7rem] font-medium font-body select-none">
      <button
        onClick={() => switchLocale("es")}
        className={cn(
          "transition-all duration-150 uppercase cursor-pointer tracking-wider",
          locale === "es" ? "text-[var(--accent)] font-semibold" : "text-[var(--text-muted)] hover:text-[var(--text-2)]"
        )}
      >
        ES
      </button>
      <span className="text-[rgba(255,255,255,0.15)] text-[10px]">|</span>
      <button
        onClick={() => switchLocale("en")}
        className={cn(
          "transition-all duration-150 uppercase cursor-pointer tracking-wider",
          locale === "en" ? "text-[var(--accent)] font-semibold" : "text-[var(--text-muted)] hover:text-[var(--text-2)]"
        )}
      >
        EN
      </button>
    </div>
  );
}

// ─── Theme Toggle ──────────────────────────────────────────
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "w-8 h-8 flex items-center justify-center rounded-sm",
        "text-[var(--text-2)] hover:text-[var(--text)]",
        "hover:bg-[var(--surface-2)] transition-all duration-150 cursor-pointer"
      )}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "dark" ? (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Sun size={16} />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: 90, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Moon size={16} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

// ─── Mobile Drawer ─────────────────────────────────────────
function MobileDrawer({
  isOpen,
  onClose,
  links,
}: {
  isOpen: boolean;
  onClose: () => void;
  links: Array<{ href: string; label: string }>;
}) {
  const { dict, locale } = useLocale();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "fixed right-0 top-0 bottom-0 z-50 w-72",
              "flex flex-col",
              "bg-[var(--color-surface)] border-l border-[var(--color-border)]"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
              <Image
                src="/logo.webp"
                alt="Knordica"
                width={140}
                height={48}
                priority
                className="h-10 w-auto object-contain"
              />
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "block px-4 py-3 rounded-sm text-sm font-medium",
                      "text-[var(--text-2)] hover:text-[var(--text)]",
                      "hover:bg-[var(--surface-2)] transition-all duration-150"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Private portals links in mobile menu */}
              <div className="border-t border-[var(--color-divider)] my-3 pt-3 opacity-60" />

              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: links.length * 0.05, duration: 0.3 }}
              >
                <Link
                  href={`/${locale}/cliente`}
                  onClick={onClose}
                  className={cn(
                    "block px-4 py-3 rounded-sm text-sm font-semibold",
                    "text-[var(--accent)] hover:bg-[var(--surface-2)] transition-all duration-150"
                  )}
                >
                  {locale === "es" ? "Portal Cliente" : "Client Portal"}
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (links.length + 1) * 0.05, duration: 0.3 }}
              >
                <Link
                  href={`/${locale}/admin`}
                  onClick={onClose}
                  className={cn(
                    "block px-4 py-3 rounded-sm text-sm font-semibold",
                    "text-[var(--gold)] hover:bg-[var(--surface-2)] transition-all duration-150"
                  )}
                >
                  {locale === "es" ? "Panel CRM (Agentes)" : "CRM Dashboard (Agents)"}
                </Link>
              </motion.div>
            </nav>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-[var(--color-divider)] space-y-4">
              <a
                href={`https://wa.me/5804122423334`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center justify-center gap-2 w-full py-3 rounded-lg font-semibold text-sm transition-all duration-300 cursor-pointer border-0"
                )}
                style={{
                  backgroundColor: "var(--color-gold)",
                  color: "var(--color-text-inverse)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-gold-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-gold)";
                }}
              >
                <Phone size={15} />
                {dict.nav.ctaBtn}
              </a>
              <div className="flex items-center justify-between">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Private Access Dropdown Component ─────────────────────
function PrivateAccessDropdown() {
  const { locale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.7rem] font-medium uppercase tracking-wider",
          "border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--surface-hover)]",
          "hover:text-[var(--text)] hover:border-[var(--border-strong)]",
          "transition-all duration-150 cursor-pointer"
        )}
      >
        <User size={12} className="text-[var(--accent)] shrink-0" />
        <span>{locale === "es" ? "Acceso" : "Access"}</span>
        <ChevronDown size={11} className={cn("transition-transform duration-200 shrink-0", isOpen ? "rotate-180" : "")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-1 w-44 bg-[var(--surface)] border border-[rgba(255,255,255,0.08)] rounded-lg shadow-lg py-1.5 z-50 glass"
          >
            <Link
              href={`/${locale}/cliente`}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-xs font-medium text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              {locale === "es" ? "Portal Cliente" : "Client Portal"}
            </Link>
            <Link
              href={`/${locale}/admin`}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-xs font-medium text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors border-t border-[rgba(255,255,255,0.08)]"
            >
              {locale === "es" ? "Panel CRM" : "CRM Dashboard"}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Navbar ───────────────────────────────────────────
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dict, locale } = useLocale();
  const navLinks = useNavLinks();
  const pathname = usePathname();

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 30);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close mobile on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-30 h-16 flex items-center transition-all duration-400",
          scrolled ? "shadow-md" : ""
        )}
        style={scrolled ? {
          backgroundColor: "color-mix(in srgb, var(--color-bg) 92%, transparent)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--color-divider)"
        } : {
          backgroundColor: "transparent",
          borderBottom: "1px solid transparent"
        }}
        role="banner"
      >
        <div className="container-knordica flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href={`/${locale}`} aria-label="Knordica — inicio" className="inline-block">
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Image
                src="/logo.webp"
                alt="Knordica"
                width={140}
                height={48}
                priority
                className="h-10 w-auto object-contain"
              />
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden lg:flex items-center gap-1"
            aria-label="Navegación principal"
          >
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-3 py-1.5 text-[0.7rem] font-medium uppercase tracking-widest rounded-sm",
                    "transition-colors duration-150",
                    isActive
                      ? "text-[var(--color-text)]"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-[var(--color-primary)]"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
            <PrivateAccessDropdown />
            <a
              href={`https://wa.me/5804122423334`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 text-[0.7rem] uppercase tracking-wider rounded-lg font-medium transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md border-0"
              )}
              style={{
                backgroundColor: "var(--color-gold)",
                color: "var(--color-text-inverse)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-gold-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-gold)";
              }}
            >
              <Phone size={11} />
              <span>{dict.nav.ctaBtn}</span>
            </a>
          </div>

          {/* Mobile trigger */}
          <button
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-sm text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-all cursor-pointer"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
          >
            <Menu size={20} />
          </button>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={navLinks}
      />
    </>
  );
}
