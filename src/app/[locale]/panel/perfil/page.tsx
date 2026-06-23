"use client";

import React, { use, useState, useEffect } from "react";
import { usePanelRole } from "@/hooks/usePanelRole";
import { CircleUser, Save, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function PerfilPage({ params }: PageProps) {
  const { locale } = use(params);
  const { role, userId, loading: roleLoading } = usePanelRole();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [bioEs, setBioEs] = useState("");
  const [bioEn, setBioEn] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (roleLoading || !userId) return;

    async function loadAgentProfile() {
      try {
        setLoading(true);
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        // 1. Get user details from auth first
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || "");
        }

        // 2. Get details from agents table if they exist
        const { data: agent, error } = await supabase
          .from("agents")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (agent) {
          setFullName(agent.full_name || "");
          setPhone(agent.phone || "");
          setWhatsapp(agent.whatsapp || "");
          setBioEs(agent.bio_es || "");
          setBioEn(agent.bio_en || "");
          setAvatarUrl(agent.avatar_url || "");
        } else if (user) {
          setFullName(user.user_metadata?.full_name || user.email?.split("@")[0] || "");
        }
      } catch (err) {
        console.error("Failed to load agent profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAgentProfile();
  }, [userId, roleLoading]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const profilePayload = {
        user_id: userId,
        full_name: fullName,
        phone: phone || null,
        whatsapp: whatsapp || null,
        bio_es: bioEs || null,
        bio_en: bioEn || null,
        avatar_url: avatarUrl || null,
        role: role,
        active: true,
      };

      // Upsert profile into agents table
      const { error: upsertError } = await supabase
        .from("agents")
        .upsert([profilePayload], { onConflict: "user_id" });

      if (upsertError) throw upsertError;

      // Update auth user metadata
      await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      setSuccess(true);
    } catch (err: any) {
      console.error("Failed to save profile:", err);
      setError(err.message || (locale === "en" ? "Failed to save profile." : "Error al guardar el perfil."));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      setError(null);
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Math.random().toString(36).substring(5)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("property-images")
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      setError(err.message || "Error al subir la imagen.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || roleLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "var(--accent)" }} />
        <p className="text-xs text-[var(--text-muted)] font-mono mt-3">
          {locale === "en" ? "Loading profile..." : "Cargando perfil..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--border)]">
        <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-[var(--text)]">
          {locale === "en" ? "My Profile" : "Mi Perfil Profesional"}
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {locale === "en" ? "Manage your advisor details, contact information, and biography." : "Actualiza tus datos de contacto y biografía pública."}
        </p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-sm text-xs flex items-center gap-2">
          <CheckCircle size={14} />
          <span>{locale === "en" ? "Profile updated successfully." : "Perfil actualizado con éxito."}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm text-xs flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Avatar Upload */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display block">
            {locale === "en" ? "Profile Picture" : "Imagen de Perfil"}
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0 flex items-center justify-center">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <CircleUser size={32} className="text-white/20" />
              )}
            </div>
            <div className="flex-1 w-full">
              <label className="px-4 py-2 border border-dashed border-white/20 hover:border-white/40 rounded-sm cursor-pointer text-xs font-semibold text-white/70 hover:text-white flex items-center justify-center bg-white/5 transition-all w-full sm:w-auto inline-block text-center">
                <span>{locale === "en" ? "Upload New Photo" : "Subir Nueva Foto"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
              {locale === "en" ? "Full Name" : "Nombre Completo"} *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-sm border bg-transparent outline-none focus:border-[#01696f] transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
              {locale === "en" ? "Email Address" : "Correo Electrónico"} (Auth)
            </label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full px-3 py-2 text-xs rounded-sm border bg-white/5 outline-none transition-colors opacity-60 cursor-not-allowed font-mono"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
        </div>

        {/* Phone & Whatsapp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
              {locale === "en" ? "Phone Number" : "Teléfono de Contacto"}
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +58 412 1234567"
              className="w-full px-3 py-2 text-xs rounded-sm border bg-transparent outline-none focus:border-[#01696f] transition-colors font-mono"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
              {locale === "en" ? "WhatsApp Number" : "WhatsApp Directo"}
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="e.g. +58 412 1234567"
              className="w-full px-3 py-2 text-xs rounded-sm border bg-transparent outline-none focus:border-[#01696f] transition-colors font-mono"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
        </div>

        {/* Bios (Bilingual) */}
        <div className="grid grid-cols-1 gap-4 border-t border-[var(--border)] pt-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
              {locale === "en" ? "Professional Bio (Spanish)" : "Biografía Profesional (Español)"}
            </label>
            <textarea
              rows={3}
              value={bioEs}
              onChange={(e) => setBioEs(e.target.value)}
              placeholder="Escribe sobre tu experiencia, especialidad y zonas en Mérida..."
              className="w-full px-3 py-2 text-xs rounded-sm border bg-transparent outline-none focus:border-[#01696f] transition-colors resize-none"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
              {locale === "en" ? "Professional Bio (English)" : "Biografía Profesional (Inglés)"}
            </label>
            <textarea
              rows={3}
              value={bioEn}
              onChange={(e) => setBioEn(e.target.value)}
              placeholder="Write about your experience, specialties, and sectors in Mérida..."
              className="w-full px-3 py-2 text-xs rounded-sm border bg-transparent outline-none focus:border-[#01696f] transition-colors resize-none"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-[var(--border)]">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2.5 bg-[#01696f] hover:bg-[#015257] text-white text-xs font-semibold rounded-sm flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            <Save size={14} />
            <span>{saving ? (locale === "en" ? "Saving..." : "Guardando...") : (locale === "en" ? "Save Profile" : "Guardar Perfil")}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
