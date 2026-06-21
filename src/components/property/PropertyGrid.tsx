"use client";

import { motion } from "framer-motion";
import { PropertyCard } from "./PropertyCard";
import { cn } from "@/lib/utils/cn";
import type { PropertyCard as PropertyCardType } from "@/types/property";

interface PropertyGridProps {
  properties: PropertyCardType[];
}

export function PropertyGrid({ properties }: PropertyGridProps) {
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full"
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
  );
}
