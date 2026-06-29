/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { use, useState, useEffect, useMemo, useRef } from "react";
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

const MUNICIPIOS = ["libertador", "campo_elias", "santos_marquina", "sucre", "rangel"];
const MUNICIPIO_LABEL: Record<string, string> = {
  libertador: "Libertador",
  campo_elias: "Campo Elías",
  santos_marquina: "Santos Marquina",
  sucre: "Sucre",
  rangel: "Rangel",
};

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

export default function ClientesCRMPage({ params }: PageProps) {
  const { locale } = use(params);
  const { role, userId, loading: roleLoading } = usePanelRole();

  const [clients, setClients] = useState<CRMClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Modales y Drawers
  const [selectedClient, setSelectedClient] = useState<CRMClient | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedClient, setDraggedClient] = useState<CRMClient | null>(null);
  const [activeOverId, setActiveOverId] = useState<string | null>(null);
  const [lastDroppedId, setLastDroppedId] = useState<string | null>(null);
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  
  // Estado para el modal de 3 pasos
  const [modalStep, setModalStep] = useState(1);
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

  useEffect(() => {
    if (!roleLoading) {
      loadClientsData();
    }
  }, [role, userId, roleLoading]);

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

  // Manejadores de visualización y edición
  const handleOpenDrawer = (client: CRMClient) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedClient(null);
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
    if (!newClient.full_name) return;

    const payload: Partial<CRMClient> & { agent_id: string } = {
      ...newClient,
      agent_id: userId || "a1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any;

    // Agregar id único local en caso de fallback
    const localId = "c_new_" + Math.random().toString(36).substring(7);
    const clientToInsert = { ...payload, id: localId } as CRMClient;

    setClients((prev) => [clientToInsert, ...prev]);
    setIsModalOpen(false);
    
    // Reset modal
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
    });

    try {
      const saved = await upsertClient(payload);
      if (saved) {
        setClients((prev) => prev.map((c) => (c.id === localId ? saved : c)));
      }
    } catch (err) {
      console.error("Failed to insert client on Supabase, keeping local copy", err);
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
        <div className="flex flex-wrap items-center gap-2">
          {/* Vista Toggle */}
          <div className="flex rounded-sm bg-black/20 p-0.5 border border-white/5">
            <button
              onClick={() => setView("kanban")}
              className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
                view === "kanban" ? "bg-[var(--p-surface-3)] text-white" : "text-[var(--p-text-2)] hover:text-white"
              }`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setView("table")}
              className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
                view === "table" ? "bg-[var(--p-surface-3)] text-white" : "text-[var(--p-text-2)] hover:text-white"
              }`}
            >
              <List size={15} />
            </button>
          </div>

          {/* Buscador */}
          <div className="relative w-full sm:w-60">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[var(--p-text-3)]">
              <Search size={13} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === "en" ? "Filter by name, email..." : "Filtrar por nombre, correo..."}
              className="pl-8 pr-3 py-1.5 w-full text-xs rounded-sm border bg-[var(--p-surface-3)] outline-none transition-colors"
              style={{ borderColor: "var(--p-border)", color: "var(--p-text)" }}
            />
          </div>

          {/* Filtros Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm border cursor-pointer hover:bg-white/5 transition-colors"
            style={{
              borderColor: showFilters ? "var(--p-text-2)" : "var(--p-border)",
              color: "var(--p-text)",
            }}
          >
            <Filter size={13} />
            {locale === "en" ? "Filters" : "Filtros"}
          </button>
        </div>

        <button
          onClick={() => {
            setModalStep(1);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-sm cursor-pointer transition-colors bg-[var(--p-accent)] text-black hover:opacity-90"
        >
          <Plus size={14} strokeWidth={2.5} />
          {locale === "en" ? "Add Client" : "Agregar Cliente"}
        </button>
      </div>

      {/* Filtros Extendidos Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="p-4 rounded-sm border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
              style={{ background: "var(--p-surface)", borderColor: "var(--p-border)" }}
            >
              <div>
                <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                  {locale === "en" ? "Client Profile" : "Perfil del Cliente"}
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-[var(--p-text)]"
                >
                  <option value="all">{locale === "en" ? "All Profiles" : "Todos los perfiles"}</option>
                  <option value="comprador">Comprador</option>
                  <option value="arrendatario">Arrendatario</option>
                  <option value="propietario">Propietario</option>
                  <option value="inversor">Inversor</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                  {locale === "en" ? "Priority Status" : "Prioridad del Lead"}
                </label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-[var(--p-text)]"
                >
                  <option value="all">{locale === "en" ? "All Priorities" : "Todas las prioridades"}</option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterType("all");
                    setFilterPriority("all");
                  }}
                  className="text-xs text-[var(--p-text-3)] hover:text-[var(--p-text)] transition-colors py-2"
                >
                  {locale === "en" ? "Clear Filter Settings" : "Limpiar ajustes de filtro"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            />

            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] z-50 p-6 overflow-y-auto flex flex-col justify-between border-l"
              style={{ background: "var(--p-sidebar)", borderColor: "var(--p-border)" }}
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-[var(--p-border)] pb-4">
                  <div>
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
                  </div>
                  <button
                    onClick={handleCloseDrawer}
                    className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-white/5 text-[var(--p-text-3)] hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Pipeline Selector Stage */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] tracking-wider block">
                    {locale === "en" ? "Embudo de Ventas" : "Etapa del Pipeline"}
                  </label>
                  <div className="grid grid-cols-5 gap-1 bg-black/20 p-0.5 border border-white/5 rounded-xs">
                    {STAGES.map((s) => {
                      const isActive = selectedClient.stage === s.value;
                      return (
                        <button
                          key={s.value}
                          onClick={() => {
                            setClients((prev) =>
                              prev.map((c) =>
                                c.id === selectedClient.id ? { ...c, stage: s.value } : c
                              )
                            );
                            setSelectedClient((prev) => (prev ? { ...prev, stage: s.value } : null));
                            updateClientStage(selectedClient.id, s.value);
                          }}
                          className={`py-1 text-[9px] uppercase tracking-wider font-semibold rounded-xs transition-colors cursor-pointer ${
                            isActive
                              ? "bg-[var(--p-surface-3)] text-white shadow-md"
                              : "text-[var(--p-text-3)] hover:text-white"
                          }`}
                        >
                          {locale === "en" ? s.label_en.substring(0, 3) : s.label_es.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Contact details */}
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-widest font-semibold text-[var(--p-text-3)] font-display">
                    {locale === "en" ? "Contact Info" : "Datos de Contacto"}
                  </h4>
                  <div className="space-y-2 text-xs">
                    {selectedClient.email && (
                      <div className="flex items-center gap-2.5 text-[var(--p-text)]">
                        <Mail size={13} className="text-[var(--p-text-3)]" />
                        <a href={`mailto:${selectedClient.email}`} className="hover:underline">
                          {selectedClient.email}
                        </a>
                      </div>
                    )}
                    {selectedClient.phone && (
                      <div className="flex items-center gap-2.5 text-[var(--p-text)]">
                        <Phone size={13} className="text-[var(--p-text-3)]" />
                        <a href={`tel:${selectedClient.phone}`} className="hover:underline">
                          {selectedClient.phone}
                        </a>
                      </div>
                    )}
                    {selectedClient.whatsapp && (
                      <div className="flex items-center gap-2.5 text-[var(--p-text)]">
                        <MessageSquare size={13} className="text-[var(--p-green)]" />
                        <a
                          href={`https://wa.me/${selectedClient.whatsapp.replace(/[^\d]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline text-[var(--p-green)] font-semibold"
                        >
                          {selectedClient.whatsapp} (WhatsApp)
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preferences preferences */}
                <div className="space-y-4 border-t border-[var(--p-border)] pt-4">
                  <h4 className="text-[10px] uppercase tracking-widest font-semibold text-[var(--p-text-3)] font-display">
                    {locale === "en" ? "Budget & Preferences" : "Presupuesto y Preferencias"}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs text-[var(--p-text)]">
                    <div>
                      <span className="text-[10px] text-[var(--p-text-3)] block mb-0.5">
                        {locale === "en" ? "Budget Max" : "Presupuesto Máx"}
                      </span>
                      <span className="font-mono font-bold text-[#C9962A] text-sm">
                        {selectedClient.budget_max
                          ? `$${selectedClient.budget_max.toLocaleString()}`
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--p-text-3)] block mb-0.5">
                        {locale === "en" ? "Zones" : "Zonas de Interés"}
                      </span>
                      <span className="font-semibold">
                        {selectedClient.interested_zones
                          ?.map((z) => MUNICIPIO_LABEL[z] || z)
                          .join(", ") || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Next action planning */}
                <div className="space-y-3 border-t border-[var(--p-border)] pt-4">
                  <h4 className="text-[10px] uppercase tracking-widest font-semibold text-[var(--p-text-3)] font-display flex items-center gap-1.5">
                    <Calendar size={12} />
                    {locale === "en" ? "Next Scheduled Action" : "Planificación Próxima Acción"}
                  </h4>
                  <div className="space-y-2">
                    <input
                      type="date"
                      defaultValue={selectedClient.next_action_date || ""}
                      onChange={(e) =>
                        handleSaveNextActionLocal(
                          selectedClient.next_action || "",
                          e.target.value || null
                        )
                      }
                      className="w-full text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-white font-mono"
                    />
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
                      className="w-full text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-[var(--p-text)]"
                    />
                  </div>
                </div>

                {/* Notes and interactions */}
                <div className="space-y-3 border-t border-[var(--p-border)] pt-4">
                  <h4 className="text-[10px] uppercase tracking-widest font-semibold text-[var(--p-text-3)] font-display flex items-center gap-1.5">
                    <FileText size={12} />
                    {locale === "en" ? "Notes & Interaction History" : "Notas e Historial de Interacciones"}
                  </h4>
                  <textarea
                    rows={4}
                    defaultValue={selectedClient.notes || ""}
                    onBlur={(e) => handleSaveNotesLocal(e.target.value)}
                    placeholder={locale === "en" ? "Add private notes..." : "Agrega notas privadas..."}
                    className="w-full p-2.5 text-xs rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] transition-all resize-none text-[var(--p-text)]"
                  />
                  <p className="text-[9px] text-[var(--p-text-3)] italic">
                    {locale === "en" ? "Changes save automatically on blur." : "Los cambios se guardan automáticamente al desenfocar."}
                  </p>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="border-t border-[var(--p-border)] pt-4 mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleArchiveClientLocal(selectedClient.id)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={13} />
                  {locale === "en" ? "Archive" : "Archivar (Perdido)"}
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
              className="fixed inset-x-4 top-[10%] md:max-w-lg md:mx-auto z-50 p-6 rounded-sm border flex flex-col justify-between"
              style={{
                background: "var(--p-surface)",
                borderColor: "var(--p-border)",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
              }}
            >
              <form onSubmit={handleCreateClient} className="space-y-5">
                <div className="flex justify-between items-center border-b border-[var(--p-border)] pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--p-text)]">
                    {locale === "en" ? "New Client Profile" : "Nuevo Perfil de Cliente"}
                  </h3>
                  <span className="text-[10px] font-mono text-[var(--p-text-3)] font-semibold">
                    {locale === "en" ? `Step ${modalStep} of 3` : `Paso ${modalStep} de 3`}
                  </span>
                </div>

                {/* Step 1: Basic Info */}
                {modalStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                        {locale === "en" ? "Full Name *" : "Nombre Completo *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={newClient.full_name || ""}
                        onChange={(e) => setNewClient({ ...newClient, full_name: e.target.value })}
                        placeholder="Ej. Alejandra Rivas"
                        className="w-full text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                        {locale === "en" ? "Email Address" : "Correo Electrónico"}
                      </label>
                      <input
                        type="email"
                        value={newClient.email || ""}
                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                        placeholder="ejemplo@correo.com"
                        className="w-full text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                          {locale === "en" ? "Phone Number" : "Teléfono"}
                        </label>
                        <input
                          type="text"
                          value={newClient.phone || ""}
                          onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                          placeholder="+58 412 1234567"
                          className="w-full text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                          WhatsApp
                        </label>
                        <input
                          type="text"
                          value={newClient.whatsapp || ""}
                          onChange={(e) => setNewClient({ ...newClient, whatsapp: e.target.value })}
                          placeholder="+58 412 1234567"
                          className="w-full text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Profile settings */}
                {modalStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                        {locale === "en" ? "Client profile type *" : "Tipo Perfil del Cliente *"}
                      </label>
                      <select
                        value={newClient.client_type || "comprador"}
                        onChange={(e) =>
                          setNewClient({ ...newClient, client_type: e.target.value as ClientType })
                        }
                        className="w-full text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-white"
                      >
                        <option value="comprador">Comprador</option>
                        <option value="arrendatario">Arrendatario</option>
                        <option value="propietario">Propietario</option>
                        <option value="inversor">Inversor</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                          {locale === "en" ? "Budget Max" : "Presupuesto Máximo"}
                        </label>
                        <input
                          type="number"
                          value={newClient.budget_max || ""}
                          onChange={(e) =>
                            setNewClient({
                              ...newClient,
                              budget_max: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          placeholder="Ej. 120000"
                          className="w-full text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                          {locale === "en" ? "Currency" : "Moneda"}
                        </label>
                        <select
                          value={newClient.budget_currency || "USD"}
                          onChange={(e) =>
                            setNewClient({ ...newClient, budget_currency: e.target.value })
                          }
                          className="w-full text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-white"
                        >
                          <option value="USD">USD</option>
                          <option value="VED">VED</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Zones and notes */}
                {modalStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                        {locale === "en" ? "Zone of Interest" : "Zona de Interés"}
                      </label>
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val && !newClient.interested_zones?.includes(val)) {
                            setNewClient({
                              ...newClient,
                              interested_zones: [...(newClient.interested_zones || []), val],
                            });
                          }
                        }}
                        className="w-full text-xs p-2 rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] text-white"
                      >
                        <option value="">{locale === "en" ? "-- Select --" : "-- Seleccionar --"}</option>
                        {MUNICIPIOS.map((m) => (
                          <option key={m} value={m}>
                            {MUNICIPIO_LABEL[m]}
                          </option>
                        ))}
                      </select>
                      {newClient.interested_zones && newClient.interested_zones.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {newClient.interested_zones.map((zone) => (
                            <span
                              key={zone}
                              className="px-2 py-0.5 rounded-xs text-[10px] bg-white/5 border border-white/10 text-white/80 flex items-center gap-1"
                            >
                              {MUNICIPIO_LABEL[zone] || zone}
                              <button
                                type="button"
                                onClick={() =>
                                  setNewClient({
                                    ...newClient,
                                    interested_zones: newClient.interested_zones?.filter(
                                      (z) => z !== zone
                                    ),
                                  })
                                }
                              >
                                <X size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-[var(--p-text-2)] mb-1 block">
                        {locale === "en" ? "Initial description & notes" : "Notas Iniciales y Requerimientos"}
                      </label>
                      <textarea
                        rows={3}
                        value={newClient.notes || ""}
                        onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                        placeholder="Ej. Busca apartamento de 2 hab con estacionamiento."
                        className="w-full p-2.5 text-xs rounded-sm border bg-[var(--p-surface-2)] outline-none border-[var(--p-border)] transition-all resize-none text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Steps Controller buttons */}
                <div className="flex justify-between items-center pt-3 border-t border-[var(--p-border)] mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (modalStep > 1) setModalStep(modalStep - 1);
                      else setIsModalOpen(false);
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-sm border border-[var(--p-border)] text-white hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    {modalStep > 1 ? (locale === "en" ? "Back" : "Atrás") : (locale === "en" ? "Cancel" : "Cancelar")}
                  </button>

                  {modalStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => setModalStep(modalStep + 1)}
                      className="px-4 py-2 text-xs font-bold rounded-sm cursor-pointer transition-colors bg-[var(--p-accent)] text-black hover:opacity-90"
                    >
                      {locale === "en" ? "Next step" : "Siguiente"}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold rounded-sm cursor-pointer transition-colors bg-[var(--p-accent)] text-black hover:opacity-90"
                    >
                      {locale === "en" ? "Save Profile" : "Guardar Cliente"}
                    </button>
                  )}
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
