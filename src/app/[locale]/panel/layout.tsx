"use client";

import React, { useEffect, useState } from "react";
import { use } from "react";
import { usePanelRole } from "@/hooks/usePanelRole";
import { PanelSidebar } from "@/components/panel/PanelSidebar";
import { PanelTopbar } from "@/components/panel/PanelTopbar";
import { motion } from "framer-motion";
import type { PanelRole } from "@/types/panel";

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

  // Loading screen
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-10 h-10 border-2 rounded-full"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            borderTopColor: "var(--accent, #01696f)",
          }}
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="mt-4 text-xs font-medium font-display tracking-widest text-[var(--text-muted)] uppercase"
        >
          {locale === "en" ? "Loading panel..." : "Cargando panel..."}
        </motion.p>
      </div>
    );
  }

  const resolvedRole: PanelRole = role ?? "user";

  return (
    <div className="flex min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <PanelSidebar
        role={resolvedRole}
        userName={userInfo.userName}
        userEmail={userInfo.email}
        avatarUrl={userInfo.avatarUrl}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <PanelTopbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-7xl mx-auto w-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
