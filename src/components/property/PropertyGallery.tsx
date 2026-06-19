"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import type { PropertyImage } from "@/types/property";

interface PropertyGalleryProps {
  images: PropertyImage[];
  title: string;
}

export function PropertyGallery({ images = [], title }: PropertyGalleryProps) {
  const [index, setIndex] = useState<number | null>(null);

  // If no images are available, render an elegant architectural banner placeholder
  if (images.length === 0) {
    return (
      <div className="relative aspect-[16/9] w-full border border-[var(--border-strong)] rounded-sm bg-radial from-zinc-800 to-zinc-950 overflow-hidden flex flex-col items-center justify-center p-8 select-none">
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

  return (
    <div className="flex flex-col gap-4">
      {/* Featured Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[300px] sm:h-[400px]">
        {/* Main Cover */}
        <div
          onClick={() => setIndex(0)}
          className="md:col-span-3 h-full border border-[var(--border)] rounded-sm overflow-hidden relative cursor-pointer group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[0]?.url}
            alt={images[0]?.alt_es || title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
          />
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Maximize2 className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Side Thumbnails */}
        <div className="hidden md:flex flex-col gap-3 h-full">
          {images.slice(1, 3).map((img, i) => (
            <div
              key={img.id}
              onClick={() => setIndex(i + 1)}
              className="flex-1 border border-[var(--border)] rounded-sm overflow-hidden relative cursor-pointer group bg-zinc-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt_es || title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="h-4 w-4 text-white" />
              </div>
            </div>
          ))}
          
          {/* Remaining Images overlay card */}
          {images.length > 3 && (
            <div
              onClick={() => setIndex(3)}
              className="flex-1 border border-[var(--border)] rounded-sm overflow-hidden relative cursor-pointer group bg-zinc-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[3]?.url}
                alt={images[3]?.alt_es || title}
                className="w-full h-full object-cover filter blur-[2px] opacity-40 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold font-display text-white bg-black/50">
                +{images.length - 3}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {index !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIndex(null)}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xs flex items-center justify-center p-4 select-none"
          >
            {/* Close */}
            <button
              onClick={() => setIndex(null)}
              className="absolute top-6 right-6 h-10 w-10 border border-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Left Nav */}
            <button
              onClick={handlePrev}
              className="absolute left-6 top-1/2 -translate-y-1/2 h-12 w-12 border border-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Main Lightbox Image */}
            <motion.div
              key={index}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[index]?.url}
                alt={images[index]?.alt_es || title}
                className="max-w-full max-h-[80vh] object-contain border border-white/10 rounded-sm"
              />
            </motion.div>

            {/* Right Nav */}
            <button
              onClick={handleNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 border border-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors cursor-pointer"
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
