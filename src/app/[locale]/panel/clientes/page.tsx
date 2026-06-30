/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { use, useState, useEffect, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
  DragStartEvent,
  pointerWithin,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { usePanelRole } from "@/hooks/usePanelRole";
import { useToastStore } from "@/store/toast.store";
import {
  Plus,
  Search,
  Mail,
  Phone,
  MessageSquare,
  DollarSign,
  Calendar,
  X,
  Eye,
  FileText,
  ArrowRight,
  Filter,
  Check,
  ChevronDown,
  LayoutGrid,
  List,
  AlertCircle,
  Clock,
  MapPin,
  Trash2,
  Bookmark,
  Building,
  Edit3,
  Calculator,
  Percent,
  Send,
  Copy,
  Home,
  TrendingUp,
  Minus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CRMStage, ClientType, CRMClient } from "@/types/panel";
import {
  getClients,
  upsertClient,
  updateClientStage,
  archiveClient,
  saveClientNotes,
  saveNextAction,
} from "@/lib/queries/clients";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const STAGES: { value: CRMStage; label_es: string; label_en: string; color: string }[] = [
  { value: "nuevo",       label_es: "Nuevo",       label_en: "New",       color: "#3B82F6" },
  { value: "contactado",  label_es: "Contactado",  label_en: "Contacted",  color: "#8B5CF6" },
  { value: "visita",      label_es: "Visita",      label_en: "Showing",    color: "#F59E0B" },
  { value: "negociacion", label_es: "Negociación", label_en: "Negotiation", color: "#EC4899" },
  { value: "cerrado",     label_es: "Cerrado",     label_en: "Closed Won",  color: "#10B981" },
];

const ARCHIVED_STAGES: { value: CRMStage; label_es: string; label_en: string; color: string }[] = [
  { value: "perdido",     label_es: "Perdido",     label_en: "Lost",       color: "#EF4444" },
];

const CLIENT_TYPE_CFG: Record<ClientType, { label_es: string; label_en: string; color: string }> = {
  comprador:    { label_es: "Comprador",    label_en: "Buyer",     color: "rgba(59, 130, 246, 0.15)" },
  arrendatario: { label_es: "Arrendatario", label_en: "Tenant",    color: "rgba(16, 185, 129, 0.15)" },
  propietario:  { label_es: "Propietario",  label_en: "Owner",     color: "rgba(139, 92, 246, 0.15)" },
  inversor:     { label_es: "Inversor",     label_en: "Investor",  color: "rgba(245, 158, 11, 0.15)" },
};

const PROP_TYPE_LABEL: Record<string, string> = {
  casa: "Casa",
  apartamento: "Apartamento",
  townhouse: "Townhouse",
  anexo: "Anexo",
  edificio: "Edificio",
  galpon: "Galpón",
  habitacion: "Habitación",
  hacienda_finca: "Hacienda / Finca",
  local: "Local comercial",
  oficina: "Oficina",
  terreno_lote: "Terreno / Lote",
};

const MERIDA_ZONES = [
  { value: "centro", label: "Centro de Mérida", municipality: "Libertador" },
  { value: "las_americas", label: "Av. Las Américas", municipality: "Libertador" },
  { value: "los_proceres", label: "Av. Los Próceres", municipality: "Libertador" },
  { value: "la_pedregosa", label: "La Pedregosa", municipality: "Libertador" },
  { value: "belensate", label: "Belensate / La Mara", municipality: "Libertador" },
  { value: "los_chorros", label: "Los Chorros / Milla", municipality: "Libertador" },
  { value: "av_urdaneta", label: "Av. Urdaneta / Carrizal", municipality: "Libertador" },
  { value: "el_valle", label: "El Valle / Culata", municipality: "Libertador" },
  { value: "ejido", label: "Ejido (Centro / Manzano)", municipality: "Campo Elías" },
  { value: "tabay", label: "Tabay / Santos Marquina", municipality: "Santos Marquina" }
];

// Generamos 20 Mocks detallados y lógicos en español para pruebas
const MOCK_CLIENTS: CRMClient[] = [
  {
    id: "c1",
    agent_id: "a1",
    full_name: "Alejandra Rivas",
    email: "arivas@email.com",
    phone: "+58 412 1234567",
    whatsapp: "+58 412 1234567",
    client_type: "comprador",
    stage: "nuevo",
    budget_min: 100000,
    budget_max: 150000,
    budget_currency: "USD",
    interested_zones: ["libertador"],
    interested_types: ["apartamento"],
    notes: "Busca apartamento de 2 habitaciones, planta baja indispensable por razones familiares.",
    next_action: "Enviar portafolio de apartamentos en La Pedregosa",
    next_action_date: "2026-06-30",
    last_contact: "2026-06-28",
    properties_shown: [],
    created_at: "2026-06-28",
    updated_at: "2026-06-28",
  },
  {
    id: "c2",
    agent_id: "a1",
    full_name: "Francisco Pernía",
    email: "fpernia@email.com",
    phone: "+58 414 7654321",
    whatsapp: "+58 414 7654321",
    client_type: "inversor",
    stage: "contactado",
    budget_min: 200000,
    budget_max: 300000,
    budget_currency: "USD",
    interested_zones: ["libertador", "campo_elias"],
    interested_types: ["local", "edificio"],
    notes: "Interesado en inmuebles comerciales con alto retorno de alquiler.",
    next_action: "Llamada de seguimiento para coordinar visita a terreno comercial",
    next_action_date: "2026-06-23",
    last_contact: "2026-06-20",
    properties_shown: [],
    created_at: "2026-06-19",
    updated_at: "2026-06-20",
  },
  {
    id: "c3",
    agent_id: "a1",
    full_name: "María Gabriela Soto",
    email: "mgsoto@email.com",
    phone: "+58 416 9876543",
    whatsapp: null,
    client_type: "arrendatario",
    stage: "visita",
    budget_min: 500,
    budget_max: 800,
    budget_currency: "USD",
    interested_zones: ["libertador"],
    interested_types: ["casa"],
    notes: "Alquiler vacacional o de larga estancia para profesor universitario visitante.",
    next_action: "Visita programada a casa Chorros de Milla",
    next_action_date: "2026-07-02",
    last_contact: "2026-06-25",
    properties_shown: [],
    created_at: "2026-06-15",
    updated_at: "2026-06-25",
  },
  {
    id: "c4",
    agent_id: "a1",
    full_name: "Carlos Eduardo Mendoza",
    email: "cemendoza@email.com",
    phone: "+58 424 5556677",
    whatsapp: "+58 424 5556677",
    client_type: "comprador",
    stage: "negociacion",
    budget_min: 150000,
    budget_max: 180000,
    budget_currency: "USD",
    interested_zones: ["campo_elias"],
    interested_types: ["townhouse"],
    notes: "Tiene oferta en discusión para townhouse en San Juan. Revisar contra-oferta.",
    next_action: "Presentar contra-oferta firmada por el propietario",
    next_action_date: "2026-06-29",
    last_contact: "2026-06-28",
    properties_shown: [],
    created_at: "2026-06-10",
    updated_at: "2026-06-28",
  },
  {
    id: "c5",
    agent_id: "a1",
    full_name: "Beatriz Elena Araujo",
    email: "baraujo@email.com",
    phone: "+58 412 8889900",
    whatsapp: null,
    client_type: "propietario",
    stage: "nuevo",
    budget_min: null,
    budget_max: 120000,
    budget_currency: "USD",
    interested_zones: ["libertador"],
    interested_types: ["apartamento"],
    notes: "Desea vender apartamento en Las Américas para comprar casa más amplia.",
    next_action: "Coordinar avalúo y sesión fotográfica del inmueble",
    next_action_date: "2026-07-03",
    last_contact: "2026-06-29",
    properties_shown: [],
    created_at: "2026-06-29",
    updated_at: "2026-06-29",
  },
  {
    id: "c6",
    agent_id: "a1",
    full_name: "José Manuel Gil",
    email: "jmgil@email.com",
    phone: "+58 414 4443322",
    whatsapp: "+58 414 4443322",
    client_type: "inversor",
    stage: "visita",
    budget_min: 80000,
    budget_max: 110000,
    budget_currency: "USD",
    interested_zones: ["libertador"],
    interested_types: ["apartamento", "oficina"],
    notes: "Busca oficinas céntricas para remodelar y alquilar a empresas de tecnología.",
    next_action: "Mostrar oficinas en el Centro Profesional Américas",
    next_action_date: "2026-07-01",
    last_contact: "2026-06-27",
    properties_shown: [],
    created_at: "2026-06-22",
    updated_at: "2026-06-27",
  },
  {
    id: "c7",
    agent_id: "a1",
    full_name: "Diana Carolina Uzcátegui",
    email: "dcuzcategui@email.com",
    phone: "+58 416 1112233",
    whatsapp: "+58 416 1112233",
    client_type: "arrendatario",
    stage: "contactado",
    budget_min: 300,
    budget_max: 450,
    budget_currency: "USD",
    interested_zones: ["libertador"],
    interested_types: ["apartamento"],
    notes: "Estudiante de postgrado ULA busca apartamento amoblado cerca de medicina.",
    next_action: "Enviar opciones de anexos amoblados en Chorros de Milla",
    next_action_date: "2026-06-30",
    last_contact: "2026-06-28",
    properties_shown: [],
    created_at: "2026-06-26",
    updated_at: "2026-06-28",
  },
  {
    id: "c8",
    agent_id: "a1",
    full_name: "Humberto Plaza",
    email: "hplaza@email.com",
    phone: "+58 424 9998877",
    whatsapp: null,
    client_type: "comprador",
    stage: "cerrado",
    budget_min: 130000,
    budget_max: 130000,
    budget_currency: "USD",
    interested_zones: ["santos_marquina"],
    interested_types: ["casa"],
    notes: "Cerrada compra de casa campestre en Tabay. Entrega de llaves completada.",
    next_action: "Hacer llamada de cortesía post-venta",
    next_action_date: "2026-07-10",
    last_contact: "2026-06-25",
    properties_shown: [],
    created_at: "2026-05-15",
    updated_at: "2026-06-25",
  },
  {
    id: "c9",
    agent_id: "a1",
    full_name: "Ricardo Montilla",
    email: "rmontilla@email.com",
    phone: "+58 412 7776655",
    whatsapp: "+58 412 7776655",
    client_type: "propietario",
    stage: "nuevo",
    budget_min: null,
    budget_max: null,
    budget_currency: "USD",
    interested_zones: ["sucre"],
    interested_types: ["terreno_lote"],
    notes: "Quiere listar terreno en Lagunillas de 5000 metros con factibilidad de agua.",
    next_action: "Verificar linderos y documentos de registro catastral",
    next_action_date: "2026-07-04",
    last_contact: "2026-06-29",
    properties_shown: [],
    created_at: "2026-06-29",
    updated_at: "2026-06-29",
  },
  {
    id: "c10",
    agent_id: "a1",
    full_name: "Gabriela Alejandra Altuve",
    email: "galtuve@email.com",
    phone: "+58 414 3332211",
    whatsapp: "+58 414 3332211",
    client_type: "comprador",
    stage: "negociacion",
    budget_min: 95000,
    budget_max: 110000,
    budget_currency: "USD",
    interested_zones: ["libertador"],
    interested_types: ["apartamento"],
    notes: "Presentó oferta formal por apartamento en Residencias El Rodeo. Esperando firma.",
    next_action: "Llamar al vendedor para firmar aceptación de oferta",
    next_action_date: "2026-06-29",
    last_contact: "2026-06-28",
    properties_shown: [],
    created_at: "2026-06-01",
    updated_at: "2026-06-28",
  },
  {
    id: "c11",
    agent_id: "a1",
    full_name: "Luis Alfonso Dávila",
    email: "ldavila@email.com",
    phone: "+58 424 1110099",
    whatsapp: null,
    client_type: "inversor",
    stage: "contactado",
    budget_min: 350000,
    budget_max: 500000,
    budget_currency: "USD",
    interested_zones: ["libertador"],
    interested_types: ["edificio", "galpon"],
    notes: "Busca galpón grande o edificio comercial en Av. Los Próceres.",
    next_action: "Contactar a colega inmobiliario por galpón no listado",
    next_action_date: "2026-07-02",
    last_contact: "2026-06-26",
    properties_shown: [],
    created_at: "2026-06-25",
    updated_at: "2026-06-26",
  },
  {
    id: "c12",
    agent_id: "a1",
    full_name: "Valeria Valentina Valero",
    email: "vvalero@email.com",
    phone: "+58 416 8887766",
    whatsapp: "+58 416 8887766",
    client_type: "arrendatario",
    stage: "visita",
    budget_min: 600,
    budget_max: 1000,
    budget_currency: "USD",
    interested_zones: ["libertador"],
    interested_types: ["casa", "townhouse"],
    notes: "Familia busca casa en alquiler con jardín amplio y vigilancia privada.",
    next_action: "Visita a townhouse en conjunto exclusivo de La Pedregosa",
    next_action_date: "2026-06-27", // VENCIDA
    last_contact: "2026-06-24",
    properties_shown: [],
    created_at: "2026-06-20",
    updated_at: "2026-06-24",
  },
  {
    id: "c13",
    agent_id: "a1",
    full_name: "Juan Ignacio Guerrero",
    email: "jguerrero@email.com",
    phone: "+58 412 4445566",
    whatsapp: "+58 412 4445566",
    client_type: "comprador",
    stage: "perdido",
    budget_min: 70000,
    budget_max: 85000,
    budget_currency: "USD",
    interested_zones: ["campo_elias"],
    interested_types: ["apartamento"],
    notes: "Desistió de la búsqueda temporalmente por reubicación laboral fuera del país.",
    next_action: "Archivar contacto",
    next_action_date: null,
    last_contact: "2026-06-15",
    properties_shown: [],
    created_at: "2026-05-20",
    updated_at: "2026-06-15",
  },
  {
    id: "c14",
    agent_id: "a1",
    full_name: "Yolanda María Maldonado",
    email: "ymaldonado@email.com",
    phone: "+58 414 1122334",
    whatsapp: "+58 414 1122334",
    client_type: "propietario",
    stage: "contactado",
    budget_min: null,
    budget_max: null,
    budget_currency: "USD",
    interested_zones: ["libertador"],
    interested_types: ["casa"],
    notes: "Desea alquilar casa amplia en Santa María. Falta firmar contrato de corretaje.",
    next_action: "Enviar borrador del contrato de corretaje exclusivo",
    next_action_date: "2026-06-29",
    last_contact: "2026-06-28",
    properties_shown: [],
    created_at: "2026-06-27",
    updated_at: "2026-06-28",
  },
  {
    id: "c15",
    agent_id: "a1",
    full_name: "Santiago Rojas",
    email: "srojas@email.com",
    phone: "+58 424 8881122",
    whatsapp: "+58 424 8881122",
    client_type: "comprador",
    stage: "nuevo",
    budget_min: 50000,
    budget_max: 70000,
    budget_currency: "USD",
    interested_zones: ["campo_elias", "sucre"],
    interested_types: ["apartamento", "casa"],
    notes: "Pareja joven con crédito propio aprobado busca su primer hogar.",
    next_action: "Primer contacto telefónico para validar preferencias",
    next_action_date: "2026-06-29",
    last_contact: "2026-06-29",
    properties_shown: [],
    created_at: "2026-06-29",
    updated_at: "2026-06-29",
  },
  {
    id: "c16",
    agent_id: "a1",
    full_name: "Elena María Paredes",
    email: "eparedes@email.com",
    phone: "+58 416 5554433",
    whatsapp: null,
    client_type: "arrendatario",
    stage: "cerrado",
    budget_min: 400,
    budget_max: 500,
    budget_currency: "USD",
    interested_zones: ["libertador"],
    interested_types: ["apartamento"],
    notes: "Alquiler concretado de apartamento de 2 hab en Av. Las Américas por 1 año.",
    next_action: "Revisar fecha de primer mes de canon",
    next_action_date: "2026-07-20",
    last_contact: "2026-06-20",
    properties_shown: [],
    created_at: "2026-06-10",
    updated_at: "2026-06-20",
  },
  {
    id: "c17",
    agent_id: "a1",
    full_name: "Gustavo Adolfo Rangel",
    email: "grangel@email.com",
    phone: "+58 412 1115599",
    whatsapp: "+58 412 1115599",
    client_type: "inversor",
    stage: "negociacion",
    budget_min: 150000,
    budget_max: 200000,
    budget_currency: "USD",
    interested_zones: ["libertador", "rangel"],
    interested_types: ["terreno_lote", "hacienda_finca"],
    notes: "En negociación de compra de lote de terreno agrícola en Mucuchíes.",
    next_action: "Esperar borrador del documento final de compra-venta visado",
    next_action_date: "2026-07-02",
    last_contact: "2026-06-28",
    properties_shown: [],
    created_at: "2026-06-05",
    updated_at: "2026-06-28",
  },
  {
    id: "c18",
    agent_id: "a1",
    full_name: "Camila Sofía Briceño",
    email: "cbriceno@email.com",
    phone: "+58 424 7771122",
    whatsapp: "+58 424 7771122",
    client_type: "comprador",
    stage: "visita",
    budget_min: 120000,
    budget_max: 160000,
    budget_currency: "USD",
    interested_zones: ["libertador"],
    interested_types: ["apartamento"],
    notes: "Mostrado apartamento en Residencias La Pedregosa, le encantó la vista.",
    next_action: "Seguimiento para recibir propuesta formal por escrito",
    next_action_date: "2026-06-29",
    last_contact: "2026-06-27",
    properties_shown: [],
    created_at: "2026-06-24",
    updated_at: "2026-06-27",
  },
  {
    id: "c19",
    agent_id: "a1",
    full_name: "Pedro Pablo Chacón",
    email: "ppchacon@email.com",
    phone: "+58 414 9990011",
    whatsapp: null,
    client_type: "propietario",
    stage: "visita",
    budget_min: null,
    budget_max: null,
    budget_currency: "USD",
    interested_zones: ["libertador"],
    interested_types: ["oficina"],
    notes: "Propietario de oficina en el Centro Profesional. Coordinando visitas con interesados.",
    next_action: "Acompañar visita con el cliente inversor Gil",
    next_action_date: "2026-07-01",
    last_contact: "2026-06-28",
    properties_shown: [],
    created_at: "2026-06-26",
    updated_at: "2026-06-28",
  },
  {
    id: "c20",
    agent_id: "a1",
    full_name: "Estefanía Carolina Rondón",
    email: "erondon@email.com",
    phone: "+58 416 3335577",
    whatsapp: "+58 416 3335577",
    client_type: "arrendatario",
    stage: "nuevo",
    budget_min: 200,
    budget_max: 300,
    budget_currency: "USD",
    interested_zones: ["libertador"],
    interested_types: ["habitacion", "anexo"],
    notes: "Busca anexo independiente en zona norte de Mérida.",
    next_action: "Validar disponibilidad de anexo en Milla",
    next_action_date: "2026-06-30",
    last_contact: "2026-06-29",
    properties_shown: [],
    created_at: "2026-06-29",
    updated_at: "2026-06-29",
  },
];

// Custom Premium Select dropdown component with gold/yellow selection highlighting
interface CustomSelectOption {
  value: string;
  label: string;
}

function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedOpt = options.find((o) => o.value === value);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] text-white flex justify-between items-center cursor-pointer hover:bg-white/[0.02] transition-colors outline-none h-[38px] text-left"
        style={{ borderColor: isOpen ? '#C9962A' : 'var(--p-border)' }}
      >
        <span className="truncate">{selectedOpt ? selectedOpt.label : (placeholder || "Seleccionar...")}</span>
        <ChevronDown size={12} className="text-[var(--p-text-3)] flex-shrink-0 ml-1.5" style={{ color: isOpen ? '#C9962A' : 'var(--p-text-3)' }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 mt-1 bg-[#18181b] border border-[#C9962A] rounded-sm shadow-xl z-50 overflow-y-auto max-h-60 py-1"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(isSelected ? "" : opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer block ${
                    isSelected
                      ? "bg-[#C9962A] text-[#141210] font-semibold"
                      : "text-white hover:bg-[#C9962A] hover:text-[#141210]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Custom NumberStepper component matching the styles of PropertyForm
function NumberStepper({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
}: {
  value: string;
  onChange: (val: string) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const numVal = parseFloat(value) || 0;

  const adjust = (delta: number) => {
    let next = numVal + delta * step;
    if (next < min) next = min;
    if (max !== undefined && next > max) next = max;
    // Format to avoid floating point precision issues (e.g. 1.5000000000000002)
    const formatted = Number(next.toFixed(2)).toString();
    onChange(formatted);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      onChange(val);
    }
  };

  const handleBlur = () => {
    if (value === "") return;
    let next = parseFloat(value) || 0;
    if (next < min) next = min;
    if (max !== undefined && next > max) next = max;
    const formatted = Number(next.toFixed(2)).toString();
    onChange(formatted);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "var(--p-surface-2)",
        border: "1px solid var(--p-border)",
        borderRadius: "var(--p-radius)",
        padding: "3px",
        height: "38px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <button
        type="button"
        onClick={() => adjust(-1)}
        style={{
          height: "100%",
          aspectRatio: "1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--p-surface-3)",
          border: "1px solid var(--p-border)",
          borderRadius: "4px",
          color: "var(--p-text-2)",
          cursor: "pointer",
          outline: "none",
          transition: "all 0.1s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          e.currentTarget.style.color = "var(--p-text)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--p-surface-3)";
          e.currentTarget.style.color = "var(--p-text-2)";
        }}
      >
        <Minus size={13} strokeWidth={2.5} />
      </button>

      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        style={{
          flex: 1,
          minWidth: 0,
          background: "transparent",
          textAlign: "center",
          color: "var(--p-text)",
          fontSize: "13px",
          fontWeight: 600,
          border: "none",
          outline: "none",
          height: "100%",
        }}
      />

      <button
        type="button"
        onClick={() => adjust(1)}
        style={{
          height: "100%",
          aspectRatio: "1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--p-surface-3)",
          border: "1px solid var(--p-border)",
          borderRadius: "4px",
          color: "var(--p-text-2)",
          cursor: "pointer",
          outline: "none",
          transition: "all 0.1s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          e.currentTarget.style.color = "var(--p-text)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--p-surface-3)";
          e.currentTarget.style.color = "var(--p-text-2)";
        }}
      >
        <Plus size={13} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─── HELPER FORMATTING FUNCTIONS ─────────────────────────────────────────────
function formatCedula(val: string): string {
  const cleaned = val.replace(/[^a-zA-Z0-9]/g, "");
  if (!cleaned) return "";
  let prefix = "V";
  let numberPart = cleaned;
  const firstChar = cleaned[0]?.toUpperCase();
  if (firstChar && ["V", "E", "J", "G"].includes(firstChar)) {
    prefix = firstChar;
    numberPart = cleaned.slice(1);
  }
  numberPart = numberPart.replace(/[^0-9]/g, "");
  if (!numberPart) return `${prefix}-`;
  const formattedNumber = Number(numberPart).toLocaleString("de-DE");
  return `${prefix}-${formattedNumber}`;
}

function formatPhone(val: string): string {
  let cleaned = val.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) {
    const digits = cleaned.slice(1);
    if (digits.length <= 2) {
      return cleaned;
    }
    const countryCode = digits.slice(0, 2);
    const rest = digits.slice(2);
    if (rest.length <= 3) {
      return `+${countryCode} ${rest}`;
    } else if (rest.length <= 6) {
      return `+${countryCode} ${rest.slice(0, 3)} ${rest.slice(3)}`;
    } else {
      return `+${countryCode} ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6, 10)}`;
    }
  } else {
    if (cleaned.length <= 4) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    } else {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 11)}`;
    }
  }
}

function formatThousands(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return "";
  return val.toLocaleString("de-DE");
}

function parseThousands(val: string): number | undefined {
  const cleaned = val.replace(/[^0-9]/g, "");
  if (!cleaned) return undefined;
  return parseInt(cleaned, 10);
}

export default function ClientesCRMPage({ params }: PageProps) {
  const resolvedParams = params ? use(params) : { locale: "es" };
  const locale = resolvedParams?.locale || "es";
  const { role, userId, loading: roleLoading } = usePanelRole();
  const toastFn = useToastStore((state) => state.toast);

  const [clients, setClients] = useState<CRMClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  // Modales y Drawers
  const [selectedClient, setSelectedClient] = useState<CRMClient | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedClient, setDraggedClient] = useState<CRMClient | null>(null);
  const [activeOverId, setActiveOverId] = useState<string | null>(null);
  const [lastDroppedId, setLastDroppedId] = useState<string | null>(null);
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [editForm, setEditForm] = useState<Partial<CRMClient>>({});

  const [calcBudget, setCalcBudget] = useState<number>(0);
  const [calcCommPct, setCalcCommPct] = useState<number>(3);

  const [zonesList, setZonesList] = useState<{ value: string; label: string; municipality?: string }[]>([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>("Todos");
  const [zoneSearchQuery, setZoneSearchQuery] = useState<string>("");
  const [isZoneDropdownOpen, setIsZoneDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  const zoneLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    MERIDA_ZONES.forEach((z) => {
      map[z.value] = z.label;
    });
    zonesList.forEach((z) => {
      map[z.value] = z.label;
    });
    return map;
  }, [zonesList]);

  const activeMunicipalities = useMemo(() => {
    const list = zonesList.length > 0 ? zonesList : MERIDA_ZONES;
    const munis = new Set<string>();
    list.forEach((z) => {
      if (z.municipality) munis.add(z.municipality);
    });
    return Array.from(munis).sort();
  }, [zonesList]);
  
  // Estado para el modal de 3 pasos y animaciones premium
  const [modalStep, setModalStep] = useState(1);
  const [animationDirection, setAnimationDirection] = useState(1);
  const [newClientIsZoneDropdownOpen, setNewClientIsZoneDropdownOpen] = useState(false);
  const [newClientIsTypeDropdownOpen, setNewClientIsTypeDropdownOpen] = useState(false);
  const [newClientZoneSearchQuery, setNewClientZoneSearchQuery] = useState("");
  const [agentDbId, setAgentDbId] = useState<string | null>(null);

  const newClientZoneDropdownRef = useRef<HTMLDivElement>(null);
  const newClientTypeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;
    async function fetchAgentDbId() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("agents")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();
        if (data) {
          setAgentDbId(data.id);
        }
      } catch (err) {
        console.error("Failed to pre-fetch agent DB id:", err);
      }
    }
    fetchAgentDbId();
  }, [userId]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (newClientIsZoneDropdownOpen && newClientZoneDropdownRef.current && !newClientZoneDropdownRef.current.contains(e.target as Node)) {
        setNewClientIsZoneDropdownOpen(false);
      }
      if (newClientIsTypeDropdownOpen && newClientTypeDropdownRef.current && !newClientTypeDropdownRef.current.contains(e.target as Node)) {
        setNewClientIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [newClientIsZoneDropdownOpen, newClientIsTypeDropdownOpen]);

  const [newClient, setNewClient] = useState<Partial<CRMClient>>({
    full_name: "",
    email: "",
    phone: "",
    whatsapp: "",
    client_type: "comprador",
    stage: "nuevo",
    budget_min: undefined,
    budget_max: undefined,
    budget_currency: "USD",
    interested_zones: [],
    interested_types: [],
    notes: "",
    next_action: "",
    next_action_date: "",
    priority: "media",
    source: "web",
    req_bedrooms: undefined,
    req_bathrooms: undefined,
    req_parking: undefined,
    bath_preference: "indiferente",
  });

  // Carga de clientes reales con fallback a mock
  const loadClientsData = async () => {
    try {
      setLoading(true);
      const data = await getClients(userId, role);
      if (data && data.length > 0) {
        setClients(data);
      } else {
        // Si no hay datos, inicializamos con los 20 mocks lógicos
        setClients(MOCK_CLIENTS);
      }
    } catch (err) {
      console.warn("Failed to load clients, using mock fallback", err);
      setClients(MOCK_CLIENTS);
    } finally {
      setLoading(false);
    }
  };

  const loadZonesData = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("zones")
        .select(`
          id,
          name_es,
          active,
          municipality,
          municipalities!inner(name, slug, active)
        `)
        .eq("active", true)
        .eq("municipalities.active", true)
        .order("name_es", { ascending: true });

      if (!error && data && data.length > 0) {
        setZonesList(
          data.map((z: any) => ({
            value: z.id,
            label: z.name_es,
            municipality: z.municipalities?.name || z.municipality || "Libertador",
          }))
        );
      } else {
        setZonesList(MERIDA_ZONES.filter((z) => z.municipality === "Libertador"));
      }
    } catch (err) {
      console.warn("Failed to fetch zones, using static fallback", err);
      setZonesList(MERIDA_ZONES.filter((z) => z.municipality === "Libertador"));
    }
  };

  useEffect(() => {
    if (!roleLoading) {
      loadClientsData();
      loadZonesData();
    }
  }, [role, userId, roleLoading]);

  useEffect(() => {
    const scrollContainer = document.querySelector(".panel-scroll") as HTMLElement;
    if (isDrawerOpen) {
      if (scrollContainer) scrollContainer.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      if (scrollContainer) scrollContainer.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      if (scrollContainer) scrollContainer.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  // Sensores estables de DnD para no interferir con clicks de inputs/botones
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const client = clients.find((c) => c.id === event.active.id);
    if (client) setDraggedClient(client);
    setActiveOverId(null);
    
    if (typeof window !== "undefined") {
      const activeNode = document.getElementById(event.active.id as string);
      if (activeNode) {
        setDragWidth(activeNode.getBoundingClientRect().width);
      }
    }
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    setActiveOverId(over?.id as string || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setDraggedClient(null);
    setActiveOverId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const targetStage = STAGES.find((s) => s.value === overId) || ARCHIVED_STAGES.find((s) => s.value === overId);

    setLastDroppedId(activeId);
    setTimeout(() => {
      setLastDroppedId((curr) => (curr === activeId ? null : curr));
    }, 1500);

    if (targetStage) {
      setClients((prev) => {
        const moved = prev.find((c) => c.id === activeId);
        if (!moved) return prev;
        const updated = { ...moved, stage: targetStage.value, updated_at: new Date().toISOString() };
        const filtered = prev.filter((c) => c.id !== activeId);
        return [updated, ...filtered]; // Prepend it so it sits at the top of the column
      });
      try {
        await updateClientStage(activeId, targetStage.value);
      } catch (err) {
        console.error("Error persisting drag-and-drop stage change", err);
      }
    } else {
      const overClient = clients.find((c) => c.id === overId);
      if (overClient) {
        setClients((prev) => {
          const moved = prev.find((c) => c.id === activeId);
          if (!moved) return prev;
          const updated = { ...moved, stage: overClient.stage, updated_at: new Date().toISOString() };
          const filtered = prev.filter((c) => c.id !== activeId);
          return [updated, ...filtered]; // Prepend it so it sits at the top of the column
        });
        try {
          await updateClientStage(activeId, overClient.stage);
        } catch (err) {
          console.error("Error persisting drag-and-drop stage change", err);
        }
      }
    }
  };

  // Filtrado de clientes lógicos
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      // Búsqueda textual
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        c.full_name.toLowerCase().includes(query) ||
        (c.email && c.email.toLowerCase().includes(query)) ||
        (c.phone && c.phone.includes(query));

      // Filtro de tipo de cliente
      const matchesType = filterType === "all" || c.client_type === filterType;

      // Filtro de prioridad (si existe la propiedad en el objeto, si no la evaluamos como media)
      const priority = (c as any).priority || "media";
      const matchesPriority = filterPriority === "all" || priority === filterPriority;

      return matchesSearch && matchesType && matchesPriority;
    });
  }, [clients, searchQuery, filterType, filterPriority]);

  // Conteo de KPI
  const stats = useMemo(() => {
    const active = filteredClients.filter((c) => c.stage !== "perdido");
    const today = new Date().toISOString().split("T")[0] || "";
    
    let expiredActions = 0;
    filteredClients.forEach((c) => {
      if (c.next_action_date && c.next_action_date < today && c.stage !== "cerrado" && c.stage !== "perdido") {
        expiredActions++;
      }
    });

    return {
      total: active.length,
      newToday: active.filter((c) => c.created_at?.startsWith(today)).length,
      expired: expiredActions,
    };
  }, [filteredClients]);

  const handleOpenDrawer = (client: CRMClient) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
    setCalcBudget(client.budget_max || 0);
    setCalcCommPct(3);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedClient(null);
    setIsEditingClient(false);
    setEditForm({});
  };

  const handleSaveClientEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    const updated = {
      ...selectedClient,
      ...editForm,
      updated_at: new Date().toISOString(),
    } as CRMClient;

    setClients((prev) => prev.map((c) => (c.id === selectedClient.id ? updated : c)));
    setSelectedClient(updated);

    // Muestra la animación de guardado con éxito inmediatamente
    toastFn({
      title: locale === "en" ? "Changes Saved" : "Cambios guardados",
      description: locale === "en" ? "Client profile updated successfully" : "Perfil del cliente actualizado correctamente",
      type: "success",
    });

    // 0.45 segundos después se esconde suavemente el drawer
    setTimeout(() => {
      setIsEditingClient(false);
      handleCloseDrawer();
    }, 450);

    try {
      await upsertClient(updated as any);
    } catch (err: any) {
      console.error("[CRM] Error saving client edits:", err);
      toastFn({
        title: locale === "en" ? "Error Saving" : "Error al guardar",
        description: err.message || (locale === "en" ? "An error occurred" : "Ocurrió un error al guardar los cambios"),
        type: "danger",
      });
    }
  };

  const handleSaveNotesLocal = async (notes: string) => {
    if (!selectedClient) return;
    setClients((prev) =>
      prev.map((c) => (c.id === selectedClient.id ? { ...c, notes } : c))
    );
    setSelectedClient((prev) => (prev ? { ...prev, notes } : null));

    try {
      await saveClientNotes(selectedClient.id, notes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNextActionLocal = async (action: string, date: string | null) => {
    if (!selectedClient) return;
    setClients((prev) =>
      prev.map((c) =>
        c.id === selectedClient.id
          ? { ...c, next_action: action, next_action_date: date }
          : c
      )
    );
    setSelectedClient((prev) =>
      prev ? { ...prev, next_action: action, next_action_date: date } : null
    );

    try {
      await saveNextAction(selectedClient.id, action, date);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.full_name?.trim()) {
      toastFn({
        title: locale === "en" ? "Full Name Required" : "Nombre completo requerido",
        description: locale === "en" ? "Please enter a name for the client." : "Por favor, ingresa el nombre del cliente.",
        type: "warning",
      });
      return;
    }

    const activeAgentId = agentDbId || "1f84e2be-80d4-48f8-b391-7db1387d8549";

    const payload: Partial<CRMClient> & { agent_id: string } = {
      ...newClient,
      agent_id: activeAgentId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any;

    // Agregar id único local en caso de fallback
    const localId = "c_new_" + Math.random().toString(36).substring(7);
    const clientToInsert = { ...payload, id: localId } as CRMClient;

    setClients((prev) => [clientToInsert, ...prev]);
    setIsModalOpen(false);
    
    // Reset modal state AFTER the smooth fade out transition finishes
    setTimeout(() => {
      setModalStep(1);
      setNewClient({
        full_name: "",
        email: "",
        phone: "",
        whatsapp: "",
        client_type: "comprador",
        stage: "nuevo",
        budget_min: undefined,
        budget_max: undefined,
        budget_currency: "USD",
        interested_zones: [],
        interested_types: [],
        notes: "",
        next_action: "",
        next_action_date: "",
        priority: "media",
        source: "web",
        req_bedrooms: undefined,
        req_bathrooms: undefined,
        req_parking: undefined,
        cedula_rif: "",
        preferred_payment: "",
        urgency: "",
      });
    }, 300);

    try {
      const saved = await upsertClient(payload);
      if (saved) {
        setClients((prev) => prev.map((c) => (c.id === localId ? saved : c)));
      }
      toastFn({
        title: locale === "en" ? "Client Created" : "Cliente agregado",
        description: locale === "en" ? "New client added successfully" : "El nuevo cliente ha sido agregado con éxito",
        type: "success",
      });
    } catch (err: any) {
      console.error("Failed to insert client on Supabase, keeping local copy", err);
      toastFn({
        title: locale === "en" ? "Error Creating Client" : "Error al agregar cliente",
        description: err.message || (locale === "en" ? "An error occurred" : "Ocurrió un error"),
        type: "danger",
      });
    }
  };

  const handleArchiveClientLocal = async (id: string) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, stage: "perdido" as CRMStage } : c))
    );
    handleCloseDrawer();
    try {
      await archiveClient(id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Stats Header Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="p-4 rounded-sm border flex flex-col justify-between"
          style={{ background: "var(--p-surface)", borderColor: "var(--p-border)" }}
        >
          <span className="text-xs text-[var(--p-text-2)] font-semibold uppercase tracking-wider">
            {locale === "en" ? "Active Clients" : "Clientes Activos"}
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-[var(--p-text)]">
              {stats.total}
            </span>
            <span className="text-[10px] text-[var(--p-text-3)]">
              {locale === "en" ? "pipeline total" : "en el embudo activo"}
            </span>
          </div>
        </div>

        <div
          className="p-4 rounded-sm border flex flex-col justify-between"
          style={{ background: "var(--p-surface)", borderColor: "var(--p-border)" }}
        >
          <span className="text-xs text-[var(--p-text-2)] font-semibold uppercase tracking-wider">
            {locale === "en" ? "New Leads Today" : "Nuevos Hoy"}
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-[var(--p-text)]">
              {stats.newToday}
            </span>
            <span className="text-[10px] text-[var(--p-green)] font-semibold">
              +100% {locale === "en" ? "vs yesterday" : "vs ayer"}
            </span>
          </div>
        </div>

        <div
          className="p-4 rounded-sm border flex flex-col justify-between"
          style={{ background: "var(--p-surface)", borderColor: "var(--p-border)" }}
        >
          <span className="text-xs text-[var(--p-text-2)] font-semibold uppercase tracking-wider flex items-center gap-1.5">
            {locale === "en" ? "Urgent Actions" : "Acciones Vencidas"}
            {stats.expired > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--p-red)] animate-pulse" />
            )}
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span
              className="text-2xl font-bold font-mono"
              style={{ color: stats.expired > 0 ? "var(--p-red)" : "var(--p-text)" }}
            >
              {stats.expired}
            </span>
            <span className="text-[10px] text-[var(--p-text-3)]">
              {locale === "en" ? "require immediate contact" : "requieren contacto inmediato"}
            </span>
          </div>
        </div>
      </div>

      {/* Control & Toolbar Panel */}
      <div
        className="p-3 rounded-sm border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"
        style={{ background: "var(--p-surface-2)", borderColor: "var(--p-border)" }}
      >
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Vista Toggle */}
          <div className="flex rounded-sm bg-black/20 p-0.5 border border-white/5">
            <button
              onClick={() => setView("kanban")}
              className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
                view === "kanban" ? "bg-[var(--p-accent)] text-black" : "text-[var(--p-text-2)] hover:text-white"
              }`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setView("table")}
              className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
                view === "table" ? "bg-[var(--p-accent)] text-black" : "text-[var(--p-text-2)] hover:text-white"
              }`}
            >
              <List size={15} />
            </button>
          </div>

          {/* Buscador */}
          <div className="relative flex-grow min-w-[180px] max-w-[360px]">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[var(--p-text-3)]">
              <Search size={13} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === "en" ? "Filter by name..." : "Filtrar por nombre..."}
              className="pl-8 pr-3 py-1.5 w-full text-xs rounded-sm border bg-[var(--p-surface-3)] outline-none transition-colors"
              style={{ borderColor: "var(--p-border)", color: "var(--p-text)" }}
            />
          </div>

          {/* Filtro Perfil */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs p-1.5 rounded-sm border bg-[var(--p-surface-3)] outline-none border-[var(--p-border)] text-white w-56 cursor-pointer"
          >
            <option value="all">{locale === "en" ? "All Profiles" : "Todos los perfiles"}</option>
            <option value="comprador">Comprador</option>
            <option value="arrendatario">Arrendatario</option>
            <option value="propietario">Propietario</option>
            <option value="inversor">Inversor</option>
          </select>

          {/* Filtro Prioridad */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs p-1.5 rounded-sm border bg-[var(--p-surface-3)] outline-none border-[var(--p-border)] text-white w-48 cursor-pointer font-mono"
          >
            <option value="all">{locale === "en" ? "All Priorities" : "Todas las prioridades"}</option>
            <option value="alta">{locale === "en" ? "High Priority" : "Alta Prioridad"}</option>
            <option value="media">{locale === "en" ? "Medium Priority" : "Media Prioridad"}</option>
            <option value="baja">{locale === "en" ? "Low Priority" : "Baja Prioridad"}</option>
          </select>

          {/* Limpiar Filtros */}
          {(filterType !== "all" || filterPriority !== "all") && (
            <button
              onClick={() => {
                setFilterType("all");
                setFilterPriority("all");
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 8px",
                borderRadius: "3px",
                border: "1px solid rgba(248,113,113,0.3)",
                background: "rgba(248,113,113,0.08)",
                color: "var(--p-red)",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <X size={10} />
              {locale === "en" ? "Clear" : "Limpiar"}
            </button>
          )}
        </div>

        <button
          onClick={() => {
            setModalStep(1);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-sm cursor-pointer transition-colors bg-[var(--p-accent)] text-black hover:opacity-90 whitespace-nowrap"
        >
          <Plus size={14} strokeWidth={2.5} />
          {locale === "en" ? "Add Client" : "Agregar Cliente"}
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="w-6 h-6 rounded-full border-2 border-white/5 border-t-[var(--p-text)]"
          />
        </div>
      ) : view === "kanban" ? (
        // ─── KANBAN PIPELINE VIEW ───────────────────────────────────────────
        <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pb-4 items-start select-none min-h-[500px] w-full">
            {STAGES.map((stage) => {
              const stageClients = filteredClients.filter((c) => c.stage === stage.value);

              return (
                <KanbanColumn
                  key={stage.value}
                  stage={stage}
                  clients={stageClients}
                  locale={locale}
                  onOpen={handleOpenDrawer}
                  draggedClient={draggedClient}
                  activeOverId={activeOverId}
                  lastDroppedId={lastDroppedId}
                />
              );
            })}
          </div>

          <DragOverlay dropAnimation={null}>
            {draggedClient ? (
              <motion.div
                layoutId={draggedClient.id}
                className="p-3 rounded-sm border flex flex-col justify-between cursor-grabbing bg-[var(--p-surface-2)] border-[var(--p-text-3)] opacity-95 shadow-2xl pointer-events-none select-none"
                style={{ minHeight: "125px", width: dragWidth ? `${dragWidth}px` : "auto" }}
              >
                <ClientCardInner client={draggedClient} locale={locale} />
              </motion.div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        // ─── TABULAR LIST VIEW ──────────────────────────────────────────────
        <div
          className="rounded-sm border overflow-x-auto"
          style={{ background: "var(--p-surface)", borderColor: "var(--p-border)" }}
        >
          <table className="w-full border-collapse text-left text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--p-border)] bg-white/[0.02]">
                <th className="p-3 text-[10px] uppercase font-bold text-[var(--p-text-2)]">
                  {locale === "en" ? "Client Name" : "Nombre del Cliente"}
                </th>
                <th className="p-3 text-[10px] uppercase font-bold text-[var(--p-text-2)]">
                  {locale === "en" ? "Profile type" : "Tipo Perfil"}
                </th>
                <th className="p-3 text-[10px] uppercase font-bold text-[var(--p-text-2)]">
                  {locale === "en" ? "Embudo comercial" : "Embudo"}
                </th>
                <th className="p-3 text-[10px] uppercase font-bold text-[var(--p-text-2)]">
                  {locale === "en" ? "Budget Max" : "Presupuesto Máx"}
                </th>
                <th className="p-3 text-[10px] uppercase font-bold text-[var(--p-text-2)]">
                  {locale === "en" ? "Next Scheduled Action" : "Próxima Acción"}
                </th>
                <th className="p-3 text-[10px] uppercase font-bold text-[var(--p-text-2)]">
                  {locale === "en" ? "Last touch" : "Último Contacto"}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => {
                const typeCfg = CLIENT_TYPE_CFG[client.client_type as ClientType] || CLIENT_TYPE_CFG.comprador;
                const stageCfg = STAGES.find((s) => s.value === client.stage) || ARCHIVED_STAGES[0] || { value: "nuevo", label_es: "Nuevo", label_en: "New", color: "#3B82F6" };
                return (
                  <tr
                    key={client.id}
                    onClick={() => handleOpenDrawer(client)}
                    className="border-b border-[var(--p-border)] hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-semibold text-[var(--p-text)]">
                      {client.full_name}
                    </td>
                    <td className="p-3">
                      <span
                        className="px-2 py-0.5 rounded-xs text-[10px] font-semibold"
                        style={{ background: typeCfg.color, color: "var(--p-text)" }}
                      >
                        {locale === "en" ? typeCfg.label_en : typeCfg.label_es}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: stageCfg.color }}
                        />
                        <span className="text-[11px] font-medium uppercase tracking-wider">
                          {locale === "en" ? stageCfg.label_en : stageCfg.label_es}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[#C9962A] font-bold">
                      {client.budget_max ? `$${client.budget_max.toLocaleString()}` : "N/A"}
                    </td>
                    <td className="p-3">
                      <span className="text-[var(--p-text-2)]">
                        {client.next_action || "—"}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[var(--p-text-3)]">
                      {client.last_contact || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Slide-out Sidebar Drawer */}
      <AnimatePresence>
        {isDrawerOpen && selectedClient && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDrawer}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40"
              data-lenis-prevent
            />

            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.65 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[720px] z-50 overflow-hidden border-l flex flex-col"
              style={{ background: "var(--p-sidebar)", borderColor: "var(--p-border)" }}
              data-lenis-prevent
            >
              {/* STICKY HEADER */}
              <div
                className="flex justify-between items-start px-6 pt-6 pb-4 border-b sticky top-0 z-10 shrink-0"
                style={{ background: "var(--p-sidebar)", borderColor: "var(--p-border)" }}
              >
                <div>
                  {!isEditingClient ? (
                    <>
                      <span
                        className="inline-block px-2 py-0.5 rounded-xs text-[9px] font-bold font-mono uppercase tracking-wider mb-2"
                        style={{
                          background:
                            CLIENT_TYPE_CFG[selectedClient.client_type as ClientType]?.color ||
                            "rgba(255,255,255,0.08)",
                          color: "var(--p-text)",
                        }}
                      >
                        {selectedClient.client_type}
                      </span>
                      <h3 className="text-lg font-bold font-display text-[var(--p-text)]">
                        {selectedClient.full_name}
                      </h3>
                    </>
                  ) : (
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--p-text)]">
                      {locale === "en" ? "Edit Client Profile" : "Editar Perfil del Cliente"}
                    </h3>
                  )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    {isEditingClient ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsEditingClient(false)}
                          className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium cursor-pointer border bg-[var(--p-surface-2)] border-[var(--p-border)] text-[var(--p-text-2)] hover:bg-white/[0.02] transition-all"
                          style={{ borderRadius: "var(--p-radius)" }}
                        >
                          {locale === "en" ? "Cancel" : "Cancelar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const formElement = document.getElementById("client-edit-form") as HTMLFormElement;
                            if (formElement) {
                              formElement.requestSubmit();
                            }
                          }}
                          className="flex items-center gap-1.5 px-5 py-2 text-[13px] font-medium cursor-pointer bg-[var(--p-accent)] text-[#0E0D0C] hover:opacity-90 transition-all"
                          style={{ borderRadius: "var(--p-radius)" }}
                        >
                          {locale === "en" ? "Save" : "Guardar"}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setEditForm(selectedClient);
                          setIsEditingClient(true);
                        }}
                        className="px-2.5 py-1 text-[10px] font-bold bg-white/5 border border-white/10 text-white rounded-sm hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 size={11} />
                        {locale === "en" ? "Edit" : "Editar"}
                      </button>
                    )}
                    <button
                      onClick={handleCloseDrawer}
                      className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-white/5 text-[var(--p-text-3)] hover:text-white transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

              {/* BODY — scrollable area below sticky header */}
              <div className="flex-1 overflow-y-auto px-6 py-6 overscroll-contain">
                <AnimatePresence mode="wait">
                  {isEditingClient ? (
                    /* EDIT MODE FORM */
                    <motion.form
                      key="edit-form"
                      initial={{ x: 30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -30, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      id="client-edit-form"
                      onSubmit={handleSaveClientEdit}
                      className="space-y-4"
                    >
                    {/* Fila 1: Nombre Completo (55%) y Cédula/RIF (45%) */}
                    <div className="grid grid-cols-9 gap-3">
                      <div className="col-span-5">
                        <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                          {locale === "en" ? "Full Name *" : "Nombre Completo *"}
                        </label>
                        <input
                          type="text"
                          required
                          value={editForm.full_name || ""}
                          onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                          className="w-full text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-white"
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                          {locale === "en" ? "ID / RIF" : "Cédula / RIF"}
                        </label>
                        <input
                          type="text"
                          value={editForm.cedula_rif || ""}
                          onChange={(e) => setEditForm({ ...editForm, cedula_rif: e.target.value })}
                          placeholder="V-12345678-0"
                          className="w-full text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* Fila 2: Correo Electrónico (100% de ancho) */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                        {locale === "en" ? "Email Address" : "Correo Electrónico"}
                      </label>
                      <input
                        type="email"
                        value={editForm.email || ""}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-white"
                      />
                    </div>

                    {/* Fila 2: WhatsApp (con ícono) y Teléfono (con ícono) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                          WhatsApp
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-green-400">
                            <MessageSquare size={13} />
                          </span>
                          <input
                            type="text"
                            value={editForm.whatsapp || ""}
                            onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                            className="w-full text-xs pl-8 p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-white"
                            placeholder="+58 ..."
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                          {locale === "en" ? "Phone Number" : "Teléfono"}
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[var(--p-text-3)]">
                            <Phone size={13} />
                          </span>
                          <input
                            type="text"
                            value={editForm.phone || ""}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            className="w-full text-xs pl-8 p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-white"
                            placeholder="+58 ..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Fila 4: Tipo Perfil, Prioridad y Origen */}
                    <div className="grid grid-cols-3 gap-3 border-t border-[var(--p-border)] pt-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                          {locale === "en" ? "Profile Type *" : "Tipo Perfil *"}
                        </label>
                        <CustomSelect
                          value={editForm.client_type || "comprador"}
                          onChange={(val) =>
                            setEditForm({ ...editForm, client_type: val as ClientType })
                          }
                          options={[
                            { value: "comprador", label: "Comprador" },
                            { value: "arrendatario", label: "Arrendatario" },
                            { value: "propietario", label: "Propietario" },
                            { value: "inversor", label: "Inversor" },
                          ]}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                          {locale === "en" ? "Priority" : "Prioridad"}
                        </label>
                        <CustomSelect
                          value={editForm.priority || "media"}
                          onChange={(val) => setEditForm({ ...editForm, priority: val as any })}
                          options={[
                            { value: "alta", label: locale === "en" ? "High" : "Alta" },
                            { value: "media", label: locale === "en" ? "Medium" : "Media" },
                            { value: "baja", label: locale === "en" ? "Low" : "Baja" },
                          ]}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                          {locale === "en" ? "Lead Source" : "Origen"}
                        </label>
                        <CustomSelect
                          value={editForm.source || "web"}
                          onChange={(val) => setEditForm({ ...editForm, source: val })}
                          options={[
                            { value: "instagram", label: "Instagram" },
                            { value: "web", label: "Web" },
                            { value: "referido", label: locale === "en" ? "Referral" : "Referido" },
                            { value: "portal", label: locale === "en" ? "Portal" : "Portal Inmob." },
                            { value: "otro", label: locale === "en" ? "Other" : "Otro" },
                          ]}
                        />
                      </div>
                    </div>

                    {/* Fila 4: Zonas de Interés */}
                    <div className="p-3.5 rounded-sm bg-white/[0.01] border border-white/5 space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] block">
                          {locale === "en" ? "Zones of Interest" : "Zonas de Interés"}
                        </label>
                        {isZoneDropdownOpen && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const allVals = (zonesList.length > 0 ? zonesList : MERIDA_ZONES).map((z) => z.value);
                                setEditForm({ ...editForm, interested_zones: allVals });
                              }}
                              className="px-2 py-0.5 rounded-[3px] text-[9px] font-medium bg-[#C9962A]/10 border border-[#C9962A]/20 text-[#C9962A] hover:bg-[#C9962A]/20 transition-colors cursor-pointer"
                            >
                              {locale === "en" ? "Select All" : "Marcar Todos"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditForm({ ...editForm, interested_zones: [] })}
                              className="px-2 py-0.5 rounded-[3px] text-[9px] font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              {locale === "en" ? "Deselect All" : "Desmarcar todos"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditForm({ ...editForm, interested_zones: [] })}
                              className="px-2 py-0.5 rounded-[3px] text-[9px] font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                            >
                              {locale === "en" ? "Clear" : "Limpiar"}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Multiselect Dropdown Selector */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsZoneDropdownOpen(!isZoneDropdownOpen)}
                          className="w-full text-left text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] border-[var(--p-border)] text-white flex justify-between items-center cursor-pointer hover:bg-white/[0.02] transition-colors"
                        >
                          <span>
                            {editForm.interested_zones && editForm.interested_zones.length > 0
                              ? `${editForm.interested_zones.length} ${locale === "en" ? "zones selected" : "zonas seleccionadas"}`
                              : (locale === "en" ? "Select Zones of Interest..." : "Seleccionar Zonas de Interés...")}
                          </span>
                          <ChevronDown size={14} className="text-[var(--p-text-3)]" />
                        </button>

                        {/* Accordion style Zones list (relative flow with smooth framer-motion slide) */}
                        <AnimatePresence initial={false}>
                          {isZoneDropdownOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden mt-2"
                            >
                              <div className="p-2 bg-[var(--p-sidebar)] border border-[var(--p-border)] rounded-sm shadow-xl space-y-2">
                                {/* Search box inside dropdown */}
                                <input
                                  type="text"
                                  value={zoneSearchQuery}
                                  onChange={(e) => setZoneSearchQuery(e.target.value)}
                                  placeholder={locale === "en" ? "Search zone/sector..." : "Buscar zona o sector..."}
                                  className="w-full text-xs p-1.5 rounded-xs border bg-[var(--p-surface-3)] outline-none border-[var(--p-border)] text-white"
                                  autoFocus
                                />

                                {/* Active Zones List inside dropdown (Grid list of checkboxes in 2 columns, no scrollbar) */}
                                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 p-1.5 bg-black/10 rounded-xs border border-white/5">
                                  {(zonesList.length > 0 ? zonesList : MERIDA_ZONES)
                                    .filter((z) => {
                                      return !zoneSearchQuery || z.label.toLowerCase().includes(zoneSearchQuery.toLowerCase());
                                    })
                                    .map((z) => {
                                      const isSelected = editForm.interested_zones?.includes(z.value);
                                      return (
                                        <button
                                          key={z.value}
                                          type="button"
                                          onClick={() => {
                                            const exists = editForm.interested_zones?.includes(z.value) || false;
                                            const updated = exists
                                              ? (editForm.interested_zones || []).filter((x) => x !== z.value)
                                              : [...(editForm.interested_zones || []), z.value];
                                            setEditForm({ ...editForm, interested_zones: updated });
                                          }}
                                          className="flex items-center gap-2 px-1.5 py-1 rounded-xs hover:bg-white/5 cursor-pointer text-white text-left transition-colors select-none w-full"
                                        >
                                          {/* Custom Checkbox */}
                                          <div
                                            className={`h-4 w-4 shrink-0 rounded-xs border flex items-center justify-center transition-all ${
                                              isSelected
                                                ? "bg-[var(--p-blue)] border-transparent text-black"
                                                : "bg-[var(--p-surface-3)] border-white/10 text-transparent"
                                            }`}
                                          >
                                            {isSelected && <Check size={11} strokeWidth={3.5} />}
                                          </div>
                                          <span className="text-xs truncate" title={z.label}>
                                            {z.label}
                                          </span>
                                        </button>
                                      );
                                    })}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Persistent Selected Chips (Accordion style slide down transition with framer-motion) */}
                      <AnimatePresence initial={false}>
                        {editForm.interested_zones && editForm.interested_zones.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden mt-2"
                          >
                            <div className="flex flex-wrap gap-1.5 p-2 bg-white/[0.02] border border-white/5 rounded-xs">
                              {editForm.interested_zones?.map((zoneValue) => {
                                const zoneObj = (zonesList.length > 0 ? zonesList : MERIDA_ZONES).find((x) => x.value === zoneValue);
                                const label = zoneObj ? zoneObj.label : zoneValue;
                                return (
                                  <button
                                    key={zoneValue}
                                    type="button"
                                    onClick={() => {
                                      setEditForm({
                                        ...editForm,
                                        interested_zones: editForm.interested_zones?.filter((x) => x !== zoneValue) || []
                                      });
                                    }}
                                    className="inline-flex items-center px-2 py-0.5 rounded-[3px] text-[10px] bg-[rgba(96,165,250,0.08)] border border-[rgba(96,165,250,0.2)] text-[var(--p-blue)] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors cursor-pointer"
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Fila 5: Tipos de Propiedad */}
                    <div className="p-3.5 rounded-sm bg-white/[0.01] border border-white/5 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] block">
                          {locale === "en" ? "Property Types" : "Tipos de Propiedad"}
                        </label>
                        {isTypeDropdownOpen && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const allVals = Object.keys(PROP_TYPE_LABEL);
                                setEditForm({ ...editForm, interested_types: allVals });
                              }}
                              className="px-2 py-0.5 rounded-[3px] text-[9px] font-medium bg-[#C9962A]/10 border border-[#C9962A]/20 text-[#C9962A] hover:bg-[#C9962A]/20 transition-colors cursor-pointer"
                            >
                              {locale === "en" ? "Select All" : "Marcar Todos"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditForm({ ...editForm, interested_types: [] })}
                              className="px-2 py-0.5 rounded-[3px] text-[9px] font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              {locale === "en" ? "Deselect All" : "Desmarcar todos"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditForm({ ...editForm, interested_types: [] })}
                              className="px-2 py-0.5 rounded-[3px] text-[9px] font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                            >
                              {locale === "en" ? "Clear" : "Limpiar"}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Multiselect Dropdown Selector */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                          className="w-full text-left text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] border-[var(--p-border)] text-white flex justify-between items-center cursor-pointer hover:bg-white/[0.02] transition-colors"
                        >
                          <span>
                            {editForm.interested_types && editForm.interested_types.length > 0
                              ? `${editForm.interested_types.length} ${locale === "en" ? "types selected" : "tipos seleccionados"}`
                              : (locale === "en" ? "Select Property Types..." : "Seleccionar Tipos de Propiedad...")}
                          </span>
                          <ChevronDown size={14} className="text-[var(--p-text-3)]" />
                        </button>

                        {/* Accordion style Types list (relative flow with smooth framer-motion slide) */}
                        <AnimatePresence initial={false}>
                          {isTypeDropdownOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden mt-2"
                            >
                              <div className="p-2 bg-[var(--p-sidebar)] border border-[var(--p-border)] rounded-sm shadow-xl space-y-2">

                                {/* Active Types List inside dropdown */}
                                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 p-1.5 bg-black/10 rounded-xs border border-white/5">
                                  {Object.entries(PROP_TYPE_LABEL).map(([value, label]) => {
                                    const isSelected = editForm.interested_types?.includes(value);
                                    return (
                                      <button
                                        key={value}
                                        type="button"
                                        onClick={() => {
                                          const exists = editForm.interested_types?.includes(value) || false;
                                          const updated = exists
                                            ? (editForm.interested_types || []).filter((x) => x !== value)
                                            : [...(editForm.interested_types || []), value];
                                          setEditForm({ ...editForm, interested_types: updated });
                                        }}
                                        className="flex items-center gap-2 px-1.5 py-1 rounded-xs hover:bg-white/5 cursor-pointer text-white text-left transition-colors select-none w-full"
                                      >
                                        {/* Custom Checkbox */}
                                        <div
                                          className={`h-4 w-4 shrink-0 rounded-xs border flex items-center justify-center transition-all ${
                                            isSelected
                                              ? "bg-[var(--p-blue)] border-transparent text-black"
                                              : "bg-[var(--p-surface-3)] border-white/10 text-transparent"
                                          }`}
                                        >
                                          {isSelected && <Check size={11} strokeWidth={3.5} />}
                                        </div>
                                        <span className="text-xs truncate">
                                          {label}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Persistent Selected Chips (Accordion style slide down transition with framer-motion, without header text) */}
                      <AnimatePresence initial={false}>
                        {editForm.interested_types && editForm.interested_types.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden mt-1"
                          >
                            <div className="flex flex-wrap gap-1.5 p-2 bg-white/[0.02] border border-white/5 rounded-xs">
                              {editForm.interested_types.map((typeValue) => {
                                const label = PROP_TYPE_LABEL[typeValue as any] || typeValue;
                                return (
                                  <button
                                    key={typeValue}
                                    type="button"
                                    onClick={() => {
                                      setEditForm({
                                        ...editForm,
                                        interested_types: editForm.interested_types?.filter((x) => x !== typeValue) || []
                                      });
                                    }}
                                    className="inline-flex items-center px-2 py-0.5 rounded-[3px] text-[10px] bg-[rgba(96,165,250,0.08)] border border-[rgba(96,165,250,0.2)] text-[var(--p-blue)] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors cursor-pointer"
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Fila 6: Habitaciones, Baños y Estacionamientos */}
                    <div className="grid grid-cols-3 gap-3 max-w-[560px] border-t border-[var(--p-border)] pt-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block whitespace-nowrap">
                          {locale === "en" ? "Bedrooms" : "Habitaciones"}
                        </label>
                        <NumberStepper
                          value={editForm.req_bedrooms?.toString() || "0"}
                          onChange={(val) =>
                            setEditForm({
                              ...editForm,
                              req_bedrooms: val ? Number(val) : undefined,
                            })
                          }
                          min={0}
                          step={1}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block whitespace-nowrap">
                          {locale === "en" ? "Bathrooms" : "Baños"}
                        </label>
                        <NumberStepper
                          value={editForm.req_bathrooms?.toString() || "0"}
                          onChange={(val) =>
                            setEditForm({
                              ...editForm,
                              req_bathrooms: val ? Number(val) : undefined,
                            })
                          }
                          min={0}
                          step={0.5}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block whitespace-nowrap">
                          {locale === "en" ? "Parking" : "Estacionamientos"}
                        </label>
                        <NumberStepper
                          value={editForm.req_parking?.toString() || "0"}
                          onChange={(val) =>
                            setEditForm({
                              ...editForm,
                              req_parking: val ? Number(val) : undefined,
                            })
                          }
                          min={0}
                          step={1}
                        />
                      </div>
                    </div>

                    {editForm.client_type === "arrendatario" && (
                      <div className="border-t border-[var(--p-border)] pt-3 space-y-1">
                        <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                          {locale === "en" ? "Bathroom Preference" : "Preferencia de Baño"}
                        </label>
                        <CustomSelect
                          value={editForm.bath_preference || "indiferente"}
                          onChange={(val) =>
                            setEditForm({
                              ...editForm,
                              bath_preference: val as any,
                            })
                          }
                          options={[
                            { value: "indiferente", label: locale === "en" ? "Indifferent" : "Indiferente (Privado o Compartido)" },
                            { value: "privado", label: locale === "en" ? "Private" : "Baño Privado" },
                            { value: "compartido", label: locale === "en" ? "Shared" : "Baño Compartido" },
                          ]}
                        />
                      </div>
                    )}

                    {/* Fila 7: Presupuesto Máximo, Forma de Pago y Urgencia (Distribución equitativa) */}
                    <div className="grid grid-cols-[1.2fr_1.5fr_1.3fr] gap-4 border-t border-[var(--p-border)] pt-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block whitespace-nowrap">
                          {locale === "en" ? "Budget Max" : "Presupuesto Máximo"}
                        </label>
                        <input
                          type="number"
                          value={editForm.budget_max || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              budget_max: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          className="w-full text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-white h-[38px]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block whitespace-nowrap">
                          {locale === "en" ? "Preferred Payment" : "Forma de Pago"}
                        </label>
                        <CustomSelect
                          value={editForm.preferred_payment || ""}
                          onChange={(val) => {
                            const currency = val === "pago_movil" ? "VES" : "USD";
                            setEditForm({ ...editForm, preferred_payment: val, budget_currency: currency });
                          }}
                          options={[
                            { value: "", label: locale === "en" ? "Select..." : "Seleccionar..." },
                            { value: "zelle", label: "Zelle (USD)" },
                            { value: "efectivo", label: "Efectivo (USD)" },
                            { value: "transferencia_int", label: "Transferencia (Panama/EEUU)" },
                            { value: "pago_movil", label: "Pago Móvil (Bs.)" },
                            { value: "usdt", label: "USDT (Cripto)" },
                          ]}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block whitespace-nowrap">
                          {locale === "en" ? "Urgency" : "Urgencia"}
                        </label>
                        <CustomSelect
                          value={editForm.urgency || ""}
                          onChange={(val) => setEditForm({ ...editForm, urgency: val })}
                          options={[
                            { value: "", label: locale === "en" ? "Select..." : "Seleccionar..." },
                            { value: "inmediata", label: locale === "en" ? "Immediate (1-30 days)" : "Inmediata (1 - 30 días)" },
                            { value: "corto_plazo", label: locale === "en" ? "Short Term (1-3 mos)" : "Corto Plazo (1 - 3 meses)" },
                            { value: "mediano_plazo", label: locale === "en" ? "Medium Term (3-6 mos)" : "Mediano Plazo (3 - 6 meses)" },
                            { value: "largo_plazo", label: locale === "en" ? "Long Term (+6 mos)" : "Largo Plazo (+6 meses)" },
                            { value: "explorando", label: locale === "en" ? "Exploring" : "Solo Explorando" },
                          ]}
                        />
                      </div>
                    </div>

                    {/* Espaciador de Scroll holgado para permitir desplegar las zonas libremente */}
                    <div className="h-48" />

                    {/* Submit Edit Buttons */}
                    <div className="border-t border-[var(--p-border)] pt-4 mt-6 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingClient(false)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-medium cursor-pointer border bg-[var(--p-surface-2)] border-[var(--p-border)] text-[var(--p-text-2)] hover:bg-white/[0.02] transition-colors"
                        style={{ borderRadius: "var(--p-radius)" }}
                      >
                        {locale === "en" ? "Cancel" : "Cancelar"}
                      </button>
                      <button
                        type="submit"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 text-[13px] font-medium cursor-pointer bg-[var(--p-accent)] text-[#0E0D0C] hover:opacity-90 transition-colors"
                        style={{ borderRadius: "var(--p-radius)" }}
                      >
                        {locale === "en" ? "Save Changes" : "Guardar Cambios"}
                      </button>
                    </div>
                    </motion.form>
                  ) : (
                    /* READ-ONLY DISPLAY MODE */
                    <motion.div
                      key="read-only"
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 30, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="space-y-6 text-xs"
                    >
                    {/* Pipeline Stage */}
                    <div className="p-4 rounded-sm border bg-[var(--p-surface-2)] border-[var(--p-border)] space-y-3">
                      <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] tracking-wider block">
                        {locale === "en" ? "Pipeline Stage" : "Etapa del Embudo Comercial (Pipeline)"}
                      </label>
                      <div className="grid grid-cols-5 gap-1 bg-black/20 p-0.5 border border-white/5 rounded-xs">
                        {STAGES.map((s) => {
                          const isActive = selectedClient.stage === s.value;
                          return (
                            <button
                              key={s.value}
                              type="button"
                              onClick={() => {
                                  setClients((prev) => {
                                    const target = prev.find((c) => c.id === selectedClient.id);
                                    if (!target) return prev;
                                    const updated = { ...target, stage: s.value };
                                    const rest = prev.filter((c) => c.id !== selectedClient.id);
                                    return [updated, ...rest];
                                  });
                                  setSelectedClient((prev) => (prev ? { ...prev, stage: s.value } : null));
                                  updateClientStage(selectedClient.id, s.value);
                                }}
                              className={`py-1.5 text-[9px] uppercase tracking-wider font-bold rounded-xs transition-colors cursor-pointer ${
                                isActive
                                  ? "bg-[var(--p-accent)] text-black shadow-md"
                                  : "text-[var(--p-text-3)] hover:text-white"
                              }`}
                            >
                              {locale === "en" ? s.label_en : s.label_es}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Ficha de Información de Contacto */}
                    <div className="p-5 rounded-sm border bg-[var(--p-surface-2)] border-[var(--p-border)] space-y-4">
                      <h4 className="text-[10px] uppercase tracking-widest font-semibold text-[var(--p-text-3)] font-display border-b border-white/5 pb-2">
                        {locale === "en" ? "Contact Information" : "Información de Contacto"}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          {selectedClient.email && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] uppercase font-bold text-[var(--p-text-3)]">Correo Electrónico</span>
                              <span className="flex items-center gap-1.5 text-[var(--p-text)] mt-0.5 text-xs">
                                <Mail size={13} className="text-[var(--p-text-3)]" />
                                <a href={`mailto:${selectedClient.email}`} className="hover:underline text-white font-medium">
                                  {selectedClient.email}
                                </a>
                              </span>
                            </div>
                          )}

                          {selectedClient.phone && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] uppercase font-bold text-[var(--p-text-3)]">Teléfono Móvil</span>
                              <span className="flex items-center gap-1.5 text-[var(--p-text)] mt-0.5 text-xs">
                                <Phone size={13} className="text-[var(--p-text-3)]" />
                                <a href={`tel:${selectedClient.phone}`} className="hover:underline text-white font-medium">
                                  {selectedClient.phone}
                                </a>
                              </span>
                            </div>
                          )}

                          {selectedClient.whatsapp && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] uppercase font-bold text-[var(--p-text-3)]">WhatsApp (Mensajería)</span>
                              <span className="flex items-center gap-1.5 text-[var(--p-text)] mt-0.5 text-xs">
                                <MessageSquare size={13} className="text-[var(--p-green)]" />
                                <a
                                  href={`https://wa.me/${selectedClient.whatsapp.replace(/[^\d]/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="hover:underline text-[var(--p-green)] font-semibold"
                                >
                                  {selectedClient.whatsapp}
                                </a>
                              </span>
                            </div>
                          )}

                          {selectedClient.cedula_rif && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] uppercase font-bold text-[var(--p-text-3)]">Cédula / RIF</span>
                              <span className="text-white font-medium text-xs mt-0.5 font-mono">{selectedClient.cedula_rif}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] uppercase font-bold text-[var(--p-text-3)]">Prioridad del Cliente</span>
                            <span className="mt-1">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-wider ${
                                  selectedClient.priority === "alta"
                                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                    : selectedClient.priority === "baja"
                                    ? "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                }`}
                              >
                                {selectedClient.priority === "alta"
                                  ? (locale === "en" ? "High" : "Alta")
                                  : selectedClient.priority === "baja"
                                  ? (locale === "en" ? "Low" : "Baja")
                                  : (locale === "en" ? "Medium" : "Media")}
                              </span>
                            </span>
                          </div>

                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] uppercase font-bold text-[var(--p-text-3)]">Origen de Captación (Lead)</span>
                            <span className="font-semibold text-white capitalize text-[11px] mt-1">
                              {selectedClient.source === "referido"
                                ? (locale === "en" ? "Referral" : "Referido")
                                : selectedClient.source === "portal"
                                ? (locale === "en" ? "Real Estate Portal" : "Portal Inmobiliario")
                                : selectedClient.source === "web"
                                ? "Web"
                                : selectedClient.source || "Web"}
                            </span>
                          </div>

                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] uppercase font-bold text-[var(--p-text-3)]">Tipo de Perfil</span>
                            <span
                              className="font-semibold text-[11px] mt-1 inline-block w-fit px-2 py-0.5 rounded-xs"
                              style={{
                                background: CLIENT_TYPE_CFG[selectedClient.client_type as ClientType]?.color || "rgba(255,255,255,0.05)",
                                color: "var(--p-text)"
                              }}
                            >
                              {locale === "en" 
                                ? CLIENT_TYPE_CFG[selectedClient.client_type as ClientType]?.label_en 
                                : CLIENT_TYPE_CFG[selectedClient.client_type as ClientType]?.label_es}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ficha de Requerimientos de Búsqueda */}
                    <div className="p-5 rounded-sm border bg-[var(--p-surface-2)] border-[var(--p-border)] space-y-4">
                      <h4 className="text-[10px] uppercase tracking-widest font-semibold text-[var(--p-text-3)] font-display border-b border-white/5 pb-2">
                        {locale === "en" ? "Budget & Search Requirements" : "Presupuesto y Requerimientos de Búsqueda"}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] uppercase font-bold text-[var(--p-text-3)]">Presupuesto Máximo</span>
                          <span className="font-mono font-bold text-[#C9962A] text-sm mt-0.5">
                            {selectedClient.budget_max
                              ? `${selectedClient.budget_currency || "USD"} ${selectedClient.budget_max.toLocaleString()}`
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] uppercase font-bold text-[var(--p-text-3)]">Zonas de Interés</span>
                          <span className="font-semibold text-[11px] leading-relaxed text-white mt-0.5">
                            {selectedClient.interested_zones
                              ?.map((z) => zoneLabelMap[z] || z)
                              .join(", ") || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] uppercase font-bold text-[var(--p-text-3)]">Habitaciones (mínimo)</span>
                          <span className="font-bold text-white font-mono text-[13px] mt-0.5">
                            {selectedClient.req_bedrooms || "—"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] uppercase font-bold text-[var(--p-text-3)]">Baños (mínimo)</span>
                          <span className="font-bold text-white font-mono text-[13px] mt-0.5">
                            {selectedClient.req_bathrooms || "—"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] uppercase font-bold text-[var(--p-text-3)]">Puestos de Estacionamiento (mínimo)</span>
                          <span className="font-bold text-white font-mono text-[13px] mt-0.5">
                            {selectedClient.req_parking || "—"}
                          </span>
                        </div>
                      </div>

                      {selectedClient.client_type === "arrendatario" && selectedClient.bath_preference && (
                        <div className="border-t border-white/5 pt-3 flex flex-col gap-0.5">
                          <span className="text-[9px] uppercase font-bold text-[var(--p-text-3)]">Preferencia de Baño</span>
                          <span className="font-semibold text-white mt-0.5">
                            {selectedClient.bath_preference === "privado"
                              ? (locale === "en" ? "Private Bathroom" : "Baño Privado")
                              : selectedClient.bath_preference === "compartido"
                              ? (locale === "en" ? "Shared Bathroom" : "Baño Compartido")
                              : (locale === "en" ? "Indifferent" : "Indiferente (Privado o Compartido)")}
                          </span>
                        </div>
                      )}

                      {(selectedClient.preferred_payment || selectedClient.urgency) && (
                        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                          {selectedClient.preferred_payment && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] uppercase font-bold text-[var(--p-text-3)]">Forma de Pago</span>
                              <span className="font-semibold text-white mt-0.5 text-xs">
                                {selectedClient.preferred_payment === "zelle"
                                  ? "Zelle (USD)"
                                  : selectedClient.preferred_payment === "efectivo"
                                  ? "Efectivo (USD)"
                                  : selectedClient.preferred_payment === "transferencia_int"
                                  ? "Transferencia (Panama/EEUU)"
                                  : selectedClient.preferred_payment === "pago_movil"
                                  ? "Pago Móvil (Bs.)"
                                  : selectedClient.preferred_payment === "usdt"
                                  ? "USDT (Cripto)"
                                  : selectedClient.preferred_payment}
                              </span>
                            </div>
                          )}
                          {selectedClient.urgency && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] uppercase font-bold text-[var(--p-text-3)]">Urgencia</span>
                              <span className="font-semibold text-white mt-0.5 text-xs">
                                {selectedClient.urgency === "inmediata"
                                  ? "Inmediata (1 - 30 días)"
                                  : selectedClient.urgency === "corto_plazo"
                                  ? "Corto Plazo (1 - 3 meses)"
                                  : selectedClient.urgency === "mediano_plazo"
                                  ? "Mediano Plazo (3 - 6 meses)"
                                  : selectedClient.urgency === "largo_plazo"
                                  ? "Largo Plazo (+6 meses)"
                                  : selectedClient.urgency === "explorando"
                                  ? "Solo Explorando"
                                  : selectedClient.urgency}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Planificación Próxima Acción */}
                    <div className="p-5 rounded-sm border bg-[var(--p-surface-2)] border-[var(--p-border)] space-y-4">
                      <h4 className="text-[10px] uppercase tracking-widest font-semibold text-[var(--p-text-3)] font-display border-b border-white/5 pb-2 flex items-center gap-1.5">
                        <Calendar size={12} />
                        {locale === "en" ? "Next Scheduled Action" : "Planificación de Próxima Acción"}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] uppercase font-bold text-[var(--p-text-3)] mb-1">Fecha Programada</span>
                          <input
                            type="date"
                            defaultValue={selectedClient.next_action_date || ""}
                            onChange={(e) =>
                              handleSaveNextActionLocal(
                                selectedClient.next_action || "",
                                e.target.value || null
                              )
                            }
                            className="w-full text-xs p-2 rounded-sm border bg-[var(--p-surface-3)] outline-none border-[var(--p-border)] text-[var(--p-text)]"
                          />
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-0.5">
                          <span className="text-[9px] uppercase font-bold text-[var(--p-text-3)] mb-1">Descripción de la Tarea</span>
                          <input
                            type="text"
                            placeholder={locale === "en" ? "Task description..." : "Descripción de la tarea..."}
                            defaultValue={selectedClient.next_action || ""}
                            onBlur={(e) =>
                              handleSaveNextActionLocal(
                                e.target.value,
                                selectedClient.next_action_date || null
                              )
                            }
                            className="w-full text-xs p-2 rounded-sm border bg-[var(--p-surface-3)] outline-none border-[var(--p-border)] text-[var(--p-text)]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notas e Historial */}
                    <div className="p-5 rounded-sm border bg-[var(--p-surface-2)] border-[var(--p-border)] space-y-3">
                      <h4 className="text-[10px] uppercase tracking-widest font-semibold text-[var(--p-text-3)] font-display border-b border-white/5 pb-2 flex items-center gap-1.5">
                        <FileText size={12} />
                        {locale === "en" ? "Notes & Interaction History" : "Notas e Historial de Interacciones"}
                      </h4>
                      <textarea
                        rows={4}
                        defaultValue={selectedClient.notes || ""}
                        onBlur={(e) => handleSaveNotesLocal(e.target.value)}
                        placeholder={locale === "en" ? "Add private notes..." : "Agrega notas privadas de seguimiento..."}
                        className="w-full p-2.5 text-xs rounded-sm border bg-[var(--p-surface-3)] outline-none border-[var(--p-border)] transition-all resize-none text-[var(--p-text)]"
                      />
                      <p className="text-[9px] text-[var(--p-text-3)] italic">
                        {locale === "en" ? "Changes save automatically on blur." : "Los cambios se guardan automáticamente al desenfocar."}
                      </p>
                    </div>

                    {/* Footer Action Buttons */}
                    <div className="border-t border-[var(--p-border)] pt-4 mt-6 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleArchiveClientLocal(selectedClient.id)}
                        className="flex-1 py-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/10 text-xs font-semibold rounded-sm transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        <Trash2 size={13} />
                        {locale === "en" ? "Archive Client (Lost)" : "Archivar Cliente (Perdido)"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCloseDrawer}
                        className="flex-1 py-2 text-xs font-bold rounded-sm cursor-pointer transition-colors bg-[var(--p-accent)] text-black hover:opacity-90 text-center"
                      >
                        {locale === "en" ? "Close" : "Listo"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Multistep client creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              key="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs z-40"
            />

            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="fixed inset-x-4 top-[5%] md:top-[6%] md:max-w-3xl md:mx-auto z-50 rounded-sm border flex flex-col max-h-[90vh] overflow-y-auto"
              style={{
                background: "var(--p-surface)",
                borderColor: "var(--p-border)",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
              }}
            >
              <form onSubmit={handleCreateClient} className="flex flex-col h-full">
                <div className="flex justify-between items-center border-b border-[var(--p-border)] p-5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--p-text)]">
                    {locale === "en" ? "New Client Profile" : "Nuevo Perfil de Cliente"}
                  </h3>
                  <span className="text-[10px] font-mono text-[var(--p-text-3)] font-semibold">
                    {locale === "en" ? `Step ${modalStep} of 3` : `Paso ${modalStep} de 3`}
                  </span>
                </div>

                <div className="p-6 flex-1 min-h-[450px] flex flex-col justify-start overflow-visible relative">
                  <AnimatePresence mode="wait" custom={animationDirection} initial={false}>
                    {modalStep === 1 && (
                      <motion.div
                        key="step-1"
                        custom={animationDirection}
                        variants={{
                          enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
                          center: { x: 0, opacity: 1 },
                          exit: (dir: number) => ({ x: dir < 0 ? 50 : -50, opacity: 0 })
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="space-y-4"
                      >
                        {/* Fila 1: Nombre Completo y Cédula/RIF */}
                        <div className="grid grid-cols-9 gap-3">
                          <div className="col-span-5">
                            <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                              {locale === "en" ? "Full Name *" : "Nombre Completo *"}
                            </label>
                            <input
                              type="text"
                              required
                              value={newClient.full_name || ""}
                              onChange={(e) => setNewClient({ ...newClient, full_name: e.target.value })}
                              placeholder="Ej. Alejandra Rivas"
                              className="w-full text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-white h-[38px]"
                              style={{ borderRadius: "var(--p-radius)" }}
                            />
                          </div>
                          <div className="col-span-4">
                            <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                              {locale === "en" ? "ID / RIF" : "Cédula / RIF"}
                            </label>
                            <input
                              type="text"
                              value={newClient.cedula_rif || ""}
                              onChange={(e) => setNewClient({ ...newClient, cedula_rif: formatCedula(e.target.value) })}
                              placeholder="V-12.345.678"
                              className="w-full text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-white font-mono h-[38px]"
                              style={{ borderRadius: "var(--p-radius)" }}
                            />
                          </div>
                        </div>

                        {/* Fila 2: Correo Electrónico */}
                        <div>
                          <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                            {locale === "en" ? "Email Address" : "Correo Electrónico"}
                          </label>
                          <input
                            type="email"
                            value={newClient.email || ""}
                            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                            placeholder="ejemplo@correo.com"
                            className="w-full text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-white h-[38px]"
                            style={{ borderRadius: "var(--p-radius)" }}
                          />
                        </div>

                        {/* Fila 3: WhatsApp y Teléfono */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                              WhatsApp
                            </label>
                            <div className="relative text-white/30 text-xs">
                              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-green-400">
                                <MessageSquare size={13} />
                              </span>
                              <input
                                type="text"
                                value={newClient.whatsapp || ""}
                                onChange={(e) => setNewClient({ ...newClient, whatsapp: formatPhone(e.target.value) })}
                                placeholder=""
                                className="w-full text-xs pl-8 p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-white h-[38px]"
                                style={{ borderRadius: "var(--p-radius)" }}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                              {locale === "en" ? "Phone Number" : "Teléfono"}
                            </label>
                            <div className="relative text-white/30 text-xs">
                              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                <Phone size={13} />
                              </span>
                              <input
                                type="text"
                                value={newClient.phone || ""}
                                onChange={(e) => setNewClient({ ...newClient, phone: formatPhone(e.target.value) })}
                                placeholder=""
                                className="w-full text-xs pl-8 p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-white h-[38px]"
                                style={{ borderRadius: "var(--p-radius)" }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Fila 4: Tipo Perfil, Prioridad y Origen */}
                        <div className="grid grid-cols-3 gap-3 border-t border-[var(--p-border)] pt-3">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                              {locale === "en" ? "Profile Type *" : "Tipo Perfil *"}
                            </label>
                            <CustomSelect
                              value={newClient.client_type || ""}
                              onChange={(val) =>
                                setNewClient({ ...newClient, client_type: val as ClientType })
                              }
                              options={[
                                { value: "comprador", label: "Comprador" },
                                { value: "arrendatario", label: "Arrendatario" },
                                { value: "propietario", label: "Propietario" },
                                { value: "inversor", label: "Inversor" },
                              ]}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                              {locale === "en" ? "Priority" : "Prioridad"}
                            </label>
                            <CustomSelect
                              value={newClient.priority || ""}
                              onChange={(val) => setNewClient({ ...newClient, priority: val as any })}
                              options={[
                                { value: "alta", label: locale === "en" ? "High" : "Alta" },
                                { value: "media", label: locale === "en" ? "Medium" : "Media" },
                                { value: "baja", label: locale === "en" ? "Low" : "Baja" },
                              ]}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                              {locale === "en" ? "Lead Source" : "Origen"}
                            </label>
                            <CustomSelect
                              value={newClient.source || ""}
                              onChange={(val) => setNewClient({ ...newClient, source: val })}
                              options={[
                                { value: "instagram", label: "Instagram" },
                                { value: "web", label: "Web" },
                                { value: "referido", label: locale === "en" ? "Referral" : "Referido" },
                                { value: "portal", label: locale === "en" ? "Real Estate Portal" : "Portal Inmobiliario" },
                                { value: "otro", label: locale === "en" ? "Other" : "Otro" },
                              ]}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {modalStep === 2 && (
                      <motion.div
                        key="step-2"
                        custom={animationDirection}
                        variants={{
                          enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
                          center: { x: 0, opacity: 1 },
                          exit: (dir: number) => ({ x: dir < 0 ? 50 : -50, opacity: 0 })
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="space-y-4"
                      >
                        {/* Presupuesto Máximo, Forma de Pago y Urgencia */}
                        <div className="grid grid-cols-[1fr_1.2fr_1.1fr] gap-3">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block whitespace-nowrap">
                              {locale === "en" ? "Budget Max" : "Presupuesto Máximo"}
                            </label>
                            <input
                              type="text"
                              value={formatThousands(newClient.budget_max)}
                              onChange={(e) =>
                                setNewClient({
                                  ...newClient,
                                  budget_max: parseThousands(e.target.value),
                                })
                              }
                              placeholder="Ej. 120.000"
                              className="w-full text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-white h-[38px]"
                              style={{ borderRadius: "var(--p-radius)" }}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block whitespace-nowrap">
                              {locale === "en" ? "Preferred Payment" : "Forma de Pago"}
                            </label>
                            <CustomSelect
                              value={newClient.preferred_payment || ""}
                              onChange={(val) => {
                                const currency = val === "pago_movil" ? "VES" : "USD";
                                setNewClient({ ...newClient, preferred_payment: val, budget_currency: currency });
                              }}
                              options={[
                                { value: "", label: locale === "en" ? "Select..." : "Seleccionar..." },
                                { value: "zelle", label: "Zelle (USD)" },
                                { value: "efectivo", label: "Efectivo (USD)" },
                                { value: "transferencia_int", label: "Transferencia (Panama/EEUU)" },
                                { value: "pago_movil", label: "Pago Móvil (Bs.)" },
                                { value: "usdt", label: "USDT (Cripto)" },
                              ]}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block whitespace-nowrap">
                              {locale === "en" ? "Urgency" : "Urgencia"}
                            </label>
                            <CustomSelect
                              value={newClient.urgency || ""}
                              onChange={(val) => setNewClient({ ...newClient, urgency: val })}
                              options={[
                                { value: "", label: locale === "en" ? "Select..." : "Seleccionar..." },
                                { value: "inmediata", label: locale === "en" ? "Immediate (1-30 days)" : "Inmediata (1-30 días)" },
                                { value: "corto_plazo", label: locale === "en" ? "Short (1-3 months)" : "Corto Plazo (1-3 meses)" },
                                { value: "mediano_plazo", label: locale === "en" ? "Medium (3-6 months)" : "Mediano Plazo (3-6 meses)" },
                                { value: "largo_plazo", label: locale === "en" ? "Long (+6 months)" : "Largo Plazo (+6 meses)" },
                                { value: "explorando", label: locale === "en" ? "Exploring" : "Explorando" },
                              ]}
                            />
                          </div>
                        </div>

                        {/* Habitaciones, Baños y Estacionamientos */}
                        <div className="grid grid-cols-3 gap-3 border-t border-[var(--p-border)] pt-3">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block whitespace-nowrap">
                              {locale === "en" ? "Bedrooms" : "Habitaciones"}
                            </label>
                            <NumberStepper
                              value={newClient.req_bedrooms?.toString() || "0"}
                              onChange={(val) =>
                                setNewClient({
                                  ...newClient,
                                  req_bedrooms: val ? Number(val) : undefined,
                                })
                              }
                              min={0}
                              step={1}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block whitespace-nowrap">
                              {locale === "en" ? "Bathrooms" : "Baños"}
                            </label>
                            <NumberStepper
                              value={newClient.req_bathrooms?.toString() || "0"}
                              onChange={(val) =>
                                setNewClient({
                                  ...newClient,
                                  req_bathrooms: val ? Number(val) : undefined,
                                })
                              }
                              min={0}
                              step={0.5}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block whitespace-nowrap">
                              {locale === "en" ? "Parking" : "Estacionamientos"}
                            </label>
                            <NumberStepper
                              value={newClient.req_parking?.toString() || "0"}
                              onChange={(val) =>
                                setNewClient({
                                  ...newClient,
                                  req_parking: val ? Number(val) : undefined,
                                })
                              }
                              min={0}
                              step={1}
                            />
                          </div>
                        </div>

                        {newClient.client_type === "arrendatario" && (
                          <div className="border-t border-[var(--p-border)] pt-3 space-y-1">
                            <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                              {locale === "en" ? "Bathroom Preference" : "Preferencia de Baño"}
                            </label>
                            <CustomSelect
                              value={newClient.bath_preference || "indiferente"}
                              onChange={(val) =>
                                setNewClient({
                                  ...newClient,
                                  bath_preference: val as any,
                                })
                              }
                              options={[
                                { value: "indiferente", label: locale === "en" ? "Indifferent" : "Indiferente (Privado o Compartido)" },
                                { value: "privado", label: locale === "en" ? "Private" : "Baño Privado" },
                                { value: "compartido", label: locale === "en" ? "Shared" : "Baño Compartido" },
                              ]}
                            />
                          </div>
                        )}
                      </motion.div>
                    )}

                    {modalStep === 3 && (
                      <motion.div
                        key="step-3"
                        custom={animationDirection}
                        variants={{
                          enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
                          center: { x: 0, opacity: 1 },
                          exit: (dir: number) => ({ x: dir < 0 ? 50 : -50, opacity: 0 })
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="space-y-4"
                      >
                        {/* Zonas de Interés */}
                        <div className="p-3.5 rounded-sm bg-white/[0.01] border border-white/5 space-y-2 relative">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] block">
                              {locale === "en" ? "Zones of Interest" : "Zonas de Interés"}
                            </label>
                          </div>

                          <div ref={newClientZoneDropdownRef} className="relative">
                            <button
                              type="button"
                              onClick={() => {
                                setNewClientIsZoneDropdownOpen(!newClientIsZoneDropdownOpen);
                                if (newClientIsTypeDropdownOpen) setNewClientIsTypeDropdownOpen(false);
                              }}
                              className="w-full text-left text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] border-[var(--p-border)] text-white flex justify-between items-center cursor-pointer hover:bg-white/[0.02] transition-colors h-[38px]"
                              style={{ borderRadius: "var(--p-radius)" }}
                            >
                              <span>
                                {newClient.interested_zones && newClient.interested_zones.length > 0
                                  ? `${newClient.interested_zones.length} ${locale === "en" ? "zones selected" : "zonas seleccionadas"}`
                                  : (locale === "en" ? "Select Zones of Interest..." : "Seleccionar Zonas de Interés...")}
                              </span>
                              <ChevronDown size={14} className="text-[var(--p-text-3)]" />
                            </button>

                            <AnimatePresence>
                              {newClientIsZoneDropdownOpen && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="relative mt-2 z-10 w-full bg-[var(--p-sidebar)] border border-[var(--p-border)] rounded-sm shadow-xl p-3 space-y-2 overflow-hidden"
                                  style={{ background: "var(--p-surface-3)" }}
                                >
                                  <div className="flex items-center justify-end pb-1 border-b border-white/5">
                                    <div className="flex gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const allVals = (zonesList.length > 0 ? zonesList : MERIDA_ZONES).map((z) => z.value);
                                          setNewClient({ ...newClient, interested_zones: allVals });
                                        }}
                                        className="px-1.5 py-0.5 rounded-[3px] text-[8px] font-medium bg-[#C9962A]/10 border border-[#C9962A]/20 text-[#C9962A] hover:bg-[#C9962A]/20 transition-colors cursor-pointer"
                                      >
                                        {locale === "en" ? "Select All" : "Marcar Todos"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setNewClient({ ...newClient, interested_zones: [] })}
                                        className="px-1.5 py-0.5 rounded-[3px] text-[8px] font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors cursor-pointer"
                                      >
                                        {locale === "en" ? "Deselect All" : "Desmarcar Todos"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setNewClient({ ...newClient, interested_zones: [] })}
                                        className="px-1.5 py-0.5 rounded-[3px] text-[8px] font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                                      >
                                        {locale === "en" ? "Clear" : "Limpiar"}
                                      </button>
                                    </div>
                                  </div>
                                  <input
                                    type="text"
                                    value={newClientZoneSearchQuery}
                                    onChange={(e) => setNewClientZoneSearchQuery(e.target.value)}
                                    placeholder={locale === "en" ? "Search zone..." : "Buscar zona..."}
                                    className="w-full text-xs p-1.5 rounded-xs border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-white"
                                    autoFocus
                                  />

                                  <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 p-1 bg-black/10 rounded-xs border border-white/5">
                                    {(zonesList.length > 0 ? zonesList : MERIDA_ZONES)
                                      .filter((z) => {
                                        return !newClientZoneSearchQuery || z.label.toLowerCase().includes(newClientZoneSearchQuery.toLowerCase());
                                      })
                                      .map((z) => {
                                        const isSelected = newClient.interested_zones?.includes(z.value);
                                        return (
                                          <button
                                            key={z.value}
                                            type="button"
                                            onClick={() => {
                                              const exists = newClient.interested_zones?.includes(z.value) || false;
                                              const updated = exists
                                                ? (newClient.interested_zones || []).filter((x) => x !== z.value)
                                                : [...(newClient.interested_zones || []), z.value];
                                              setNewClient({ ...newClient, interested_zones: updated });
                                            }}
                                            className="flex items-center gap-2 px-1 py-0.5 rounded-xs hover:bg-white/5 cursor-pointer text-white text-left transition-colors select-none w-full"
                                          >
                                            <div
                                              className={`h-3.5 w-3.5 shrink-0 rounded-xs border flex items-center justify-center transition-all ${
                                                isSelected
                                                  ? "bg-[var(--p-blue)] border-transparent text-black"
                                                  : "bg-[var(--p-surface-3)] border-white/10 text-transparent"
                                              }`}
                                            >
                                              {isSelected && <Check size={10} strokeWidth={4} />}
                                            </div>
                                            <span className="text-[11px] truncate" title={z.label}>
                                              {z.label}
                                            </span>
                                          </button>
                                        );
                                      })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <AnimatePresence>
                            {newClient.interested_zones && newClient.interested_zones.length > 0 && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="flex flex-wrap gap-1 mt-1.5 p-1 bg-white/[0.01] border border-white/5 rounded-xs">
                                  {newClient.interested_zones?.map((zoneValue) => {
                                    const zoneObj = (zonesList.length > 0 ? zonesList : MERIDA_ZONES).find((x) => x.value === zoneValue);
                                    const label = zoneObj ? zoneObj.label : zoneValue;
                                    return (
                                      <button
                                        key={zoneValue}
                                        type="button"
                                        onClick={() => {
                                          setNewClient({
                                            ...newClient,
                                            interested_zones: newClient.interested_zones?.filter((x) => x !== zoneValue) || []
                                          });
                                        }}
                                        className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[9px] bg-[rgba(96,165,250,0.08)] border border-[rgba(96,165,250,0.2)] text-[var(--p-blue)] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors cursor-pointer"
                                      >
                                        {label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Tipos de Propiedad de Interés */}
                        <div className="p-3.5 rounded-sm bg-white/[0.01] border border-white/5 space-y-2 relative">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] block">
                              {locale === "en" ? "Property Types" : "Tipos de Propiedad"}
                            </label>
                          </div>

                          <div ref={newClientTypeDropdownRef} className="relative">
                            <button
                              type="button"
                              onClick={() => {
                                setNewClientIsTypeDropdownOpen(!newClientIsTypeDropdownOpen);
                                if (newClientIsZoneDropdownOpen) setNewClientIsZoneDropdownOpen(false);
                              }}
                              className="w-full text-left text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] border-[var(--p-border)] text-white flex justify-between items-center cursor-pointer hover:bg-white/[0.02] transition-colors h-[38px]"
                              style={{ borderRadius: "var(--p-radius)" }}
                            >
                              <span>
                                {newClient.interested_types && newClient.interested_types.length > 0
                                  ? `${newClient.interested_types.length} ${locale === "en" ? "types selected" : "tipos seleccionados"}`
                                  : (locale === "en" ? "Select Property Types..." : "Seleccionar Tipos de Propiedad...")}
                              </span>
                              <ChevronDown size={14} className="text-[var(--p-text-3)]" />
                            </button>

                            <AnimatePresence>
                              {newClientIsTypeDropdownOpen && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="relative mt-2 z-10 w-full bg-[var(--p-sidebar)] border border-[var(--p-border)] rounded-sm shadow-xl p-3 space-y-2 overflow-hidden"
                                  style={{ background: "var(--p-surface-3)" }}
                                >
                                  <div className="flex items-center justify-end pb-1 border-b border-white/5">
                                    <div className="flex gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const allVals = Object.keys(PROP_TYPE_LABEL);
                                          setNewClient({ ...newClient, interested_types: allVals });
                                        }}
                                        className="px-1.5 py-0.5 rounded-[3px] text-[8px] font-medium bg-[#C9962A]/10 border border-[#C9962A]/20 text-[#C9962A] hover:bg-[#C9962A]/20 transition-colors cursor-pointer"
                                      >
                                        {locale === "en" ? "Select All" : "Marcar Todos"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setNewClient({ ...newClient, interested_types: [] })}
                                        className="px-1.5 py-0.5 rounded-[3px] text-[8px] font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors cursor-pointer"
                                      >
                                        {locale === "en" ? "Deselect All" : "Desmarcar Todos"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setNewClient({ ...newClient, interested_types: [] })}
                                        className="px-1.5 py-0.5 rounded-[3px] text-[8px] font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                                      >
                                        {locale === "en" ? "Clear" : "Limpiar"}
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 p-1 bg-black/10 rounded-xs border border-white/5">
                                    {Object.entries(PROP_TYPE_LABEL).map(([value, label]) => {
                                      const isSelected = newClient.interested_types?.includes(value);
                                      return (
                                        <button
                                          key={value}
                                          type="button"
                                          onClick={() => {
                                            const exists = newClient.interested_types?.includes(value) || false;
                                            const updated = exists
                                              ? (newClient.interested_types || []).filter((x) => x !== value)
                                              : [...(newClient.interested_types || []), value];
                                            setNewClient({ ...newClient, interested_types: updated });
                                          }}
                                          className="flex items-center gap-2 px-1 py-0.5 rounded-xs hover:bg-white/5 cursor-pointer text-white text-left transition-colors select-none w-full"
                                        >
                                          <div
                                            className={`h-3.5 w-3.5 shrink-0 rounded-xs border flex items-center justify-center transition-all ${
                                              isSelected
                                                ? "bg-[var(--p-blue)] border-transparent text-black"
                                                : "bg-[var(--p-surface-3)] border-white/10 text-transparent"
                                            }`}
                                          >
                                            {isSelected && <Check size={10} strokeWidth={4} />}
                                          </div>
                                          <span className="text-[11px] truncate">
                                            {label}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <AnimatePresence>
                            {newClient.interested_types && newClient.interested_types.length > 0 && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="flex flex-wrap gap-1 mt-1.5 p-1 bg-white/[0.01] border border-white/5 rounded-xs">
                                  {newClient.interested_types.map((typeValue) => {
                                    const label = PROP_TYPE_LABEL[typeValue as any] || typeValue;
                                    return (
                                      <button
                                        key={typeValue}
                                        type="button"
                                        onClick={() => {
                                          setNewClient({
                                            ...newClient,
                                            interested_types: newClient.interested_types?.filter((x) => x !== typeValue) || []
                                          });
                                        }}
                                        className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[9px] bg-[rgba(96,165,250,0.08)] border border-[rgba(96,165,250,0.2)] text-[var(--p-blue)] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors cursor-pointer"
                                      >
                                        {label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Notas Iniciales */}
                        <div>
                          <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                            {locale === "en" ? "Initial description & notes" : "Notas Iniciales y Requerimientos"}
                          </label>
                          <textarea
                            rows={3}
                            value={newClient.notes || ""}
                            onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                            placeholder="Ej. Busca apartamento de 2 hab con estacionamiento."
                            className="w-full p-2.5 text-xs rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] transition-all resize-none text-white font-sans"
                            style={{ borderRadius: "var(--p-radius)" }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex justify-between items-center p-5 border-t border-[var(--p-border)] bg-[var(--p-surface)]">
                  {/* Botón Izquierdo: Cancelar (visible en todos los pasos) */}
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-[13px] font-medium rounded-sm border border-[var(--p-border)] text-white hover:bg-white/5 cursor-pointer transition-colors"
                    style={{ borderRadius: "var(--p-radius)" }}
                  >
                    {locale === "en" ? "Cancel" : "Cancelar"}
                  </button>

                  <div className="flex items-center gap-3">
                    {/* Botón Navegar Atrás (si es paso > 1) */}
                    {modalStep > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setAnimationDirection(-1);
                          setModalStep(modalStep - 1);
                        }}
                        className="px-5 py-2.5 text-[13px] font-medium rounded-sm border border-[var(--p-border)] text-white hover:bg-white/5 cursor-pointer transition-colors"
                        style={{ borderRadius: "var(--p-radius)" }}
                      >
                        {locale === "en" ? "Back" : "Atrás"}
                      </button>
                    )}

                    {/* Botón Navegar Adelante / Guardar */}
                    {modalStep < 3 ? (
                      <button
                        key="btn-next"
                        type="button"
                        onClick={() => {
                          if (modalStep === 1 && !newClient.full_name?.trim()) {
                            toastFn({
                              title: locale === "en" ? "Full Name Required" : "Nombre completo requerido",
                              description: locale === "en" ? "Please fill in the client's full name to continue." : "Por favor, ingresa el nombre completo del cliente para continuar.",
                              type: "warning",
                            });
                            return;
                          }
                          setAnimationDirection(1);
                          setModalStep(modalStep + 1);
                        }}
                        className="px-6 py-2.5 text-[13px] font-medium rounded-sm cursor-pointer transition-colors bg-[var(--p-accent)] text-black hover:opacity-90 font-semibold"
                        style={{ borderRadius: "var(--p-radius)" }}
                      >
                        {locale === "en" ? "Next step" : "Siguiente"}
                      </button>
                    ) : (
                      <button
                        key="btn-submit"
                        type="submit"
                        className="px-6 py-2.5 text-[13px] font-medium rounded-sm cursor-pointer transition-colors bg-[var(--p-accent)] text-black hover:opacity-90 font-semibold"
                        style={{ borderRadius: "var(--p-radius)" }}
                      >
                        {locale === "en" ? "Save Profile" : "Guardar Cliente"}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── KANBAN COLUMN COMPONENT ───────────────────────────────────────────────
function KanbanColumn({
  stage,
  clients,
  locale,
  onOpen,
  draggedClient,
  activeOverId,
  lastDroppedId,
}: {
  stage: { value: CRMStage; label_es: string; label_en: string; color: string };
  clients: CRMClient[];
  locale: string;
  onOpen: (client: CRMClient) => void;
  draggedClient: CRMClient | null;
  activeOverId: string | null;
  lastDroppedId: string | null;
}) {
  const { setNodeRef } = useDroppable({
    id: stage.value,
  });

  // El puntero está dentro si el activeOverId es esta columna o cualquiera de sus tarjetas
  const isPointerInside = activeOverId === stage.value || clients.some((c) => c.id === activeOverId);

  const isOverActive = isPointerInside && draggedClient && draggedClient.stage !== stage.value;

  return (
    <div
      ref={setNodeRef}
      className={`w-full flex flex-col rounded-sm border transition-all duration-300 ${
        isOverActive ? "bg-white/[0.04]" : ""
      }`}
      style={{
        background: "var(--p-surface)",
        borderWidth: "1px",
        borderStyle: "solid",
        borderTopWidth: "2.5px",
        borderTopColor: stage.color,
        borderRightColor: isOverActive ? stage.color : "var(--p-border)",
        borderBottomColor: isOverActive ? stage.color : "var(--p-border)",
        borderLeftColor: isOverActive ? stage.color : "var(--p-border)",
        boxShadow: isOverActive ? `0 0 16px 2px ${stage.color}25` : "none",
      }}
    >
      {/* Column Header */}
      <div
        className="p-3 border-b flex items-center justify-between bg-white/[0.01]"
        style={{ borderColor: "var(--p-border)" }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
          <span className="text-[10px] font-bold font-display uppercase tracking-wider text-[var(--p-text)]">
            {locale === "en" ? stage.label_en : stage.label_es}
          </span>
        </div>
        <span className="text-[10px] font-semibold font-mono text-[var(--p-text-3)] bg-white/5 px-1.5 py-0.5 rounded-xs">
          {clients.length}
        </span>
      </div>

      {/* Cards list container */}
      <div className="p-2 space-y-2 flex-1 min-h-[125px]">
        <SortableContext items={clients.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {clients.length > 0 ? (
            clients.map((client) => (
              <SortableClientCard
                key={client.id}
                client={client}
                onOpen={onOpen}
                locale={locale}
                lastDroppedId={lastDroppedId}
              />
            ))
          ) : (
            <div className="h-[125px] border border-dashed border-white/10 rounded-sm bg-black/5 flex flex-col items-center justify-center text-[var(--p-text-3)] space-y-1">
              <Building size={16} strokeWidth={1.5} />
              <span className="text-[9px] uppercase tracking-wider font-mono font-semibold">{locale === "en" ? "Empty Column" : "Sin clientes"}</span>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

// Componente interno reutilizable para el contenido de la tarjeta
function ClientCardInner({ client, locale }: { client: CRMClient; locale: string }) {
  const typeCfg = CLIENT_TYPE_CFG[client.client_type as ClientType] || CLIENT_TYPE_CFG.comprador;
  const today = new Date().toISOString().split("T")[0] || "";
  const isActionExpired =
    client.next_action_date &&
    client.next_action_date < today &&
    client.stage !== "cerrado" &&
    client.stage !== "perdido";

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span
          className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold font-mono uppercase tracking-wider"
          style={{ background: typeCfg.color, color: "var(--p-text)" }}
        >
          {locale === "en" ? typeCfg.label_en : typeCfg.label_es}
        </span>
        {isActionExpired && (
          <span
            className="flex items-center gap-1 text-[9px] font-bold text-[var(--p-red)] uppercase"
            title={locale === "en" ? "Overdue Action" : "Acción Vencida"}
          >
            <AlertCircle size={10} />
            {locale === "en" ? "Overdue" : "Vencida"}
          </span>
        )}
      </div>

      <h4 className="text-xs font-semibold text-[var(--p-text)]">{client.full_name}</h4>

      {client.interested_types && client.interested_types.length > 0 && (
        <p className="text-[10px] text-[var(--p-text-2)] flex items-center gap-1">
          <Building size={10} className="text-[var(--p-text-3)]" />
          {client.interested_types.map((t) => PROP_TYPE_LABEL[t] || t).join(", ")}
        </p>
      )}

      {client.budget_max && (
        <p className="text-[10px] font-semibold font-mono text-[#C9962A] flex items-center gap-0.5">
          <DollarSign size={10} />
          {client.budget_max.toLocaleString()} max
        </p>
      )}

      <div
        className="mt-3 pt-2 border-t flex items-center justify-between text-[9px] text-[var(--p-text-3)]"
        style={{ borderColor: "var(--p-border)" }}
      >
        <span className="font-mono flex items-center gap-1">
          <Clock size={9} />
          {client.last_contact ? client.last_contact : "N/A"}
        </span>
        <span className="text-[var(--p-text-2)] flex items-center gap-0.5 font-semibold">
          {locale === "en" ? "Details" : "Ver"}
          <ArrowRight size={8} />
        </span>
      </div>
    </div>
  );
}

// ─── SORTABLE CLIENT CARD COMPONENT ────────────────────────────────────────
function SortableClientCard({
  client,
  onOpen,
  locale,
  lastDroppedId,
}: {
  client: CRMClient;
  onOpen: (client: CRMClient) => void;
  locale: string;
  lastDroppedId: string | null;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: client.id,
  });

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        className="p-3 h-auto min-h-[125px] rounded-sm border border-dashed border-white/25 bg-black/20 select-none flex flex-col justify-between"
      >
        <div style={{ visibility: "hidden" }} className="w-full">
          <ClientCardInner client={client} locale={locale} />
        </div>
      </div>
    );
  }

  const isLastDropped = client.id === lastDroppedId;

  const style = {
    zIndex: isLastDropped ? 50 : 1,
    position: "relative" as const,
  };

  return (
    <motion.div
      ref={setNodeRef}
      id={client.id}
      style={style}
      layoutId={client.id}
      layout="position"
      transition={{
        type: "spring",
        stiffness: 60, // Slow and soft spring glide
        damping: 18,   // Controlled landing
      }}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if (e.defaultPrevented) return;
        onOpen(client);
      }}
      className="p-3 h-auto min-h-[125px] rounded-sm border cursor-pointer select-none transition-all flex flex-col justify-between hover:border-[var(--p-text-3)] hover:-translate-y-0.5 duration-150 bg-[var(--p-surface-2)] border-[var(--p-border)]"
    >
      <ClientCardInner client={client} locale={locale} />
    </motion.div>
  );
}
