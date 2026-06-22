"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/components/layout/LocaleProvider";
import { PropertyCard } from "./PropertyCard";
import type { PropertyCard as PropertyCardType } from "@/types/property";
import { EASE_EXPO } from "@/lib/motion/variants";

interface RelatedPropertiesProps {
  properties: PropertyCardType[];
  currentPropertyId: string;
}

export function RelatedProperties({ properties, currentPropertyId }: RelatedPropertiesProps) {
  const { dict } = useLocale();

  // Filter out the current active property
  const filtered = properties
    .filter((p) => p.id !== currentPropertyId)
    .slice(0, 3);

  if (filtered.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: EASE_EXPO }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="flex flex-col gap-6 pt-12 border-t border-[var(--border)]"
    >
      <motion.h3 
        variants={itemVariants}
        className="text-xl md:text-2xl font-bold font-display tracking-tight text-[var(--text)]"
      >
        {dict.property?.detail?.similares || "Propiedades similares"}
      </motion.h3>
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full"
      >
        {filtered.map((property) => (
          <motion.div key={property.id} variants={itemVariants}>
            <PropertyCard property={property} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
