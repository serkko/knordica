"use client";

import { AnimatePresence, motion, type Transition } from "framer-motion";
import { PropertyCard } from "./PropertyCard";
import { cn } from "@/lib/utils/cn";
import type { PropertyCard as PropertyCardType } from "@/types/property";

// Easing as const tuple
const EASE_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];

interface PropertyGridProps {
  properties: propertiesArray;
}

// Custom type helper for properties array
type propertiesArray = PropertyCardType[];

const containerVariants = {
  hidden: {},
  show:  { transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
  exit:  { transition: { staggerChildren: 0.03, staggerDirection: -1 as -1 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 15 },
  show: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.5, ease: EASE_EXPO } as Transition,
  },
  exit: {
    opacity: 0, scale: 0.9, y: -15,
    transition: { duration: 0.35, ease: "easeIn" } as Transition,
  },
};

export function PropertyGrid({ properties }: PropertyGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      layout
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full"
    >
      <AnimatePresence mode="popLayout">
        {properties.map((property, index) => (
          <motion.div
            key={property.id}
            variants={itemVariants}
            layout
            initial="hidden"
            animate="show"
            exit="exit"
            className={cn("h-full", index === 0 && "lg:col-span-2")}
          >
            <PropertyCard property={property} isFeatured={index === 0} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
