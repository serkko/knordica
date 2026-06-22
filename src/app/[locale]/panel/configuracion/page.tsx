"use client";

import React, { use, useState } from "react";
import { usePanelRole } from "@/hooks/usePanelRole";
import { Save, AlertOctagon, CheckCircle2, ShieldAlert } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function ConfiguracionPage({ params }: PageProps) {
  const { locale } = use(params);
  const { role, loading: roleLoading } = usePanelRole();

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Site Settings state
  const [siteName, setSiteName] = useState("Knordica");
  const [contactEmail, setContactEmail] = useState("contacto@knordica.com");
  const [contactPhone, setContactPhone] = useState("+58 412 1002030");
  const [commissionRate, setCommissionRate] = useState("5");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    // Simulate saving settings
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
    }, 1000);
  };

  if (roleLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "var(--accent)" }} />
        <p className="text-xs text-[var(--text-muted)] font-mono mt-3">
          {locale === "en" ? "Loading settings..." : "Cargando configuración..."}
        </p>
      </div>
    );
  }

  // Admin access validation
  if (role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-sm text-center min-h-[300px] space-y-3"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
      >
        <span className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
          <ShieldAlert size={24} />
        </span>
        <h3 className="font-display font-bold text-base text-[var(--text)]">
          {locale === "en" ? "Access Denied" : "Acceso Denegado"}
        </h3>
        <p className="text-xs text-[var(--text-muted)] max-w-sm">
          {locale === "en"
            ? "Only administrative accounts have access to system variables and settings."
            : "Solo las cuentas administrativas tienen acceso a las variables y configuraciones del sistema."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--border)]">
        <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-[var(--text)]">
          {locale === "en" ? "System Settings" : "Configuración del Sistema"}
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {locale === "en" ? "Manage global website variables, default commissions and metadata." : "Administra las variables globales del portal, comisiones base y metadata."}
        </p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-sm text-xs flex items-center gap-2">
          <CheckCircle2 size={14} />
          <span>{locale === "en" ? "Settings saved successfully." : "Configuración guardada con éxito."}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-xs font-bold font-display uppercase tracking-widest text-[var(--text-muted)]">
            {locale === "en" ? "Portal Information" : "Información del Portal"}
          </h3>

          {/* Site name */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
              {locale === "en" ? "Company / Agency Name" : "Nombre de la Agencia"}
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-sm border bg-transparent outline-none focus:border-[#01696f] transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                {locale === "en" ? "Primary Contact Email" : "Correo de Contacto"}
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-sm border bg-transparent outline-none focus:border-[#01696f] transition-colors font-mono"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              />
            </div>
            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                {locale === "en" ? "General Contact Phone" : "Teléfono General"}
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-sm border bg-transparent outline-none focus:border-[#01696f] transition-colors font-mono"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-[var(--border)] pt-4">
          <h3 className="text-xs font-bold font-display uppercase tracking-widest text-[var(--text-muted)]">
            {locale === "en" ? "Financial Defaults" : "Parámetros Financieros"}
          </h3>

          {/* Commission */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
              {locale === "en" ? "Base Commission Rate (%)" : "Comisión Base Agencia (%)"}
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-sm border bg-transparent outline-none focus:border-[#01696f] transition-colors font-mono"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="pt-4 border-t border-[var(--border)]">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2.5 bg-[#01696f] hover:bg-[#015257] text-white text-xs font-semibold rounded-sm flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            <Save size={14} />
            <span>{saving ? (locale === "en" ? "Saving..." : "Guardando...") : (locale === "en" ? "Save Settings" : "Guardar Ajustes")}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
