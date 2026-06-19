import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, ArrowLeft, Send } from "lucide-react";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/queries/blog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  // Pre-render blog posts
  const posts = await getBlogPosts("es");
  return posts.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getBlogPostBySlug(slug, locale as "es" | "en");

  if (!post) return {};

  return {
    title: `${post.title} | Knordica Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : [],
    },
  };
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const post = await getBlogPostBySlug(slug, locale as "es" | "en");

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.published_at).toLocaleDateString(
    locale === "es" ? "es-VE" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const getCategoryLabel = (cat: string) => {
    const cats: Record<string, string> = {
      mercado: locale === "es" ? "Mercado" : "Market",
      guias: locale === "es" ? "Guías" : "Guides",
      market: "Market",
      guides: "Guides",
    };
    return cats[cat] || cat;
  };

  // Convert simple markdown headings & lists to styled HTML tags
  const renderContentHtml = (markdown: string) => {
    return markdown
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl md:text-3xl font-bold font-display tracking-tight text-[var(--text)] mt-8 mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl md:text-2xl font-bold font-display tracking-tight text-[var(--text)] mt-8 mb-4">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold font-display tracking-tight text-[var(--text)] mt-6 mb-3">$1</h3>')
      .replace(/^\- (.*$)/gim, '<li class="ml-6 list-disc mb-2">$1</li>')
      .replace(/^\d\.\s(.*$)/gim, '<li class="ml-6 list-decimal mb-2">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[var(--text)]">$1</strong>')
      .split("\n\n")
      .map((paragraph) => {
        if (paragraph.trim().startsWith("<h") || paragraph.trim().startsWith("<li")) {
          return paragraph;
        }
        return `<p class="mb-4 leading-relaxed font-light text-[var(--text-2)]">${paragraph}</p>`;
      })
      .join("");
  };

  return (
    <article className="pt-24 pb-16 min-h-screen">
      <div className="container-knordica max-w-3xl">
        {/* Back Link */}
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-2)] hover:text-[var(--accent)] transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{locale === "es" ? "Volver a la editorial" : "Back to blog"}</span>
        </Link>

        {/* Categories & Date */}
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-mono mb-4">
          <Badge variant="accent" className="font-sans font-bold text-[9px] tracking-wider uppercase">
            {getCategoryLabel(post.category)}
          </Badge>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display tracking-tight text-[var(--text)] leading-tight mb-6">
          {post.title}
        </h1>

        {/* Author row */}
        <div className="flex items-center gap-3 pb-8 border-b border-[var(--border)] mb-8">
          <div className="h-8 w-8 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] font-bold text-xs">
            {post.author_name.charAt(0)}
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-[var(--text)] leading-none">{post.author_name}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Knordica Advisory Group</p>
          </div>
        </div>

        {/* Main cover image */}
        {post.cover_image_url && (
          <div className="relative aspect-[16/9] w-full rounded-sm overflow-hidden mb-8 border border-[var(--border)] bg-zinc-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        <div 
          className="prose prose-zinc dark:prose-invert max-w-none text-sm md:text-base leading-relaxed text-[var(--text-2)] font-light"
          dangerouslySetInnerHTML={{ __html: renderContentHtml(post.content) }}
        />

        {/* Bottom CTA Block */}
        <div className="mt-16 p-8 border border-[var(--border-strong)] rounded-sm bg-[var(--surface-2)]/30 glass flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <h4 className="font-display font-bold text-base text-[var(--text)]">
              {locale === "es" ? "¿Deseas invertir en Mérida?" : "Looking to invest in Mérida?"}
            </h4>
            <p className="text-xs text-[var(--text-2)] font-light">
              {locale === "es" 
                ? "Nuestros asesores técnicos te ayudarán a encontrar las mejores oportunidades de plusvalía." 
                : "Our technical advisors will help you find the best value appreciation opportunities."}
            </p>
          </div>
          <Link href={`/${locale}/contacto`}>
            <Button variant="primary" size="sm" className="h-9 px-4 text-xs font-display uppercase tracking-wider">
              <Send className="h-3 w-3" />
              <span>{locale === "es" ? "Contactar Asesor" : "Contact Advisor"}</span>
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
