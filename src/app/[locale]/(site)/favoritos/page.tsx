"use client";

import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";
import { useLocale } from "@/components/layout/LocaleProvider";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertySkeleton } from "@/components/property/PropertySkeleton";
import { HeartCrack, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";

export default function FavoritosPublicPage() {
  const { locale } = useLocale();
  const { favorites, isLoading } = useFavorites();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const items = isMounted ? favorites : [];
  const showSkeleton = isLoading || !isMounted;

  return (
    <div className="pt-24 pb-16 min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border)] pb-8 mb-12">
        <div className="container-knordica">
          <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-semibold font-display block mb-2">
            {locale === "es" ? "Guardados" : "Saved"}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-[var(--text)] leading-tight mb-2">
            {locale === "es" ? "Mis Propiedades Favoritas" : "My Favorite Properties"}
          </h1>
          <p className="text-sm md:text-base text-[var(--text-2)] font-light">
            {locale === "es" 
              ? "Accede rápidamente a las propiedades de tu interés que has guardado." 
              : "Quickly access the properties of interest you have saved."}
          </p>
        </div>
      </header>

      {/* Grid Content */}
      <div className="container-knordica">
        {showSkeleton ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <PropertySkeleton />
            <PropertySkeleton />
            <PropertySkeleton />
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center p-12 border border-[var(--border)] bg-[var(--surface)]/30 rounded-sm glass min-h-[350px] max-w-xl mx-auto"
          >
            <div className="h-16 w-16 rounded-full border border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)] mb-4">
              <HeartCrack className="h-6 w-6" />
            </div>
            <h4 className="font-display font-bold text-base text-[var(--text)] mb-2">
              {locale === "es" ? "No tienes favoritos guardados" : "No saved favorites yet"}
            </h4>
            <p className="text-xs text-[var(--text-2)] max-w-sm font-light leading-relaxed mb-6">
              {locale === "es"
                ? "Explora nuestro catálogo de casas, apartamentos y parcelas en los Andes para agregar elementos a tu lista de favoritos."
                : "Explore our catalog of houses, apartments, and plots in the Andes to add items to your favorites list."}
            </p>
            <Link href={`/${locale}/propiedades`}>
              <Button variant="primary" className="text-xs uppercase tracking-wider font-display h-10 px-6 rounded-sm">
                <Search className="h-3.5 w-3.5 mr-2" />
                <span>{locale === "es" ? "Explorar propiedades" : "Explore properties"}</span>
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full"
          >
            <AnimatePresence mode="popLayout">
              {items.map((property) => (
                <motion.div
                  key={property.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full"
                >
                  <PropertyCard property={property} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
