"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePanelRole } from "@/hooks/usePanelRole";
import { DataTable, Column } from "@/components/panel/DataTable";
import { Plus, Edit, Trash2, Eye, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function PropiedadesPage({ params }: PageProps) {
  const { locale } = use(params);
  const router = useRouter();
  const { role, userId, loading: roleLoading } = usePanelRole();
  
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load properties
  const loadProperties = async () => {
    try {
      setLoading(true);
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      let query = supabase
        .from("properties")
        .select("*, translations:property_translations(*), images:property_images(*)");

      // Filter by agent if not admin/senior
      if (role !== "admin" && role !== "senior" && userId) {
        query = query.eq("agent_id", userId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        // Map db arrays back into neat data items
        const mapped = data.map((prop) => {
          const trans = prop.translations?.find((t: any) => t.locale === locale) || prop.translations?.[0] || {};
          const cover = prop.images?.find((i: any) => i.is_cover)?.url || "";
          return {
            id: prop.id,
            slug: prop.slug,
            title: trans.title || "Sin título",
            type: prop.property_type,
            operation: prop.operation,
            price: prop.price,
            priceCurrency: prop.price_currency || "USD",
            status: prop.status,
            views: prop.completeness_score || 0, // Fallback view stat to score for simulation
            coverUrl: cover,
          };
        });
        setProperties(mapped);
      }
    } catch (err) {
      console.error("Failed to load properties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roleLoading) {
      loadProperties();
    }
  }, [role, userId, roleLoading]);

  // Delete handler
  const handleDelete = async (id: string) => {
    if (!confirm(locale === "en" ? "Are you sure you want to delete this property?" : "¿Estás seguro de eliminar esta propiedad?")) return;

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
      
      // Reload properties list
      loadProperties();
    } catch (err) {
      console.error("Delete property failed:", err);
      alert(locale === "en" ? "Failed to delete property." : "Error al eliminar la propiedad.");
    }
  };

  // Bulk Delete
  const handleBulkDelete = async (selectedItems: any[]) => {
    if (!confirm(locale === "en" ? `Delete ${selectedItems.length} properties?` : `¿Eliminar ${selectedItems.length} propiedades?`)) return;

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const ids = selectedItems.map((item) => item.id);
      
      const { error } = await supabase.from("properties").delete().in("id", ids);
      if (error) throw error;

      loadProperties();
    } catch (err) {
      console.error("Bulk delete failed:", err);
      alert(locale === "en" ? "Bulk delete failed." : "Error en eliminación masiva.");
    }
  };

  const columns: Column<any>[] = [
    {
      key: "coverUrl",
      label_es: "Foto",
      label_en: "Photo",
      render: (item) => (
        <div className="w-12 h-10 rounded-xs overflow-hidden bg-black/20 border border-[var(--border)] shrink-0">
          {item.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--text-muted)] bg-white/5 font-display font-bold">
              K
            </div>
          )}
        </div>
      ),
    },
    {
      key: "title",
      label_es: "Título",
      label_en: "Title",
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-semibold text-white/90 truncate max-w-[200px] block">{item.title}</span>
          <span className="text-[10px] text-[var(--text-muted)] font-mono block mt-0.5">{item.id.substring(0, 8)}...</span>
        </div>
      ),
    },
    {
      key: "type",
      label_es: "Tipo",
      label_en: "Type",
      sortable: true,
      render: (item) => <span className="capitalize">{item.type.replace("_", " ")}</span>,
    },
    {
      key: "operation",
      label_es: "Operación",
      label_en: "Operation",
      sortable: true,
      render: (item) => (
        <span
          className="inline-block px-1.5 py-0.5 rounded-xs text-[9px] font-bold uppercase tracking-wider font-mono"
          style={{
            background: item.operation === "venta" ? "rgba(201,150,42,0.1)" : "rgba(1,105,111,0.1)",
            color: item.operation === "venta" ? "var(--color-gold)" : "var(--color-primary-hover, #D4C8B0)",
          }}
        >
          {item.operation}
        </span>
      ),
    },
    {
      key: "price",
      label_es: "Precio",
      label_en: "Price",
      sortable: true,
      render: (item) => <span className="font-semibold font-mono">{item.priceCurrency} {item.price.toLocaleString()}</span>,
    },
    {
      key: "status",
      label_es: "Estado",
      label_en: "Status",
      sortable: true,
      render: (item) => (
        <span
          className="inline-block px-1.5 py-0.5 rounded-xs text-[9px] font-bold uppercase tracking-wider font-display"
          style={{
            background: item.status === "activa" ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)",
            color: item.status === "activa" ? "var(--success)" : "var(--text-muted)",
          }}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: "actions",
      label_es: "Acciones",
      label_en: "Actions",
      render: (item) => (
        <div className="flex gap-1">
          <Link
            href={`/${locale}/panel/propiedades/editar/${item.id}`}
            className="w-7 h-7 flex items-center justify-center rounded-sm text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-all"
            title={locale === "en" ? "Edit" : "Editar"}
          >
            <Edit size={13} />
          </Link>
          <a
            href={`/${locale}/propiedades/${item.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 flex items-center justify-center rounded-sm text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-all"
            title={locale === "en" ? "View Public" : "Ver público"}
          >
            <ExternalLink size={13} />
          </a>
          <button
            onClick={() => handleDelete(item.id)}
            className="w-7 h-7 flex items-center justify-center rounded-sm text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer"
            title={locale === "en" ? "Delete" : "Eliminar"}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-[var(--text)]">
            {locale === "en" ? "My Properties" : "Mis Propiedades"}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            {locale === "en" ? "Manage and edit all real estate listings." : "Administra y edita todos los listados de inmuebles."}
          </p>
        </div>

        <Link
          href={`/${locale}/panel/propiedades/nueva`}
          className="px-4 py-2 bg-[#01696f] hover:bg-[#015257] text-white text-xs font-semibold rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus size={14} />
          <span>{locale === "en" ? "New Property" : "Nueva Propiedad"}</span>
        </Link>
      </div>

      {/* Properties Table */}
      <DataTable
        columns={columns}
        data={properties}
        loading={loading || roleLoading}
        locale={locale}
        keyExtractor={(item) => item.id}
        searchKeys={["title", "type", "operation", "status"]}
        bulkActions={[
          {
            label_es: "Eliminar seleccionados",
            label_en: "Delete selected",
            action: handleBulkDelete,
          },
        ]}
      />
    </div>
  );
}
