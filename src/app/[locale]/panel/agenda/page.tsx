"use client";

import React, { use, useState } from "react";
import { Plus, Calendar as CalendarIcon, Clock, Phone, MapPin, MessageSquare, AlertCircle, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PageProps {
  params: Promise<{ locale: string }>;
}

interface AgendaItem {
  id: string;
  title: string;
  type: "visita" | "llamada" | "reunion" | "tarea";
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  client: string;
  notes: string;
  completed: boolean;
}

const INITIAL_EVENTS: AgendaItem[] = [
  {
    id: "e1",
    title: "Visita Apartamento El Tapial",
    type: "visita",
    date: "2026-06-22",
    time: "10:00 AM",
    client: "Carlos Mendoza",
    notes: "Indispensable mostrar el tanque de agua auxiliar y áreas comunes.",
    completed: false,
  },
  {
    id: "e2",
    title: "Firma Notaría Terreno Comercial",
    type: "reunion",
    date: "2026-06-22",
    time: "02:30 PM",
    client: "Francisco Pernía",
    notes: "Firma de opción compra-venta, Notaría Primera de Mérida.",
    completed: false,
  },
  {
    id: "e3",
    title: "Llamada de seguimiento - Propuesta de compra",
    type: "llamada",
    date: "2026-06-23",
    time: "09:00 AM",
    client: "Alejandra Rivas",
    notes: "Hacer seguimiento de la oferta enviada por la casa en La Pedregosa.",
    completed: false,
  },
  {
    id: "e4",
    title: "Reunión de coordinación de avalúo",
    type: "reunion",
    date: "2026-06-25",
    time: "11:30 AM",
    client: "Propietario Tapial",
    notes: "Avalúo comercial formal del inmueble.",
    completed: true,
  },
];

export default function AgendaPage({ params }: PageProps) {
  const { locale } = use(params);
  const [events, setEvents] = useState<AgendaItem[]>(INITIAL_EVENTS);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"visita" | "llamada" | "reunion" | "tarea">("visita");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newClient, setNewClient] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate || !newTime) return;

    const item: AgendaItem = {
      id: `e-${Math.random().toString(36).substring(5)}`,
      title: newTitle,
      type: newType,
      date: newDate,
      time: newTime,
      client: newClient || "N/A",
      notes: newNotes,
      completed: false,
    };

    setEvents([item, ...events]);
    setModalOpen(false);

    // Reset fields
    setNewTitle("");
    setNewType("visita");
    setNewDate("");
    setNewTime("");
    setNewClient("");
    setNewNotes("");
  };

  const toggleComplete = (id: string) => {
    setEvents(events.map(ev => ev.id === id ? { ...ev, completed: !ev.completed } : ev));
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case "visita":
        return { label_es: "Visita", label_en: "Showing", bg: "rgba(1,105,111,0.1)", color: "var(--color-primary-hover, #D4C8B0)", icon: <MapPin size={12} /> };
      case "llamada":
        return { label_es: "Llamada", label_en: "Call", bg: "rgba(201,150,42,0.1)", color: "var(--color-gold)", icon: <Phone size={12} /> };
      case "reunion":
        return { label_es: "Reunión", label_en: "Meeting", bg: "rgba(37,99,235,0.1)", color: "#3B82F6", icon: <CalendarIcon size={12} /> };
      default:
        return { label_es: "Tarea", label_en: "Task", bg: "rgba(255,255,255,0.05)", color: "var(--text-muted)", icon: <Check size={12} /> };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-[var(--text)]">
            {locale === "en" ? "Agenda / Schedule" : "Agenda Profesional"}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            {locale === "en" ? "View and manage showing schedules, calls, and task deadlines." : "Planifica visitas de clientes, llamadas de seguimiento y cierres."}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-[#01696f] hover:bg-[#015257] text-white text-xs font-semibold rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus size={14} />
          <span>{locale === "en" ? "Schedule Event" : "Programar Evento"}</span>
        </button>
      </div>

      {/* Events Lists (Split Completed vs Pending) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Events */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold font-display uppercase tracking-widest text-[var(--text-muted)]">
            {locale === "en" ? "Upcoming Tasks" : "Próximos Eventos y Citas"}
          </h3>

          <div className="space-y-3">
            {events.filter(ev => !ev.completed).length > 0 ? (
              events.filter(ev => !ev.completed).map(ev => {
                const badge = getEventBadge(ev.type);
                return (
                  <motion.div
                    key={ev.id}
                    className="p-4 rounded-sm border flex items-start justify-between relative group"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="px-1.5 py-0.5 rounded-xs text-[8px] font-bold font-mono uppercase tracking-wider flex items-center gap-1"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          {badge.icon}
                          {locale === "en" ? badge.label_en : badge.label_es}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1">
                          <Clock size={10} />
                          {ev.date} @ {ev.time}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[var(--text)]">{ev.title}</h4>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1 font-sans leading-normal">
                          {locale === "en" ? "Client" : "Cliente"}: <span className="text-[var(--text-2)] font-semibold">{ev.client}</span>
                        </p>
                        {ev.notes && (
                          <p className="text-[10px] text-[var(--text-muted)] bg-white/[0.01] p-1.5 rounded-xs border border-white/5 mt-1.5 font-mono">
                            {ev.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Mark complete trigger */}
                    <button
                      onClick={() => toggleComplete(ev.id)}
                      className="ml-4 w-6 h-6 rounded-full border border-[var(--border)] hover:border-emerald-500 hover:bg-emerald-500/10 flex items-center justify-center text-transparent hover:text-emerald-400 transition-all cursor-pointer mt-1"
                      title={locale === "en" ? "Complete" : "Completar"}
                    >
                      <Check size={12} />
                    </button>
                  </motion.div>
                );
              })
            ) : (
              <div
                className="p-8 border border-dashed rounded-sm text-center text-xs text-[var(--text-muted)] font-display"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                {locale === "en" ? "No upcoming events scheduled" : "No tienes citas programadas"}
              </div>
            )}
          </div>
        </div>

        {/* Completed Events */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold font-display uppercase tracking-widest text-[var(--text-muted)]">
            {locale === "en" ? "History / Completed" : "Historial / Completados"}
          </h3>

          <div className="space-y-3 opacity-60">
            {events.filter(ev => ev.completed).length > 0 ? (
              events.filter(ev => ev.completed).map(ev => {
                const badge = getEventBadge(ev.type);
                return (
                  <div
                    key={ev.id}
                    className="p-3 rounded-sm border border-[var(--border)] bg-[var(--surface-2)] flex items-start justify-between line-through"
                  >
                    <div>
                      <span className="text-[9px] font-mono text-[var(--text-muted)]">
                        {ev.date} · {ev.title} ({ev.client})
                      </span>
                    </div>
                    <button
                      onClick={() => toggleComplete(ev.id)}
                      className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center cursor-pointer"
                      title={locale === "en" ? "Undo" : "Deshacer"}
                    >
                      <Check size={10} />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-[var(--text-muted)] italic font-display">
                {locale === "en" ? "No completed items" : "Ningún evento completado todavía"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Programar Evento Dialog Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0f1117] border border-white/10 rounded-sm w-full max-w-md p-6 relative z-10 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                {locale === "en" ? "New Schedule Entry" : "Programar Nuevo Evento"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-white/40 hover:text-white transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4 text-xs text-white/80">
              {/* Title */}
              <div className="space-y-1">
                <label className="font-display font-semibold uppercase tracking-widest text-white/30 text-[9px]">
                  {locale === "en" ? "Subject / Title" : "Asunto / Título"} *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border bg-white/5 border-white/10 outline-none focus:border-[#01696f] text-white"
                />
              </div>

              {/* Grid 2 Columns */}
              <div className="grid grid-cols-2 gap-3">
                {/* Type */}
                <div className="space-y-1">
                  <label className="font-display font-semibold uppercase tracking-widest text-white/30 text-[9px]">
                    {locale === "en" ? "Type" : "Tipo"}
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-sm border bg-[#0f1117] border-white/10 outline-none text-white"
                  >
                    <option value="visita">{locale === "en" ? "Showing" : "Visita"}</option>
                    <option value="llamada">{locale === "en" ? "Call" : "Llamada"}</option>
                    <option value="reunion">{locale === "en" ? "Meeting" : "Reunión"}</option>
                    <option value="tarea">{locale === "en" ? "Task" : "Tarea"}</option>
                  </select>
                </div>

                {/* Client */}
                <div className="space-y-1">
                  <label className="font-display font-semibold uppercase tracking-widest text-white/30 text-[9px]">
                    {locale === "en" ? "Client Name" : "Cliente"}
                  </label>
                  <input
                    type="text"
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    className="w-full px-3 py-2 rounded-sm border bg-white/5 border-white/10 outline-none text-white"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-display font-semibold uppercase tracking-widest text-white/30 text-[9px]">
                    {locale === "en" ? "Date" : "Fecha"} *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-sm border bg-white/5 border-white/10 outline-none text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-display font-semibold uppercase tracking-widest text-white/30 text-[9px]">
                    {locale === "en" ? "Time" : "Hora"} *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-sm border bg-white/5 border-white/10 outline-none text-white font-mono"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-display font-semibold uppercase tracking-widest text-white/30 text-[9px]">
                  {locale === "en" ? "Notes" : "Notas Adicionales"}
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2.5 rounded-sm border bg-white/5 border-white/10 outline-none focus:border-[#01696f] text-white resize-none"
                />
              </div>

              {/* Footer */}
              <div className="flex gap-2 justify-end pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-sm font-semibold transition-colors cursor-pointer"
                >
                  {locale === "en" ? "Cancel" : "Cancelar"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#01696f] hover:bg-[#015257] text-white rounded-sm font-semibold transition-colors cursor-pointer"
                >
                  {locale === "en" ? "Schedule" : "Agendar"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
