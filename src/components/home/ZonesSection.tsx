"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/components/layout/LocaleProvider";
import type { Zone, PropertyCard } from "@/types/property";

interface ZonesSectionProps {
  zones: Zone[];
  properties: PropertyCard[];
}

export function ZonesSection({ zones, properties }: ZonesSectionProps) {
  const { locale, dict } = useLocale();

  const getPropertyCount = (zoneId: string) => {
    return properties.filter((p) => p.zone?.id === zoneId).length;
  };

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="section-y border-t border-[var(--color-divider)] bg-[var(--color-bg)]">
      <div className="container-knordica">
        {/* Section Header */}
        <div className="max-w-2xl mb-12 md:mb-16">
          <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-semibold font-display block mb-2">
            {dict.zones?.title || "Zonas de Mérida"}
          </span>
          <h2 className="text-3xl md:text-4xl font-light font-display tracking-tight text-[var(--text)]">
            {dict.zones?.subtitle || "Conoce las principales urbanizaciones y sectores donde trabajamos"}
          </h2>
        </div>

        {/* Zones Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {zones.map((zone) => {
            const count = getPropertyCount(zone.id);
            const name = locale === "es" ? zone.name_es : zone.name_en;
            const description = locale === "es" ? zone.description_es : zone.description_en;

            return (
              <motion.div key={zone.id} variants={itemVariants} className="h-full">
                <Link href={`/${locale}/propiedades?zona=${zone.slug}`} className="block h-full group">
                  <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] group cursor-pointer h-full min-h-[240px]">
                    
                    {/* Background Image / Placeholder */}
                    {zone.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={zone.cover_image_url}
                        alt={name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-radial from-zinc-800 to-zinc-950 opacity-80" />
                    )}

                    {/* Dark overlay gradient that lightens on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908]/90 via-[#0a0908]/40 to-black/30 group-hover:from-[#0a0908]/80 group-hover:via-[#0a0908]/30 group-hover:to-black/20 transition-all duration-500 z-10" />

                    {/* Content */}
                    <div className="absolute inset-0 p-6 z-20 flex flex-col justify-between">
                      {/* Top section: pin and properties count */}
                      <div className="flex justify-between items-start">
                        <div className="h-8 w-8 border border-[var(--color-border)] rounded-full flex items-center justify-center text-white/70 group-hover:text-[var(--accent)] group-hover:border-[var(--accent)] transition-colors">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <span className="text-[11px] font-mono text-white/50 bg-[#0a0908]/50 backdrop-blur-xs px-2 py-0.5 rounded-sm">
                          {count} {dict.zones?.propiedades || "propiedades"}
                        </span>
                      </div>

                      {/* Bottom section: details */}
                      <div className="flex flex-col gap-2">
                        <h3 className="text-[1.1rem] font-normal font-display text-white tracking-tight leading-tight group-hover:text-[var(--accent)] transition-colors">
                          {name}
                        </h3>
                        {description && (
                          <p className="text-[0.75rem] text-white/70 line-clamp-2 leading-relaxed font-light font-body">
                            {description}
                          </p>
                        )}
                        <div className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-wider font-display text-white/50 group-hover:text-[var(--accent)] transition-colors mt-1">
                          <span>{dict.zones?.explorar || "Explorar zona"}</span>
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
