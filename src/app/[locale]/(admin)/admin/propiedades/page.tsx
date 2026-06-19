"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/layout/LocaleProvider";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/admin/DataTable";
import { MOCK_PROPERTIES } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Building, 
  Plus, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Eye,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AdminPropiedades() {
  const { locale, dict } = useLocale();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Load properties
  const loadProperties = async () => {
    setLoading(true);
    const hasSupabaseKeys = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD";

    if (hasSupabaseKeys) {
      try {
        const { data, error } = await supabase
          .from("properties")
          .select(`
            *,
            zone:zones(*),
            translations:property_translations(locale, title),
            property_images(url, is_cover)
          `)
          .order("created_at", { ascending: false });

        if (!error && data) {
          const mapped = data.map((p: any) => {
            const trans = p.translations?.find((t: any) => t.locale === locale) || 
                          p.translations?.[0] || 
                          { title: "Propiedad sin título" };
            
            const coverImgObj = p.property_images?.find((img: any) => img.is_cover) || 
                               p.property_images?.[0];

            return {
              id: p.id,
              slug: p.slug,
              operation: p.operation,
              property_type: p.property_type,
              status: p.status,
              price: Number(p.price),
              price_currency: p.price_currency || "USD",
              bedrooms: p.bedrooms,
              bathrooms: p.bathrooms,
              area_total: p.area_total,
              zone: p.zone,
              title: trans.title,
              cover_image: coverImgObj ? { url: coverImgObj.url } : null
            };
          });
          setProperties(mapped);
        }
      } catch (e) {
        console.error("Supabase load properties error", e);
      }
    } else {
      // Local development fallback
      const localProperties = JSON.parse(localStorage.getItem("knordica-dev-properties") || "null");
      if (localProperties) {
        setProperties(localProperties);
      } else {
        setProperties(MOCK_PROPERTIES);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProperties();
  }, []);

  // Delete Mutation
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      locale === "es"
        ? "¿Estás seguro de que deseas eliminar esta propiedad? Esta acción no se puede deshacer."
        : "Are you sure you want to delete this property? This action cannot be undone."
    );
    if (!confirmDelete) return;

    const hasSupabaseKeys = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD";

    if (hasSupabaseKeys) {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) {
        alert(locale === "es" ? "Error al eliminar la propiedad." : "Error deleting property.");
      } else {
        loadProperties();
      }
    } else {
      // Local fallback delete
      const localProperties = JSON.parse(localStorage.getItem("knordica-dev-properties") || "null") || MOCK_PROPERTIES;
      const updated = localProperties.filter((p: any) => p.id !== id);
      localStorage.setItem("knordica-dev-properties", JSON.stringify(updated));
      setProperties(updated);
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      casa: locale === "es" ? "Casa" : "House",
      apartamento: locale === "es" ? "Apartamento" : "Apartment",
      local: locale === "es" ? "Local" : "Commercial",
      terreno: locale === "es" ? "Terreno" : "Land",
      finca: locale === "es" ? "Finca" : "Estate",
      oficina: locale === "es" ? "Oficina" : "Office",
      proyecto: locale === "es" ? "Proyecto" : "Project",
    };
    return types[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; style: "gold" | "accent" | "success" | "outline" }> = {
      activa: { label: locale === "es" ? "Activa" : "Active", style: "success" },
      reservada: { label: locale === "es" ? "Reservada" : "Reserved", style: "gold" },
      vendida: { label: locale === "es" ? "Vendida" : "Sold", style: "outline" },
      alquilada: { label: locale === "es" ? "Alquilada" : "Rented", style: "outline" },
      inactiva: { label: locale === "es" ? "Inactiva" : "Inactive", style: "outline" },
    };
    const config = statuses[status] || { label: status, style: "outline" };
    return <Badge variant={config.style}>{config.label}</Badge>;
  };

  // Columns definition for DataTable
  const columns = [
    {
      key: "title",
      header: locale === "es" ? "Propiedad" : "Property",
      sortable: true,
      render: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-12 rounded-xs bg-zinc-900 border border-[var(--border)] overflow-hidden shrink-0">
            {item.cover_image?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.cover_image.url}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-[10px] text-[var(--text-muted)] bg-[var(--surface-2)]">
                K
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h5 className="font-semibold text-[var(--text)] truncate max-w-[200px]" title={item.title}>
              {item.title}
            </h5>
            <span className="text-[10px] text-[var(--text-muted)] font-mono truncate block">
              {item.slug}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "zone.name_es",
      header: locale === "es" ? "Zona" : "Zone",
      sortable: true,
      render: (item: any) => (
        <span>
          {item.zone 
            ? (locale === "es" ? item.zone.name_es : item.zone.name_en || item.zone.name_es)
            : "Mérida"}
        </span>
      ),
    },
    {
      key: "property_type",
      header: locale === "es" ? "Tipo / Operación" : "Type / Operation",
      sortable: true,
      render: (item: any) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-[var(--text)]">{getPropertyTypeLabel(item.property_type)}</span>
          <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
            {item.operation === "venta" 
              ? (locale === "es" ? "Venta" : "For Sale")
              : (locale === "es" ? "Alquiler" : "For Rent")}
          </span>
        </div>
      ),
    },
    {
      key: "price",
      header: locale === "es" ? "Precio" : "Price",
      sortable: true,
      render: (item: any) => {
        const formatted = new Intl.NumberFormat("es-VE", {
          style: "currency",
          currency: item.price_currency || "USD",
          maximumFractionDigits: 0,
        }).format(item.price);
        return <span className="font-bold font-mono text-[var(--gold)]">{formatted}</span>;
      },
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (item: any) => getStatusBadge(item.status),
    },
    {
      key: "actions",
      header: locale === "es" ? "Acciones" : "Actions",
      render: (item: any) => (
        <div className="flex items-center gap-1.5">
          {/* View Public page */}
          <Link href={`/${locale}/propiedades/${item.slug}`} target="_blank" title="Ver ficha pública">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] rounded-xs flex items-center justify-center cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </Link>
          {/* Edit Page */}
          <Link href={`/${locale}/admin/propiedades/${item.id}`} title="Editar propiedad">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent)] rounded-xs flex items-center justify-center cursor-pointer"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          </Link>
          {/* Delete Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(item.id)}
            className="h-8 w-8 p-0 border border-[var(--border)] text-[var(--text-muted)] hover:text-red-400 hover:border-red-500/30 rounded-xs flex items-center justify-center cursor-pointer"
            title="Eliminar propiedad"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display mb-1">
            <Link href={`/${locale}/admin`} className="hover:text-[var(--accent)] transition-colors">
              {locale === "es" ? "Resumen" : "Dashboard"}
            </Link>
            <span>/</span>
            <span className="text-[var(--accent)]">{locale === "es" ? "Propiedades" : "Properties"}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[var(--text)]">
            {locale === "es" ? "Catálogo Inmobiliario" : "Listings Management"}
          </h2>
          <p className="text-xs text-[var(--text-2)] font-light mt-1">
            {locale === "es"
              ? "Crea, edita, destaca y gestiona la disponibilidad de las propiedades activas."
              : "Create, edit, feature, and manage the availability of active properties."}
          </p>
        </div>

        <Link href={`/${locale}/admin/propiedades/nueva`}>
          <Button variant="primary" className="text-xs uppercase tracking-wider font-display h-10 px-5 rounded-sm shrink-0">
            <Plus className="h-4 w-4 mr-1.5" />
            <span>{locale === "es" ? "Nueva Propiedad" : "Add Property"}</span>
          </Button>
        </Link>
      </div>

      {/* Main Table view */}
      {loading ? (
        <div className="p-8 border border-[var(--border)] bg-[var(--surface)] animate-pulse rounded-sm min-h-[300px]" />
      ) : (
        <DataTable
          columns={columns}
          data={properties}
          searchPlaceholder={locale === "es" ? "Buscar por título, zona, slug..." : "Search by title, zone, slug..."}
          searchKeys={["title", "slug", "property_type", "operation"]}
        />
      )}

      {/* Helper notification block */}
      <div className="p-4 border border-[var(--border)] bg-[var(--surface-2)]/30 rounded-sm flex items-start gap-3">
        <Sparkles className="h-4.5 w-4.5 text-[var(--accent)] shrink-0 mt-0.5" />
        <span className="text-[11px] text-[var(--text-muted)] leading-relaxed">
          {locale === "es"
            ? "Para destacar propiedades en la página de inicio o marcar listados como exclusivos, edita la propiedad y habilita las casillas correspondientes en la sección de estado."
            : "To feature properties on the homepage or mark listings as exclusive, edit the property and enable the corresponding checkboxes under the status section."}
        </span>
      </div>
    </div>
  );
}
