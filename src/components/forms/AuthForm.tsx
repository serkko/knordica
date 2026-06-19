"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Mail, Lock, User, LogIn, UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/layout/LocaleProvider";
import { createClient } from "@/lib/supabase/client";

const loginSchema = zod.object({
  email: zod.string().email({ message: "email_invalid" }),
  password: zod.string().min(6, { message: "password_min" }),
});

const registerSchema = zod.object({
  fullName: zod.string().min(3, { message: "name_min" }),
  email: zod.string().email({ message: "email_invalid" }),
  password: zod.string().min(6, { message: "password_min" }),
});

type LoginFormData = zod.infer<typeof loginSchema>;
type RegisterFormData = zod.infer<typeof registerSchema>;

export function AuthForm() {
  const { locale, dict } = useLocale();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const supabase = createClient();

  // Login Form
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLogin,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Register Form
  const {
    register: registerSignUp,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetSignUp,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const getErrorMessage = (errorKey: string) => {
    const errorMap: Record<string, string> = {
      email_invalid: locale === "es" ? "Correo electrónico inválido" : "Invalid email address",
      password_min: locale === "es" ? "La contraseña debe tener al menos 6 caracteres" : "Password must be at least 6 characters",
      name_min: locale === "es" ? "El nombre debe tener al menos 3 caracteres" : "Name must be at least 3 characters",
    };
    return errorMap[errorKey] || errorKey;
  };

  const onLogin = async (data: LoginFormData) => {
    setIsPending(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setErrorMsg(
          locale === "es"
            ? "Credenciales incorrectas o cuenta inexistente."
            : "Invalid credentials or account does not exist."
        );
      } else {
        setSuccessMsg(locale === "es" ? "¡Sesión iniciada! Redirigiendo..." : "Login successful! Redirecting...");
        resetLogin();
        setTimeout(() => {
          router.push(`/${locale}/cliente`);
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(locale === "es" ? "Error de conexión." : "Connection error.");
    } finally {
      setIsPending(false);
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    setIsPending(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg(
          locale === "es"
            ? "¡Registro exitoso! Por favor verifica tu correo electrónico."
            : "Registration successful! Please check your email for verification."
        );
        resetSignUp();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(locale === "es" ? "Error de conexión." : "Connection error.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 rounded-sm glass flex flex-col gap-6">
      {/* Navigation tabs */}
      <div className="grid grid-cols-2 border-b border-[var(--border)] pb-2 gap-2">
        <button
          onClick={() => {
            setActiveTab("login");
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className={`pb-3 text-xs uppercase tracking-wider font-semibold font-display border-b-2 text-center transition-all cursor-pointer ${
            activeTab === "login"
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-transparent text-[var(--text-2)] hover:text-[var(--text)]"
          }`}
        >
          {locale === "es" ? "Iniciar Sesión" : "Login"}
        </button>
        <button
          onClick={() => {
            setActiveTab("register");
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className={`pb-3 text-xs uppercase tracking-wider font-semibold font-display border-b-2 text-center transition-all cursor-pointer ${
            activeTab === "register"
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-transparent text-[var(--text-2)] hover:text-[var(--text)]"
          }`}
        >
          {locale === "es" ? "Crear Cuenta" : "Register"}
        </button>
      </div>

      {/* Errors / Success notifications */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 border border-red-500/20 bg-red-500/5 text-red-400 text-xs rounded-sm animate-in fade-in duration-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-3 border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs rounded-sm animate-in fade-in duration-300">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Login View */}
      {activeTab === "login" && (
        <form onSubmit={handleLoginSubmit(onLogin)} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
              {locale === "es" ? "Correo electrónico" : "Email Address"}
            </label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
              <input
                type="email"
                {...registerLogin("email")}
                className={`h-10 w-full pl-9 pr-4 text-xs bg-transparent border rounded-sm focus:ring-0 focus:outline-hidden ${
                  loginErrors.email
                    ? "border-[var(--danger)] focus:border-[var(--danger)]"
                    : "border-[var(--border)] focus:border-[var(--accent)]"
                }`}
                placeholder="email@ejemplo.com"
              />
            </div>
            {loginErrors.email && (
              <span className="text-[10px] text-[var(--danger)]">
                {getErrorMessage(loginErrors.email.message!)}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
              {locale === "es" ? "Contraseña" : "Password"}
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
              <input
                type="password"
                {...registerLogin("password")}
                className={`h-10 w-full pl-9 pr-4 text-xs bg-transparent border rounded-sm focus:ring-0 focus:outline-hidden ${
                  loginErrors.password
                    ? "border-[var(--danger)] focus:border-[var(--danger)]"
                    : "border-[var(--border)] focus:border-[var(--accent)]"
                }`}
                placeholder="••••••"
              />
            </div>
            {loginErrors.password && (
              <span className="text-[10px] text-[var(--danger)]">
                {getErrorMessage(loginErrors.password.message!)}
              </span>
            )}
          </div>

          <Button type="submit" variant="primary" isLoading={isPending} className="h-10 rounded-sm font-display uppercase tracking-wider text-xs mt-2">
            {!isPending && <LogIn className="h-3.5 w-3.5" />}
            <span>{locale === "es" ? "Iniciar Sesión" : "Login"}</span>
          </Button>
        </form>
      )}

      {/* Register View */}
      {activeTab === "register" && (
        <form onSubmit={handleRegisterSubmit(onRegister)} className="flex flex-col gap-4">
          {/* Full Name */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
              {locale === "es" ? "Nombre completo" : "Full Name"}
            </label>
            <div className="relative">
              <User className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                {...registerSignUp("fullName")}
                className={`h-10 w-full pl-9 pr-4 text-xs bg-transparent border rounded-sm focus:ring-0 focus:outline-hidden ${
                  registerErrors.fullName
                    ? "border-[var(--danger)] focus:border-[var(--danger)]"
                    : "border-[var(--border)] focus:border-[var(--accent)]"
                }`}
                placeholder={locale === "es" ? "Ej: Alejandro Mora" : "e.g., John Doe"}
              />
            </div>
            {registerErrors.fullName && (
              <span className="text-[10px] text-[var(--danger)]">
                {getErrorMessage(registerErrors.fullName.message!)}
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
                {...registerSignUp("email")}
                className={`h-10 w-full pl-9 pr-4 text-xs bg-transparent border rounded-sm focus:ring-0 focus:outline-hidden ${
                  registerErrors.email
                    ? "border-[var(--danger)] focus:border-[var(--danger)]"
                    : "border-[var(--border)] focus:border-[var(--accent)]"
                }`}
                placeholder="email@ejemplo.com"
              />
            </div>
            {registerErrors.email && (
              <span className="text-[10px] text-[var(--danger)]">
                {getErrorMessage(registerErrors.email.message!)}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
              {locale === "es" ? "Contraseña" : "Password"}
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
              <input
                type="password"
                {...registerSignUp("password")}
                className={`h-10 w-full pl-9 pr-4 text-xs bg-transparent border rounded-sm focus:ring-0 focus:outline-hidden ${
                  registerErrors.password
                    ? "border-[var(--danger)] focus:border-[var(--danger)]"
                    : "border-[var(--border)] focus:border-[var(--accent)]"
                }`}
                placeholder="••••••"
              />
            </div>
            {registerErrors.password && (
              <span className="text-[10px] text-[var(--danger)]">
                {getErrorMessage(registerErrors.password.message!)}
              </span>
            )}
          </div>

          <Button type="submit" variant="primary" isLoading={isPending} className="h-10 rounded-sm font-display uppercase tracking-wider text-xs mt-2">
            {!isPending && <UserPlus className="h-3.5 w-3.5" />}
            <span>{locale === "es" ? "Registrarse" : "Create Account"}</span>
          </Button>
        </form>
      )}
    </div>
  );
}
