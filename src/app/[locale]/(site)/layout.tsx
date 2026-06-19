// Site layout — wraps all public pages (/propiedades, /mapa, /blog, etc.)
// Agrega Navbar y Footer al shell del sitio público.

import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <PageTransition>
        <main className="pt-0">{children}</main>
      </PageTransition>
      <Footer />
    </>
  );
}
