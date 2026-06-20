import type { Metadata } from "next";
import type { Property } from "@/types/property";

interface GeneratePropertyMetadataOptions {
  property: Property;
  locale: "es" | "en";
  siteUrl: string;
}

export function generatePropertyMetadata({
  property,
  locale,
  siteUrl,
}: GeneratePropertyMetadataOptions): Metadata {
  const isEs = locale === "es";

  // Resolve title and description from translation fields
  const trans = property.translations?.find((t) => t.locale === locale) ||
    property.translations?.[0] || {
      title: property.slug,
      short_description: "",
    };

  const title = `${trans.title} | Knordica`;
  const description =
    trans.short_description ||
    (isEs
      ? "Explora los detalles de esta propiedad seleccionada en los Andes venezolanos."
      : "Explore the details of this selected property in the Venezuelan Andes.");

  const canonicalUrl = `${siteUrl}/${locale}/propiedades/${property.slug}`;
  const alternateEs = `${siteUrl}/es/propiedades/${property.slug}`;
  const alternateEn = `${siteUrl}/en/propiedades/${property.slug}`;

  // Image fallback
  const ogImage =
    property.images?.find((img) => img.is_cover)?.url ||
    `${siteUrl}/images/og-default.jpg`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        es: alternateEs,
        en: alternateEn,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Knordica",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: trans.title,
        },
      ],
      type: "website",
      locale: locale === "es" ? "es_VE" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
