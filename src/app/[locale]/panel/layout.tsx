"use client";

import React, { useState, useEffect } from "react";
import { use } from "react";
import { usePanelRole } from "@/hooks/usePanelRole";
import { PanelSidebar } from "@/components/panel/PanelSidebar";
import { PanelTopbar } from "@/components/panel/PanelTopbar";
import { motion } from "framer-motion";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default function PanelLayout({ children, params }: LayoutProps) {
  const { locale } = use(params);
  const { role, loading } = usePanelRole();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [userInfo, setUserInfo] = useState<{
    email: string;
    userName: string;
    initial: string;
  }>({
    email: "",
    userName: "",
    initial: "",
  });

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const email = user.email || "";
          const userName = user.user_metadata?.full_name || email.split("@")[0] || "Usuario";
          const initial = userName.charAt(0).toUpperCase();
          setUserInfo({ email, userName, initial });
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    }
    fetchUserInfo();
  }, []);

  // Premium loading screen
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f1117] text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-10 h-10 border-2 rounded-full"
          style={{
            borderColor: "rgba(255,255,255,0.1)",
            borderTopColor: "var(--accent, #C9962A)",
          }}
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="mt-4 text-xs font-medium font-display tracking-widest text-white/50 uppercase"
        >
          {locale === "en" ? "Loading environment..." : "Cargando entorno..."}
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      {/* Sidebar (Desktop and Mobile drawer) */}
      <PanelSidebar
        locale={locale}
        role={role}
        userEmail={userInfo.email}
        userName={userInfo.userName}
        userInitial={userInfo.initial}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10">
        {/* Topbar */}
        <PanelTopbar
          locale={locale}
          onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
        />

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-7xl mx-auto w-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
