"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/layout/LocaleProvider";
import { createClient } from "@/lib/supabase/client";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Calendar, 
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Eye,
  Check
} from "lucide-react";

export default function AdminBlog() {
  const { locale } = useLocale();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [titleEs, setTitleEs] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [category, setCategory] = useState("mercado");
  const [coverUrl, setCoverUrl] = useState("");
  const [excerptEs, setExcerptEs] = useState("");
  const [excerptEn, setExcerptEn] = useState("");

  const supabase = createClient();
  const hasSupabaseKeys = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD";

  const loadPosts = async () => {
    setLoading(true);
    try {
      if (hasSupabaseKeys) {
        const { data, error } = await supabase
          .from("blog_posts")
          .select(`
            *,
            translations:blog_post_translations(*)
          `)
          .order("created_at", { ascending: false });

        if (!error && data) {
          const mapped = data.map((p: any) => {
            const trans = p.translations?.find((t: any) => t.locale === locale) || p.translations?.[0] || {};
            return {
              id: p.id,
              slug: p.slug,
              category: p.category,
              cover_image_url: p.cover_image_url,
              published: p.published,
              published_at: p.published_at,
              featured: p.featured,
              title: trans.title || "Artículo sin título",
              excerpt: trans.excerpt || "",
              created_at: p.created_at
            };
          });
          setPosts(mapped);
        }
      } else {
        // Fallback local storage
        const localPosts = JSON.parse(localStorage.getItem("knordica-dev-blog") || "[]");
        if (localPosts.length === 0) {
          const defaults = [
            {
              id: "post-1",
              slug: "tendencias-mercado-merida-2026",
              category: "mercado",
              cover_image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
              published: true,
              published_at: new Date().toISOString(),
              featured: true,
              title: "Tendencias del Mercado Inmobiliario en Mérida para 2026",
              excerpt: "Un análisis detallado sobre el incremento de plusvalía en el sector residencial de Mérida.",
              created_at: new Date().toISOString()
            },
            {
              id: "post-2",
              slug: "guia-comprar-propiedad-venezuela",
              category: "guias",
              cover_image_url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
              published: true,
              published_at: new Date().toISOString(),
              featured: false,
              title: "Guía Completa: Cómo comprar una propiedad en Venezuela",
              excerpt: "Todo lo que necesitas saber sobre trámites legales, registro y divisas para adquirir tu inmueble.",
              created_at: new Date().toISOString()
            }
          ];
          localStorage.setItem("knordica-dev-blog", JSON.stringify(defaults));
          setPosts(defaults);
        } else {
          setPosts(localPosts);
        }
      }
    } catch (e) {
      console.error("Load blog posts error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleTogglePublished = async (id: string, currentStatus: boolean) => {
    // Optimistic Update
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, published: !currentStatus, published_at: !currentStatus ? new Date().toISOString() : null } : p))
    );

    if (hasSupabaseKeys) {
      await supabase
        .from("blog_posts")
        .update({ 
          published: !currentStatus, 
          published_at: !currentStatus ? new Date().toISOString() : null 
        })
        .eq("id", id);
    } else {
      const localPosts = JSON.parse(localStorage.getItem("knordica-dev-blog") || "[]");
      const updated = localPosts.map((p: any) => 
        p.id === id 
          ? { ...p, published: !currentStatus, published_at: !currentStatus ? new Date().toISOString() : null } 
          : p
      );
      localStorage.setItem("knordica-dev-blog", JSON.stringify(updated));
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    // Optimistic Update
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, featured: !currentStatus } : p))
    );

    if (hasSupabaseKeys) {
      await supabase.from("blog_posts").update({ featured: !currentStatus }).eq("id", id);
    } else {
      const localPosts = JSON.parse(localStorage.getItem("knordica-dev-blog") || "[]");
      const updated = localPosts.map((p: any) => (p.id === id ? { ...p, featured: !currentStatus } : p));
      localStorage.setItem("knordica-dev-blog", JSON.stringify(updated));
    }
  };

  const handleDeletePost = async (id: string) => {
    const confirmDelete = window.confirm(
      locale === "es"
        ? "¿Estás seguro de que deseas eliminar este artículo de blog?"
        : "Are you sure you want to delete this blog post?"
    );
    if (!confirmDelete) return;

    if (hasSupabaseKeys) {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (!error) loadPosts();
    } else {
      const localPosts = JSON.parse(localStorage.getItem("knordica-dev-blog") || "[]");
      const updated = localPosts.filter((p: any) => p.id !== id);
      localStorage.setItem("knordica-dev-blog", JSON.stringify(updated));
      setPosts(updated);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEs || !excerptEs) return;

    const slug = titleEs
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const cover = coverUrl || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b";

    if (hasSupabaseKeys) {
      // Get agent author
      const { data: { user } } = await supabase.auth.getUser();
      let authorId: string | null = null;
      if (user) {
        const { data: agent } = await supabase.from("agents").select("id").eq("user_id", user.id).single();
        if (agent) authorId = agent.id;
      }

      const { data: newP, error } = await supabase
        .from("blog_posts")
        .insert([
          {
            slug,
            category,
            cover_image_url: cover,
            published: true,
            published_at: new Date().toISOString(),
            author_id: authorId
          },
        ])
        .select()
        .single();

      if (!error && newP) {
        await supabase.from("blog_post_translations").insert([
          { post_id: newP.id, locale: "es", title: titleEs, excerpt: excerptEs },
          { post_id: newP.id, locale: "en", title: titleEn || titleEs, excerpt: excerptEn || excerptEs }
        ]);

        loadPosts();
        setShowAddForm(false);
        setTitleEs("");
        setTitleEn("");
        setCoverUrl("");
        setExcerptEs("");
        setExcerptEn("");
      } else {
        alert("Error creating blog post");
      }
    } else {
      // Local fallback
      const newPostPayload = {
        id: `post-${Math.random().toString(36).substring(5)}`,
        slug,
        category,
        cover_image_url: cover,
        published: true,
        published_at: new Date().toISOString(),
        featured: false,
        title: titleEs,
        excerpt: excerptEs,
        created_at: new Date().toISOString()
      };

      const localPosts = JSON.parse(localStorage.getItem("knordica-dev-blog") || "[]");
      localPosts.unshift(newPostPayload);
      localStorage.setItem("knordica-dev-blog", JSON.stringify(localPosts));

      setPosts(localPosts);
      setShowAddForm(false);
      setTitleEs("");
      setTitleEn("");
      setCoverUrl("");
      setExcerptEs("");
      setExcerptEn("");
    }
  };

  const getCategoryLabel = (cat: string) => {
    const categories: Record<string, string> = {
      mercado: locale === "es" ? "Mercado" : "Market",
      inversion: locale === "es" ? "Inversiones" : "Investment",
      guias: locale === "es" ? "Guías" : "Guides",
      noticias: locale === "es" ? "Noticias" : "News",
    };
    return categories[cat] || cat;
  };

  const columns = [
    {
      key: "title",
      header: locale === "es" ? "Artículo" : "Blog Title",
      sortable: true,
      render: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-10 bg-zinc-900 border border-[var(--border)] overflow-hidden shrink-0 rounded-xs">
            {item.cover_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.cover_image_url}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <span className="font-bold text-[var(--text)] truncate max-w-[220px] block" title={item.title}>
              {item.title}
            </span>
            <span className="text-[9px] text-[var(--text-muted)] font-mono block">
              {item.slug}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: locale === "es" ? "Categoría" : "Category",
      sortable: true,
      render: (item: any) => (
        <span className="capitalize">{getCategoryLabel(item.category)}</span>
      ),
    },
    {
      key: "published",
      header: locale === "es" ? "Publicado" : "Status",
      sortable: true,
      render: (item: any) => (
        <button
          onClick={() => handleTogglePublished(item.id, item.published)}
          className="flex items-center gap-1 cursor-pointer hover:opacity-85 text-xs"
        >
          {item.published ? (
            <div className="flex items-center gap-1 text-emerald-400 font-medium">
              <ToggleRight className="h-5 w-5 shrink-0" />
              <span>{locale === "es" ? "Publicado" : "Published"}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[var(--text-muted)]">
              <ToggleLeft className="h-5 w-5 shrink-0" />
              <span>{locale === "es" ? "Borrador" : "Draft"}</span>
            </div>
          )}
        </button>
      ),
    },
    {
      key: "featured",
      header: locale === "es" ? "Destacado" : "Featured",
      sortable: true,
      render: (item: any) => (
        <button
          onClick={() => handleToggleFeatured(item.id, item.featured)}
          className="flex items-center gap-1 cursor-pointer hover:opacity-85 text-xs"
        >
          {item.featured ? (
            <div className="flex items-center gap-1 text-[var(--gold)] font-medium">
              <Check className="h-3.5 w-3.5 shrink-0 border border-[var(--gold)]/30 rounded-full p-0.5" />
              <span>{locale === "es" ? "Destacado" : "Featured"}</span>
            </div>
          ) : (
            <span className="text-[var(--text-muted)]">{locale === "es" ? "No" : "No"}</span>
          )}
        </button>
      ),
    },
    {
      key: "actions",
      header: locale === "es" ? "Acciones" : "Actions",
      render: (item: any) => (
        <div className="flex items-center gap-1.5">
          <Link href={`/${locale}/blog/${item.slug}`} target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] rounded-xs flex items-center justify-center cursor-pointer"
              title="Ver artículo público"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeletePost(item.id)}
            className="h-8 w-8 p-0 border border-[var(--border)] text-[var(--text-muted)] hover:text-red-400 hover:border-red-500/30 rounded-xs flex items-center justify-center cursor-pointer"
            title="Eliminar artículo"
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
            <span className="text-[var(--accent)]">{locale === "es" ? "Blog" : "Blog"}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[var(--text)]">
            {locale === "es" ? "Blog de Contenidos" : "Blog Editorial"}
          </h2>
          <p className="text-xs text-[var(--text-2)] font-light mt-1">
            {locale === "es"
              ? "Crea y publica artículos sobre tendencias de mercado inmobiliario, guías de compra y noticias de Mérida."
              : "Create and publish articles about real estate trends, buying guides, and Mérida news."}
          </p>
        </div>

        <Button 
          variant={showAddForm ? "outline" : "primary"}
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs uppercase tracking-wider font-display h-10 px-5 rounded-sm shrink-0"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          <span>{showAddForm ? (locale === "es" ? "Cancelar" : "Cancel") : (locale === "es" ? "Nuevo Artículo" : "New Post")}</span>
        </Button>
      </div>

      {/* Add Blog Post Form */}
      {showAddForm && (
        <form onSubmit={handleCreatePost} className="p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          <h3 className="font-display font-bold text-sm text-[var(--text)] pb-2 border-b border-[var(--border)]">
            {locale === "es" ? "Crear Nuevo Artículo" : "Create New Post"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                {locale === "es" ? "Título (Español)" : "Title (Spanish)"}
              </label>
              <input
                type="text"
                value={titleEs}
                onChange={(e) => setTitleEs(e.target.value)}
                required
                className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                {locale === "es" ? "Título (Inglés) - Opcional" : "Title (English) - Optional"}
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                {locale === "es" ? "Categoría" : "Category"}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] text-[var(--text)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden cursor-pointer"
              >
                <option value="mercado" className="bg-[var(--surface-2)]">{locale === "es" ? "Tendencias del Mercado" : "Market Trends"}</option>
                <option value="inversion" className="bg-[var(--surface-2)]">{locale === "es" ? "Inversiones" : "Investment Opportunities"}</option>
                <option value="guias" className="bg-[var(--surface-2)]">{locale === "es" ? "Guías de Compra/Venta" : "Buying/Selling Guides"}</option>
                <option value="noticias" className="bg-[var(--surface-2)]">{locale === "es" ? "Noticias" : "News"}</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                {locale === "es" ? "URL Imagen de Portada" : "Cover Image URL"}
              </label>
              <input
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                {locale === "es" ? "Resumen Excerpt (Español)" : "Excerpt (Spanish)"}
              </label>
              <textarea
                rows={2}
                value={excerptEs}
                onChange={(e) => setExcerptEs(e.target.value)}
                required
                className="px-3 py-2 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden resize-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                {locale === "es" ? "Resumen Excerpt (Inglés) - Opcional" : "Excerpt (English) - Optional"}
              </label>
              <textarea
                rows={2}
                value={excerptEn}
                onChange={(e) => setExcerptEn(e.target.value)}
                className="px-3 py-2 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" className="h-10 px-6 rounded-sm text-xs font-display uppercase tracking-wider">
              <span>{locale === "es" ? "Crear y Publicar" : "Create & Publish"}</span>
            </Button>
          </div>
        </form>
      )}

      {/* Main Table view */}
      {loading ? (
        <div className="p-8 border border-[var(--border)] bg-[var(--surface)] animate-pulse rounded-sm min-h-[300px]" />
      ) : (
        <DataTable
          columns={columns}
          data={posts}
          searchPlaceholder={locale === "es" ? "Buscar por título, slug..." : "Search by title, slug..."}
          searchKeys={["title", "slug"]}
        />
      )}

      {/* Helper notes */}
      <div className="p-4 border border-[var(--border)] bg-[var(--surface-2)]/30 rounded-sm flex items-start gap-3">
        <Sparkles className="h-4.5 w-4.5 text-[var(--accent)] shrink-0 mt-0.5" />
        <span className="text-[11px] text-[var(--text-muted)] leading-relaxed">
          {locale === "es"
            ? "Para que los artículos de blog aparezcan en la sección editorial de la página de inicio, asegúrate de marcarlos como 'Destacado' pulsando en la columna correspondiente."
            : "To display articles in the homepage editorial section, make sure to mark them as 'Featured' by clicking on the corresponding column."}
        </span>
      </div>
    </div>
  );
}
