"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/components/layout/LocaleProvider";

export function WhyKnordica() {
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
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const items = dict.why?.items || [
    {
      numero: "01",
      titulo: "Selección rigurosa",
      descripcion:
        "Cada propiedad en nuestro catálogo ha pasado por un proceso de verificación legal, técnica y de mercado. Sin improvisación.",
    },
    {
      numero: "02",
      titulo: "Asesoría real",
      descripcion:
        "No hacemos transacciones, construimos relaciones. Cada cliente tiene un asesor dedicado que entiende su caso específico.",
    },
    {
      numero: "03",
      titulo: "Transparencia total",
      descripcion:
        "Precio claro, documentación completa, sin sorpresas. La claridad es parte del servicio directo que ofrecemos.",
    },
    {
      numero: "04",
      titulo: "Cobertura local profunda",
      descripcion:
        "Conocemos el territorio a nivel profundo. Cada zona, cada urbanización, cada dinámica de mercado específica.",
    },
  ];

  return (
    <section className="section-y border-t border-[rgba(255,255,255,0.08)] bg-[#0a0908] overflow-hidden">
      <div className="container-knordica">
        {/* Section Header */}
        <div className="max-w-2xl mb-16 md:mb-24">
          <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-semibold font-display block mb-2">
            {dict.why?.title || "Por qué elegir Knordica"}
          </span>
          <h2 className="text-3xl md:text-4xl font-light font-display tracking-tight text-[var(--text)]">
            {dict.why?.subtitle || "Propiedades que verificamos. Criterio técnico. Conocimiento directo del mercado merideño."}
          </h2>
        </div>

        {/* Feature List Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8"
        >
          {items.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex flex-col relative"
            >
              {/* Giant number counter */}
              <span className="font-display font-light text-[var(--accent)] select-none leading-none mb-4 block" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
                {item.numero}
              </span>

              {/* Title label */}
              <h3 className="text-[0.7rem] uppercase tracking-wider font-semibold font-body text-[var(--text-muted)] mb-3">
                {item.titulo}
              </h3>

              {/* Description */}
              <p className="text-sm text-[var(--text-2)] leading-relaxed font-light">
                {item.descripcion}
              </p>

              {/* Divider lines between items in desktop */}
              {index < 3 && (
                <div className="hidden lg:block absolute top-0 -right-4 h-full w-[1px] bg-[rgba(255,255,255,0.08)]" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
