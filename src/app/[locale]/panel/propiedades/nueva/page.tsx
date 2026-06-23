"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  Eye,
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
  // Clasificación
  operation: string;
  property_type: string;
  status: string;
  // Precio
  price: string;
  price_currency: string;
  price_negotiable: boolean;
  maintenance_fee: string;
  // Dimensiones
  area_built: string;
  area_total: string;
  bedrooms: string;
  bathrooms: string;
  half_bathrooms: string;
  parking_spaces: string;
  floors: string;
  floor_number: string;
  year_built: string;
  // Ubicación
  municipio: string;
  zone_id: string;
  address_es: string;
  lat: string;
  lng: string;
  // Contenido
  title_es: string;
  description_es: string;
  // Video
  video_url: string;
  virtual_tour_url: string;
  // Badges
  featured: boolean;
  exclusive: boolean;
  new_listing: boolean;
  price_reduced: boolean;
  // Amenidades
  has_pool: boolean;
  has_garden: boolean;
  has_ac: boolean;
  has_generator: boolean;
  has_water_tank: boolean;
  has_security: boolean;
  has_elevator: boolean;
  allows_pets: boolean;
  furnished: boolean;
  has_gym: boolean;
  has_jacuzzi: boolean;
  has_bbq: boolean;
  has_laundry: boolean;
  has_balcony: boolean;
  has_terrace: boolean;
  has_solar_panels: boolean;
}

const INIT: FormData = {
  operation: "venta",
  property_type: "apartamento",
  status: "activa",
  price: "",
  price_currency: "USD",
  price_negotiable: false,
  maintenance_fee: "",
  area_built: "",
  area_total: "",
  bedrooms: "",
  bathrooms: "",
  half_bathrooms: "",
  parking_spaces: "",
  floors: "",
  floor_number: "",
  year_built: "",
  municipio: "",
  zone_id: "",
  address_es: "",
  lat: "",
  lng: "",
  title_es: "",
  description_es: "",
  video_url: "",
  virtual_tour_url: "",
  featured: false,
  exclusive: false,
  new_listing: true,
  price_reduced: false,
  has_pool: false,
  has_garden: false,
  has_ac: false,
  has_generator: false,
  has_water_tank: false,
  has_security: false,
  has_elevator: false,
  allows_pets: false,
  furnished: false,
  has_gym: false,
  has_jacuzzi: false,
  has_bbq: false,
  has_laundry: false,
  has_balcony: false,
  has_terrace: false,
  has_solar_panels: false,
};

// ── Helpers visuales ──
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
    minHeight: "120px",
  } as React.CSSProperties,
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-medium mb-1.5" style={{ color: "var(--p-text-2)" }}>
      {children}
    </label>
  );
}

function SectionCard({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        background: "var(--p-surface)",
        border: "1px solid var(--p-border)",
        borderRadius: "var(--p-radius)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4"
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
      className="flex items-center gap-2 text-[12px] select-none"
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

// ── Zona de drag & drop de imágenes ──
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
      {/* Zona de drop */}
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
        {!canAdd && (
          <p className="text-[11px]" style={{ color: "var(--p-amber)" }}>
            Límite de 20 fotos alcanzado
          </p>
        )}
      </motion.div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Grid de imágenes con reorden */}
      {images.length > 0 && (
        <div>
          <p className="text-[11px] mb-2" style={{ color: "var(--p-text-3)" }}>
            {images.length}/20 · Arrastra para reordenar · La primera con ★ es la portada
          </p>
          <Reorder.Group
            axis="y"
            values={images}
            onReorder={onReorder}
            className="space-y-2"
          >
            {images.map((img) => (
              <Reorder.Item key={img.id} value={img}>
                <motion.div
                  layout
                  className="flex items-center gap-3 px-3 py-2"
                  style={{
                    background: img.isCover ? "var(--p-accent-medium)" : "var(--p-surface-2)",
                    border: `1px solid ${img.isCover ? "var(--p-accent)" : "var(--p-border)"}`,
                    borderRadius: "var(--p-radius)",
                  }}
                >
                  {/* Grip */}
                  <GripVertical size={14} style={{ color: "var(--p-text-3)", flexShrink: 0, cursor: "grab" }} />

                  {/* Preview */}
                  <div
                    className="w-14 h-10 flex-shrink-0 overflow-hidden"
                    style={{ borderRadius: "4px", background: "var(--p-surface-3)" }}
                  >
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  </div>

                  {/* Nombre */}
                  <span className="flex-1 text-[12px] truncate" style={{ color: "var(--p-text-2)" }}>
                    {img.file?.name ?? "Imagen subida"}
                  </span>

                  {/* Progress bar */}
                  {img.uploading && (
                    <div
                      className="w-20 h-1 overflow-hidden"
                      style={{ borderRadius: "2px", background: "var(--p-surface-3)" }}
                    >
                      <motion.div
                        className="h-full"
                        style={{ background: "var(--p-accent)" }}
                        animate={{ width: `${img.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}

                  {/* Portada */}
                  <button
                    type="button"
                    onClick={() => onSetCover(img.id)}
                    title="Establecer como portada"
                    className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderRadius: "var(--p-radius)",
                      color: img.isCover ? "#D4924A" : "var(--p-text-3)",
                      background: img.isCover ? "rgba(212,146,74,0.15)" : "transparent",
                    }}
                  >
                    <Star size={13} fill={img.isCover ? "currentColor" : "none"} />
                  </button>

                  {/* Eliminar */}
                  <button
                    type="button"
                    onClick={() => onRemove(img.id)}
                    className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderRadius: "var(--p-radius)",
                      color: "var(--p-red)",
                      background: "rgba(192,96,90,0.08)",
                    }}
                  >
                    <X size={13} />
                  </button>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}
    </div>
  );
}

// ── Página principal ──
export default function NuevaPropiedadPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "es";

  const [form, setForm] = useState<FormData>(INIT);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof FormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ── Imágenes: agregar ──
  const handleAddImages = useCallback((files: File[]) => {
    const remaining = 20 - images.length;
    const toAdd = files.slice(0, remaining);
    const newImgs: ImageFile[] = toAdd.map((file, i) => ({
      id: `${Date.now()}-${i}-${file.name}`,
      file,
      preview: URL.createObjectURL(file),
      isCover: images.length === 0 && i === 0,
      uploading: false,
      progress: 0,
    }));
    setImages((prev) => [...prev, ...newImgs]);
  }, [images.length]);

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      // Si se eliminó la portada, asignar la primera como portada
      if (filtered.length > 0 && !filtered.some((i) => i.isCover)) {
        const first = filtered[0];
        if (first) first.isCover = true;
      }
      return filtered;
    });
  };

  const handleSetCover = (id: string) => {
    setImages((prev) => prev.map((img) => ({ ...img, isCover: img.id === id })));
  };

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title_es.trim()) { setError("El título es obligatorio."); return; }
    if (!form.price) { setError("El precio es obligatorio."); return; }

    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // Generar slug desde título
      const slug = form.title_es
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim().replace(/\s+/g, "-")
        + "-" + Date.now().toString(36);

      // 1. Insertar propiedad
      const { data: prop, error: propErr } = await supabase
        .from("properties")
        .insert({
          slug,
          agent_id: user.id,
          operation: form.operation,
          property_type: form.property_type,
          status: form.status,
          price: parseFloat(form.price) || 0,
          price_currency: form.price_currency,
          price_negotiable: form.price_negotiable,
          maintenance_fee: form.maintenance_fee ? parseFloat(form.maintenance_fee) : null,
          area_built: form.area_built ? parseFloat(form.area_built) : null,
          area_total: form.area_total ? parseFloat(form.area_total) : null,
          bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
          bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
          half_bathrooms: form.half_bathrooms ? parseInt(form.half_bathrooms) : null,
          parking_spaces: form.parking_spaces ? parseInt(form.parking_spaces) : null,
          floors: form.floors ? parseInt(form.floors) : null,
          floor_number: form.floor_number ? parseInt(form.floor_number) : null,
          year_built: form.year_built ? parseInt(form.year_built) : null,
          municipio: form.municipio || null,
          zone_id: form.zone_id || null,
          address_es: form.address_es || null,
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null,
          video_url: form.video_url || null,
          virtual_tour_url: form.virtual_tour_url || null,
          featured: form.featured,
          exclusive: form.exclusive,
          new_listing: form.new_listing,
          price_reduced: form.price_reduced,
          has_pool: form.has_pool,
          has_garden: form.has_garden,
          has_ac: form.has_ac,
          has_generator: form.has_generator,
          has_water_tank: form.has_water_tank,
          has_security: form.has_security,
          has_elevator: form.has_elevator,
          allows_pets: form.allows_pets,
          furnished: form.furnished,
          has_gym: form.has_gym,
          has_jacuzzi: form.has_jacuzzi,
          has_bbq: form.has_bbq,
          has_laundry: form.has_laundry,
          has_balcony: form.has_balcony,
          has_terrace: form.has_terrace,
          has_solar_panels: form.has_solar_panels,
        })
        .select()
        .single();

      if (propErr || !prop) throw propErr ?? new Error("Error al crear propiedad");

      // 2. Insertar traducción ES
      await supabase.from("property_translations").insert({
        property_id: prop.id,
        locale: "es",
        title: form.title_es,
        description: form.description_es || null,
        short_description: null,
      });

      // 3. Subir imágenes a Supabase Storage
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          if (!img || !img.file) continue;

          const currentId = img.id;
          const currentIsCover = img.isCover;

          // Actualizar progress UI
          setImages((prev) => prev.map((x) => x.id === currentId ? { ...x, uploading: true, progress: 10 } : x));

          const ext = img.file.name.split(".").pop();
          const path = `properties/${prop.id}/${Date.now()}-${i}.${ext}`;

          const { data: uploaded, error: upErr } = await supabase.storage
            .from("property-images")
            .upload(path, img.file, { upsert: false, cacheControl: "31536000" });

          setImages((prev) => prev.map((x) => x.id === currentId ? { ...x, progress: 80 } : x));

          if (!upErr && uploaded) {
            const { data: { publicUrl } } = supabase.storage
              .from("property-images")
              .getPublicUrl(path);

            await supabase.from("property_images").insert({
              property_id: prop.id,
              url: publicUrl,
              is_cover: currentIsCover,
              sort_order: i,
              alt_es: form.title_es,
              alt_en: form.title_es,
            });
          }

          setImages((prev) => prev.map((x) => x.id === currentId ? { ...x, uploading: false, progress: 100 } : x));
        }
      }

      // Redirigir a la propiedad recién creada
      router.push(`/${locale}/panel/propiedades/${prop.id}/editar`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center"
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
              Nueva propiedad
            </h2>
            <p className="text-[12px]" style={{ color: "var(--p-text-2)" }}>
              Completa la información para publicar
            </p>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium"
          style={{
            borderRadius: "var(--p-radius)",
            background: saving ? "var(--p-surface-3)" : "var(--p-accent)",
            color: saving ? "var(--p-text-2)" : "#0E0D0C",
            opacity: saving ? 0.7 : 1,
          }}
        >
          <Save size={14} />
          {saving ? "Guardando..." : "Publicar propiedad"}
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

      {/* SECCIÓN: Clasificación */}
      <SectionCard title="Clasificación">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Operación</Label>
            <select
              value={form.operation}
              onChange={(e) => set("operation", e.target.value)}
              style={INPUT.base}
            >
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
              <option value="vacacional">Vacacional</option>
            </select>
          </div>
          <div>
            <Label>Tipo de inmueble</Label>
            <select
              value={form.property_type}
              onChange={(e) => set("property_type", e.target.value)}
              style={INPUT.base}
            >
              {["apartamento","casa","townhouse","anexo","edificio","galpon","habitacion","hacienda_finca","local","oficina","terreno_lote"].map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Estado</Label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              style={INPUT.base}
            >
              <option value="activa">Activa</option>
              <option value="reservada">Reservada</option>
              <option value="vendida">Vendida</option>
              <option value="alquilada">Alquilada</option>
              <option value="cerrada">Cerrada</option>
            </select>
          </div>
        </div>
        {/* Badges */}
        <div className="flex flex-wrap gap-4 mt-4">
          <Toggle checked={form.featured} onChange={(v) => set("featured", v)} label="Destacada" />
          <Toggle checked={form.exclusive} onChange={(v) => set("exclusive", v)} label="Exclusiva" />
          <Toggle checked={form.new_listing} onChange={(v) => set("new_listing", v)} label="Nueva" />
          <Toggle checked={form.price_reduced} onChange={(v) => set("price_reduced", v)} label="Precio reducido" />
        </div>
      </SectionCard>

      {/* SECCIÓN: Contenido */}
      <SectionCard title="Título y descripción">
        <div className="space-y-4">
          <div>
            <Label>Título (Español) *</Label>
            <input
              value={form.title_es}
              onChange={(e) => set("title_es", e.target.value)}
              placeholder="Ej: Hermoso apartamento en El Parque..."
              style={INPUT.base}
              required
            />
          </div>
          <div>
            <Label>Descripción</Label>
            <textarea
              value={form.description_es}
              onChange={(e) => set("description_es", e.target.value)}
              placeholder="Describe la propiedad con detalle: características, entorno, accesos..."
              style={INPUT.textarea}
            />
          </div>
        </div>
      </SectionCard>

      {/* SECCIÓN: Precio */}
      <SectionCard title="Precio">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Precio *</Label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="0"
              style={INPUT.base}
              required
            />
          </div>
          <div>
            <Label>Moneda</Label>
            <select
              value={form.price_currency}
              onChange={(e) => set("price_currency", e.target.value)}
              style={INPUT.base}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="VES">VES</option>
            </select>
          </div>
          <div>
            <Label>Mantenimiento</Label>
            <input
              type="number"
              value={form.maintenance_fee}
              onChange={(e) => set("maintenance_fee", e.target.value)}
              placeholder="0"
              style={INPUT.base}
            />
          </div>
        </div>
        <div className="mt-3">
          <Toggle checked={form.price_negotiable} onChange={(v) => set("price_negotiable", v)} label="Precio negociable" />
        </div>
      </SectionCard>

      {/* SECCIÓN: Dimensiones */}
      <SectionCard title="Dimensiones y habitaciones">
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: "area_built", label: "m² construidos" },
            { key: "area_total", label: "m² totales" },
            { key: "bedrooms", label: "Habitaciones" },
            { key: "bathrooms", label: "Baños" },
            { key: "half_bathrooms", label: "Medios baños" },
            { key: "parking_spaces", label: "Estacionamientos" },
            { key: "floors", label: "Pisos del edificio" },
            { key: "floor_number", label: "Piso de la unidad" },
            { key: "year_built", label: "Año de construcción" },
          ].map(({ key, label }) => (
            <div key={key}>
              <Label>{label}</Label>
              <input
                type="number"
                value={form[key as keyof FormData] as string}
                onChange={(e) => set(key as keyof FormData, e.target.value)}
                placeholder="-"
                style={INPUT.base}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* SECCIÓN: Ubicación */}
      <SectionCard title="Ubicación">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Municipio</Label>
            <select
              value={form.municipio}
              onChange={(e) => set("municipio", e.target.value)}
              style={INPUT.base}
            >
              <option value="">Seleccionar...</option>
              <option value="libertador">Libertador</option>
              <option value="campo_elias">Campo Elías</option>
              <option value="santos_marquina">Santos Marquina</option>
              <option value="sucre">Sucre</option>
              <option value="rangel">Rangel</option>
            </select>
          </div>
          <div>
            <Label>Dirección</Label>
            <input
              value={form.address_es}
              onChange={(e) => set("address_es", e.target.value)}
              placeholder="Calle, edificio, referencia..."
              style={INPUT.base}
            />
          </div>
          <div>
            <Label>Latitud</Label>
            <input
              type="number"
              step="any"
              value={form.lat}
              onChange={(e) => set("lat", e.target.value)}
              placeholder="8.5933"
              style={INPUT.base}
            />
          </div>
          <div>
            <Label>Longitud</Label>
            <input
              type="number"
              step="any"
              value={form.lng}
              onChange={(e) => set("lng", e.target.value)}
              placeholder="-71.1440"
              style={INPUT.base}
            />
          </div>
        </div>
      </SectionCard>

      {/* SECCIÓN: Imágenes */}
      <SectionCard title="Fotos (hasta 20)">
        <ImageDropzone
          images={images}
          onAdd={handleAddImages}
          onRemove={handleRemoveImage}
          onReorder={setImages}
          onSetCover={handleSetCover}
        />
      </SectionCard>

      {/* SECCIÓN: Video */}
      <SectionCard title="Video y tour virtual" defaultOpen={false}>
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

      {/* SECCIÓN: Amenidades */}
      <SectionCard title="Amenidades" defaultOpen={false}>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {[
            ["has_pool", "Piscina"],
            ["has_garden", "Jardín"],
            ["has_ac", "Aire acondicionado"],
            ["has_generator", "Planta eléctrica"],
            ["has_water_tank", "Tanque de agua"],
            ["has_security", "Seguridad"],
            ["has_elevator", "Ascensor"],
            ["allows_pets", "Acepta mascotas"],
            ["furnished", "Amueblado"],
            ["has_gym", "Gym"],
            ["has_jacuzzi", "Jacuzzi"],
            ["has_bbq", "BBQ"],
            ["has_laundry", "Lavandería"],
            ["has_balcony", "Balcón"],
            ["has_terrace", "Terraza"],
            ["has_solar_panels", "Paneles solares"],
          ].map(([key, label]) => (
            <Toggle
              key={key}
              checked={!!form[key as keyof FormData]}
              onChange={(v) => set(key as keyof FormData, v)}
              label={label as string}
            />
          ))}
        </div>
      </SectionCard>

      {/* Botón submit bottom */}
      <div className="flex justify-end pt-2 pb-8">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 text-[13px] font-medium"
          style={{
            borderRadius: "var(--p-radius)",
            background: saving ? "var(--p-surface-3)" : "var(--p-accent)",
            color: saving ? "var(--p-text-2)" : "#0E0D0C",
          }}
        >
          <Save size={15} />
          {saving ? "Publicando..." : "Publicar propiedad"}
        </button>
      </div>
    </form>
  );
}
