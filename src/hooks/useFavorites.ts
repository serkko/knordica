"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { PropertyCard } from "@/types/property";

export function useFavorites() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  // Helper check if Supabase key is default or empty
  const hasSupabaseKeys = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
                          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD";

  // 1. Fetch Favorites
  const { data: favorites = [], isLoading } = useQuery<PropertyCard[]>({
    queryKey: ["favorites"],
    queryFn: async () => {
      if (hasSupabaseKeys) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
          .from("favorites")
          .select(`
            id,
            property_id,
            property:properties(
              id,
              slug,
              operation,
              property_type,
              status,
              featured,
              exclusive,
              new_listing,
              price_reduced,
              price,
              price_currency,
              area_total,
              area_built,
              bedrooms,
              bathrooms,
              parking_spaces,
              zone:zones(*),
              translations:property_translations(locale, title, short_description)
            )
          `);

        if (error) {
          console.error("Error fetching favorites from Supabase:", error);
          throw error;
        }

        if (data) {
          const locale = typeof window !== "undefined" && window.location.pathname.startsWith("/en") ? "en" : "es";
          
          return data
            .map((item: any) => {
              const p = item.property;
              if (!p) return null;
              
              const trans = p.translations?.find((t: any) => t.locale === locale) || 
                            p.translations?.[0] || 
                            { title: "Propiedad sin título", short_description: "" };

              return {
                id: p.id,
                slug: p.slug,
                operation: p.operation,
                property_type: p.property_type,
                status: p.status,
                featured: p.featured,
                exclusive: p.exclusive,
                new_listing: p.new_listing,
                price_reduced: p.price_reduced,
                price: Number(p.price),
                price_currency: p.price_currency || "USD",
                area_total: p.area_total,
                area_built: p.area_built,
                bedrooms: p.bedrooms,
                bathrooms: p.bathrooms,
                parking_spaces: p.parking_spaces,
                zone: p.zone,
                cover_image: null, // images populated during mapping
                title: trans.title,
                short_description: trans.short_description,
              } as PropertyCard;
            })
            .filter((p): p is PropertyCard => p !== null);
        }
      }

      // LocalStorage Fallback
      if (typeof window !== "undefined") {
        const localFavs = JSON.parse(localStorage.getItem("knordica-dev-favorites") || "[]");
        return localFavs;
      }
      return [];
    },
  });

  // 2. Toggle Favorite Mutation (add or remove)
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ property, isFav }: { property: PropertyCard; isFav: boolean }) => {
      if (hasSupabaseKeys) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Auth required");

        if (isFav) {
          // Remove
          const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("property_id", property.id);
            
          if (error) throw error;
        } else {
          // Add
          const { error } = await supabase
            .from("favorites")
            .insert([{ user_id: user.id, property_id: property.id }]);

          if (error) throw error;
        }
        return;
      }

      // LocalStorage Fallback
      if (typeof window !== "undefined") {
        let localFavs: PropertyCard[] = JSON.parse(localStorage.getItem("knordica-dev-favorites") || "[]");
        if (isFav) {
          localFavs = localFavs.filter((p) => p.id !== property.id);
        } else {
          localFavs.push(property);
        }
        localStorage.setItem("knordica-dev-favorites", JSON.stringify(localFavs));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const isFavorite = (id: string) => {
    return favorites.some((p) => p.id === id);
  };

  const toggleFavorite = (property: PropertyCard) => {
    const isFav = isFavorite(property.id);
    toggleFavoriteMutation.mutate({ property, isFav });
  };

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    toggleMutation: toggleFavoriteMutation,
  };
}
