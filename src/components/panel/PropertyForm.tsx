/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useRouter } from "next/navigation";
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

interface PropertyFormProps {
  locale: string;
  propertyId: string;
}

export function PropertyForm({ locale, propertyId }: PropertyFormProps) {
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
        const { data: trans } = await supabase
          .from("property_translations")
          .select("title, description")
          .eq("property_id", propertyId)
          .eq("locale", "es")
          .maybeSingle();

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
          price: prop.price?.toString() || "",
          price_currency: prop.price_currency || "USD",
          price_negotiable: !!prop.price_negotiable,
          maintenance_fee: prop.maintenance_fee?.toString() || "",
          area_built: prop.area_built?.toString() || "",
          area_total: prop.area_total?.toString() || "",
          bedrooms: prop.bedrooms?.toString() || "",
          bathrooms: prop.bathrooms?.toString() || "",
          half_bathrooms: prop.half_bathrooms?.toString() || "",
          parking_spaces: prop.parking_spaces?.toString() || "",
          floors: prop.floors?.toString() || "",
          floor_number: prop.floor_number?.toString() || "",
          year_built: prop.year_built?.toString() || "",
          municipio: prop.municipio || "",
          zone_id: prop.zone_id || "",
          address_es: prop.address_es || "",
          lat: prop.lat?.toString() || "",
          lng: prop.lng?.toString() || "",
          title_es: trans?.title || "",
          description_es: trans?.description || "",
          video_url: prop.video_url || "",
          virtual_tour_url: prop.virtual_tour_url || "",
          featured: !!prop.featured,
          exclusive: !!prop.exclusive,
          new_listing: !!prop.new_listing,
          price_reduced: !!prop.price_reduced,
          has_pool: !!prop.has_pool,
          has_garden: !!prop.has_garden,
          has_ac: !!prop.has_ac,
          has_generator: !!prop.has_generator,
          has_water_tank: !!prop.has_water_tank,
          has_security: !!prop.has_security,
          has_elevator: !!prop.has_elevator,
          allows_pets: !!prop.allows_pets,
          furnished: !!prop.furnished,
          has_gym: !!prop.has_gym,
          has_jacuzzi: !!prop.has_jacuzzi,
          has_bbq: !!prop.has_bbq,
          has_laundry: !!prop.has_laundry,
          has_balcony: !!prop.has_balcony,
          has_terrace: !!prop.has_terrace,
          has_solar_panels: !!prop.has_solar_panels,
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
      // ensure we have at least one cover if none is cover
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
        setRemovedImages((r) => [...r, target.id]); // flag as deleted from database
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

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title_es.trim()) { setError("El título es obligatorio."); return; }
    if (!form.price) { setError("El precio es obligatorio."); return; }

    setSaving(true);
    try {
      const supabase = createClient();

      // 1. Update property in properties table
      const { error: propErr } = await supabase
        .from("properties")
        .update({
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
        .eq("id", propertyId);

      if (propErr) throw propErr;

      // 2. Update Translation (upsert)
      const { error: transErr } = await supabase
        .from("property_translations")
        .upsert({
          property_id: propertyId,
          locale: "es",
          title: form.title_es,
          description: form.description_es || null,
        }, { onConflict: "property_id,locale" });

      if (transErr) throw transErr;

      // 3. Remove deleted images from db
      if (removedImages.length > 0) {
        await supabase.from("property_images").delete().in("id", removedImages);
        setRemovedImages([]);
      }

      // 4. Handle images (Update sort_order/cover status or Upload new ones)
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (!img) continue;
        if (img.url) {
          // Existing image: update sorting and cover flags
          await supabase
            .from("property_images")
            .update({
              sort_order: i,
              is_cover: img.isCover,
            })
            .eq("id", img.id);
        } else if (img.file) {
          // New image: upload & insert
          const currentId = img.id;
          const currentIsCover = img.isCover;

          setImages((prev) => prev.map((x) => x.id === currentId ? { ...x, uploading: true, progress: 15 } : x));

          const ext = img.file.name.split(".").pop();
          const path = `properties/${propertyId}/${Date.now()}-${i}.${ext}`;

          const { data: uploaded, error: upErr } = await supabase.storage
            .from("property-images")
            .upload(path, img.file, { upsert: false, cacheControl: "31536000" });

          setImages((prev) => prev.map((x) => x.id === currentId ? { ...x, progress: 80 } : x));

          if (!upErr && uploaded) {
            const { data: { publicUrl } } = supabase.storage
              .from("property-images")
              .getPublicUrl(path);

            const { data: insertedImg } = await supabase
              .from("property_images")
              .insert({
                property_id: propertyId,
                url: publicUrl,
                is_cover: currentIsCover,
                sort_order: i,
                alt_es: form.title_es,
                alt_en: form.title_es,
              })
              .select()
              .single();

            // Replace mock/temporary id with actual db id
            if (insertedImg) {
              setImages((prev) =>
                prev.map((x) =>
                  x.id === currentId
                    ? { ...x, id: insertedImg.id, url: publicUrl, file: undefined, uploading: false, progress: 100 }
                    : x
                )
              );
            }
          } else {
            setImages((prev) => prev.map((x) => x.id === currentId ? { ...x, uploading: false } : x));
          }
        }
      }

      setSuccess("Propiedad guardada correctamente");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
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
              Editar propiedad
            </h2>
            <p className="text-[12px]" style={{ color: "var(--p-text-2)" }}>
              Modifica la información y fotos de la publicación
            </p>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer"
          style={{
            borderRadius: "var(--p-radius)",
            background: saving ? "var(--p-surface-3)" : "var(--p-accent)",
            color: saving ? "var(--p-text-2)" : "#0E0D0C",
            opacity: saving ? 0.7 : 1,
          }}
        >
          <Save size={14} />
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      {/* Success */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 text-[13px]"
          style={{
            borderRadius: "var(--p-radius)",
            background: "rgba(76,175,125,0.12)",
            border: "1px solid rgba(76,175,125,0.2)",
            color: "var(--p-green)",
          }}
        >
          {success}
        </motion.div>
      )}

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
              placeholder="Describe la propiedad con detalle..."
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
          className="flex items-center gap-2 px-6 py-2.5 text-[13px] font-medium cursor-pointer"
          style={{
            borderRadius: "var(--p-radius)",
            background: saving ? "var(--p-surface-3)" : "var(--p-accent)",
            color: saving ? "var(--p-text-2)" : "#0E0D0C",
          }}
        >
          <Save size={15} />
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
