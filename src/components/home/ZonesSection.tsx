"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
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
    <section className="section-y border-t border-[var(--border)] bg-[var(--bg-alt)]/50">
      <div className="container-knordica">
        {/* Section Header */}
        <div className="max-w-2xl mb-12 md:mb-16">
          <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-semibold font-display block mb-2">
            {dict.zones?.title || "Zonas de Mérida"}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-[var(--text)]">
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
                  <Card className="h-full p-6 flex flex-col justify-between border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:shadow-[var(--shadow-md)] transition-all">
                    <div>
                      {/* Icon & Count */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="h-10 w-10 border border-[var(--border-strong)] rounded-full flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:border-[var(--accent)] transition-colors">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-mono text-[var(--text-muted)]">
                          {count} {dict.zones?.propiedades || "propiedades"}
                        </span>
                      </div>

                      {/* Name */}
                      <h3 className="text-xl font-bold font-display tracking-tight mb-3 text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                        {name}
                      </h3>

                      {/* Description */}
                      {description && (
                        <p className="text-sm text-[var(--text-2)] leading-relaxed font-light mb-6">
                          {description}
                        </p>
                      )}
                    </div>

                    {/* CTA Link */}
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider font-display text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors mt-auto">
                      <span>{dict.zones?.explorar || "Explorar zona"}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
