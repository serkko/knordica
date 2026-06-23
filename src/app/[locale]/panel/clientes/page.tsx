/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { use, useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { usePanelRole } from "@/hooks/usePanelRole";
import { Plus, Search, Mail, Phone, MessageSquare, DollarSign, Calendar, X, Eye, FileText, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ClientStage, ClientType, CRMClient } from "@/types/panel";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const STAGES: { value: ClientStage; label_es: string; label_en: string; color: string }[] = [
  { value: "nuevo", label_es: "Nuevo", label_en: "New", color: "#3B82F6" },
  { value: "contactado", label_es: "Contactado", label_en: "Contacted", color: "#8B5CF6" },
  { value: "calificado", label_es: "Calificado", label_en: "Qualified", color: "#EC4899" },
  { value: "visita", label_es: "Visita", label_en: "Showing", color: "#F59E0B" },
  { value: "propuesta", label_es: "Propuesta", label_en: "Proposal", color: "#10B981" },
  { value: "cerrado", label_es: "Cerrado", label_en: "Won", color: "#10B981" },
  { value: "perdido", label_es: "Perdido", label_en: "Lost", color: "#EF4444" },
];

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
    interested_zones: ["La Pedregosa", "El Tapial"],
    interested_types: ["apartamento"],
    notes: "Busca apartamento de 2 habitaciones, planta baja indispensable por razones familiares.",
    next_action: "Enviar portafolio de apartamentos en La Pedregosa",
    next_action_date: "2026-06-25",
    last_contact: "2026-06-21",
    properties_shown: [],
    created_at: "2026-06-21",
    updated_at: "2026-06-21",
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
    interested_zones: ["Av. Los Próceres", "Centro"],
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
    interested_zones: ["Chorros de Milla"],
    interested_types: ["casa"],
    notes: "Alquiler vacacional o de larga estancia para profesor universitario visitante.",
    next_action: "Visita programada a casa Chorros de Milla",
    next_action_date: "2026-06-22",
    last_contact: "2026-06-18",
    properties_shown: [],
    created_at: "2026-06-15",
    updated_at: "2026-06-18",
  },
];

export default function ClientesCRMPage({ params }: PageProps) {
  const { locale } = use(params);
  const { role, userId, loading: roleLoading } = usePanelRole();

  const [clients, setClients] = useState<CRMClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<CRMClient | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load clients
  const loadClients = async () => {
    try {
      setLoading(true);
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      let query = supabase.from("crm_clients").select("*");

      if (role !== "admin" && role !== "senior" && userId) {
        query = query.eq("agent_id", userId);
      }

      const { data, error } = await query;

      if (error) {
        console.warn("crm_clients table may not exist yet. Falling back to mock data.");
        setClients(MOCK_CLIENTS);
      } else if (data && data.length > 0) {
        setClients(data);
      } else {
        setClients(MOCK_CLIENTS);
      }
    } catch {
      setClients(MOCK_CLIENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roleLoading) {
      loadClients();
    }
  }, [role, userId, roleLoading]);

  // Handle drag and drop stage transitions
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStage = destination.droppableId as ClientStage;
    
    // Update local state immediately
    const updated = clients.map((c) => {
      if (c.id === draggableId) {
        return { ...c, stage: newStage };
      }
      return c;
    });
    setClients(updated);

    // Save transition to DB
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase
        .from("crm_clients")
        .update({ stage: newStage, updated_at: new Date().toISOString() })
        .eq("id", draggableId);
    } catch (err) {
      console.warn("DB update failed on stage drag. Keeping local state.", err);
    }
  };

  // Filter clients by search query
  const filteredClients = clients.filter((c) =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
    (c.phone && c.phone.includes(searchQuery.trim()))
  );

  const handleOpenDrawer = (client: CRMClient) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setSelectedClient(null);
    setIsDrawerOpen(false);
  };

  const handleSaveNotes = async (notes: string) => {
    if (!selectedClient) return;

    const updated = clients.map((c) => {
      if (c.id === selectedClient.id) {
        return { ...c, notes };
      }
      return c;
    });
    setClients(updated);
    setSelectedClient({ ...selectedClient, notes });

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase
        .from("crm_clients")
        .update({ notes, updated_at: new Date().toISOString() })
        .eq("id", selectedClient.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pb-4 border-b border-[var(--border)]">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-[var(--text)]">
            {locale === "en" ? "CRM Board" : "Gestión de Clientes (CRM)"}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            {locale === "en"
              ? "Drag and drop client cards to transition pipeline stages."
              : "Arrastra las tarjetas de tus clientes para cambiar su etapa del embudo comercial."}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
            <Search size={14} strokeWidth={1.5} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={locale === "en" ? "Filter by name, email..." : "Filtrar por nombre, correo..."}
            className="pl-9 pr-4 py-2 w-full text-xs rounded-sm border bg-[var(--surface-2)] outline-none focus:border-[#01696f] transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          />
        </div>
      </div>

      {/* Kanban Board Container */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 items-start select-none min-h-[500px]">
          {STAGES.map((stage) => {
            const stageClients = filteredClients.filter((c) => c.stage === stage.value);
            const stageTitle = locale === "en" ? stage.label_en : stage.label_es;

            return (
              <div
                key={stage.value}
                className="w-72 shrink-0 flex flex-col rounded-sm border"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                {/* Column Header */}
                <div
                  className="p-3 border-b flex items-center justify-between bg-white/[0.01]"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="text-[11px] font-bold font-display uppercase tracking-wider text-[var(--text)]">
                      {stageTitle}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold font-mono text-[var(--text-muted)] bg-white/5 px-1.5 py-0.5 rounded-xs">
                    {stageClients.length}
                  </span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={stage.value}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="p-2 space-y-2 min-h-[400px] flex-1 overflow-y-auto max-h-[600px]"
                      style={{
                        background: snapshot.isDraggingOver ? "rgba(255,255,255,0.01)" : "transparent",
                      }}
                    >
                      {stageClients.map((client, index) => (
                        <Draggable key={client.id} draggableId={client.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => handleOpenDrawer(client)}
                              className="p-3 rounded-sm border cursor-pointer select-none transition-all flex flex-col justify-between hover:-translate-y-0.5 duration-150"
                              style={{
                                background: snapshot.isDragging ? "var(--surface-dynamic)" : "var(--surface-2)",
                                borderColor: "var(--border)",
                                boxShadow: snapshot.isDragging ? "var(--shadow-md)" : "none",
                                ...provided.draggableProps.style,
                              }}
                            >
                              <div className="space-y-1.5">
                                <span className="text-[9px] font-bold uppercase tracking-wider font-mono text-[var(--text-muted)]">
                                  {client.client_type}
                                </span>
                                <h4 className="text-xs font-semibold text-[var(--text)]">
                                  {client.full_name}
                                </h4>
                                {client.budget_max && (
                                  <p className="text-[10px] font-semibold font-mono text-[#C9962A] flex items-center gap-0.5">
                                    <DollarSign size={10} />
                                    {client.budget_max.toLocaleString()} max
                                  </p>
                                )}
                              </div>

                              <div
                                className="mt-3 pt-2.5 border-t flex items-center justify-between text-[10px] text-[var(--text-muted)]"
                                style={{ borderColor: "var(--border)" }}
                              >
                                <span className="font-mono">
                                  {client.last_contact ? client.last_contact : "N/A"}
                                </span>
                                <span className="text-[#01696f] flex items-center gap-0.5 font-semibold">
                                  {locale === "en" ? "Details" : "Ver"}
                                  <ArrowRight size={10} />
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* CRM Details Sidebar Drawer */}
      <AnimatePresence>
        {isDrawerOpen && selectedClient && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDrawer}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Slide-out Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[460px] bg-[#0f1117] border-l border-white/5 z-50 p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div>
                    <span className="inline-block px-1.5 py-0.5 rounded-xs text-[9px] font-bold font-mono bg-white/5 text-white/50 uppercase tracking-wider mb-2">
                      {selectedClient.client_type}
                    </span>
                    <h3 className="text-lg font-bold font-display text-white">
                      {selectedClient.full_name}
                    </h3>
                  </div>
                  <button
                    onClick={handleCloseDrawer}
                    className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-white/5 text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Details Section */}
                <div className="space-y-4 text-xs">
                  <h4 className="text-[10px] uppercase tracking-widest font-semibold text-white/30 font-display">
                    {locale === "en" ? "Contact Info" : "Datos de Contacto"}
                  </h4>
                  <div className="space-y-2.5">
                    {selectedClient.email && (
                      <div className="flex items-center gap-2.5 text-white/80">
                        <Mail size={14} className="text-white/40" />
                        <span>{selectedClient.email}</span>
                      </div>
                    )}
                    {selectedClient.phone && (
                      <div className="flex items-center gap-2.5 text-white/80">
                        <Phone size={14} className="text-white/40" />
                        <span>{selectedClient.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Budget & Areas Section */}
                <div className="space-y-4 border-t border-white/5 pt-4">
                  <h4 className="text-[10px] uppercase tracking-widest font-semibold text-white/30 font-display">
                    {locale === "en" ? "Budget & Preferences" : "Presupuesto y Preferencias"}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs text-white/80">
                    <div>
                      <span className="text-[10px] text-white/40 block">
                        {locale === "en" ? "Budget Limit" : "Presupuesto Máx"}
                      </span>
                      <span className="font-mono font-bold text-[#C9962A]">
                        ${selectedClient.budget_max?.toLocaleString() || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 block">
                        {locale === "en" ? "Preferred Zones" : "Zonas de Interés"}
                      </span>
                      <span className="font-semibold">
                        {selectedClient.interested_zones?.join(", ") || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-3 border-t border-white/5 pt-4">
                  <h4 className="text-[10px] uppercase tracking-widest font-semibold text-white/30 font-display flex items-center gap-1.5">
                    <FileText size={12} />
                    {locale === "en" ? "Client Notes" : "Notas e Interacciones"}
                  </h4>
                  <textarea
                    rows={4}
                    defaultValue={selectedClient.notes || ""}
                    onBlur={(e) => handleSaveNotes(e.target.value)}
                    placeholder={locale === "en" ? "Add private notes about this client..." : "Agrega notas privadas sobre este cliente..."}
                    className="w-full p-2.5 text-xs rounded-sm border bg-white/5 outline-none border-white/10 focus:border-[#01696f] transition-all resize-none text-white/80"
                  />
                  <p className="text-[9px] text-white/30 italic">
                    {locale === "en" ? "Changes save automatically on blur." : "Los cambios se guardan automáticamente al desenfocar."}
                  </p>
                </div>
              </div>

              {/* Bottom Footer */}
              <div className="border-t border-white/5 pt-4 mt-6">
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer text-center"
                >
                  {locale === "en" ? "Done" : "Listo"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
