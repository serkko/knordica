import type { Property } from "@/types/property";

interface StructuredDataOptions {
  property: Property;
  locale: "es" | "en";
  siteUrl: string;
}

export function generatePropertyStructuredData({
  property,
  locale,
  siteUrl,
}: StructuredDataOptions) {
  const trans = property.translations?.find((t) => t.locale === locale) ||
    property.translations?.[0] || {
      title: property.slug,
      description: "",
      short_description: "",
    };

  const name = trans.title;
  const description = trans.description || trans.short_description || "";
  const url = `${siteUrl}/${locale}/propiedades/${property.slug}`;

  const image = property.images && property.images.length > 0
    ? property.images.map((img) => img.url)
    : [`${siteUrl}/images/og-default.jpg`];

  return {
    "@context": "https://schema.org",
    "@type": "SingleFamilyResidence",
    "name": name,
    "description": description,
    "url": url,
    "image": image,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.zone?.city || "Mérida",
      "addressRegion": "Mérida",
      "addressCountry": "VE",
      "streetAddress": locale === "es" ? property.address_es || "" : property.address_en || "",
    },
    "geo": property.lat && property.lng ? {
      "@type": "GeoCoordinates",
      "latitude": property.lat,
      "longitude": property.lng,
    } : undefined,
    "offers": {
      "@type": "Offer",
      "priceCurrency": property.price_currency || "USD",
      "price": property.price,
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "priceCurrency": property.price_currency || "USD",
        "price": property.price,
        "priceType": property.operation === "venta" ? "Sale" : "Rent",
      },
      "availability": "https://schema.org/InStock",
      "validFrom": property.created_at,
    },
    "numberOfRooms": property.bedrooms || undefined,
    "numberOfBathroomsTotal": property.bathrooms || undefined,
  };
}
