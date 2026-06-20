// [locale] layout — Root de toda la app bilingüe
// Carga el diccionario server-side y lo pasa via LocaleProvider
// ThemeProvider y GlobalBackground viven aquí

import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../globals.css";
import { notFound } from "next/navigation";
import { i18nConfig, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { LocaleProvider } from "@/components/layout/LocaleProvider";
import { GlobalBackground } from "@/components/layout/GlobalBackground";
import { QueryProvider } from "@/components/layout/QueryProvider";
import { ToastProvider } from "@/components/ui/Toast";

import Script from "next/script";

export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === "es";

  const alternates = {
    canonical: `/${locale}`,
    languages: {
      es: "/es",
      en: "/en",
    } as Record<string, string>,
  };

  return {
    title: isEs
      ? "Knordica · Propiedades en los Andes venezolanos"
      : "Knordica · Real estate in the Venezuelan Andes",
    description: isEs
      ? "Catálogo de propiedades seleccionadas en los Andes venezolanos. Acompañamos cada operación con criterio y conocimiento real del territorio."
      : "Curated property listings in the Venezuelan Andes. Every transaction guided with clarity and real knowledge of the territory.",
    alternates,
    openGraph: {
      locale: isEs ? "es_VE" : "en_US",
      alternateLocale: isEs ? "en_US" : "es_VE",
    },
    icons: {
      icon: '/logo.webp',
      apple: '/logo.webp',
    },
  };
}

// ─── Inline script to prevent theme flash ─────────────────
// Must run synchronously before first paint.
const themeScript = `
  (function() {
    try {
      var stored = localStorage.getItem('knordica-theme');
      if (stored === 'light' || stored === 'dark') {
        document.documentElement.setAttribute('data-theme', stored);
        return;
      }
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } catch(e) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();
`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!i18nConfig.locales.includes(locale as Locale)) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&f[]=satoshi@400,500,700,800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Prevent flash of wrong theme */}
        <Script id="theme-script" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <ThemeProvider>
          <QueryProvider>
            <LocaleProvider locale={locale as Locale} dict={dict}>
              {/* Global background — fixed, z-0, behind all content */}
              <GlobalBackground />
              <ToastProvider />
              {/* Page content — relative, z-10 */}
              <div className="relative z-10">
                {children}
              </div>
            </LocaleProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
