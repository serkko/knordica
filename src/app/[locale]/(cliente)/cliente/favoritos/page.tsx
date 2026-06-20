"use client";

import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";
import { useLocale } from "@/components/layout/LocaleProvider";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertySkeleton } from "@/components/property/PropertySkeleton";
import { Heart, Trash2, ArrowLeft, Search, HeartCrack } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

export default function ClienteFavoritos() {
  const { locale, dict } = useLocale();
  const { favorites, isLoading, toggleFavorite } = useFavorites();

  const handleRemoveFavorite = (e: React.MouseEvent, property: any) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(property);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display mb-1">
          <Link href={`/${locale}/cliente`} className="hover:text-[var(--accent)] transition-colors">
            {locale === "es" ? "Panel" : "Dashboard"}
          </Link>
          <span>/</span>
          <span className="text-[var(--accent)]">{locale === "es" ? "Favoritos" : "Favorites"}</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[var(--text)]">
          {locale === "es" ? "Mis Propiedades Guardadas" : "My Saved Properties"}
        </h2>
        <p className="text-xs text-[var(--text-2)] font-light mt-1">
          {locale === "es"
            ? "Accede rápidamente a las propiedades de tu interés y compara sus detalles."
            : "Quickly access properties of interest and compare their details."}
        </p>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PropertySkeleton />
          <PropertySkeleton />
        </div>
      ) : favorites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center text-center p-12 border border-[var(--border)] bg-[var(--surface)]/30 rounded-sm glass min-h-[350px]"
        >
          <div className="h-16 w-16 rounded-full border border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)] mb-4">
            <HeartCrack className="h-6 w-6" />
          </div>
          <h4 className="font-display font-bold text-base text-[var(--text)] mb-2">
            {locale === "es" ? "No tienes favoritos guardados" : "No saved favorites yet"}
          </h4>
          <p className="text-xs text-[var(--text-2)] max-w-sm font-light leading-relaxed mb-6">
            {locale === "es"
              ? "Explora nuestro catálogo de casas, apartamentos y parcelas en los Andes para agregar elementos a tu lista."
              : "Explore our catalog of houses, apartments, and plots in the Andes to add items to your list."}
          </p>
          <Link href={`/${locale}/propiedades`}>
            <Button variant="primary" className="text-xs uppercase tracking-wider font-display h-10 px-6 rounded-sm">
              <Search className="h-3.5 w-3.5 mr-2" />
              <span>{locale === "es" ? "Explorar propiedades" : "Explore properties"}</span>
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {favorites.map((property) => (
              <motion.div
                key={property.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative group/fav"
              >
                {/* Favorite Card wrapper */}
                <PropertyCard property={property} />

                {/* Absolute Heart/Delete overlay on Favorites page */}
                <button
                  onClick={(e) => handleRemoveFavorite(e, property)}
                  className="absolute top-4 left-20 z-10 h-8 w-8 rounded-full flex items-center justify-center border border-red-500/20 bg-red-950/70 text-red-400 hover:bg-red-900 hover:text-white hover:border-red-500 transition-all cursor-pointer backdrop-blur-xs shadow-md"
                  title={locale === "es" ? "Quitar de favoritos" : "Remove from favorites"}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
