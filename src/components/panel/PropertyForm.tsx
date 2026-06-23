"use client";

// ─── PropertyForm — PENDIENTE DE CONSTRUCCIÓN ─────────────────────────────────
//
// Este componente está planificado pero aún no ha sido implementado.
// Su propósito es mostrar el formulario completo de edición de una propiedad
// en la ruta: /panel/propiedades/[id]/editar
//
// Cuando esté listo incluirá:
//  - Edición de título, descripción y slug
//  - Gestión de imágenes (portada + galería)
//  - Datos técnicos completos (tipo, operación, áreas, habitaciones, etc.)
//  - Ubicación y mapa
//  - SEO y meta información
//  - Historial de cambios
// ─────────────────────────────────────────────────────────────────────────────

import { useRouter } from "next/navigation";

interface PropertyFormProps {
  locale: string;
  propertyId: string;
}

export function PropertyForm({ locale, propertyId }: PropertyFormProps) {
  const router = useRouter();

  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      padding: "48px 24px",
      color: "var(--p-text-3)",
    }}>
      {/* Ícono construcción */}
      <div style={{
        width: 56,
        height: 56,
        borderRadius: "12px",
        background: "var(--p-surface-2)",
        border: "1px solid var(--p-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 26,
      }}>
        🚧
      </div>

      <div style={{ textAlign: "center", maxWidth: 380 }}>
        <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--p-text)", margin: 0 }}>
          Editor completo en construcción
        </p>
        <p style={{ fontSize: "13px", color: "var(--p-text-2)", marginTop: 8, lineHeight: 1.6 }}>
          El formulario de edición completa de propiedades está pendiente de implementación.
          Por ahora puedes usar la <strong>edición rápida</strong> desde la lista de propiedades.
        </p>
        <p style={{ fontSize: "11px", color: "var(--p-text-3)", marginTop: 12, fontFamily: "monospace" }}>
          ID: {propertyId}
        </p>
      </div>

      <button
        onClick={() => router.push(`/${locale}/panel/propiedades`)}
        style={{
          marginTop: 8,
          padding: "8px 20px",
          fontSize: "13px",
          fontWeight: 500,
          borderRadius: "var(--p-radius)",
          border: "1px solid var(--p-border)",
          background: "none",
          color: "var(--p-text-2)",
          cursor: "pointer",
        }}
      >
        ← Volver a propiedades
      </button>
    </div>
  );
}
