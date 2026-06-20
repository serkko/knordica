"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useInView, animate } from "framer-motion";
import { useLocale } from "@/components/layout/LocaleProvider";

function WhyCounter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [num, setNum] = useState("00");

  useEffect(() => {
    if (!inView) return;
    const targetVal = parseInt(value, 10);
    if (isNaN(targetVal)) return;

    const controls = animate(0, targetVal, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (latest) => {
        const rounded = Math.round(latest);
        setNum(rounded < 10 ? `0${rounded}` : `${rounded}`);
      },
    });

    return () => controls.stop();
  }, [inView, value]);

  return <span ref={ref}>{num}</span>;
}

export function WhyKnordica() {
  const { dict, locale } = useLocale();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Setup vertical progress line mapping
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -24 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
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
    <section ref={sectionRef} className="section-y border-t border-[var(--color-divider)] bg-[var(--color-bg)] overflow-hidden">
      <div className="container-knordica">
        {/* Section Header */}
        <div className="max-w-2xl mb-16 md:mb-24">
          <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-semibold font-display block mb-2 select-none">
            {dict.why?.title || "Por qué elegir Knordica"}
          </span>
          <h2 className="text-3xl md:text-4xl font-light font-display tracking-tight text-[var(--color-text)]">
            {dict.why?.subtitle || "Propiedades que verificamos. Criterio técnico. Conocimiento directo del mercado merideño."}
          </h2>
        </div>

        {/* Feature List Grid Container */}
        <div className="relative">
          {/* Vertical scroll progress line (desktop) */}
          <motion.div
            style={{ scaleY, transformOrigin: "top" }}
            className="hidden lg:block absolute left-0 top-0 bottom-0 w-[1px] bg-[var(--color-divider)]"
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 lg:pl-8"
          >
            {items.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex flex-col relative"
              >
                {/* Giant number counter with count-up animation */}
                <span 
                  className="font-display font-light select-none leading-none mb-4 block" 
                  style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", color: "var(--color-gold)" }}
                >
                  <WhyCounter value={item.numero} />
                </span>

                {/* Title label */}
                <h3 
                  className="text-[0.7rem] uppercase tracking-wider font-semibold font-body text-[var(--color-text)] mb-3"
                >
                  {item.titulo}
                </h3>

                {/* Description */}
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed font-light">
                  {item.descripcion}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
