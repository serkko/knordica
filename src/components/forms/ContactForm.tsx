"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Mail, Phone, User, MessageSquare, Send, CheckCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/layout/LocaleProvider";
import { createLead } from "@/lib/queries/leads";

const contactSchema = zod.object({
  fullName: zod.string().min(3, { message: "nombre_required" }),
  email: zod.string().email({ message: "email_invalid" }),
  phone: zod.string().min(7, { message: "telefono_required" }),
  intent: zod.string(),
  message: zod.string().min(10, { message: "message_required" }),
});

type ContactFormData = zod.infer<typeof contactSchema>;

export function ContactForm() {
  const { locale, dict } = useLocale();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      intent: "info",
      message: "",
    },
  });

  const getErrorMessage = (errorKey: string) => {
    const errorMap: Record<string, string> = {
      nombre_required: locale === "es" ? "El nombre debe tener al menos 3 caracteres" : "Name must be at least 3 characters",
      email_invalid: locale === "es" ? "Correo electrónico inválido" : "Invalid email address",
      telefono_required: locale === "es" ? "El teléfono es obligatorio" : "Phone number is required",
      message_required: locale === "es" ? "El mensaje debe tener al menos 10 caracteres" : "Message must be at least 10 characters",
    };
    return errorMap[errorKey] || errorKey;
  };

  const onSubmit = async (data: ContactFormData) => {
    setIsPending(true);
    try {
      const success = await createLead({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        intent: data.intent,
        message: data.message,
        source: "contacto_page",
      });

      if (success) {
        setIsSubmitted(true);
        reset();
      }
    } catch (err) {
      console.error("Failed to submit contact request", err);
    } finally {
      setIsPending(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border border-[var(--border)] rounded-sm bg-[var(--surface)] glass min-h-[350px] animate-in fade-in duration-500">
        <CheckCircle className="h-14 w-14 text-[var(--success)] mb-5 animate-bounce" />
        <h3 className="font-display font-bold text-xl text-[var(--text)] mb-3">
          {locale === "es" ? "¡Mensaje Enviado!" : "Message Sent!"}
        </h3>
        <p className="text-xs text-[var(--text-2)] max-w-sm font-light leading-relaxed mb-8">
          {locale === "es" 
            ? "Hemos recibido tus comentarios correctamente. Un agente del equipo de Knordica se comunicará contigo a la brevedad." 
            : "We have received your message. A member of the Knordica team will get back to you shortly."}
        </p>
        <Button variant="outline" size="sm" onClick={() => setIsSubmitted(false)}>
          {locale === "es" ? "Enviar otro mensaje" : "Send another message"}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass flex flex-col gap-6">
      <div>
        <h3 className="font-display font-bold text-lg text-[var(--text)] mb-1.5">
          {locale === "es" ? "Escríbenos directamente" : "Write to us directly"}
        </h3>
        <p className="text-xs text-[var(--text-2)] font-light leading-relaxed">
          {locale === "es" 
            ? "Completa el formulario a continuación y te responderemos en un plazo máximo de 24 horas laborables." 
            : "Fill out the form below and we will respond within 24 business hours."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Nombre */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
            {locale === "es" ? "Nombre completo" : "Full Name"}
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
              placeholder={locale === "es" ? "Ej: Alejandro Mora" : "e.g., John Doe"}
            />
          </div>
          {errors.fullName && (
            <span className="text-[10px] text-[var(--danger)] font-medium">
              {getErrorMessage(errors.fullName.message!)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Teléfono */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
              {locale === "es" ? "Teléfono / WhatsApp" : "Phone / WhatsApp"}
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
                placeholder={locale === "es" ? "+58 412 000 0000" : "+1 555 000 0000"}
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
              {locale === "es" ? "Correo electrónico" : "Email Address"}
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
                placeholder={locale === "es" ? "alejandro@ejemplo.com" : "john@example.com"}
              />
            </div>
            {errors.email && (
              <span className="text-[10px] text-[var(--danger)] font-medium">
                {getErrorMessage(errors.email.message!)}
              </span>
            )}
          </div>
        </div>

        {/* Intent */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
            {locale === "es" ? "¿En qué podemos ayudarte?" : "How can we help you?"}
          </label>
          <div className="relative">
            <HelpCircle className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)] pointer-events-none" />
            <select
              {...register("intent")}
              suppressHydrationWarning
              className="h-10 w-full pl-9 pr-4 text-xs bg-transparent border border-[var(--border)] text-[var(--text)] rounded-sm focus:border-[var(--accent)] focus:ring-0 focus:outline-hidden cursor-pointer appearance-none"
            >
              <option value="info" className="bg-[var(--surface-2)]">
                {locale === "es" ? "Solicitar información general" : "Request general information"}
              </option>
              <option value="vender" className="bg-[var(--surface-2)]">
                {locale === "es" ? "Quiero vender / alquilar mi propiedad" : "I want to sell / rent my property"}
              </option>
              <option value="comprar" className="bg-[var(--surface-2)]">
                {locale === "es" ? "Quiero comprar / buscar asesoría" : "I want to buy / seek advisory"}
              </option>
              <option value="otro" className="bg-[var(--surface-2)]">
                {locale === "es" ? "Otras consultas" : "Other inquiries"}
              </option>
            </select>
          </div>
        </div>

        {/* Mensaje */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
            {locale === "es" ? "Mensaje" : "Your Message"}
          </label>
          <div className="relative">
            <MessageSquare className="absolute top-3 left-3 h-3.5 w-3.5 text-[var(--text-muted)]" />
            <textarea
              rows={4}
              {...register("message")}
              placeholder={locale === "es" ? "Cuéntanos sobre tus requerimientos..." : "Tell us about your requirements..."}
              className={`w-full pl-9 pr-4 py-2 text-xs bg-transparent border rounded-sm focus:ring-0 focus:outline-hidden resize-none ${
                errors.message
                  ? "border-[var(--danger)] focus:border-[var(--danger)]"
                  : "border-[var(--border)] focus:border-[var(--accent)]"
              }`}
            />
          </div>
          {errors.message && (
            <span className="text-[10px] text-[var(--danger)] font-medium">
              {getErrorMessage(errors.message.message!)}
            </span>
          )}
        </div>

        {/* Submit */}
        <Button type="submit" variant="primary" isLoading={isPending} className="h-10 rounded-sm font-display uppercase tracking-wider text-xs mt-2">
          {!isPending && <Send className="h-3.5 w-3.5" />}
          <span>{locale === "es" ? "Enviar mensaje" : "Send Message"}</span>
        </Button>
      </form>
    </div>
  );
}
