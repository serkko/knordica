"use client";

// KnordicaLogo — Logo SVG propio
// "K" geométrica con insinuación arquitectónica (diagonal + volumen)
// Animación: path drawing reveal (pathLength 0 → 1) al primer load
// Funciona monocromático a 24px y a 200px

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface KnordicaLogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
  color?: string;
  withText?: boolean;
}

const PATH_VARIANTS = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (delay: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: 1.4,
        delay,
        ease: [0.16, 1, 0.3, 1],
      },
      opacity: {
        duration: 0.2,
        delay,
      },
    },
  }),
};

export function KnordicaLogo({
  size = 32,
  className,
  animate = true,
  color = "currentColor",
  withText = false,
}: KnordicaLogoProps) {
  const svgProps = {
    width: size,
    height: size,
    viewBox: "0 0 48 48",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-label": "Knordica",
    role: "img" as const,
  };

  // La K está construida con 3 partes:
  // 1. Tramo vertical izquierdo
  // 2. Diagonal superior (con un pequeño quiebre arquitectónico)
  // 3. Diagonal inferior
  // El quiebre crea una ilusión de tejado/estructura

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <motion.svg
        {...svgProps}
        initial="hidden"
        animate={animate ? "visible" : "hidden"}
      >
        {/* Trazo vertical — columna */}
        <motion.path
          d="M10 6 L10 42"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="square"
          variants={PATH_VARIANTS}
          custom={0}
        />

        {/* Diagonal superior — con quiebre en punto medio */}
        {/* Va del centro-izquierda hacia arriba-derecha, pasando por un punto interior */}
        <motion.path
          d="M10 24 L20 14 L38 6"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="square"
          strokeLinejoin="miter"
          variants={PATH_VARIANTS}
          custom={0.15}
        />

        {/* Diagonal inferior — simétrica con eje */}
        <motion.path
          d="M10 24 L20 32 L38 42"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="square"
          strokeLinejoin="miter"
          variants={PATH_VARIANTS}
          custom={0.3}
        />

        {/* Acento geométrico — línea horizontal en el punto de quiebre (tejado) */}
        <motion.path
          d="M16 19 L24 15"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="square"
          opacity={0.4}
          variants={PATH_VARIANTS}
          custom={0.5}
        />
      </motion.svg>

      {withText && (
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-semibold uppercase tracking-widest"
          style={{
            fontSize: size * 0.5,
            color,
          }}
        >
          Knordica
        </motion.span>
      )}
    </span>
  );
}
