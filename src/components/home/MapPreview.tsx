"use client";

import { motion } from "framer-motion";
import { Map, Navigation2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/layout/LocaleProvider";

export function MapPreview() {
  const { locale, dict } = useLocale();

  return (
    <section className="section-y border-t border-[var(--border)] overflow-hidden">
      <div className="container-knordica">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Left */}
          <div className="lg:col-span-5 max-w-lg">
            <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-semibold font-display block mb-2">
              {dict.nav?.mapa || "Búsqueda por Mapa"}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-[var(--text)] mb-6 leading-tight">
              {locale === "es"
                ? "Explora propiedades de forma geoespacial"
                : "Explore properties geo-spatially"}
            </h2>
            <p className="text-sm md:text-base text-[var(--text-2)] font-light leading-relaxed mb-8">
              {locale === "es"
                ? "Nuestra herramienta de búsqueda visual te permite ubicar apartamentos y casas en los sectores más exclusivos de Mérida. Filtra precios y dimensiones directamente sobre el mapa del valle."
                : "Our visual search tool allows you to pinpoint apartments and homes in Mérida's most exclusive neighborhoods. Filter prices and dimensions directly over the valley map."}
            </p>
            <Link href={`/${locale}/mapa`}>
              <Button variant="primary" className="group">
                <Map className="h-4 w-4" />
                <span>{locale === "es" ? "Abrir mapa interactivo" : "Open interactive map"}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {/* Graphical Mock Map Right */}
          <div className="lg:col-span-7 relative h-[380px] sm:h-[450px] border border-[var(--border-strong)] rounded-sm bg-[var(--bg-alt)] overflow-hidden shadow-[var(--shadow-md)]">
            {/* Styled backdrop grid representing coordinates */}
            <div className="absolute inset-0 opacity-15 dark:opacity-20 bg-[linear-gradient(to_right,var(--border-strong)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-strong)_1px,transparent_1px)] bg-[size:32px_32px]" />

            {/* Stylized vector contours representing mountain ranges */}
            <svg
              className="absolute inset-0 w-full h-full text-[var(--border)] opacity-30 select-none pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 800 450"
            >
              <path
                d="M-50,300 C150,220 250,350 400,280 C550,210 650,380 850,290"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M-50,200 C200,100 300,280 500,180 C700,80 750,300 850,220"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>

            {/* Simulated interactive map markers in Mérida */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-[28%] left-[35%] z-10"
            >
              <div className="flex flex-col items-center">
                <div className="bg-[var(--gold)] text-[var(--bg)] font-display text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-[var(--shadow-sm)] border border-[color-mix(in_srgb,var(--gold)_30%,white)]">
                  $280.000
                </div>
                <div className="h-2 w-2 rounded-full bg-[var(--gold)] border-2 border-[var(--bg)] shadow-[var(--shadow-sm)] -mt-0.5" />
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, delay: 1, ease: "easeInOut" }}
              className="absolute top-[48%] left-[55%] z-10"
            >
              <div className="flex flex-col items-center">
                <div className="bg-[var(--accent)] text-[var(--bg)] font-display text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-[var(--shadow-sm)] border border-[color-mix(in_srgb,var(--accent)_30%,white)]">
                  $145.000
                </div>
                <div className="h-2 w-2 rounded-full bg-[var(--accent)] border-2 border-[var(--bg)] shadow-[var(--shadow-sm)] -mt-0.5" />
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, delay: 0.5, ease: "easeInOut" }}
              className="absolute top-[62%] left-[24%] z-10"
            >
              <div className="flex flex-col items-center">
                <div className="bg-[var(--surface-2)] text-[var(--text)] font-display text-[10px] font-medium px-2 py-0.5 rounded-sm shadow-[var(--shadow-sm)] border border-[var(--border-strong)]">
                  $95.000
                </div>
                <div className="h-2 w-2 rounded-full bg-[var(--text)] border-2 border-[var(--bg)] shadow-[var(--shadow-sm)] -mt-0.5" />
              </div>
            </motion.div>

            {/* Dashboard Overlay Mock (gives feeling of a premium dashboard interface) */}
            <div className="absolute bottom-4 left-4 right-4 glass p-4 rounded-sm flex items-center justify-between shadow-[var(--shadow-md)]">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-[var(--accent-dim)] text-[var(--accent)] rounded-full flex items-center justify-center shrink-0">
                  <Navigation2 className="h-4 w-4 rotate-45" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase font-display tracking-widest text-[var(--text-muted)] font-bold">
                    {locale === "es" ? "Sector Activo" : "Active Neighborhood"}
                  </p>
                  <p className="text-sm font-bold text-[var(--text)]">La Pedregosa, Mérida</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-dim)] px-2 py-0.5 rounded-sm">
                {locale === "es" ? "3 Disponibles" : "3 Available"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
