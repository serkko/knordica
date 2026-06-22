"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, Search } from "lucide-react";
import { useState } from "react";

const PAGE_TITLES: Record<string, string> = {
  "/panel/inicio": "Inicio",
  "/panel/propiedades": "Propiedades",
  "/panel/propiedades/nueva": "Nueva propiedad",
  "/panel/clientes": "Clientes",
  "/panel/agenda": "Agenda",
  "/panel/estadisticas": "Estadísticas",
  "/panel/agentes": "Agentes",
  "/panel/usuarios": "Usuarios",
  "/panel/blog": "Blog",
  "/panel/analitica": "Analítica",
  "/panel/configuracion": "Configuración",
  "/panel/favoritos": "Favoritos",
  "/panel/mensajes": "Mensajes",
  "/panel/perfil": "Mi perfil",
};

export function PanelTopbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  const normalized = pathname.replace(/^\/[a-z]{2}/, "");
  
  // Determinar título: match exacto o match de prefijo
  let title = "Panel";
  if (PAGE_TITLES[normalized]) {
    title = PAGE_TITLES[normalized];
  } else {
    // match de subpáginas como /panel/propiedades/[id]/editar
    const match = Object.entries(PAGE_TITLES).find(([key]) =>
      normalized.startsWith(key + "/")
    );
    if (match) title = match[1];
  }

  return (
    <header
      className="flex items-center justify-between px-6 flex-shrink-0"
      style={{
        height: "60px",
        borderBottom: "1px solid var(--p-border)",
        background: "var(--p-bg)",
      }}
    >
      {/* Título de página con animación al cambiar */}
      <motion.h1
        key={title}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-[15px] font-semibold"
        style={{ color: "var(--p-text)", fontFamily: "var(--p-font-display)" }}
      >
        {title}
      </motion.h1>

      {/* Acciones derecha */}
      <div className="flex items-center gap-1">
        {/* Búsqueda */}
        <motion.button
          onClick={() => setSearchOpen((v) => !v)}
          className="w-8 h-8 flex items-center justify-center"
          style={{
            borderRadius: "6px",
            color: "var(--p-text-2)",
            background: searchOpen ? "var(--p-surface-2)" : "transparent",
          }}
          whileHover={{ background: "var(--p-surface-2)", color: "var(--p-text)" }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.15 }}
        >
          <Search size={15} strokeWidth={1.75} />
        </motion.button>

        {/* Notificaciones */}
        <motion.button
          className="relative w-8 h-8 flex items-center justify-center"
          style={{ borderRadius: "6px", color: "var(--p-text-2)" }}
          whileHover={{ background: "var(--p-surface-2)", color: "var(--p-text)" }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.15 }}
        >
          <Bell size={15} strokeWidth={1.75} />
          {/* Dot indicador — visible cuando hay notificaciones */}
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--p-accent)" }}
          />
        </motion.button>
      </div>
    </header>
  );
}
