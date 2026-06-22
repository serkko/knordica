"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { usePanelRole } from "@/hooks/usePanelRole";
import { Heart, Search, Building2, ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PageProps {
  params: Promise<{ locale: string }>;
}

interface FavoriteProperty {
  id: string;
  title: string;
  slug: string;
  price: number;
  priceCurrency: string;
  coverUrl: string;
  type: string;
  operation: string;
}

const MOCK_FAVORITES: FavoriteProperty[] = [
  {
    id: "f1",
    title: "Apartamento El Tapial",
    slug: "apartamento-el-tapial",
    price: 145000,
    priceCurrency: "USD",
    coverUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    type: "apartamento",
    operation: "venta",
  },
  {
    id: "f2",
    title: "Villa de Lujo en La Pedregosa",
    slug: "villa-lujo-pedregosa",
    price: 320000,
    priceCurrency: "USD",
    coverUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    type: "casa",
    operation: "venta",
  },
];

export default function FavoritosPage({ params }: PageProps) {
  const { locale } = use(params);
  const { role, userId, loading: roleLoading } = usePanelRole();

  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      // Query favorites join properties
      const { data, error } = await supabase
        .from("favorites")
        .select("property_id, properties(*, translations:property_translations(*), images:property_images(*))")
        .eq("user_id", userId);

      if (error) {
        console.warn("Favorites table loading failed, using mocks.");
        setFavorites(MOCK_FAVORITES);
      } else if (data && data.length > 0) {
        const mapped = data.map((item: any) => {
          const prop = item.properties;
          const trans = prop.translations?.find((t: any) => t.locale === locale) || prop.translations?.[0] || {};
          const cover = prop.images?.find((i: any) => i.is_cover)?.url || "";
          return {
            id: prop.id,
            slug: prop.slug,
            title: trans.title || "Sin título",
            price: prop.price,
            priceCurrency: prop.price_currency || "USD",
            coverUrl: cover,
            type: prop.property_type,
            operation: prop.operation,
          };
        });
        setFavorites(mapped);
      } else {
        setFavorites(MOCK_FAVORITES);
      }
    } catch {
      setFavorites(MOCK_FAVORITES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roleLoading && userId) {
      loadFavorites();
    } else if (!roleLoading && !userId) {
      // Not logged in or guest
      setFavorites(MOCK_FAVORITES);
      setLoading(false);
    }
  }, [userId, roleLoading]);

  const handleRemoveFavorite = async (id: string) => {
    // Optimistic update
    setFavorites(favorites.filter((fav) => fav.id !== id));

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("property_id", id);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "var(--accent)" }} />
        <p className="text-xs text-[var(--text-muted)] font-mono mt-3">
          {locale === "en" ? "Loading favorites..." : "Cargando favoritos..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--border)]">
        <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-[var(--text)]">
          {locale === "en" ? "My Favorites" : "Mis Propiedades Favoritas"}
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {locale === "en" ? "Save properties you are interested in to review or consult later." : "Guarda las propiedades que te interesan para revisarlas o consultarlas con un asesor."}
        </p>
      </div>

      {/* Grid of favorite items */}
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {favorites.map((prop) => (
              <motion.div
                key={prop.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-sm border overflow-hidden relative flex flex-col justify-between group"
                style={{
                  background: "var(--surface-2)",
                  borderColor: "var(--border)",
                }}
              >
                {/* Image */}
                <div className="aspect-video w-full bg-black/20 overflow-hidden relative">
                  {prop.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={prop.coverUrl}
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                      <Building2 size={36} />
                    </div>
                  )}

                  {/* Operation Tag */}
                  <span
                    className="absolute top-3 left-3 px-1.5 py-0.5 rounded-xs text-[8px] font-bold font-mono uppercase tracking-wider bg-black/60 text-white"
                  >
                    {prop.operation}
                  </span>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFavorite(prop.id)}
                    className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-sm bg-black/60 text-white/80 hover:text-red-400 hover:bg-black/80 transition-colors cursor-pointer"
                    title={locale === "en" ? "Remove Favorite" : "Eliminar de Favoritos"}
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Details Footer */}
                <div className="p-4 space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider font-mono text-[var(--text-muted)]">
                    {prop.type}
                  </span>
                  <h4 className="text-xs font-semibold text-[var(--text)] truncate">
                    {prop.title}
                  </h4>
                  <p className="text-sm font-semibold font-mono text-[#C9962A]">
                    {prop.priceCurrency} {prop.price.toLocaleString()}
                  </p>

                  <div className="pt-2 border-t border-[var(--border)] flex justify-between items-center text-[10px]">
                    <Link
                      href={`/${locale}/propiedades/${prop.slug}`}
                      className="text-[#01696f] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>{locale === "en" ? "View Public Page" : "Ver Publicación"}</span>
                      <ExternalLink size={10} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div
          className="border border-dashed rounded-sm p-12 text-center text-xs text-[var(--text-muted)] font-display"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <Heart size={32} className="mx-auto text-[var(--text-muted)] mb-3 opacity-30 animate-pulse" />
          <p>{locale === "en" ? "You haven't saved any properties yet." : "Aún no tienes propiedades guardadas en favoritos."}</p>
          <Link href={`/${locale}`} className="text-[#01696f] hover:underline font-semibold mt-2 inline-block">
            {locale === "en" ? "Browse our catalogue" : "Explorar nuestro catálogo"}
          </Link>
        </div>
      )}
    </div>
  );
}
