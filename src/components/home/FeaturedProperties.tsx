"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/layout/LocaleProvider";
import type { PropertyCard as PropertyCardType } from "@/types/property";

interface FeaturedPropertiesProps {
  properties: PropertyCardType[];
}

export function FeaturedProperties({ properties }: FeaturedPropertiesProps) {
  const { locale, dict } = useLocale();

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
    <section className="section-y border-t border-[var(--border)]">
      <div className="container-knordica">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16">
          <div className="max-w-xl">
            <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-semibold font-display block mb-2">
              {dict.property?.badge?.destacada || "Destacadas"}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-[var(--text)]">
              {dict.catalog?.subtitle || "Propiedades seleccionadas en Mérida"}
            </h2>
          </div>
          <Link
            href={`/${locale}/propiedades`}
            className="group mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider font-display text-[var(--text-2)] hover:text-[var(--accent)] transition-colors"
          >
            <span>{dict.common?.verTodos || "Ver todos"}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <div className="w-full text-center py-16 border border-[var(--border)] rounded-sm glass">
            <p className="text-[var(--text-2)]">
              {dict.catalog?.empty?.description || "No encontramos propiedades destacadas."}
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {properties.map((property) => (
              <motion.div key={property.id} variants={itemVariants}>
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Mobile Call to Action Button */}
        <div className="mt-12 text-center md:hidden">
          <Button
            onClick={() => (window.location.href = `/${locale}/propiedades`)}
            variant="outline"
            className="w-full"
          >
            {dict.common?.verTodos || "Ver todos"}
          </Button>
        </div>
      </div>
    </section>
  );
}
