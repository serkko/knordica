"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { HeroSearch } from "./HeroSearch";
import { GeometricBackground } from "@/components/ui/GeometricBackground";
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
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.6; // Slower playback for smooth feeling
    }
  }, [videoLoaded]);

  const titleText = dict.hero?.title || "Propiedades seleccionadas en Mérida, Venezuela.";

  return (
    <section 
      className="relative min-h-screen flex items-center overflow-hidden py-20"
      style={{
        backgroundColor: "oklch(0.08 0.01 60)"
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        onPlay={() => setVideoLoaded(true)}
        className="absolute inset-0 w-full h-full object-cover"
        src="/hero.mp4"
        poster="/hero-fallback.jpg"
        aria-hidden="true"
      />

      {/* Capa 3: Overlay de gradiente oscuro */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, rgba(10, 8, 7, 0.85) 0%, rgba(10, 8, 7, 0.72) 50%, rgba(10, 8, 7, 0.9) 100%)"
        }}
        aria-hidden="true"
      />

      {/* Fallback Grid Layer (Visible only if video hasn't loaded/played) */}
      {!videoLoaded && (
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
              linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            opacity: 0.02,
          }}
          aria-hidden="true"
        />
      )}

      {/* Capa 4: Líneas geométricas animadas */}
      <GeometricBackground variant="lines" />

      {/* Capa 5: Contenido principal */}
      <div className="relative z-10 container mx-auto px-4 w-full flex flex-col items-center justify-center text-center">
        <div className="w-full max-w-4xl flex flex-col items-center">
          
          {/* Badge over title */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 select-none"
          >
            <span
              className="inline-block text-[0.7rem] uppercase tracking-[0.15em] font-medium font-body px-4 py-1.5"
              style={{
                backgroundColor: "transparent",
                border: "1px solid rgba(168, 134, 74, 0.6)",
                color: "#EDE9E3",
                borderRadius: "6px",
              }}
            >
              MÉRIDA · VENEZUELA
            </span>
          </motion.div>

          {/* Title h1 */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight mb-6 font-display max-w-4xl leading-[1.05]"
            style={{
              fontSize: "clamp(2.8rem, 6vw, 5rem)",
              letterSpacing: "-0.04em",
              color: "#FDFCFA",
            }}
          >
            {titleText}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
            className="text-base sm:text-lg md:text-xl max-w-2xl mb-12 font-body font-light leading-relaxed"
            style={{ color: "rgba(237, 233, 227, 0.75)" }}
          >
            {dict.hero?.subtitle ||
              "Acompañamos cada operación con criterio, claridad y conocimiento real del territorio."}
          </motion.p>

          {/* Search bar complete */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="w-full mb-16 flex justify-center"
          >
            <HeroSearch zones={zones} />
          </motion.div>

          {/* Micro Stats Banner */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 w-full max-w-3xl border-t border-white/10 pt-8"
          >
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-3xl md:text-4xl font-display font-bold text-[#FDFCFA]">
                +<AnimatedCounter value={stats.propiedades} />
              </span>
              <span className="text-xs uppercase tracking-wider text-white/50 font-medium mt-1">
                {dict.hero?.stats?.propiedades || "propiedades activas"}
              </span>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-3xl md:text-4xl font-display font-bold text-[#FDFCFA]">
                <AnimatedCounter value={stats.zonas} />
              </span>
              <span className="text-xs uppercase tracking-wider text-white/50 font-medium mt-1">
                {dict.hero?.stats?.zonas || "zonas registradas"}
              </span>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-3xl md:text-4xl font-display font-bold text-[#FDFCFA]">
                +<AnimatedCounter value={stats.operaciones} />
              </span>
              <span className="text-xs uppercase tracking-wider text-white/50 font-medium mt-1">
                {dict.hero?.stats?.operaciones || "operaciones cerradas"}
              </span>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-3xl md:text-4xl font-display font-bold text-[#FDFCFA]">
                <AnimatedCounter value={stats.satisfaccion} />%
              </span>
              <span className="text-xs uppercase tracking-wider text-white/50 font-medium mt-1">
                {dict.hero?.stats?.satisfaccion || "clientes satisfechos"}
              </span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
