"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import type { PropertyImage } from "@/types/property";

interface PropertyGalleryProps {
  images: PropertyImage[];
  title: string;
}

export function PropertyGallery({ images = [], title }: PropertyGalleryProps) {
  const [index, setIndex] = useState<number | null>(null);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);

  useEffect(() => {
    if (index === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIndex(null);
      } else if (e.key === "ArrowLeft") {
        setIndex((prev) => (prev === null || prev === 0 ? images.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setIndex((prev) => (prev === null || prev === images.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, images.length]);

  // If no images are available, render an elegant architectural banner placeholder
  if (images.length === 0) {
    return (
      <div className="relative aspect-[16/9] w-full border border-[var(--border-strong)] rounded-lg bg-radial from-zinc-800 to-zinc-950 overflow-hidden flex flex-col items-center justify-center p-8 select-none">
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
      </div>
    );
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index !== null) {
      setIndex(index === 0 ? images.length - 1 : index - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (index !== null) {
      setIndex(index === images.length - 1 ? 0 : index + 1);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollPosition = target.scrollLeft;
    const width = target.clientWidth;
    if (width > 0) {
      const idx = Math.round(scrollPosition / width);
      setActiveMobileIndex(idx);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Desktop Layout: 60/40 Split Grid */}
      <div className="hidden md:grid grid-cols-5 gap-3 h-[400px]">
        {/* Main Cover (60% width = col-span-3) */}
        <div
          onClick={() => setIndex(0)}
          className="col-span-3 h-full border border-[var(--border)] rounded-lg overflow-hidden relative cursor-pointer group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[0]?.url}
            alt={images[0]?.alt_es || title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Maximize2 className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Side Thumbnails (40% width = col-span-2) */}
        <div className="col-span-2 flex flex-col gap-3 h-full">
          {images.slice(1, 3).map((img, i) => {
            const isSecondThumb = i === 1;
            const hasMore = images.length > 3;

            return (
              <div
                key={img.id}
                onClick={() => setIndex(i + 1)}
                className="flex-1 border border-[var(--border)] rounded-lg overflow-hidden relative cursor-pointer group bg-zinc-900"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt_es || title}
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05] ${
                    isSecondThumb && hasMore ? "filter blur-[2px] opacity-40" : ""
                  }`}
                />
                
                {isSecondThumb && hasMore ? (
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold font-display text-white bg-black/50">
                    +{images.length - 3}
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Fallback if we only have 2 images to render nicely */}
          {images.length === 2 && (
            <div className="flex-1 border border-[var(--border)] rounded-lg bg-[var(--surface-2)] flex flex-col items-center justify-center p-4">
              <span className="text-[10px] tracking-widest text-[var(--accent)] font-semibold uppercase font-display">
                Knordica
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout: Horizontal Swipe Carousel */}
      <div className="flex md:hidden flex-col gap-2">
        <div className="relative w-full h-[250px] sm:h-[350px] overflow-hidden rounded-lg border border-[var(--border)]">
          <div
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none h-full w-full"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {images.map((img, i) => (
              <div
                key={img.id}
                onClick={() => setIndex(i)}
                className="w-full h-full flex-shrink-0 snap-start relative cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt_es || title}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Indicator Dots */}
        <div className="flex justify-center gap-1.5 mt-1">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                activeMobileIndex === i ? "bg-[var(--accent)] w-3" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {index !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIndex(null)}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-[4px] flex items-center justify-center p-4 select-none"
          >
            {/* Close Button */}
            <button
              onClick={() => setIndex(null)}
              className="absolute top-6 right-6 h-10 w-10 border border-white/20 rounded-sm flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors cursor-pointer z-50 bg-black/50"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Left Nav */}
            <button
              onClick={handlePrev}
              className="absolute left-6 top-1/2 -translate-y-1/2 h-12 w-12 border border-white/20 rounded-sm flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors cursor-pointer z-50 bg-black/50"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Main Lightbox Image */}
            <motion.div
              key={index}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-4xl max-h-[85vh] overflow-hidden flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[index]?.url}
                alt={images[index]?.alt_es || title}
                className="max-w-full max-h-[85vh] object-contain border border-white/10 rounded-lg"
              />
            </motion.div>

            {/* Right Nav */}
            <button
              onClick={handleNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 border border-white/20 rounded-sm flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors cursor-pointer z-50 bg-black/50"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Index indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono text-white/50">
              {index + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
