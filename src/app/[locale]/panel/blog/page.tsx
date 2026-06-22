"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { usePanelRole } from "@/hooks/usePanelRole";
import { DataTable, Column } from "@/components/panel/DataTable";
import { Plus, Edit, Trash2, Eye, FileText, ShieldAlert } from "lucide-react";
import { BlogArticle } from "@/types/panel";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const MOCK_ARTICLES: BlogArticle[] = [
  {
    id: "b1",
    slug: "invertir-en-merida-2026",
    status: "publicado",
    author_id: "a1",
    category: "Inversión",
    tags: ["Mérida", "Mercado Inmobiliario"],
    cover_image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    title_es: "Tendencias del Mercado Inmobiliario en Mérida para el 2026",
    title_en: "Real Estate Trends in Merida for 2026",
    excerpt_es: "Analizamos las zonas con mayor plusvalía y los tipos de propiedades más demandados.",
    excerpt_en: "We analyze the areas with the highest appreciation and the most requested property types.",
    content_es: "Lorem ipsum dolor sit amet...",
    content_en: "Lorem ipsum dolor sit amet...",
    seo_title_es: "Invertir en Mérida 2026",
    seo_description_es: "Guía de inversión inmobiliaria en Mérida.",
    views: 1420,
    published_at: "2026-06-15",
    created_at: "2026-06-10",
    updated_at: "2026-06-15",
  },
  {
    id: "b2",
    slug: "guia-pedregosa-merida",
    status: "borrador",
    author_id: "a1",
    category: "Zonas",
    tags: ["Pedregosa", "Guía de Zonas"],
    cover_image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    title_es: "Vivir en La Pedregosa: Naturaleza y Comodidad en un Solo Lugar",
    title_en: "Living in La Pedregosa: Nature and Convenience Combined",
    excerpt_es: "Descubre por qué esta hermosa zona residencial es una de las favoritas en Mérida.",
    excerpt_en: "Discover why this beautiful residential area is one of the favorites in Merida.",
    content_es: "Lorem ipsum dolor sit amet...",
    content_en: "Lorem ipsum dolor sit amet...",
    seo_title_es: "Guía La Pedregosa",
    seo_description_es: "Todo sobre vivir en La Pedregosa, Mérida.",
    views: 0,
    published_at: null,
    created_at: "2026-06-20",
    updated_at: "2026-06-20",
  },
];

export default function BlogAdminPage({ params }: PageProps) {
  const { locale } = use(params);
  const { role, loading: roleLoading } = usePanelRole();

  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // Load articles
  const loadArticles = async () => {
    try {
      setLoading(true);
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { data, error } = await supabase.from("blog_articles").select("*");

      if (error) {
        console.warn("blog_articles table may not exist yet. Falling back to mock data.");
        setArticles(MOCK_ARTICLES);
      } else if (data && data.length > 0) {
        setArticles(data);
      } else {
        setArticles(MOCK_ARTICLES);
      }
    } catch {
      setArticles(MOCK_ARTICLES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roleLoading) {
      loadArticles();
    }
  }, [role, roleLoading]);

  const handleDelete = async (id: string) => {
    if (!confirm(locale === "en" ? "Delete this article?" : "¿Eliminar este artículo?")) return;

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.from("blog_articles").delete().eq("id", id);
      loadArticles();
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<BlogArticle>[] = [
    {
      key: "cover_image_url",
      label_es: "Portada",
      label_en: "Cover",
      render: (item) => (
        <div className="w-12 h-10 rounded-xs overflow-hidden bg-black/20 border border-[var(--border)] shrink-0">
          {item.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.cover_image_url} alt={item.title_es} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--text-muted)] bg-white/5 font-display font-bold">
              B
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
          <span className="font-semibold text-white/90 truncate max-w-[220px] block">
            {locale === "en" ? item.title_en : item.title_es}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] font-mono block mt-0.5">
            /{item.slug}
          </span>
        </div>
      ),
    },
    {
      key: "category",
      label_es: "Categoría",
      label_en: "Category",
      sortable: true,
      render: (item) => <span className="font-semibold">{item.category}</span>,
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
            background: item.status === "publicado" ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)",
            color: item.status === "publicado" ? "var(--success)" : "var(--text-muted)",
          }}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: "views",
      label_es: "Vistas",
      label_en: "Views",
      sortable: true,
      render: (item) => <span className="font-mono text-emerald-400">{item.views.toLocaleString()}</span>,
    },
    {
      key: "published_at",
      label_es: "Publicación",
      label_en: "Published",
      sortable: true,
      render: (item) => <span className="font-mono">{item.published_at || "—"}</span>,
    },
    {
      key: "actions",
      label_es: "Acciones",
      label_en: "Actions",
      render: (item) => (
        <div className="flex gap-1">
          <button
            onClick={() => alert("Blog article editing can be built here or integrated with public editor.")}
            className="w-7 h-7 flex items-center justify-center rounded-sm text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-all"
            title={locale === "en" ? "Edit" : "Editar"}
          >
            <Edit size={13} />
          </button>
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

  if (roleLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "var(--accent)" }} />
        <p className="text-xs text-[var(--text-muted)] font-mono mt-3">
          {locale === "en" ? "Loading articles..." : "Cargando artículos..."}
        </p>
      </div>
    );
  }

  // Admin access validation
  if (role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-sm text-center min-h-[300px] space-y-3"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
      >
        <span className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
          <ShieldAlert size={24} />
        </span>
        <h3 className="font-display font-bold text-base text-[var(--text)]">
          {locale === "en" ? "Access Denied" : "Acceso Denegado"}
        </h3>
        <p className="text-xs text-[var(--text-muted)] max-w-sm">
          {locale === "en"
            ? "Only administrative accounts have access to post and manage blog content."
            : "Solo las cuentas administrativas tienen acceso para publicar y gestionar contenido de blog."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-[var(--text)]">
            {locale === "en" ? "Blog Manager" : "Gestión del Blog"}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {locale === "en" ? "Compose, publish, and edit articles for the Knordica blog." : "Redacta, publica y edita artículos informativos para el blog corporativo."}
          </p>
        </div>

        <button
          onClick={() => alert("New article compose window can be opened here.")}
          className="px-4 py-2 bg-[#01696f] hover:bg-[#015257] text-white text-xs font-semibold rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus size={14} />
          <span>{locale === "en" ? "New Article" : "Nuevo Artículo"}</span>
        </button>
      </div>

      {/* Articles list */}
      <DataTable
        columns={columns}
        data={articles}
        loading={loading}
        locale={locale}
        keyExtractor={(item) => item.id}
        searchKeys={["title_es", "title_en", "category", "status"]}
      />
    </div>
  );
}
