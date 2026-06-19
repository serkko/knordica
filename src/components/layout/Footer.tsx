"use client";

// Footer — Knordica
// Atribución elegante a Xelta Studios en bottom.
// Bilingüe via dict desde LocaleProvider.

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { KnordicaLogo } from "@/components/ui/KnordicaLogo";
import { useLocale } from "@/components/layout/LocaleProvider";
import { cn } from "@/lib/utils/cn";

const COLUMN_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function Footer() {
  const { dict, locale } = useLocale();
  const year = new Date().getFullYear();

  const navLinks = [
    { href: `/${locale}/propiedades`, label: dict.footer.nav.propiedades },
    { href: `/${locale}/mapa`, label: dict.footer.nav.mapa },
    { href: `/${locale}/herramientas`, label: dict.footer.nav.herramientas },
    { href: `/${locale}/blog`, label: dict.footer.nav.blog },
    { href: `/${locale}/nosotros`, label: dict.footer.nav.nosotros },
    { href: `/${locale}/contacto`, label: dict.footer.nav.contacto },
  ];

  return (
    <footer
      className={cn(
        "relative border-t border-[var(--border)] bg-[var(--bg-alt)]",
        "overflow-hidden"
      )}
      aria-label="Pie de página"
    >
      {/* Top accent line */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--accent-glow), transparent)",
        }}
      />

      {/* Main content */}
      <div className="container-knordica section-y-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand column */}
          <motion.div
            className="lg:col-span-2 space-y-5"
            variants={COLUMN_VARIANTS}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            custom={0}
          >
            <KnordicaLogo size={28} withText animate={false} />
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-xs">
              {dict.footer.description}
            </p>

            {/* Contact info */}
            <div className="space-y-3 pt-2">
              <a
                href={`https://wa.me/5804122423334`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-2.5 text-sm text-[var(--text-2)]",
                  "hover:text-[var(--accent)] transition-colors duration-150"
                )}
              >
                <Phone size={13} className="text-[var(--accent)]" />
                +58 412 242 3334
              </a>
              <div className="flex items-start gap-2.5 text-sm text-[var(--text-muted)]">
                <MapPin size={13} className="text-[var(--accent)] mt-0.5 shrink-0" />
                {dict.contact.oficina} — Mérida, Venezuela
              </div>
              <div className="flex items-start gap-2.5 text-sm text-[var(--text-muted)]">
                <Clock size={13} className="text-[var(--accent)] mt-0.5 shrink-0" />
                {dict.contact.horario}
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/5804122423334?text=${encodeURIComponent(
                locale === "es"
                  ? "Hola Knordica, me gustaría obtener más información."
                  : "Hello Knordica, I would like to get more information."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-semibold",
                "bg-[var(--accent)] text-black",
                "hover:opacity-90 transition-opacity duration-150"
              )}
            >
              {dict.footer.whatsapp}
              <ArrowUpRight size={14} />
            </a>
          </motion.div>

          {/* Navigation */}
          <motion.div
            variants={COLUMN_VARIANTS}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            custom={1}
          >
            <h3 className="text-xs font-semibold tracking-widest uppercase text-[var(--text-muted)] mb-5">
              {dict.footer.nav.titulo}
            </h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-sm text-[var(--text-2)]",
                      "hover:text-[var(--accent)] transition-colors duration-150"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Tagline / brand sentiment */}
          <motion.div
            variants={COLUMN_VARIANTS}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            custom={2}
            className="space-y-4"
          >
            <h3 className="text-xs font-semibold tracking-widest uppercase text-[var(--text-muted)] mb-5">
              {dict.footer.tagline}
            </h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              {locale === "es"
                ? "Selección rigurosa. Asesoría real. Mérida, Venezuela."
                : "Rigorous selection. Real advisory. Mérida, Venezuela."}
            </p>
            {/* Legal links */}
            <div className="pt-4 flex flex-col gap-2">
              <Link
                href={`/${locale}/privacidad`}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-2)] transition-colors"
              >
                {dict.footer.legal.privacidad}
              </Link>
              <Link
                href={`/${locale}/terminos`}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-2)] transition-colors"
              >
                {dict.footer.legal.terminos}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            {dict.footer.copyright.replace("2025", String(year))}
          </p>

          {/* Xelta Studios attribution — sobria y elegante */}
          <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
            {dict.footer.atribucion}{" "}
            <a
              href="https://xeltastudios.com"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "font-medium text-[var(--text-2)]",
                "hover:text-[var(--accent)] transition-colors duration-150",
                "inline-flex items-center gap-0.5"
              )}
            >
              {dict.footer.xelta}
              <ArrowUpRight size={11} />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
