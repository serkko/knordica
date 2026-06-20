"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export function GlobalBackground() {
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });
  const [prefersReduced, setPrefersReduced] = useState(false);

  // Motion values for tracking mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Soft spring physics
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  // Map coordinate range to movement offset [-20px, 20px]
  const shiftX = useTransform(springX, [0, windowSize.width], [-20, 20]);
  const shiftY = useTransform(springY, [0, windowSize.height], [-20, 20]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect media query for reduced motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const motionHandler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", motionHandler);

    // Window size tracking
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const resizeHandler = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", resizeHandler);

    // Mouse movement tracking
    const mouseHandler = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", mouseHandler, { passive: true });

    return () => {
      mq.removeEventListener("change", motionHandler);
      window.removeEventListener("resize", resizeHandler);
      window.removeEventListener("mousemove", mouseHandler);
    };
  }, [mouseX, mouseY]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-[var(--bg)]"
    >
      {/* CAPA 1 — Noise texture sutil */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none select-none mix-blend-overlay"
        style={{ opacity: "var(--noise-opacity)" }}
      >
        <filter id="globals-noise">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.65" 
            numOctaves="3" 
            stitchTiles="stitch" 
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#globals-noise)" />
      </svg>


      {/* CAPA 3 — Gradiente atmosférico */}
      {!prefersReduced && (
        <motion.div
          style={{ x: shiftX, y: shiftY }}
          className="absolute inset-0 pointer-events-none select-none"
        >
          {/* Superior izquierda: color accent al 8% de opacidad, blur 120px, tamaño 600px */}
          <div
            className="absolute top-[-100px] left-[-100px] rounded-full"
            style={{
              width: "600px",
              height: "600px",
              background: "var(--accent)",
              opacity: 0.08,
              filter: "blur(120px)",
            }}
          />

          {/* Inferior derecha: mismo color al 5%, blur 180px, tamaño 800px */}
          <div
            className="absolute bottom-[-150px] right-[-150px] rounded-full"
            style={{
              width: "800px",
              height: "800px",
              background: "var(--accent)",
              opacity: 0.05,
              filter: "blur(180px)",
            }}
          />
        </motion.div>
      )}
    </div>
  );
}
