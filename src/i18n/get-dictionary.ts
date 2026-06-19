import type { Locale } from "./config";

// Server-side dictionary loader.
// Called from [locale] layout — passes dictionary down to Server Components.
// Client Components only receive the specific strings they need as props.

const dictionaries = {
  es: () => import("./dictionaries/es").then((m) => m.default),
  en: () => import("./dictionaries/en").then((m) => m.default),
};

export const getDictionary = async (locale: Locale) => {
  const loader = dictionaries[locale] ?? dictionaries.es;
  return loader();
};
