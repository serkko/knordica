"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useLocale } from "@/components/layout/LocaleProvider";

interface StatsBannerProps {
  stats?: {
    propiedades: number;
    zonas: number;
    operaciones: number;
    satisfaccion: number;
  };
}

export function StatsBanner({ stats = { propiedades: 47, zonas: 12, operaciones: 183, satisfaccion: 98 } }: StatsBannerProps) {
  const { dict } = useLocale();

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
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
    <section className="py-12 border-y border-[var(--border)] bg-[var(--surface-2)]">
      <div className="container-knordica">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
        >
          <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
            <span className="text-3xl md:text-4xl font-display font-bold text-[var(--accent)]">
              +<AnimatedCounter value={stats.propiedades} />
            </span>
            <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium mt-1">
              {dict.hero?.stats?.propiedades || "propiedades activas"}
            </span>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
            <span className="text-3xl md:text-4xl font-display font-bold text-[var(--accent)]">
              <AnimatedCounter value={stats.zonas} />
            </span>
            <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium mt-1">
              {dict.hero?.stats?.zonas || "zonas en Mérida"}
            </span>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
            <span className="text-3xl md:text-4xl font-display font-bold text-[var(--accent)]">
              +<AnimatedCounter value={stats.operaciones} />
            </span>
            <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium mt-1">
              {dict.hero?.stats?.operaciones || "operaciones cerradas"}
            </span>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
            <span className="text-3xl md:text-4xl font-display font-bold text-[var(--accent)]">
              <AnimatedCounter value={stats.satisfaccion} />%
            </span>
            <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium mt-1">
              {dict.hero?.stats?.satisfaccion || "clientes satisfechos"}
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
