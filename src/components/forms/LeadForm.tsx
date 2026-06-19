"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Mail, Phone, User, MessageSquare, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/layout/LocaleProvider";
import { createLead } from "@/lib/queries/leads";

const leadSchema = zod.object({
  fullName: zod.string().min(3, { message: "nombre_required" }),
  email: zod.string().email({ message: "email_invalid" }).or(zod.literal("")),
  phone: zod.string().min(7, { message: "telefono_required" }),
  intent: zod.string(),
  message: zod.string().optional(),
});

type LeadFormData = zod.infer<typeof leadSchema>;

interface LeadFormProps {
  propertyId?: string;
  agentId?: string;
}

export function LeadForm({ propertyId, agentId }: LeadFormProps) {
  const { locale, dict } = useLocale();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      intent: "comprar",
      message: "",
    },
  });

  const getErrorMessage = (errorKey: string) => {
    const errorMap: Record<string, string> = {
      nombre_required: dict.property?.lead?.errors?.nombre_required || "El nombre es obligatorio",
      email_invalid: dict.property?.lead?.errors?.email_invalid || "Correo electrónico inválido",
      telefono_required: dict.property?.lead?.errors?.telefono_required || "El teléfono es obligatorio",
    };
    return errorMap[errorKey] || errorKey;
  };

  const onSubmit = async (data: LeadFormData) => {
    setIsPending(true);
    try {
      const success = await createLead({
        property_id: propertyId,
        agent_id: agentId,
        full_name: data.fullName,
        email: data.email || undefined,
        phone: data.phone,
        intent: data.intent,
        message: data.message,
        source: "web_form",
      });

      if (success) {
        setIsSubmitted(true);
        reset();
      }
    } catch (err) {
      console.error("Failed to submit lead", err);
    } finally {
      setIsPending(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 border border-[var(--border)] rounded-sm glass min-h-[300px]">
        <CheckCircle className="h-12 w-12 text-[var(--success)] mb-4 animate-bounce" />
        <h4 className="font-display font-bold text-lg text-[var(--text)] mb-2">
          {dict.property?.lead?.success?.title || "¡Consulta recibida!"}
        </h4>
        <p className="text-xs text-[var(--text-2)] max-w-xs font-light leading-relaxed mb-6">
          {dict.property?.lead?.success?.message ||
            "Un asesor de Knordica te contactará en menos de 24 horas."}
        </p>
        <Button variant="outline" size="sm" onClick={() => setIsSubmitted(false)}>
          {locale === "es" ? "Enviar otra consulta" : "Send another inquiry"}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass flex flex-col gap-5">
      <div>
        <h4 className="font-display font-bold text-base text-[var(--text)] mb-1">
          {dict.property?.lead?.title || "¿Te interesa esta propiedad?"}
        </h4>
        <p className="text-xs text-[var(--text-2)] font-light leading-relaxed">
          {dict.property?.lead?.subtitle || "Déjanos tus datos y un asesor te contactará"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Nombre */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
            {dict.property?.lead?.nombre || "Nombre completo"}
          </label>
          <div className="relative">
            <User className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
            <input
              type="text"
              {...register("fullName")}
              className={`h-10 w-full pl-9 pr-4 text-xs bg-transparent border rounded-sm focus:ring-0 focus:outline-hidden ${
                errors.fullName
                  ? "border-[var(--danger)] focus:border-[var(--danger)]"
                  : "border-[var(--border)] focus:border-[var(--accent)]"
              }`}
            />
          </div>
          {errors.fullName && (
            <span className="text-[10px] text-[var(--danger)] font-medium">
              {getErrorMessage(errors.fullName.message!)}
            </span>
          )}
        </div>

        {/* Teléfono */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
            {dict.property?.lead?.telefono || "Teléfono / WhatsApp"}
          </label>
          <div className="relative">
            <Phone className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
            <input
              type="tel"
              {...register("phone")}
              className={`h-10 w-full pl-9 pr-4 text-xs bg-transparent border rounded-sm focus:ring-0 focus:outline-hidden ${
                errors.phone
                  ? "border-[var(--danger)] focus:border-[var(--danger)]"
                  : "border-[var(--border)] focus:border-[var(--accent)]"
              }`}
            />
          </div>
          {errors.phone && (
            <span className="text-[10px] text-[var(--danger)] font-medium">
              {getErrorMessage(errors.phone.message!)}
            </span>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
            {dict.property?.lead?.email || "Correo electrónico"}
          </label>
          <div className="relative">
            <Mail className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
            <input
              type="email"
              {...register("email")}
              className={`h-10 w-full pl-9 pr-4 text-xs bg-transparent border rounded-sm focus:ring-0 focus:outline-hidden ${
                errors.email
                  ? "border-[var(--danger)] focus:border-[var(--danger)]"
                  : "border-[var(--border)] focus:border-[var(--accent)]"
              }`}
            />
          </div>
          {errors.email && (
            <span className="text-[10px] text-[var(--danger)] font-medium">
              {getErrorMessage(errors.email.message!)}
            </span>
          )}
        </div>

        {/* Intent */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
            {dict.property?.lead?.intent || "¿Qué estás buscando?"}
          </label>
          <select
            {...register("intent")}
            suppressHydrationWarning
            className="h-10 w-full px-3 text-xs bg-transparent border border-[var(--border)] text-[var(--text)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden cursor-pointer"
          >
            <option value="comprar" className="bg-[var(--surface-2)]">
              {dict.property?.lead?.intents?.comprar || "Quiero comprar"}
            </option>
            <option value="alquilar" className="bg-[var(--surface-2)]">
              {dict.property?.lead?.intents?.alquilar || "Quiero alquilar"}
            </option>
            <option value="invertir" className="bg-[var(--surface-2)]">
              {dict.property?.lead?.intents?.invertir || "Quiero invertir"}
            </option>
            <option value="info" className="bg-[var(--surface-2)]">
              {dict.property?.lead?.intents?.info || "Solo quiero información"}
            </option>
          </select>
        </div>

        {/* Mensaje */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
            {dict.property?.lead?.mensaje || "Mensaje (opcional)"}
          </label>
          <div className="relative">
            <MessageSquare className="absolute top-3 left-3 h-3.5 w-3.5 text-[var(--text-muted)]" />
            <textarea
              rows={3}
              {...register("message")}
              className="w-full pl-9 pr-4 py-2 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden resize-none"
            />
          </div>
        </div>

        {/* Submit */}
        <Button type="submit" variant="primary" isLoading={isPending} className="h-10 rounded-sm font-display uppercase tracking-wider text-xs">
          {!isPending && <Send className="h-3.5 w-3.5" />}
          <span>{dict.property?.lead?.submit || "Enviar consulta"}</span>
        </Button>
      </form>
    </div>
  );
}
