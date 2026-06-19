"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/layout/LocaleProvider";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { 
  Settings, 
  Mail, 
  Phone, 
  Globe, 
  Save, 
  CheckCircle,
  Database,
  RefreshCw,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminConfiguracion() {
  const { locale } = useLocale();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Settings state
  const [siteName, setSiteName] = useState("Knordica");
  const [contactEmail, setContactEmail] = useState("contacto@knordica.com");
  const [contactPhone, setContactPhone] = useState("+58 424 111 2222");
  const [whatsappNumber, setWhatsappNumber] = useState("+58 424 111 2222");
  
  // Social media
  const [instagramUrl, setInstagramUrl] = useState("https://instagram.com/knordica");
  const [facebookUrl, setFacebookUrl] = useState("https://facebook.com/knordica");
  
  const supabase = createClient();
  const hasSupabaseKeys = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD";

  useEffect(() => {
    // Load local settings if any
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("knordica-dev-settings");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSiteName(parsed.siteName || "Knordica");
          setContactEmail(parsed.contactEmail || "contacto@knordica.com");
          setContactPhone(parsed.contactPhone || "+58 424 111 2222");
          setWhatsappNumber(parsed.whatsappNumber || "+58 424 111 2222");
          setInstagramUrl(parsed.instagramUrl || "https://instagram.com/knordica");
          setFacebookUrl(parsed.facebookUrl || "https://facebook.com/knordica");
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);

    const payload = {
      siteName,
      contactEmail,
      contactPhone,
      whatsappNumber,
      instagramUrl,
      facebookUrl
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("knordica-dev-settings", JSON.stringify(payload));
      setSuccessMsg(
        locale === "es" 
          ? "Configuración guardada correctamente en LocalStorage." 
          : "Settings saved successfully to LocalStorage."
      );
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleResetDevDatabase = () => {
    const confirmReset = window.confirm(
      locale === "es"
        ? "¿Estás seguro de que deseas restablecer la base de datos de desarrollo a los valores predeterminados de fábrica? Se borrarán todas las modificaciones locales."
        : "Are you sure you want to reset the development database to factory defaults? All local modifications will be cleared."
    );

    if (confirmReset) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("knordica-dev-properties");
        localStorage.removeItem("knordica-dev-leads");
        localStorage.removeItem("knordica-dev-favorites");
        localStorage.removeItem("knordica-dev-lead-notes");
        alert(
          locale === "es"
            ? "Base de datos restablecida. Recargando la aplicación..."
            : "Database reset complete. Reloading application..."
        );
        window.location.reload();
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display mb-1">
          <Link href={`/${locale}/admin`} className="hover:text-[var(--accent)] transition-colors">
            {locale === "es" ? "Resumen" : "Dashboard"}
          </Link>
          <span>/</span>
          <span className="text-[var(--accent)]">{locale === "es" ? "Configuración" : "Settings"}</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[var(--text)]">
          {locale === "es" ? "Configuración del Sistema" : "System Settings"}
        </h2>
        <p className="text-xs text-[var(--text-2)] font-light mt-1">
          {locale === "es"
            ? "Ajusta las variables de contacto general de Knordica, enlaces a redes sociales e integraciones."
            : "Adjust Knordica's general contact details, social media handles, and integrations."}
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2.5 p-3.5 border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs rounded-sm">
          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column info (1 col) */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass flex flex-col gap-4 text-center items-center">
            <div className="h-12 w-12 rounded-sm border border-[var(--border-strong)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--accent)]">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-[var(--text)]">
                {locale === "es" ? "Panel de Ajustes" : "Settings Dashboard"}
              </h4>
              <p className="text-[11px] text-[var(--text-2)] font-light mt-1">
                {locale === "es" 
                  ? "Configuraciones globales que impactan formularios, cabeceras y pie de página de la web."
                  : "Global parameters affecting website headers, footers, and inquiry forms."}
              </p>
            </div>
          </div>

          {/* Database Info panel */}
          <div className="p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
              <Database className="h-4 w-4 text-[var(--text-muted)]" />
              <span className="text-[10px] font-bold font-display uppercase tracking-wider text-[var(--text-muted)]">
                {locale === "es" ? "Almacenamiento" : "Database State"}
              </span>
            </div>
            <div className="text-xs font-light text-[var(--text-2)] flex flex-col gap-3">
              <div>
                <span className="block font-semibold text-[var(--text)]">
                  {locale === "es" ? "Estado de Conexión" : "Connection State"}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  {hasSupabaseKeys ? "Supabase Cloud: Conectado" : "Mock LocalStorage Engine: Activo"}
                </span>
              </div>
              
              {!hasSupabaseKeys && (
                <div className="pt-2 border-t border-[var(--border)]">
                  <Button 
                    variant="outline" 
                    onClick={handleResetDevDatabase}
                    className="w-full text-[10px] uppercase font-display tracking-wider border-red-500/20 bg-red-950/10 text-red-400 hover:bg-red-950/30 hover:border-red-500 h-9 rounded-sm flex items-center justify-center cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3 mr-1.5" />
                    <span>{locale === "es" ? "Restablecer Mocks" : "Reset Local DB"}</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column forms (2 cols) */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <form onSubmit={handleSaveSettings} className="p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass flex flex-col gap-6">
            <h3 className="font-display font-bold text-base text-[var(--text)] pb-2 border-b border-[var(--border)]">
              {locale === "es" ? "Datos de Contacto e Identidad" : "Contact Details & Brand"}
            </h3>

            {/* Site Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Nombre de la Empresa" : "Company Name"}
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="h-10 px-3 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Correo Electrónico de Contacto" : "Inbox Email Address"}
                </label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="h-10 pl-9 pr-4 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Phone & Whatsapp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Teléfono Comercial" : "Office Phone"}
                </label>
                <div className="relative">
                  <Phone className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="h-10 pl-9 pr-4 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Número de WhatsApp (Ej: +58424...)" : "WhatsApp Number"}
                </label>
                <div className="relative">
                  <Phone className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="h-10 pl-9 pr-4 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <h3 className="font-display font-bold text-base text-[var(--text)] pb-2 border-b border-[var(--border)] mt-4">
              {locale === "es" ? "Redes Sociales" : "Social Links"}
            </h3>

            {/* Instagram & Facebook */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  Instagram
                </label>
                <div className="relative">
                  <Globe className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="h-10 pl-9 pr-4 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  Facebook
                </label>
                <div className="relative">
                  <Globe className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    className="h-10 pl-9 pr-4 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2 border-t border-[var(--border)]">
              <Button type="submit" variant="primary" className="h-10 px-6 rounded-sm text-xs font-display uppercase tracking-wider">
                <Save className="h-3.5 w-3.5 mr-1.5" />
                <span>{locale === "es" ? "Guardar Cambios" : "Save Changes"}</span>
              </Button>
            </div>
          </form>

          {/* Privacy & Policies card */}
          <div className="p-5 border border-emerald-500/20 bg-emerald-500/5 rounded-sm flex items-start gap-3">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-[11px] text-emerald-300 font-light leading-relaxed">
              {locale === "es"
                ? "Toda la configuración del sistema cumple con las normativas locales de Mérida sobre protección de datos digitales de usuarios y prospectos."
                : "All system settings comply with Mérida's local guidelines on user and prospect digital data protection."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
