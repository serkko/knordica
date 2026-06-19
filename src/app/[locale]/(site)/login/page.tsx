import type { Metadata } from "next";
import { AuthForm } from "@/components/forms/AuthForm";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === "es";

  return {
    title: isEs ? "Acceso Cliente | Knordica" : "Client Access | Knordica",
    description: isEs
      ? "Inicia sesión o crea tu cuenta para gestionar tus favoritos y solicitudes de visitas en Knordica."
      : "Log in or register to manage your favorites and booking requests at Knordica.",
  };
}

export default async function LoginPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="pt-32 pb-20 min-h-screen flex items-center justify-center">
      <div className="container-knordica max-w-lg">
        <div className="text-center mb-8">
          <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-semibold font-display block mb-2">
            Knordica portal
          </span>
          <h1 className="text-3xl font-bold font-display tracking-tight text-[var(--text)]">
            {locale === "es" ? "Acceso exclusivo" : "Exclusive Portal"}
          </h1>
        </div>
        
        <AuthForm />
      </div>
    </div>
  );
}
