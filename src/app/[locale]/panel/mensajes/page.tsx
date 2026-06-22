"use client";

import React, { use, useState } from "react";
import { Send, CircleUser, Search, MessageCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PageProps {
  params: Promise<{ locale: string }>;
}

interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string; // HH:MM
}

interface Conversation {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: Message[];
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "chat1",
    name: "Alejandra Rivas",
    role: "Client",
    lastMessage: "¿Cuándo podríamos coordinar la visita a La Pedregosa?",
    time: "10:30 AM",
    unread: true,
    messages: [
      { id: "m1", sender: "user", text: "Hola Alejandra, recibí tu interés en la villa.", timestamp: "09:15 AM" },
      { id: "m2", sender: "agent", text: "Excelente. Me gustaría saber si tiene agua constante.", timestamp: "09:30 AM" },
      { id: "m3", sender: "user", text: "Sí, cuenta con un tanque de 10.000 litros con sistema hidroneumático.", timestamp: "09:35 AM" },
      { id: "m4", sender: "agent", text: "¿Cuándo podríamos coordinar la visita a La Pedregosa?", timestamp: "10:30 AM" },
    ],
  },
  {
    id: "chat2",
    name: "Carlos Mendoza",
    role: "Client",
    lastMessage: "Perfecto, mañana a las 10:00 AM puntual estaré allí.",
    time: "Ayer",
    unread: false,
    messages: [
      { id: "m5", sender: "agent", text: "Confirmado Carlos, la cita para el Tapial queda fijada.", timestamp: "Ayer" },
      { id: "m6", sender: "user", text: "Perfecto, mañana a las 10:00 AM puntual estaré allí.", timestamp: "Ayer" },
    ],
  },
];

export default function MensajesPage({ params }: PageProps) {
  const { locale } = use(params);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState<string>("chat1");
  const [inputText, setInputText] = useState("");

  const activeChat = conversations.find((c) => c.id === activeChatId) || conversations[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMsg: Message = {
      id: `msg-${Math.random().toString(36).substring(5)}`,
      sender: "user", // Representing the active dashboard profile
      text: inputText,
      timestamp: timeNow,
    };

    // Update active conversation messages
    const updated = conversations.map((conv) => {
      if (conv.id === activeChatId) {
        return {
          ...conv,
          lastMessage: inputText,
          time: timeNow,
          unread: false,
          messages: [...conv.messages, newMsg],
        };
      }
      return conv;
    });

    setConversations(updated);
    setInputText("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--border)]">
        <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-[var(--text)]">
          {locale === "en" ? "Inbox / Messages" : "Bandeja de Mensajes"}
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {locale === "en" ? "Chat directly with advisors or registered clients regarding listings." : "Bandeja de mensajería directa con tus clientes y asesores."}
        </p>
      </div>

      {/* Messages Layout Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 rounded-sm border overflow-hidden min-h-[460px]"
        style={{
          background: "var(--surface-2)",
          borderColor: "var(--border)",
        }}
      >
        {/* Left column: Conversations list */}
        <div
          className="md:col-span-1 border-r flex flex-col justify-between"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="p-3 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                <Search size={12} strokeWidth={1.5} />
              </span>
              <input
                type="text"
                placeholder={locale === "en" ? "Search chats..." : "Buscar chats..."}
                className="pl-8 pr-3 py-1.5 w-full text-xs rounded-sm border bg-[var(--surface)] outline-none focus:border-[#01696f] transition-colors"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              />
            </div>
          </div>

          {/* Conversations list container */}
          <div className="flex-1 overflow-y-auto max-h-[380px] p-2 space-y-1">
            {conversations.map((conv) => {
              const isActive = conv.id === activeChatId;
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveChatId(conv.id);
                    // Mark as read
                    setConversations(conversations.map(c => c.id === conv.id ? { ...c, unread: false } : c));
                  }}
                  className={`p-2.5 rounded-sm flex items-center gap-3 cursor-pointer transition-all select-none ${
                    isActive
                      ? "bg-white/5 border border-white/5"
                      : "hover:bg-white/[0.015] border border-transparent"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 border border-[var(--border)] shrink-0 flex items-center justify-center">
                    <CircleUser size={16} className="text-[var(--text-muted)]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-semibold text-[var(--text)] truncate">{conv.name}</h4>
                      <span className="text-[9px] text-[var(--text-muted)] font-mono">{conv.time}</span>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
                      {conv.lastMessage}
                    </p>
                  </div>

                  {conv.unread && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Active Chat Thread */}
        <div className="md:col-span-2 flex flex-col justify-between min-h-[400px]">
          {activeChat ? (
            <>
              {/* Chat Thread Header */}
              <div
                className="p-3 border-b flex items-center gap-3"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 border border-[var(--border)] flex items-center justify-center shrink-0">
                  <CircleUser size={16} className="text-[var(--text-muted)]" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--text)]">{activeChat.name}</h4>
                  <span className="text-[9px] text-[var(--text-muted)] font-mono">
                    {activeChat.role}
                  </span>
                </div>
              </div>

              {/* Chat messages view */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[300px] bg-white/[0.005]">
                <AnimatePresence initial={false}>
                  {activeChat.messages.map((msg) => {
                    const isOwnMessage = msg.sender === "user";
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex flex-col max-w-[70%] ${
                          isOwnMessage ? "ml-auto items-end" : "mr-auto items-start"
                        }`}
                      >
                        <div
                          className="p-2.5 rounded-sm text-xs font-medium leading-normal"
                          style={{
                            background: isOwnMessage ? "#01696f" : "var(--surface)",
                            color: "white",
                            border: isOwnMessage ? "none" : "1px solid var(--border)",
                          }}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[8px] text-[var(--text-muted)] font-mono mt-0.5 px-0.5">
                          {msg.timestamp}
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Chat message input form */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t flex gap-2"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={locale === "en" ? "Type a message..." : "Escribe un mensaje..."}
                  className="flex-1 px-3 py-2 text-xs rounded-sm border bg-[var(--surface-2)] outline-none focus:border-[#01696f] transition-all"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#01696f] hover:bg-[#015257] text-white text-xs font-semibold rounded-sm flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Send size={14} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-xs text-[var(--text-muted)] font-display">
              <MessageCircle size={28} className="text-[var(--text-muted)] mb-2 opacity-30" />
              <span>{locale === "en" ? "Select a conversation to start chatting" : "Selecciona una conversación para chatear"}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
