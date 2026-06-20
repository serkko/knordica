"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/layout/LocaleProvider";
import type { PropertyCard as PropertyCardType } from "@/types/property";
import { cn } from "@/lib/utils/cn";
import { useReveal } from "@/hooks/useReveal";

interface FeaturedPropertiesProps {
  properties: PropertyCardType[];
}

export function FeaturedProperties({ properties }: FeaturedPropertiesProps) {
  const { locale, dict } = useLocale();
  const { ref, isInView, containerVariants, itemVariants } = useReveal(0.15, true);

  return (
    <section ref={ref} className="section-y border-t border-[var(--border)]">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "show" : "hidden"}
        className="container-knordica"
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16">
          <div className="max-w-xl">
            <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-semibold font-display block mb-2">
              {dict.property?.badge?.destacada || "Destacadas"}
            </span>
            <h2 className="text-3xl md:text-4xl font-light font-display tracking-tight text-[var(--text)]">
              {dict.catalog?.subtitle || "Propiedades seleccionadas en Mérida"}
            </h2>
          </div>
          <Link
            href={`/${locale}/propiedades`}
            className="group mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider font-display text-[var(--text-2)] hover:text-[var(--accent)] transition-colors relative pb-1"
          >
            <span className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[var(--accent)] group-hover:after:w-full after:transition-all after:duration-300">
              {dict.common?.verTodos || "Ver todos"}
            </span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <motion.div variants={itemVariants} className="w-full text-center py-16 border border-[var(--border)] rounded-sm glass">
            <p className="text-[var(--text-2)]">
              {dict.catalog?.empty?.description || "No encontramos propiedades destacadas."}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                variants={itemVariants}
                className={cn("h-full", index === 0 && "lg:col-span-2")}
              >
                <PropertyCard property={property} isFeatured={index === 0} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Mobile Call to Action Button */}
        <motion.div variants={itemVariants} className="mt-12 text-center md:hidden">
          <Button
            onClick={() => (window.location.href = `/${locale}/propiedades`)}
            variant="outline"
            className="w-full"
          >
            {dict.common?.verTodos || "Ver todos"}
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
