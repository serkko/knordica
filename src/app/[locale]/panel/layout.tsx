"use client";

import React, { useEffect, useState } from "react";
import { use } from "react";
import { usePanelRole } from "@/hooks/usePanelRole";
import { PanelSidebar } from "@/components/panel/PanelSidebar";
import { PanelTopbar } from "@/components/panel/PanelTopbar";
import { motion } from "framer-motion";
import type { PanelRole } from "@/types/panel";

// ─────────────────────────────────────────────
// TOKENS DE DISEÑO DEL PANEL
// Negro neutro limpio, sin tinte cálido.
// Referencia visual: Linear, Vercel, Raycast.
// ─────────────────────────────────────────────
const PANEL_STYLES = `
  :root {
    /* Superficies — negro neutro sin amarronado */
    --p-bg:        #090909;
    --p-sidebar:   #0F0F0F;
    --p-surface:   #141414;
    --p-surface-2: #1A1A1A;
    --p-surface-3: #222222;

    /* Bordes */
    --p-border:    rgba(255, 255, 255, 0.08);
    --p-border-2:  rgba(255, 255, 255, 0.04);

    /* Texto — máximo contraste, escala clara */
    --p-text:      #EDEDEC;
    --p-text-2:    #A1A1A0;
    --p-text-3:    #616160;

    /* Acento — blanco brillante con toque azul frío, estilo Linear */
    --p-accent:        #E8E8E6;
    --p-accent-soft:   rgba(232, 232, 230, 0.07);
    --p-accent-medium: rgba(232, 232, 230, 0.13);

    /* Estados semánticos */
    --p-green:   #4ADE80;
    --p-amber:   #FBB040;
    --p-red:     #F87171;
    --p-blue:    #60A5FA;

    /* Tipografía */
    --p-font-body:    'Inter', 'Helvetica Neue', sans-serif;
    --p-font-display: 'Inter', 'Helvetica Neue', sans-serif;

    /* Radio */
    --p-radius: 6px;

    /* Transición estándar */
    --p-ease: cubic-bezier(0.16, 1, 0.3, 1);
    --p-duration: 200ms;

    /* Tamaños base del panel — más grandes */
    --p-text-xs:   12px;
    --p-text-sm:   13px;
    --p-text-base: 14px;
    --p-text-lg:   16px;
    --p-text-xl:   20px;
  }

  /* Scrollbar del panel */
  .panel-scroll::-webkit-scrollbar { width: 4px; }
  .panel-scroll::-webkit-scrollbar-track { background: transparent; }
  .panel-scroll::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.08);
    border-radius: 4px;
  }
  .panel-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(255,255,255,0.15);
  }

  /* Reset de font-size para todo el panel */
  .panel-root,
  .panel-root * {
    font-size: inherit;
  }
  .panel-root {
    font-size: var(--p-text-base);
  }
`;

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default function PanelLayout({ children, params }: LayoutProps) {
  const { locale } = use(params);
  const { role, loading } = usePanelRole();

  const [userInfo, setUserInfo] = useState<{
    email: string;
    userName: string;
    avatarUrl: string | null;
  }>({
    email: "",
    userName: "",
    avatarUrl: null,
  });

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const email = user.email || "";
          const userName =
            user.user_metadata?.full_name ||
            email.split("@")[0] ||
            "Usuario";
          const avatarUrl = user.user_metadata?.avatar_url ?? null;
          setUserInfo({ email, userName, avatarUrl });
        }
      } catch (err) {
        console.error("[PanelLayout] Error fetching user info:", err);
      }
    }
    fetchUserInfo();
  }, []);

  if (loading) {
    return (
      <>
        <style>{PANEL_STYLES}</style>
        <div
          className="flex flex-col items-center justify-center min-h-screen"
          style={{ background: "var(--p-bg)" }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.08)",
              borderTopColor: "var(--p-accent)",
            }}
          />
        </div>
      </>
    );
  }

  const resolvedRole: PanelRole = role ?? "user";

  return (
    <>
      <style>{PANEL_STYLES}</style>
      <div
        className="panel-root flex"
        style={{
          background: "var(--p-bg)",
          color: "var(--p-text)",
          minHeight: "100dvh",
          fontFamily: "var(--p-font-body)",
          /* SIN overflow:hidden aqui para que el toggle del sidebar no se corte */
          position: "relative",
        }}
      >
        <PanelSidebar
          role={resolvedRole}
          userName={userInfo.userName}
          userEmail={userInfo.email}
          avatarUrl={userInfo.avatarUrl}
          locale={locale}
        />

        <div className="flex-1 flex flex-col min-w-0" style={{ overflow: "hidden" }}>
          <PanelTopbar />

          <main
            className="flex-1 overflow-y-auto panel-scroll"
            style={{ padding: "28px 32px" }}
          >
            <motion.div
              key={typeof window !== "undefined" ? window.location.pathname : ""}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
}
