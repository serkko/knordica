/**
 * Utility functions for formatting numbers, currency, and measurements
 */

/**
 * Formats a numeric price into a currency string (e.g. $280.000)
 */
export function formatPrice(price: number, currency: string = "USD", locale: "es" | "en" = "es"): string {
  if (currency === "VES") {
    const formattedNum = new Intl.NumberFormat(locale === "es" ? "es-VE" : "en-US", {
      maximumFractionDigits: 0,
    }).format(price);
    return `Bs. ${formattedNum}`;
  }

  let formatted = new Intl.NumberFormat(locale === "es" ? "es-VE" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);

  return formatted;
}

/**
 * Formats area dimensions in square meters (e.g. 520 m²)
 */
export function formatArea(area: number | null | undefined, locale: "es" | "en" = "es"): string {
  if (area === null || area === undefined) return "-";
  return `${new Intl.NumberFormat(locale === "es" ? "es-VE" : "en-US").format(area)} m²`;
}

/**
 * Formats regular numbers with correct local decimal/thousands separators
 */
export function formatNumber(num: number | null | undefined, locale: "es" | "en" = "es"): string {
  if (num === null || num === undefined) return "-";
  return new Intl.NumberFormat(locale === "es" ? "es-VE" : "en-US").format(num);
}
