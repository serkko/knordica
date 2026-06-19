"use client";

import { motion } from "framer-motion";
import { HeroSearch } from "./HeroSearch";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useLocale } from "@/components/layout/LocaleProvider";
import type { Zone } from "@/types/property";

interface HeroProps {
  zones: Zone[];
  stats: {
    propiedades: number;
    zonas: number;
    operaciones: number;
    satisfaccion: number;
  };
}

export function Hero({ zones, stats }: HeroProps) {
  const { dict } = useLocale();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center py-20 overflow-hidden">
      <div className="container-knordica relative z-10 w-full flex flex-col items-center justify-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-4xl text-center flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase font-display bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--border-accent)]">
              {dict.hero?.badge || "Mérida, Venezuela"}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 font-display max-w-3xl leading-[1.05]"
          >
            {dict.hero?.title?.split("\n").map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            )) || "Encuentra tu próxima propiedad en Mérida"}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-[var(--text-2)] max-w-2xl mb-12 font-body font-light leading-relaxed"
          >
            {dict.hero?.subtitle ||
              "Asesoría inmobiliaria de alto nivel. Seleccionamos, evaluamos y negociamos las mejores propiedades para compradores e inversores exigentes."}
          </motion.p>

          {/* Search form */}
          <motion.div variants={itemVariants} className="w-full mb-16 flex justify-center">
            <HeroSearch zones={zones} />
          </motion.div>

          {/* Micro Stats Banner */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 w-full max-w-3xl border-t border-[var(--border)] pt-8"
          >
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-3xl md:text-4xl font-display font-bold text-[var(--text)]">
                +<AnimatedCounter value={stats.propiedades} />
              </span>
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium mt-1">
                {dict.hero?.stats?.propiedades || "propiedades activas"}
              </span>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-3xl md:text-4xl font-display font-bold text-[var(--text)]">
                <AnimatedCounter value={stats.zonas} />
              </span>
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium mt-1">
                {dict.hero?.stats?.zonas || "zonas en Mérida"}
              </span>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-3xl md:text-4xl font-display font-bold text-[var(--text)]">
                +<AnimatedCounter value={stats.operaciones} />
              </span>
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium mt-1">
                {dict.hero?.stats?.operaciones || "operaciones cerradas"}
              </span>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-3xl md:text-4xl font-display font-bold text-[var(--text)]">
                <AnimatedCounter value={stats.satisfaccion} />%
              </span>
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium mt-1">
                {dict.hero?.stats?.satisfaccion || "clientes satisfechos"}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Visual background lines (additional elegant accent overlay) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.02] dark:opacity-[0.04]">
        <div className="absolute top-[30%] left-[10%] w-[80%] h-[1px] bg-linear-to-r from-transparent via-[var(--accent)] to-transparent" />
        <div className="absolute top-[50%] left-[20%] w-[60%] h-[1px] bg-linear-to-r from-transparent via-[var(--accent)] to-transparent" />
      </div>
    </section>
  );
}
