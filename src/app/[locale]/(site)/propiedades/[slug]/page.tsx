import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPropertyBySlug, getProperties } from "@/lib/queries/properties";
import { PropertyDetail } from "@/components/property/PropertyDetail";
import { RelatedProperties } from "@/components/property/RelatedProperties";
import { generatePropertyMetadata } from "@/lib/seo/metadata";
import { generatePropertyStructuredData } from "@/lib/seo/structured-data";
import { MOCK_PROPERTIES } from "@/lib/mock-data";
import type { Locale } from "@/i18n/config";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  // Pre-render pages for all mock properties on build
  return MOCK_PROPERTIES.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://knordica.com";
  return generatePropertyMetadata({
    property,
    locale: locale as Locale,
    siteUrl,
  });
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;

  // Parallel server fetches
  const [property, allPropertiesResult] = await Promise.all([
    getPropertyBySlug(slug),
    getProperties({ page: 1, per_page: 10 }),
  ]);

  if (!property) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://knordica.com";
  const jsonLd = generatePropertyStructuredData({
    property,
    locale: locale as Locale,
    siteUrl,
  });

  return (
    <div className="pt-24 pb-16 min-h-screen">
      {/* Insert JSON-LD Structured Data for Google search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-knordica">
        {/* Main detail layout */}
        <PropertyDetail property={property} />

        {/* Related listings section */}
        <RelatedProperties
          properties={allPropertiesResult.data}
          currentPropertyId={property.id}
        />
      </div>
    </div>
  );
}
