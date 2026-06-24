/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
// =============================================================================
// ⚠️  ARCHIVO DE AUDITORÍA — NO USAR EN PRODUCCIÓN
// =============================================================================
//
// Este archivo es una copia de respaldo del formulario completo de propiedades.
// Su propósito es permitir auditorías visuales de las reglas de discriminación
// de campos sin afectar el comportamiento en producción.
//
// DIFERENCIAS CON PropertyForm.tsx (producción):
//   - Muestra TODOS los campos del formulario, sin ocultar ninguno.
//   - Los campos inaplicables para la combinación (tipo × operación) actual se
//     resaltan con un borde rojo punteado y fondo rojo translúcido.
//   - El componente se exporta como `PropertyFormAudit` para evitar colisiones.
//
// CÓMO USAR:
//   Importar en una ruta de panel protegida (solo admins) para inspeccionar
//   visualmente qué campos aplican a cada combinación tipo × operación.
//   Cambiar los selectores "Operación" y "Tipo de inmueble" para ver en tiempo
//   real cómo cambia la discriminación.
//
// SINCRONIZACIÓN:
//   Este archivo debe mantenerse sincronizado con PropertyForm.tsx cada vez que
//   se añadan nuevos campos o se modifiquen las reglas de discriminación en
//   src/utils/propertyDiscrimination.ts
//
// Última sincronización: 2026-06-23
// =============================================================================
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { checkFieldApplies, isCombinationInconsistent } from "@/utils/propertyDiscrimination";
import {
  Upload,
  X,
  GripVertical,
  Star,
  Plus,
  ChevronDown,
  ChevronUp,
  Video,
  Link as LinkIcon,
  ArrowLeft,
  Save,
  Image as ImageIcon,
} from "lucide-react";

// ── Tipos ──
interface ImageFile {
  id: string;
  file?: File;
  preview: string;
  url?: string;       // si ya está subida
  isCover: boolean;
  uploading: boolean;
  progress: number;
}

interface FormData {
  // Clasificación y Gamificación
  operation: string;
  property_type: string;
  status: string;
  listing_badge: string;
  completeness_score: string;
  featured: boolean;
  exclusive: boolean;
  new_listing: boolean;
  price_reduced: boolean;

  // Título y Descripción (Multi-idioma)
  title_es: string;
  description_es: string;
  title_en: string;
  description_en: string;

  // Precio y Condiciones
  price: string;
  price_currency: string;
  price_negotiable: boolean;
  price_usd: string;
  maintenance_fee: string;
  maintenance_included: boolean;

  // Vacacional
  price_per_night: string;
  price_weekend: string;
  min_nights: string;
  max_guests: string;
  checkin_time: string;
  checkout_time: string;
  house_rules: string;
  includes_breakfast: boolean;

  // Dimensiones y Habitáculos
  area_built: string;
  area_total: string;
  area_hectares: string;
  bedrooms: string;
  bathrooms: string;
  half_bathrooms: string;
  parking_spaces: string;
  parking_covered: boolean;
  floors: string;
  floor_number: string;
  property_age: string;
  year_built: string;
  condition: string;
  furnished: string;

  // Ubicación
  municipio: string;
  zone_id: string;
  address_es: string;
  address_en: string;
  lat: string;
  lng: string;
  show_exact_location: boolean;

  // Servicios Básicos
  has_elevator: boolean;
  has_water_tank: boolean;
  has_hot_water: boolean;
  has_generator: boolean;
  gas_type: string;
  has_internet: boolean;

  // Seguridad
  has_security_24h: boolean;
  has_electric_gate: boolean;
  has_cctv: boolean;
  has_electric_fence: boolean;
  has_intercom: boolean;
  has_armored_door: boolean;

  // Climatización
  has_ac: boolean;
  has_heating: boolean;
  kitchen_type: string;

  // Habitación y Anexo
  bathroom_type: string;
  host_housing_type: string;
  cohabitation: string;
  occupants_count: string;
  gender_policy: string;
  deposit_required: boolean;
  deposit_amount: string;
  allows_pets: boolean;
  allows_cooking: boolean;
  has_independent_entrance: boolean;

  // Terreno y Finca
  topography: string;
  land_use: string;
  access_type: string;
  current_use: string;
  has_own_water: boolean;

  // Media
  video_url: string;
  virtual_tour_url: string;
}

const INIT: FormData = {
  operation: "venta",
  property_type: "apartamento",
  status: "activa",
  listing_badge: "basico",
  completeness_score: "0",
  featured: false,
  exclusive: false,
  new_listing: true,
  price_reduced: false,
  title_es: "",
  description_es: "",
  title_en: "",
  description_en: "",
  price: "",
  price_currency: "USD",
  price_negotiable: false,
  price_usd: "",
  maintenance_fee: "",
  maintenance_included: false,
  price_per_night: "",
  price_weekend: "",
  min_nights: "1",
  max_guests: "",
  checkin_time: "14:00",
  checkout_time: "11:00",
  house_rules: "",
  includes_breakfast: false,
  area_built: "",
  area_total: "",
  area_hectares: "",
  bedrooms: "",
  bathrooms: "",
  half_bathrooms: "",
  parking_spaces: "",
  parking_covered: false,
  floors: "",
  floor_number: "",
  property_age: "",
  year_built: "",
  condition: "",
  furnished: "sin_muebles",
  municipio: "",
  zone_id: "",
  address_es: "",
  address_en: "",
  lat: "",
  lng: "",
  show_exact_location: true,
  has_elevator: false,
  has_water_tank: false,
  has_hot_water: false,
  has_generator: false,
  gas_type: "",
  has_internet: false,
  has_security_24h: false,
  has_electric_gate: false,
  has_cctv: false,
  has_electric_fence: false,
  has_intercom: false,
  has_armored_door: false,
  has_ac: false,
  has_heating: false,
  kitchen_type: "",
  bathroom_type: "",
  host_housing_type: "",
  cohabitation: "",
  occupants_count: "",
  gender_policy: "",
  deposit_required: false,
  deposit_amount: "",
  allows_pets: false,
  allows_cooking: true,
  has_independent_entrance: false,
  topography: "",
  land_use: "",
  access_type: "",
  current_use: "",
  has_own_water: false,
  video_url: "",
  virtual_tour_url: "",
};

const INPUT = {
  base: {
    background: "var(--p-surface-2)",
    border: "1px solid var(--p-border)",
    borderRadius: "var(--p-radius)",
    color: "var(--p-text)",
    padding: "0 12px",
    height: "38px",
    fontSize: "13px",
    outline: "none",
    width: "100%",
  } as React.CSSProperties,
  textarea: {
    background: "var(--p-surface-2)",
    border: "1px solid var(--p-border)",
    borderRadius: "var(--p-radius)",
    color: "var(--p-text)",
    padding: "10px 12px",
    fontSize: "13px",
    outline: "none",
    width: "100%",
    resize: "vertical" as const,
    minHeight: "160px",
  } as React.CSSProperties,
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-medium mb-1.5" style={{ color: "var(--p-text-2)" }}>
      {children}
    </label>
  );
}

function SectionCard({ title, children, defaultOpen = true, style = {} }: { title: string; children: React.ReactNode; defaultOpen?: boolean; style?: React.CSSProperties }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        background: "var(--p-surface)",
        border: "1px solid var(--p-border)",
        borderRadius: "var(--p-radius)",
        overflow: "hidden",
        ...style,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer"
        style={{ borderBottom: open ? "1px solid var(--p-border)" : "none" }}
      >
        <span className="text-[13px] font-semibold" style={{ color: "var(--p-text)" }}>
          {title}
        </span>
        {open ? <ChevronUp size={15} style={{ color: "var(--p-text-2)" }} /> : <ChevronDown size={15} style={{ color: "var(--p-text-2)" }} />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="p-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-[12px] select-none cursor-pointer"
      style={{ color: checked ? "var(--p-text)" : "var(--p-text-2)" }}
    >
      <motion.div
        className="relative w-8 h-[18px] flex-shrink-0"
        style={{
          borderRadius: "9px",
          background: checked ? "var(--p-accent)" : "var(--p-surface-3)",
        }}
        animate={{ background: checked ? "var(--p-accent)" : "var(--p-surface-3)" }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="absolute top-[3px] w-3 h-3 bg-white rounded-full"
          animate={{ left: checked ? "17px" : "3px" }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.div>
      {label}
    </button>
  );
}

function ImageDropzone({ images, onAdd, onRemove, onReorder, onSetCover }: {
  images: ImageFile[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onReorder: (items: ImageFile[]) => void;
  onSetCover: (id: string) => void;
}) {
  const [draggingOver, setDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDraggingOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length) onAdd(files);
  }, [onAdd]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onAdd(files);
    e.target.value = "";
  };

  const canAdd = images.length < 20;

  return (
    <div className="space-y-3">
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDraggingOver(true); }}
        onDragLeave={() => setDraggingOver(false)}
        onDrop={handleDrop}
        onClick={() => canAdd && fileInputRef.current?.click()}
        animate={{
          borderColor: draggingOver ? "var(--p-accent)" : "rgba(255,255,255,0.12)",
          background: draggingOver ? "var(--p-accent-soft)" : "var(--p-surface-2)",
        }}
        transition={{ duration: 0.15 }}
        className="flex flex-col items-center justify-center gap-3 py-10 cursor-pointer"
        style={{
          border: "2px dashed rgba(255,255,255,0.12)",
          borderRadius: "var(--p-radius)",
        }}
      >
        <div
          className="w-10 h-10 flex items-center justify-center"
          style={{
            borderRadius: "var(--p-radius)",
            background: "var(--p-surface-3)",
            color: "var(--p-accent)",
          }}
        >
          <Upload size={18} />
        </div>
        <div className="text-center">
          <p className="text-[13px] font-medium" style={{ color: "var(--p-text)" }}>
            Arrastra fotos aquí
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--p-text-2)" }}>
            o haz clic para explorar · hasta 20 fotos · JPG, PNG, WEBP
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
          disabled={!canAdd}
        />
      </motion.div>

      {images.length > 0 && (
        <Reorder.Group axis="y" values={images} onReorder={onReorder} className="space-y-1.5">
          {images.map((img) => (
            <Reorder.Item
              key={img.id}
              value={img}
              className="flex items-center gap-3 p-2 rounded-[6px]"
              style={{
                background: "var(--p-surface-2)",
                border: "1px solid var(--p-border)",
              }}
            >
              <div className="cursor-grab active:cursor-grabbing text-white/30 hover:text-white/60">
                <GripVertical size={14} />
              </div>
              <div className="w-12 h-9 rounded-sm overflow-hidden bg-black/20 flex-shrink-0">
                <img src={img.preview} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/50 truncate">
                  {img.file ? img.file.name : "Foto de la propiedad"}
                </p>
              </div>
              {img.uploading && (
                <div className="w-20 bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: `${img.progress}%` }} />
                </div>
              )}
              <button
                type="button"
                onClick={() => onSetCover(img.id)}
                className="p-1.5 hover:bg-white/5 rounded-sm transition-colors text-white/30 hover:text-[#C8B49A]"
                style={{ color: img.isCover ? "#C8B49A" : undefined }}
                title="Establecer como portada"
              >
                <Star size={14} fill={img.isCover ? "#C8B49A" : "none"} />
              </button>
              <button
                type="button"
                onClick={() => onRemove(img.id)}
                className="p-1.5 hover:bg-red-500/10 rounded-sm transition-colors text-white/30 hover:text-red-400"
              >
                <X size={14} />
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </div>
  );
}

interface PropertyFormAuditProps {
  locale: string;
  propertyId: string;
}

// ── COMPONENTE DE AUDITORÍA ──
// Muestra TODOS los campos con sombras rojas en los inaplicables.
// No oculta nada — sirve para inspección visual de las reglas de discriminación.
export function PropertyFormAudit({ locale, propertyId }: PropertyFormAuditProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INIT);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const set = (key: keyof FormData, val: any) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const checkApplies = (fieldOrGroup: string): boolean => {
    return checkFieldApplies(fieldOrGroup, form.property_type, form.operation);
  };

  // ── Estilo de auditoría: SIEMPRE MUESTRA, marca en rojo si no aplica ──
  const auditStyle = (applies: boolean): React.CSSProperties => {
    if (applies) return {};
    return {
      border: "1px dashed rgba(239, 68, 68, 0.7)",
      boxShadow: "0 0 10px rgba(239, 68, 68, 0.35)",
      background: "rgba(239, 68, 68, 0.03)",
      position: "relative" as const,
      transition: "all 0.3s ease",
    };
  };

  // ── Load Property ──
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const supabase = createClient();

        // 1. Fetch property fields
        const { data: prop, error: propErr } = await supabase
          .from("properties")
          .select("*")
          .eq("id", propertyId)
          .single();

        if (propErr || !prop) throw propErr || new Error("Propiedad no encontrada");

        // 2. Fetch translations
        const { data: translations } = await supabase
          .from("property_translations")
          .select("locale, title, description")
          .eq("property_id", propertyId);

        const transEs = (translations as any)?.find((t: any) => t.locale === "es") || {};
        const transEn = (translations as any)?.find((t: any) => t.locale === "en") || {};

        // 3. Fetch images
        const { data: imgs } = await supabase
          .from("property_images")
          .select("*")
          .eq("property_id", propertyId)
          .order("sort_order", { ascending: true });

        // Map values to form state
        setForm({
          operation: prop.operation || "venta",
          property_type: prop.property_type || "apartamento",
          status: prop.status || "activa",
          listing_badge: prop.listing_badge || "basico",
          completeness_score: prop.completeness_score?.toString() || "0",
          featured: !!prop.featured,
          exclusive: !!prop.exclusive,
          new_listing: !!prop.new_listing,
          price_reduced: !!prop.price_reduced,
          title_es: transEs.title || "",
          description_es: transEs.description || "",
          title_en: transEn.title || "",
          description_en: transEn.description || "",
          price: prop.price?.toString() || "",
          price_currency: prop.price_currency || "USD",
          price_negotiable: !!prop.price_negotiable,
          price_usd: prop.price_usd?.toString() || "",
          maintenance_fee: prop.maintenance_fee?.toString() || "",
          maintenance_included: !!prop.maintenance_included,
          price_per_night: prop.price_per_night?.toString() || "",
          price_weekend: prop.price_weekend?.toString() || "",
          min_nights: prop.min_nights?.toString() || "1",
          max_guests: prop.max_guests?.toString() || "",
          checkin_time: prop.checkin_time || "14:00",
          checkout_time: prop.checkout_time || "11:00",
          house_rules: prop.house_rules || "",
          includes_breakfast: !!prop.includes_breakfast,
          area_built: prop.area_built?.toString() || "",
          area_total: prop.area_total?.toString() || "",
          area_hectares: prop.area_hectares?.toString() || "",
          bedrooms: prop.bedrooms?.toString() || "",
          bathrooms: prop.bathrooms?.toString() || "",
          half_bathrooms: prop.half_bathrooms?.toString() || "",
          parking_spaces: prop.parking_spaces?.toString() || "",
          parking_covered: !!prop.parking_covered,
          floors: prop.total_floors?.toString() || "",
          floor_number: prop.floor_number?.toString() || "",
          property_age: prop.property_age?.toString() || "",
          year_built: prop.year_built?.toString() || (prop.property_age ? (new Date().getFullYear() - prop.property_age).toString() : ""),
          condition: prop.condition || "",
          furnished: prop.furnished || "sin_muebles",
          municipio: prop.municipio || "",
          zone_id: prop.zone_id || "",
          address_es: prop.address_es || "",
          address_en: prop.address_en || "",
          lat: prop.lat?.toString() || "",
          lng: prop.lng?.toString() || "",
          show_exact_location: !!prop.show_exact_location,
          has_elevator: !!prop.has_elevator,
          has_water_tank: !!prop.has_water_tank,
          has_hot_water: !!prop.has_hot_water,
          has_generator: !!prop.has_generator,
          gas_type: prop.gas_type || "",
          has_internet: !!prop.has_internet,
          has_security_24h: !!prop.has_security_24h,
          has_electric_gate: !!prop.has_electric_gate,
          has_cctv: !!prop.has_cctv,
          has_electric_fence: !!prop.has_electric_fence,
          has_intercom: !!prop.has_intercom,
          has_armored_door: !!prop.has_armored_door,
          has_ac: !!prop.has_ac,
          has_heating: !!prop.has_heating,
          kitchen_type: prop.kitchen_type || "",
          bathroom_type: prop.bathroom_type || "",
          host_housing_type: prop.host_housing_type || "",
          cohabitation: prop.cohabitation || "",
          occupants_count: prop.occupants_count?.toString() || "",
          gender_policy: prop.gender_policy || "",
          deposit_required: !!prop.deposit_required,
          deposit_amount: prop.deposit_amount?.toString() || "",
          allows_pets: !!prop.allows_pets,
          allows_cooking: !!prop.allows_cooking,
          has_independent_entrance: !!prop.has_independent_entrance,
          topography: prop.topography || "",
          land_use: prop.land_use || "",
          access_type: prop.access_type || "",
          current_use: prop.current_use || "",
          has_own_water: !!prop.has_own_water,
          video_url: prop.video_url || "",
          virtual_tour_url: prop.virtual_tour_url || "",
        });

        // Map images to image file list
        if (imgs) {
          setImages(
            imgs.map((im: any) => ({
              id: im.id,
              preview: im.url,
              url: im.url,
              isCover: !!im.is_cover,
              uploading: false,
              progress: 100,
            }))
          );
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar la propiedad");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [propertyId]);

  // ── Image Handlers ──
  const handleAddImages = (files: File[]) => {
    const space = 20 - images.length;
    const added = files.slice(0, space).map((f) => ({
      id: Math.random().toString(36).substring(2, 9),
      file: f,
      preview: URL.createObjectURL(f),
      isCover: false,
      uploading: false,
      progress: 0,
    }));
    setImages((prev) => {
      const next = [...prev, ...added];
      if (next.length > 0 && !next.some((x) => x.isCover) && next[0]) {
        next[0].isCover = true;
      }
      return next;
    });
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((x) => x.id === id);
      if (target && target.url) {
        setRemovedImages((r) => [...r, target.id]);
      }
      const filtered = prev.filter((x) => x.id !== id);
      if (target?.isCover && filtered.length > 0 && filtered[0]) {
        filtered[0].isCover = true;
      }
      return filtered;
    });
  };

  const handleSetCover = (id: string) => {
    setImages((prev) => prev.map((img) => ({ ...img, isCover: img.id === id })));
  };

  // ── Submit (deshabilitado en auditoría — solo lectura visual) ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("⚠️ Este formulario es solo de auditoría. No guarda cambios en producción.");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "var(--p-accent)" }} />
        <p className="text-xs text-[var(--p-text-3)] font-mono mt-3">
          Cargando datos de la propiedad...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
      {/* Banner de auditoría */}
      <div
        className="px-4 py-3 text-[12px] rounded mb-2"
        style={{
          background: "rgba(212,146,74,0.10)",
          border: "1px solid rgba(212,146,74,0.35)",
          color: "#D4924A",
        }}
      >
        🔍 <strong>Modo Auditoría</strong> — Todos los campos están visibles. Los campos con{" "}
        <span style={{ display: "inline-block", width: 12, height: 12, border: "1px dashed rgba(239,68,68,0.7)", background: "rgba(239,68,68,0.08)", verticalAlign: "middle", borderRadius: 2 }} />{" "}
        borde rojo punteado <strong>no aplican</strong> para la combinación actual ({form.property_type.replace(/_/g, " ")} × {form.operation}).
        Cambia los selectores de arriba para explorar la discriminación en tiempo real.
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/${locale}/panel/propiedades`)}
            className="w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors"
            style={{
              borderRadius: "var(--p-radius)",
              background: "var(--p-surface)",
              border: "1px solid var(--p-border)",
              color: "var(--p-text-2)",
            }}
          >
            <ArrowLeft size={14} />
          </button>
          <div>
            <h2 className="text-[18px] font-semibold" style={{ color: "var(--p-text)" }}>
              Auditoría de Formulario (Vista Completa)
            </h2>
            <p className="text-[12px]" style={{ color: "var(--p-text-2)" }}>
              Todos los campos visibles · Campos inaplicables marcados con borde rojo
            </p>
          </div>
        </div>
        <button
          type="submit"
          disabled
          className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-not-allowed opacity-40"
          style={{
            borderRadius: "var(--p-radius)",
            background: "var(--p-surface-3)",
            color: "var(--p-text-2)",
          }}
        >
          <Save size={14} />
          Solo lectura
        </button>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 text-[13px]"
          style={{
            borderRadius: "var(--p-radius)",
            background: "rgba(192,96,90,0.12)",
            border: "1px solid rgba(192,96,90,0.2)",
            color: "var(--p-red)",
          }}
        >
          {error}
        </motion.div>
      )}

      {/* Alerta de inconsistencia lógica */}
      {isCombinationInconsistent(form.property_type, form.operation) && (
        <div
          className="px-4 py-3 text-[12px] rounded"
          style={{
            background: "rgba(212,146,74,0.12)",
            border: "1px solid rgba(212,146,74,0.2)",
            color: "#D4924A",
            marginBottom: "16px"
          }}
        >
          ⚠️ <strong>Combinación inconsistente:</strong> ({form.property_type.replace(/_/g, " ")} × {form.operation}) no está permitida en producción.
        </div>
      )}

      {/* SECCIÓN: Clasificación y Gamificación */}
      <SectionCard title="Clasificación y Gamificación">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Operación</Label>
            <select
              value={form.operation}
              onChange={(e) => set("operation", e.target.value)}
              style={INPUT.base}
            >
              <option value="venta" disabled={isCombinationInconsistent(form.property_type, "venta")}>Venta</option>
              <option value="alquiler" disabled={isCombinationInconsistent(form.property_type, "alquiler")}>Alquiler</option>
              <option value="vacacional" disabled={isCombinationInconsistent(form.property_type, "vacacional")}>Vacacional</option>
            </select>
          </div>
          <div>
            <Label>Tipo de inmueble</Label>
            <select
              value={form.property_type}
              onChange={(e) => set("property_type", e.target.value)}
              style={INPUT.base}
            >
              {["apartamento", "casa", "townhouse", "anexo", "edificio", "galpon", "habitacion", "hacienda_finca", "local", "oficina", "terreno_lote"].map((t) => (
                <option
                  key={t}
                  value={t}
                  disabled={isCombinationInconsistent(t, form.operation)}
                >
                  {t.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label>Estado de publicación</Label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} style={INPUT.base}>
              <option value="activa">Activa</option>
              <option value="reservada">Reservada</option>
              <option value="vendida">Vendida</option>
              <option value="alquilada">Alquilada</option>
              <option value="cerrada">Cerrada</option>
            </select>
          </div>
          <div>
            <Label>Puntaje de Completitud (0-100)</Label>
            <input type="number" value={form.completeness_score} onChange={(e) => set("completeness_score", e.target.value)} style={INPUT.base} />
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--p-border)", marginTop: "16px", paddingTop: "12px" }} className="space-y-3">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "10px 16px" }}>
            <Toggle checked={form.featured} onChange={(v) => set("featured", v)} label="Destacada" />
            <Toggle checked={form.exclusive} onChange={(v) => set("exclusive", v)} label="Exclusiva" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "10px 16px" }}>
            <Toggle checked={form.price_reduced} onChange={(v) => set("price_reduced", v)} label="Precio reducido" />
            <Toggle 
              checked={form.listing_badge === "oportunidad"} 
              onChange={(v) => set("listing_badge", v ? "oportunidad" : "basico")} 
              label="Insignia: Oportunidad" 
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "10px 16px" }}>
            <Toggle 
              checked={form.listing_badge === "ultima_unidad"} 
              onChange={(v) => set("listing_badge", v ? "ultima_unidad" : "basico")} 
              label="Insignia: Última Unidad" 
            />
          </div>
        </div>
      </SectionCard>

      {/* SECCIÓN: Contenido Multi-idioma */}
      <SectionCard title="Contenido de la publicación">
        <div className="space-y-6">
          {/* Sección en Español */}
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Publicación en Español</div>
            <div>
              <Label>Título (Español) *</Label>
              <input value={form.title_es} onChange={(e) => set("title_es", e.target.value)} placeholder="Ej: Apartamento duplex en La Pedregosa" style={INPUT.base} />
            </div>
            <div>
              <Label>Descripción (Español)</Label>
              <textarea value={form.description_es} onChange={(e) => set("description_es", e.target.value)} placeholder="Descripción en español..." style={INPUT.textarea} rows={6} />
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--p-border)", paddingTop: "16px" }} className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Publicación en Inglés (Opcional)</div>
            <div>
              <Label>Título (Inglés)</Label>
              <input value={form.title_en} onChange={(e) => set("title_en", e.target.value)} placeholder="Ej: Duplex apartment in La Pedregosa" style={INPUT.base} />
            </div>
            <div>
              <Label>Descripción (Inglés)</Label>
              <textarea value={form.description_en} onChange={(e) => set("description_en", e.target.value)} placeholder="Description in English..." style={INPUT.textarea} rows={6} />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* SECCIÓN: Precio y Finanzas */}
      <SectionCard title="Precio y Condiciones">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div style={auditStyle(form.operation !== "vacacional")} className="p-1 rounded">
            <Label>{form.operation === "alquiler" ? "Canon mensual *" : "Precio base *"}</Label>
            <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} style={INPUT.base} />
            {form.operation === "vacacional" && <span className="text-[10px] text-red-400 block mt-1">No aplica en vacacional</span>}
          </div>
          <div>
            <Label>Moneda base</Label>
            <select value={form.price_currency} onChange={(e) => set("price_currency", e.target.value)} style={INPUT.base}>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="VES">VES (Bs.)</option>
            </select>
          </div>
          <div style={auditStyle(checkApplies("maintenance"))} className="p-1 rounded">
            <Label>Cuota de condominio/mantenimiento</Label>
            <input type="number" value={form.maintenance_fee} onChange={(e) => set("maintenance_fee", e.target.value)} style={INPUT.base} />
            {form.operation === "alquiler" && (
              <div className="mt-2">
                <Toggle checked={form.maintenance_included} onChange={(v) => set("maintenance_included", v)} label="Condominio incluido en el canon" />
              </div>
            )}
            {!checkApplies("maintenance") && (
              <span className="text-[10px] text-red-400 block mt-1">
                No aplica para {form.operation === "vacacional" ? "alquiler vacacional" : "terrenos"}
              </span>
            )}
          </div>
        </div>
        <div className="mt-3">
          <Toggle checked={form.price_negotiable} onChange={(v) => set("price_negotiable", v)} label="Precio negociable" />
        </div>
      </SectionCard>

      {/* SECCIÓN: Detalles de Alquiler Vacacional */}
      <SectionCard title="Condiciones Vacacionales" defaultOpen={false} style={auditStyle(checkApplies("vacational_section"))}>
        {!checkApplies("vacational_section") && <div className="text-red-400 text-xs mb-3 font-semibold">⚠️ No aplica para operación: {form.operation}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Precio por noche (USD)</Label>
            <input type="number" value={form.price_per_night} onChange={(e) => set("price_per_night", e.target.value)} style={INPUT.base} />
          </div>
          <div>
            <Label>Tarifa por noche - Fines de semana (Vie - Dom)</Label>
            <input type="number" value={form.price_weekend} onChange={(e) => set("price_weekend", e.target.value)} style={INPUT.base} />
          </div>
          <div>
            <Label>Mínimo de noches</Label>
            <input type="number" value={form.min_nights} onChange={(e) => set("min_nights", e.target.value)} style={INPUT.base} />
          </div>
          <div>
            <Label>Máximo de huéspedes</Label>
            <input type="number" value={form.max_guests} onChange={(e) => set("max_guests", e.target.value)} style={INPUT.base} />
          </div>
          <div>
            <Label>Hora Check-in</Label>
            <select value={form.checkin_time} onChange={(e) => set("checkin_time", e.target.value)} style={INPUT.base}>
              {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"].map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Hora Check-out</Label>
            <select value={form.checkout_time} onChange={(e) => set("checkout_time", e.target.value)} style={INPUT.base}>
              {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"].map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 space-y-4">
          <div>
            <Label>Normas de la casa / House Rules</Label>
            <textarea value={form.house_rules} onChange={(e) => set("house_rules", e.target.value)} placeholder="Normas de convivencia, políticas de ruido..." style={INPUT.textarea} />
          </div>
          <Toggle checked={form.includes_breakfast} onChange={(v) => set("includes_breakfast", v)} label="Incluye desayuno" />
        </div>
      </SectionCard>

      {/* SECCIÓN: Estructura y Dimensiones */}
      <SectionCard title="Dimensiones y Estructura Física">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Área construida (m²)</Label>
            <input type="number" value={form.area_built} onChange={(e) => set("area_built", e.target.value)} style={INPUT.base} />
          </div>
          <div>
            <Label>Área total terreno (m²)</Label>
            <input type="number" value={form.area_total} onChange={(e) => set("area_total", e.target.value)} style={INPUT.base} />
          </div>
          <div style={auditStyle(checkApplies("area_hectares"))} className="p-1.5 rounded">
            <Label>Área en Hectáreas (Rural)</Label>
            <input type="number" step="any" value={form.area_hectares} onChange={(e) => set("area_hectares", e.target.value)} style={INPUT.base} />
            {!checkApplies("area_hectares") && <span className="text-[10px] text-red-400 block mt-1">No aplica para {form.property_type.replace(/_/g, " ")}</span>}
          </div>
          <div style={auditStyle(checkApplies("bedrooms"))} className="p-1.5 rounded">
            <Label>Habitaciones / Dormitorios</Label>
            <input type="number" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} style={INPUT.base} />
            {!checkApplies("bedrooms") && <span className="text-[10px] text-red-400 block mt-1">No aplica para {form.property_type.replace(/_/g, " ")}</span>}
          </div>
          <div style={auditStyle(checkApplies("bathrooms"))} className="p-1.5 rounded">
            <Label>Baños completos</Label>
            <input type="number" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} style={INPUT.base} />
            {!checkApplies("bathrooms") && <span className="text-[10px] text-red-400 block mt-1">No aplica para {form.property_type.replace(/_/g, " ")}</span>}
          </div>
          <div style={auditStyle(checkApplies("half_bathrooms"))} className="p-1.5 rounded">
            <Label>Medios Baños (Visitas)</Label>
            <input type="number" value={form.half_bathrooms} onChange={(e) => set("half_bathrooms", e.target.value)} style={INPUT.base} />
            {!checkApplies("half_bathrooms") && <span className="text-[10px] text-red-400 block mt-1">No aplica para {form.property_type.replace(/_/g, " ")}</span>}
          </div>
          <div style={auditStyle(checkApplies("parking"))} className="p-1.5 rounded">
            <Label>Puestos estacionamiento</Label>
            <input type="number" value={form.parking_spaces} onChange={(e) => set("parking_spaces", e.target.value)} style={INPUT.base} />
            {!checkApplies("parking") && <span className="text-[10px] text-red-400 block mt-1">No aplica para {form.property_type.replace(/_/g, " ")}</span>}
          </div>
          <div style={auditStyle(checkApplies("floor_number"))} className="p-1.5 rounded">
            <Label>Número de piso (Unidad)</Label>
            <input type="number" value={form.floor_number} onChange={(e) => set("floor_number", e.target.value)} style={INPUT.base} />
            {!checkApplies("floor_number") && <span className="text-[10px] text-red-400 block mt-1">No aplica para {form.property_type.replace(/_/g, " ")}</span>}
          </div>
          <div style={auditStyle(checkApplies("floors"))} className="p-1.5 rounded">
            <Label>Pisos totales (Edificio)</Label>
            <input type="number" value={form.floors} onChange={(e) => set("floors", e.target.value)} style={INPUT.base} />
            {!checkApplies("floors") && <span className="text-[10px] text-red-400 block mt-1">No aplica para {form.property_type.replace(/_/g, " ")}</span>}
          </div>
          <div style={auditStyle(checkApplies("year_built"))} className="p-1.5 rounded">
            <Label>Año de construcción (Year Built)</Label>
            <input type="number" value={form.year_built} onChange={(e) => set("year_built", e.target.value)} placeholder="Ej: 2015" style={INPUT.base} />
            {!checkApplies("year_built") && <span className="text-[10px] text-red-400 block mt-1">No aplica para {form.property_type.replace(/_/g, " ")}</span>}
          </div>
          <div style={auditStyle(checkApplies("condition"))} className="p-1.5 rounded">
            <Label>Estado de conservación</Label>
            <select value={form.condition} onChange={(e) => set("condition", e.target.value)} style={INPUT.base}>
              <option value="">Seleccionar...</option>
              <option value="nuevo">Nuevo / A estrenar</option>
              <option value="excelente">Excelente estado</option>
              <option value="bueno">Buen estado</option>
              <option value="por_remodelar">Por remodelar / Reparar</option>
              <option value="en_gris">En obra gris</option>
            </select>
            {!checkApplies("condition") && <span className="text-[10px] text-red-400 block mt-1">No aplica para {form.property_type.replace(/_/g, " ")}</span>}
          </div>
          <div style={auditStyle(checkApplies("furnished"))} className="p-1.5 rounded">
            <Label>Mobiliario</Label>
            <select value={form.furnished} onChange={(e) => set("furnished", e.target.value)} style={INPUT.base}>
              <option value="sin_muebles">Sin muebles</option>
              <option value="semi_amueblado">Semi amoblado</option>
              <option value="completamente_amueblado">Completamente amoblado</option>
            </select>
            {!checkApplies("furnished") && <span className="text-[10px] text-red-400 block mt-1">No aplica para {form.property_type.replace(/_/g, " ")}</span>}
          </div>
        </div>
        <div style={auditStyle(checkApplies("parking"))} className="mt-3 p-1.5 rounded max-w-xs">
          <Toggle checked={form.parking_covered} onChange={(v) => set("parking_covered", v)} label="Estacionamiento techado" />
        </div>
      </SectionCard>

      {/* SECCIÓN: Ubicación */}
      <SectionCard title="Ubicación y Coordenadas">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Municipio</Label>
            <select value={form.municipio} onChange={(e) => set("municipio", e.target.value)} style={INPUT.base}>
              <option value="">Seleccionar...</option>
              <option value="libertador">Libertador</option>
              <option value="campo_elias">Campo Elías</option>
              <option value="santos_marquina">Santos Marquina</option>
              <option value="sucre">Sucre</option>
              <option value="rangel">Rangel</option>
            </select>
          </div>
          <div>
            <Label>ID de Zona (Relacional)</Label>
            <input value={form.zone_id} onChange={(e) => set("zone_id", e.target.value)} placeholder="UUID de la zona" style={INPUT.base} />
          </div>
          <div>
            <Label>Dirección (Español)</Label>
            <input value={form.address_es} onChange={(e) => set("address_es", e.target.value)} placeholder="Calle, edificio..." style={INPUT.base} />
          </div>
          <div>
            <Label>Dirección (Inglés)</Label>
            <input value={form.address_en} onChange={(e) => set("address_en", e.target.value)} placeholder="Street name, reference..." style={INPUT.base} />
          </div>
          <div>
            <Label>Latitud</Label>
            <input type="number" step="any" value={form.lat} onChange={(e) => set("lat", e.target.value)} placeholder="8.59" style={INPUT.base} />
          </div>
          <div>
            <Label>Longitud</Label>
            <input type="number" step="any" value={form.lng} onChange={(e) => set("lng", e.target.value)} placeholder="-71.14" style={INPUT.base} />
          </div>
        </div>
        <div className="mt-3">
          <Toggle checked={form.show_exact_location} onChange={(v) => set("show_exact_location", v)} label="Mostrar ubicación exacta públicamente" />
        </div>
      </SectionCard>

      {/* SECCIÓN: Servicios Básicos y Seguridad */}
      <SectionCard title="Servicios y Climatización" style={auditStyle(checkApplies("services_section"))}>
        {!checkApplies("services_section") && <div className="text-red-400 text-xs mb-3 font-semibold">⚠️ No aplica para tipo de propiedad: {form.property_type.replace(/_/g, " ")}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Tipo de gas</Label>
            <select value={form.gas_type} onChange={(e) => set("gas_type", e.target.value)} style={INPUT.base}>
              <option value="">Seleccionar...</option>
              <option value="bombona">Bombona de gas</option>
              <option value="directo">Gas directo</option>
              <option value="no_tiene">No tiene</option>
            </select>
          </div>
          <div>
            <Label>Tipo de cocina</Label>
            <select value={form.kitchen_type} onChange={(e) => set("kitchen_type", e.target.value)} style={INPUT.base}>
              <option value="">Seleccionar...</option>
              <option value="gas">A gas</option>
              <option value="electrica">Eléctrica</option>
              <option value="induccion">Inducción</option>
              <option value="mixta">Mixta</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <Toggle checked={form.has_water_tank} onChange={(v) => set("has_water_tank", v)} label="Tanque de agua" />
          <Toggle checked={form.has_hot_water} onChange={(v) => set("has_hot_water", v)} label="Agua caliente" />
          <Toggle checked={form.has_generator} onChange={(v) => set("has_generator", v)} label="Planta eléctrica / Generador" />
          <div className="flex flex-col gap-0.5">
            <Toggle checked={form.has_internet} onChange={(v) => set("has_internet", v)} label="Internet" />
            <span className="text-[9px] text-[var(--p-text-3)] block ml-10">Acometida instalada (Listo para traspaso de titularidad)</span>
          </div>
          <Toggle checked={form.has_ac} onChange={(v) => set("has_ac", v)} label="Aire acondicionado" />
          <Toggle checked={form.has_heating} onChange={(v) => set("has_heating", v)} label="Calefacción" />
          <div style={auditStyle(checkApplies("elevator"))} className="p-1 rounded">
            <Toggle checked={form.has_elevator} onChange={(v) => set("has_elevator", v)} label="Ascensor" />
            {!checkApplies("elevator") && <span className="text-[9px] text-red-400 block ml-10">No aplica para {form.property_type.replace(/_/g, " ")}</span>}
          </div>
          {/* has_independent_entrance fuera de shared_section (vacacional) */}
          <div style={auditStyle(checkApplies("has_independent_entrance"))} className="p-1 rounded">
            <Toggle checked={form.has_independent_entrance} onChange={(v) => set("has_independent_entrance", v)} label="Entrada independiente" />
            {!checkApplies("has_independent_entrance") && <span className="text-[9px] text-red-400 block ml-10">No aplica para {form.property_type.replace(/_/g, " ")} × {form.operation}</span>}
          </div>
        </div>
      </SectionCard>

      {/* SECCIÓN: Seguridad */}
      <SectionCard title="Seguridad Física" style={auditStyle(checkApplies("security_section"))}>
        {!checkApplies("security_section") && <div className="text-red-400 text-xs mb-3 font-semibold">⚠️ No aplica para tipo de propiedad: {form.property_type.replace(/_/g, " ")}</div>}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Toggle checked={form.has_security_24h} onChange={(v) => set("has_security_24h", v)} label="Seguridad 24 horas" />
          <Toggle checked={form.has_electric_gate} onChange={(v) => set("has_electric_gate", v)} label="Portón eléctrico" />
          <Toggle checked={form.has_cctv} onChange={(v) => set("has_cctv", v)} label="CCTV / Cámaras" />
          <div style={auditStyle(checkApplies("has_electric_fence"))} className="p-1 rounded">
            <Toggle checked={form.has_electric_fence} onChange={(v) => set("has_electric_fence", v)} label="Cerco eléctrico" />
            {!checkApplies("has_electric_fence") && <span className="text-[9px] text-red-400 block ml-10">No aplica para {form.property_type.replace(/_/g, " ")}</span>}
          </div>
          <Toggle checked={form.has_intercom} onChange={(v) => set("has_intercom", v)} label="Intercomunicador" />
          <Toggle checked={form.has_armored_door} onChange={(v) => set("has_armored_door", v)} label="Puerta blindada" />
        </div>
      </SectionCard>

      {/* SECCIÓN: Habitación y Anexo */}
      <SectionCard title="Parámetros de Compartido / Habitación" defaultOpen={false} style={auditStyle(checkApplies("shared_section"))}>
        {!checkApplies("shared_section") && <div className="text-red-400 text-xs mb-3 font-semibold">⚠️ No aplica para esta combinación (Tipo: {form.property_type.replace(/_/g, " ")}, Operación: {form.operation})</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Tipo de baño</Label>
            <select value={form.bathroom_type} onChange={(e) => set("bathroom_type", e.target.value)} style={INPUT.base}>
              <option value="">Seleccionar...</option>
              <option value="privado">Baño privado</option>
              <option value="compartido">Baño compartido</option>
            </select>
          </div>
          <div>
            <Label>Tipo de vivienda del anfitrión</Label>
            <select value={form.host_housing_type} onChange={(e) => set("host_housing_type", e.target.value)} style={INPUT.base}>
              <option value="">Seleccionar...</option>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
            </select>
          </div>
          <div>
            <Label>Cohabitación</Label>
            <select value={form.cohabitation} onChange={(e) => set("cohabitation", e.target.value)} style={INPUT.base}>
              <option value="">Seleccionar...</option>
              <option value="solo_inquilinos">Solo cohabitan inquilinos</option>
              <option value="con_propietario">Cohabita con propietario</option>
            </select>
          </div>
          <div>
            <Label>Número de ocupantes actuales</Label>
            <input type="number" value={form.occupants_count} onChange={(e) => set("occupants_count", e.target.value)} style={INPUT.base} />
          </div>
          <div>
            <Label>Política de género</Label>
            <select value={form.gender_policy} onChange={(e) => set("gender_policy", e.target.value)} style={INPUT.base}>
              <option value="">Seleccionar...</option>
              <option value="mixto">Mixto</option>
              <option value="solo_mujeres">Solo mujeres</option>
              <option value="solo_hombres">Solo hombres</option>
            </select>
          </div>
          {form.deposit_required && (
            <div>
              <Label>Monto de depósito (USD)</Label>
              <input type="number" value={form.deposit_amount} onChange={(e) => set("deposit_amount", e.target.value)} style={INPUT.base} />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <Toggle checked={form.deposit_required} onChange={(v) => {
            set("deposit_required", v);
            if (!v) set("deposit_amount", "");
          }} label="Requiere depósito" />
          <Toggle checked={form.allows_pets} onChange={(v) => set("allows_pets", v)} label="Acepta mascotas" />
          <Toggle checked={form.allows_cooking} onChange={(v) => set("allows_cooking", v)} label="Permite cocinar" />
        </div>
      </SectionCard>

      {/* SECCIÓN: Terrenos y Fincas */}
      <SectionCard title="Parámetros de Terreno y Campo" defaultOpen={false} style={auditStyle(checkApplies("land_section"))}>
        {!checkApplies("land_section") && <div className="text-red-400 text-xs mb-3 font-semibold">⚠️ No aplica para tipo de propiedad: {form.property_type.replace(/_/g, " ")}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Topografía</Label>
            <select value={form.topography} onChange={(e) => set("topography", e.target.value)} style={INPUT.base}>
              <option value="">Seleccionar...</option>
              <option value="plano">Plano</option>
              <option value="inclinado">Semi-inclinado</option>
              <option value="irregular">Irregular / Quebrado</option>
            </select>
          </div>
          <div>
            <Label>Uso del suelo</Label>
            <input value={form.land_use} onChange={(e) => set("land_use", e.target.value)} placeholder="Ej: Residencial, Agrícola" style={INPUT.base} />
          </div>
          <div>
            <Label>Vía de acceso</Label>
            <select value={form.access_type} onChange={(e) => set("access_type", e.target.value)} style={INPUT.base}>
              <option value="">Seleccionar...</option>
              <option value="asfalto">Asfalto / Pavimento</option>
              <option value="tierra">Tierra / Granzón</option>
              <option value="concreto">Concreto</option>
            </select>
          </div>
          <div>
            <Label>Uso actual del terreno</Label>
            <input value={form.current_use} onChange={(e) => set("current_use", e.target.value)} placeholder="Ej: Cultivo, Vacío" style={INPUT.base} />
          </div>
        </div>
        <div className="mt-3">
          <Toggle checked={form.has_own_water} onChange={(v) => set("has_own_water", v)} label="Tiene agua propia (Manantial / Pozo)" />
        </div>
      </SectionCard>

      {/* SECCIÓN: Fotos */}
      <SectionCard title="Fotos de la propiedad (hasta 20)">
        <ImageDropzone
          images={images}
          onAdd={handleAddImages}
          onRemove={handleRemoveImage}
          onReorder={setImages}
          onSetCover={handleSetCover}
        />
      </SectionCard>

      {/* SECCIÓN: Video y Tour Virtual */}
      <SectionCard title="Video y Tour Virtual (Enlaces)" defaultOpen={false}>
        <div className="space-y-4">
          <div>
            <Label>Enlace de YouTube o Vimeo</Label>
            <div className="relative">
              <Video size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--p-text-3)" }} />
              <input
                value={form.video_url}
                onChange={(e) => set("video_url", e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                style={{ ...INPUT.base, paddingLeft: "36px" }}
              />
            </div>
          </div>
          <div>
            <Label>Tour virtual (Matterport u otro iframe)</Label>
            <div className="relative">
              <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--p-text-3)" }} />
              <input
                value={form.virtual_tour_url}
                onChange={(e) => set("virtual_tour_url", e.target.value)}
                placeholder="https://matterport.com/..."
                style={{ ...INPUT.base, paddingLeft: "36px" }}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Pie de página */}
      <div className="flex justify-end pt-2 pb-8">
        <div
          className="text-[11px] px-4 py-2 rounded"
          style={{
            background: "rgba(212,146,74,0.08)",
            border: "1px solid rgba(212,146,74,0.2)",
            color: "#D4924A",
          }}
        >
          ⚠️ Formulario de auditoría — Los cambios no se guardan en producción
        </div>
      </div>
    </form>
  );
}
