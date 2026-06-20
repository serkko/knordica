"use client";

import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Linkedin,
  Facebook,
} from "lucide-react";
import { KnordicaLogo } from "@/components/ui/KnordicaLogo";
import { useLocale } from "@/components/layout/LocaleProvider";

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
      className="relative border-t border-[rgba(255,255,255,0.06)] bg-[#050505] pt-20 pb-12 overflow-hidden text-[#8a8278] z-10"
      aria-label="Pie de página"
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-30" />

      {/* Decorative Background Lighting/Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03] dark:opacity-[0.06]">
        <div className="absolute -bottom-36 -left-36 w-80 h-80 rounded-full bg-[var(--accent)] blur-[100px]" />
        {/* Subtle grid pattern layer */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="container-knordica relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Column 1: Brand & Description */}
          <div className="flex flex-col items-start gap-5">
            <KnordicaLogo size={28} withText animate={false} />
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-xs">
              {dict.footer.description || "Knordica · Propiedades seleccionadas en Mérida, Venezuela. Acompañamos cada cierre con rigor, claridad y conocimiento del territorio."}
            </p>
            {/* Social channels */}
            <div className="flex gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-[rgba(255,255,255,0.08)] bg-white/5 flex items-center justify-center text-white/70 hover:bg-[var(--accent)] hover:text-black hover:border-[var(--accent)] transition-all cursor-pointer"
              >
                <Instagram size={14} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-[rgba(255,255,255,0.08)] bg-white/5 flex items-center justify-center text-white/70 hover:bg-[var(--accent)] hover:text-black hover:border-[var(--accent)] transition-all cursor-pointer"
              >
                <Linkedin size={14} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-[rgba(255,255,255,0.08)] bg-white/5 flex items-center justify-center text-white/70 hover:bg-[var(--accent)] hover:text-black hover:border-[var(--accent)] transition-all cursor-pointer"
              >
                <Facebook size={14} />
              </a>
            </div>
          </div>

          {/* Column 2: Properties Link mapping */}
          <div className="flex flex-col items-start gap-5">
            <h4 className="font-bold text-[var(--text)] uppercase text-xs tracking-wider border-l-2 border-[var(--accent)] pl-3">
              {locale === "es" ? "Catálogo" : "Catalog"}
            </h4>
            <ul className="space-y-3 text-xs flex flex-col items-start">
              <li>
                <Link href={`/${locale}/propiedades?operacion=venta`} className="hover:text-[var(--accent)] transition-colors">
                  {locale === "es" ? "Propiedades en Venta" : "Properties for Sale"}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/propiedades?operacion=alquiler`} className="hover:text-[var(--accent)] transition-colors">
                  {locale === "es" ? "Propiedades en Alquiler" : "Properties for Rent"}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/propiedades`} className="hover:text-[var(--accent)] transition-colors">
                  {locale === "es" ? "Listado Completo" : "All Listings"}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/mapa`} className="hover:text-[var(--accent)] transition-colors">
                  {dict.footer.nav.mapa || "Buscar por mapa"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company Sitemap */}
          <div className="flex flex-col items-start gap-5">
            <h4 className="font-bold text-[var(--text)] uppercase text-xs tracking-wider border-l-2 border-[var(--accent)] pl-3">
              {locale === "es" ? "Empresa" : "Company"}
            </h4>
            <ul className="space-y-3 text-xs flex flex-col items-start">
              {navLinks.slice(4).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[var(--accent)] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={`/${locale}/herramientas`} className="hover:text-[var(--accent)] transition-colors">
                  {dict.footer.nav.herramientas || "Herramientas"}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/blog`} className="hover:text-[var(--accent)] transition-colors">
                  {dict.footer.nav.blog || "Blog"}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacidad`} className="hover:text-[var(--accent)] transition-colors">
                  {dict.footer.legal.privacidad || "Privacidad"}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terminos`} className="hover:text-[var(--accent)] transition-colors">
                  {dict.footer.legal.terminos || "Términos"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Office */}
          <div className="flex flex-col items-start gap-5">
            <h4 className="font-bold text-[var(--text)] uppercase text-xs tracking-wider border-l-2 border-[var(--accent)] pl-3">
              {locale === "es" ? "Oficina" : "Office"}
            </h4>
            <ul className="space-y-3.5 text-xs flex flex-col items-start">
              <li className="flex gap-2.5 items-start">
                <MapPin size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                <span>{dict.contact.oficina} — Mérida, Venezuela</span>
              </li>
              <li className="flex gap-2.5 items-center">
                <Phone size={14} className="text-[var(--accent)] shrink-0" />
                <a href="tel:+584122423334" className="hover:text-[var(--accent)] transition-colors">
                  +58 412 242 3334
                </a>
              </li>
              <li className="flex gap-2.5 items-center">
                <Mail size={14} className="text-[var(--accent)] shrink-0" />
                <a href="mailto:contacto@knordica.com" className="hover:text-[var(--accent)] transition-colors">
                  contacto@knordica.com
                </a>
              </li>
              <li className="flex gap-2.5 items-start">
                <Clock size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                <span>{dict.contact.horario}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom (Copyright and Xelta Signature block sharing same integrated bg layout) */}
        <div className="border-t border-[rgba(255,255,255,0.06)] pt-8 relative z-[2000]">
          <style dangerouslySetInnerHTML={{ __html: `
            .xelta-footer-row {
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: center;
              font-size: 13px;
              color: #757575;
              margin: 0;
              width: 100%;
              gap: 0.5rem;
              flex-wrap: wrap;
            }

            .xelta-footer-row strong {
              font-weight: 600;
              color: #a1a1aa; /* adapted to stand out elegantly in client dark theme */
            }

            .xelta-footer-sep {
              margin: 0 0.4rem;
              opacity: 0.7;
            }

            .xelta-copyright {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 0.5rem;
              font-size: 13px;
              color: inherit;
              text-decoration: none;
              cursor: pointer;
              user-select: none;
            }

            .xelta-text {
              font-weight: 400;
              opacity: 0.9;
              transition: color 0.3s ease;
            }

            .xelta-copyright:hover .xelta-text {
              color: #ffffff;
            }

            .xelta-brand {
              display: flex;
              align-items: center;
              gap: 0.375rem;
              font-weight: 700;
              color: inherit;
              transition: color 0.3s ease;
            }

            .xelta-copyright:hover .xelta-brand {
              color: #D32F2F;
            }

            .eternal-cube {
              width: 8px;
              height: 8px;
              background-color: #D32F2F;
              transform: rotate(45deg);
              transition: transform 0.7s ease !important;
              will-change: transform;
            }

            .xelta-copyright:hover .eternal-cube {
              transform: rotate(180deg);
            }

            /* Responsive: stacks vertically on mobile and hides separator */
            @media (max-width: 640px) {
              .xelta-footer-row {
                flex-direction: column;
                gap: 0.5rem;
                text-align: center;
              }
              .xelta-footer-sep {
                display: none;
              }
            }
          `}} />

          <div className="xelta-footer-row">
            <span>
              © {year} <strong>Knordica</strong>. {locale === "es" ? "Todos los derechos reservados." : "All rights reserved."}
            </span>
            <span className="xelta-footer-sep">|</span>
            <a href="https://xeltastudios.com"
               target="_blank"
               rel="noopener noreferrer"
               className="xelta-copyright">
              <span className="xelta-text">
                {dict.footer.atribucion || (locale === "es" ? "Sitio forjado por" : "Site forged by")}
              </span>
              <span className="xelta-brand">
                <span className="eternal-cube" aria-hidden="true" />
                Xelta Studios
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
