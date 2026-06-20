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
  const { locale, dict } = useLocale();

  const titleText = dict.hero?.title || "Propiedades seleccionadas en Mérida, Venezuela.";

  const badgeVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const wordContainerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const wordItemVariants = {
    hidden: { opacity: 0, y: 60 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const searchBarVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { delay: 0.8, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const statsVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { delay: 1.0, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-center py-20 overflow-hidden">
      <div className="container-knordica relative z-10 w-full flex flex-col items-center justify-center">
        <motion.div
          initial="hidden"
          animate="show"
          className="w-full max-w-4xl text-center flex flex-col items-center"
        >
          {/* Tag Label with Lines */}
          <motion.div variants={badgeVariants} className="mb-6 select-none">
            <span 
              className="inline-block text-[0.7rem] uppercase tracking-[0.15em] font-medium font-body px-4 py-1.5"
              style={{
                backgroundColor: "transparent",
                border: "1px solid var(--color-primary)",
                color: "var(--color-primary)",
                borderRadius: "9999px",
              }}
            >
              MÉRIDA · VENEZUELA
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={wordContainerVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight mb-6 font-display max-w-4xl leading-[1.05] flex flex-wrap justify-center gap-x-[0.25em]"
            style={{ 
              fontSize: "clamp(2.8rem, 6vw, 5rem)", 
              letterSpacing: "-0.04em",
              color: "var(--color-text)" 
            }}
          >
            {titleText.split(" ").map((word, i) => (
              <span key={i} className="inline-block overflow-hidden py-1">
                <motion.span
                  variants={wordItemVariants}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={subtitleVariants}
            className="text-base sm:text-lg md:text-xl max-w-2xl mb-12 font-body font-light leading-relaxed"
            style={{ color: "var(--color-text-muted)" }}
          >
            {dict.hero?.subtitle ||
              "Acompañamos cada operación con criterio, claridad y conocimiento real del territorio."}
          </motion.p>

          {/* Search form */}
          <motion.div variants={searchBarVariants} className="w-full mb-16 flex justify-center">
            <HeroSearch zones={zones} />
          </motion.div>

          {/* Micro Stats Banner */}
          <motion.div
            variants={statsVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 w-full max-w-3xl border-t border-[var(--color-divider)] pt-8"
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
                {dict.hero?.stats?.zonas || "zonas registradas"}
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

      {/* Floating Animated Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
        <span className="text-[0.6rem] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium font-body">
          {locale === "es" ? "Explorar" : "Explore"}
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-[18px] h-[30px] rounded-full border border-[var(--color-border)] flex justify-center p-1"
        >
          <div className="w-[3px] h-[6px] rounded-full bg-[var(--accent)]" />
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
