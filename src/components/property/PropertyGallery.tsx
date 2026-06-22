"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2, Grid3X3 } from "lucide-react";
import type { PropertyImage } from "@/types/property";
import { EASE_EXPO } from "@/lib/motion/variants";

interface PropertyGalleryProps {
  images: PropertyImage[];
  title: string;
}

export function PropertyGallery({ images = [], title }: PropertyGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 prev | 1 next

  const open = useCallback((i: number) => {
    setDirection(0);
    setLightboxIndex(i);
  }, []);

  const close = useCallback(() => setLightboxIndex(null), []);

  const prev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setDirection(-1);
      setLightboxIndex((prev) =>
        prev === null || prev === 0 ? images.length - 1 : prev - 1
      );
    },
    [images.length]
  );

  const next = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setDirection(1);
      setLightboxIndex((prev) =>
        prev === null || prev === images.length - 1 ? 0 : prev + 1
      );
    },
    [images.length]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, close, prev, next]);

  // Lock body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxIndex]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const t = e.currentTarget;
    if (t.clientWidth > 0) setActiveMobileIndex(Math.round(t.scrollLeft / t.clientWidth));
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir >= 0 ? "8%" : "-8%",
      opacity: 0,
      scale: 0.97,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.45, ease: EASE_EXPO } as Transition,
    },
    exit: (dir: number) => ({
      x: dir >= 0 ? "-5%" : "5%",
      opacity: 0,
      scale: 0.97,
      transition: { duration: 0.3, ease: "easeIn" } as Transition,
    }),
  };

  // Empty state
  if (images.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_EXPO } as Transition}
        className="relative aspect-[16/9] w-full border border-[var(--border-strong)] rounded-xl bg-radial from-zinc-800 to-zinc-950 overflow-hidden flex flex-col items-center justify-center p-8 select-none"
      >
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,var(--border-strong)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-strong)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <span className="text-[10px] tracking-widest text-[var(--accent)] font-semibold uppercase font-display mb-1.5">
          Knordica Gallery
        </span>
        <h3 className="text-xl font-bold font-display text-[var(--text-2)] text-center max-w-md line-clamp-1">
          {title}
        </h3>
        <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
          [ ARCHITECTURAL PREVIEW — PLACEHOLDER ]
        </p>
      </motion.div>
    );
  }

  return (
    <>
      {/* ── Desktop Grid ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE_EXPO } as Transition}
        className="hidden md:grid grid-cols-5 gap-2.5 aspect-[16/7] max-h-[520px]"
      >
        {/* Main Cover — 60% */}
        <motion.div
          onClick={() => open(0)}
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.3 }}
          className="col-span-3 h-full border border-[var(--border)] rounded-xl overflow-hidden relative cursor-pointer group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[0]?.url}
            alt={images[0]?.alt_es || title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-sm text-white text-xs font-medium tracking-wider">
              <Maximize2 className="h-3.5 w-3.5" />
              {images.length > 1 && <span>{images.length} fotos</span>}
            </div>
          </div>
          {/* Photo count badge */}
          <div className="absolute bottom-3 left-3 bg-black/65 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded-sm">
            1 / {images.length}
          </div>
        </motion.div>

        {/* Side Thumbnails — 40% */}
        <div className="col-span-2 flex flex-col gap-2.5 h-full">
          {images.slice(1, 3).map((img, i) => {
            const isLast = i === 1;
            const hasMore = images.length > 3;
            return (
              <motion.div
                key={img.id}
                onClick={() => open(i + 1)}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.1 + i * 0.08, ease: EASE_EXPO } as Transition}
                whileHover={{ scale: 1.01 }}
                className="flex-1 border border-[var(--border)] rounded-xl overflow-hidden relative cursor-pointer group bg-zinc-900"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt_es || title}
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05] ${
                    isLast && hasMore ? "filter blur-[1px] opacity-50" : ""
                  }`}
                />
                {isLast && hasMore ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/55 backdrop-blur-[2px]">
                    <Grid3X3 className="h-5 w-5 mb-1 opacity-70" />
                    <span className="text-lg font-bold font-display">+{images.length - 3}</span>
                    <span className="text-[10px] font-mono opacity-60 mt-0.5">
                      {images.length > 3 ? "ver todas" : ""}
                    </span>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="h-4 w-4 text-white" />
                  </div>
                )}
              </motion.div>
            );
          })}

          {images.length === 2 && (
            <div className="flex-1 border border-[var(--border)] rounded-xl bg-[var(--surface-2)] flex flex-col items-center justify-center p-4">
              <span className="text-[10px] tracking-widest text-[var(--accent)] font-semibold uppercase font-display">
                Knordica
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Mobile Carousel ── */}
      <div className="flex md:hidden flex-col gap-2">
        <div className="relative w-full h-[260px] sm:h-[360px] overflow-hidden rounded-xl border border-[var(--border)]">
          <div
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none h-full w-full"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {images.map((img, i) => (
              <div
                key={img.id}
                onClick={() => open(i)}
                className="w-full h-full flex-shrink-0 snap-start relative cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt_es || title} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          {/* Mobile counter */}
          <div className="absolute bottom-3 right-3 bg-black/65 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded-sm">
            {activeMobileIndex + 1} / {images.length}
          </div>
        </div>
        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-0.5">
          {images.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: activeMobileIndex === i ? 20 : 6,
                backgroundColor: activeMobileIndex === i ? "var(--accent)" : "rgba(255,255,255,0.25)",
              }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>
      </div>

      {/* ── Fullscreen Lightbox ── */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            className="fixed inset-0 z-[100] bg-black/97 backdrop-blur-md flex flex-col items-center justify-center select-none"
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/60 to-transparent z-10">
              <span className="text-white/50 text-xs font-mono">
                {lightboxIndex + 1} · {images.length}
              </span>
              <span className="text-white/70 text-xs font-light tracking-wide line-clamp-1 max-w-xs text-center">
                {title}
              </span>
              <motion.button
                onClick={close}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="h-9 w-9 border border-white/20 rounded-sm flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-colors cursor-pointer bg-black/40 backdrop-blur-sm"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            {/* Prev Button */}
            <motion.button
              onClick={prev}
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.95 }}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 h-11 w-11 border border-white/15 rounded-sm flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-colors cursor-pointer z-20 bg-black/40 backdrop-blur-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>

            {/* Main Image */}
            <div
              className="relative w-full h-full flex items-center justify-center px-20 py-16"
              onClick={close}
            >
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={lightboxIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="max-w-5xl max-h-full flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={images[lightboxIndex]?.url}
                    alt={images[lightboxIndex]?.alt_es || title}
                    className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl border border-white/5"
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Next Button */}
            <motion.button
              onClick={next}
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 h-11 w-11 border border-white/15 rounded-sm flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-colors cursor-pointer z-20 bg-black/40 backdrop-blur-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>

            {/* Bottom Thumbnail Strip */}
            {images.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 py-4 bg-gradient-to-t from-black/70 to-transparent px-4">
                <div className="flex gap-2 overflow-x-auto max-w-2xl scrollbar-none pb-1">
                  {images.map((img, i) => (
                    <motion.button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDirection(i > (lightboxIndex ?? 0) ? 1 : -1);
                        setLightboxIndex(i);
                      }}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.96 }}
                      animate={{
                        opacity: lightboxIndex === i ? 1 : 0.45,
                        borderColor:
                          lightboxIndex === i
                            ? "var(--accent)"
                            : "rgba(255,255,255,0.1)",
                      }}
                      className="h-12 w-16 flex-shrink-0 rounded-sm overflow-hidden border cursor-pointer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.alt_es || `${i + 1}`}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
