"use client";

import React, { useEffect, useState } from "react";
import { use } from "react";
import { usePanelRole } from "@/hooks/usePanelRole";
import { PanelSidebar } from "@/components/panel/PanelSidebar";
import { PanelTopbar } from "@/components/panel/PanelTopbar";
import { motion } from "framer-motion";
import type { PanelRole } from "@/types/panel";

// ─────────────────────────────────────────────
// TOKENS DE DISEÑO DEL PANEL — Dark mode
// Completamente independientes del tema público
// ─────────────────────────────────────────────
const PANEL_STYLES = `
  :root {
    /* Superficies */
    --p-bg:        #0E0D0C;
    --p-sidebar:   #111110;
    --p-surface:   #161513;
    --p-surface-2: #1D1B18;
    --p-surface-3: #252320;

    /* Bordes */
    --p-border:    rgba(255, 255, 255, 0.07);
    --p-border-2:  rgba(255, 255, 255, 0.04);

    /* Texto */
    --p-text:      #F0EDE8;
    --p-text-2:    #9C9690;
    --p-text-3:    #5C5852;

    /* Acento principal — arena/lino */
    --p-accent:        #C8B49A;
    --p-accent-soft:   rgba(200, 180, 154, 0.08);
    --p-accent-medium: rgba(200, 180, 154, 0.15);

    /* Estados semánticos */
    --p-green:   #4CAF7D;
    --p-amber:   #D4924A;
    --p-red:     #C0605A;
    --p-blue:    #5B8FD4;

    /* Tipografía */
    --p-font-body:    'Inter', 'Helvetica Neue', sans-serif;
    --p-font-display: 'Inter', 'Helvetica Neue', sans-serif;

    /* Radio — consistente en todo el panel */
    --p-radius: 6px;

    /* Transición estándar */
    --p-ease: cubic-bezier(0.16, 1, 0.3, 1);
    --p-duration: 200ms;
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

  // Pantalla de carga
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
              border: "2px solid rgba(200,180,154,0.15)",
              borderTopColor: "var(--p-accent)",
            }}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mt-3 text-[11px] tracking-widest uppercase"
            style={{ color: "var(--p-text-3)" }}
          >
            Cargando
          </motion.p>
        </div>
      </>
    );
  }

  const resolvedRole: PanelRole = role ?? "user";

  return (
    <>
      <style>{PANEL_STYLES}</style>
      <div
        className="flex overflow-hidden"
        style={{
          background: "var(--p-bg)",
          color: "var(--p-text)",
          minHeight: "100dvh",
          fontFamily: "var(--p-font-body)",
        }}
      >
        <PanelSidebar
          role={resolvedRole}
          userName={userInfo.userName}
          userEmail={userInfo.email}
          avatarUrl={userInfo.avatarUrl}
          locale={locale}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <PanelTopbar />

          <main
            className="flex-1 overflow-y-auto panel-scroll"
            style={{ padding: "28px" }}
          >
            <motion.div
              key={typeof window !== "undefined" ? window.location.pathname : ""}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
}
