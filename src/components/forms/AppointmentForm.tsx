"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Calendar as CalendarIcon, Clock, Phone, User, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/layout/LocaleProvider";
import { createLead } from "@/lib/queries/leads";

const appointmentSchema = zod.object({
  fullName: zod.string().min(3, { message: "nombre_required" }),
  phone: zod.string().min(7, { message: "telefono_required" }),
  date: zod.string().min(1, { message: "date_required" }),
  time: zod.string().min(1, { message: "time_required" }),
  notes: zod.string().optional(),
});

type AppointmentFormData = zod.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  propertyId?: string;
  agentId?: string;
  onSuccess?: () => void;
}

export function AppointmentForm({ propertyId, agentId, onSuccess }: AppointmentFormProps) {
  const { locale, dict } = useLocale();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      date: "",
      time: "",
      notes: "",
    },
  });

  const getErrorMessage = (errorKey: string) => {
    const errorMap: Record<string, string> = {
      nombre_required: dict.property?.lead?.errors?.nombre_required || "El nombre es obligatorio",
      telefono_required: dict.property?.lead?.errors?.telefono_required || "El teléfono es obligatorio",
      date_required: locale === "es" ? "La fecha es obligatoria" : "Date is required",
      time_required: locale === "es" ? "La hora es obligatoria" : "Time is required",
    };
    return errorMap[errorKey] || errorKey;
  };

  const onSubmit = async (data: AppointmentFormData) => {
    setIsPending(true);
    try {
      const scheduledDateTime = `${data.date}T${data.time}`;
      const success = await createLead({
        property_id: propertyId,
        agent_id: agentId,
        full_name: data.fullName,
        phone: data.phone,
        intent: "agendar",
        message: `Visita programada para el día ${data.date} a las ${data.time}. Notas: ${data.notes || "Ninguna"}`,
        source: "web_form",
      });

      if (success) {
        setIsSubmitted(true);
        reset();
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error("Failed to book appointment", err);
    } finally {
      setIsPending(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 border border-[var(--border)] rounded-sm glass min-h-[300px]">
        <CheckCircle2 className="h-12 w-12 text-[var(--success)] mb-4" />
        <h4 className="font-display font-bold text-lg text-[var(--text)] mb-2">
          {locale === "es" ? "¡Visita programada!" : "Visit Scheduled!"}
        </h4>
        <p className="text-xs text-[var(--text-2)] max-w-xs font-light leading-relaxed mb-6">
          {locale === "es"
            ? "Hemos recibido tu solicitud de visita. Un asesor confirmará tu cita vía telefónica o WhatsApp."
            : "We have received your visit request. An advisor will confirm your appointment via phone or WhatsApp."}
        </p>
        <Button variant="outline" size="sm" onClick={() => setIsSubmitted(false)}>
          {locale === "es" ? "Volver" : "Back"}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass flex flex-col gap-5">
      <div>
        <h4 className="font-display font-bold text-base text-[var(--text)] mb-1">
          {dict.property?.detail?.agendar || "Agendar visita"}
        </h4>
        <p className="text-xs text-[var(--text-2)] font-light leading-relaxed">
          {locale === "es"
            ? "Elige el día y la hora de tu preferencia para coordinar el recorrido."
            : "Choose your preferred date and time to coordinate the walk-through."}
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

        {/* Fecha y Hora en Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Fecha */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
              {locale === "es" ? "Fecha" : "Date"}
            </label>
            <div className="relative">
              <CalendarIcon className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                {...register("date")}
                className="h-10 w-full pl-9 pr-2 text-xs bg-transparent border border-[var(--border)] text-[var(--text)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden cursor-pointer"
              />
            </div>
            {errors.date && (
              <span className="text-[10px] text-[var(--danger)] font-medium">
                {getErrorMessage(errors.date.message!)}
              </span>
            )}
          </div>

          {/* Hora */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
              {locale === "es" ? "Hora" : "Time"}
            </label>
            <div className="relative">
              <Clock className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)] pointer-events-none" />
              <select
                {...register("time")}
                suppressHydrationWarning
                className="h-10 w-full pl-9 pr-2 text-xs bg-transparent border border-[var(--border)] text-[var(--text)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden cursor-pointer"
              >
                <option value="" className="bg-[var(--surface-2)]">--:--</option>
                {["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((t) => (
                  <option key={t} value={t} className="bg-[var(--surface-2)]">{t}</option>
                ))}
              </select>
            </div>
            {errors.time && (
              <span className="text-[10px] text-[var(--danger)] font-medium">
                {getErrorMessage(errors.time.message!)}
              </span>
            )}
          </div>
        </div>

        {/* Notas */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
            {locale === "es" ? "Notas adicionales" : "Additional notes"}
          </label>
          <textarea
            rows={2}
            {...register("notes")}
            className="w-full px-3 py-2 text-xs bg-transparent border border-[var(--border)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden resize-none"
          />
        </div>

        {/* Submit */}
        <Button type="submit" variant="primary" isLoading={isPending} className="h-10 rounded-sm font-display uppercase tracking-wider text-xs">
          <span>{locale === "es" ? "Agendar cita" : "Book appointment"}</span>
        </Button>
      </form>
    </div>
  );
}
