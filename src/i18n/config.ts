// i18n configuration — source of truth for locale setup
// Español por defecto, inglés como alternativo.

export const i18nConfig = {
  defaultLocale: "es",
  locales: ["es", "en"],
} as const;

export type Locale = (typeof i18nConfig)["locales"][number];
