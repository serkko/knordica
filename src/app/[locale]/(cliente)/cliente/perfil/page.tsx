"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/layout/LocaleProvider";
import { createClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { User, Mail, ShieldAlert, KeyRound, AlertCircle, CheckCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

const profileSchema = zod.object({
  fullName: zod.string().min(3, { message: "name_min" }),
});

const passwordSchema = zod.object({
  password: zod.string().min(6, { message: "password_min" }),
  confirmPassword: zod.string().min(6, { message: "password_min" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "passwords_dont_match",
  path: ["confirmPassword"],
});

type ProfileFormData = zod.infer<typeof profileSchema>;
type PasswordFormData = zod.infer<typeof passwordSchema>;

export default function ClientePerfil() {
  const { locale } = useLocale();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profilePending, setProfilePending] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const supabase = createClient();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    setValue: setProfileValue,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "" },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "";
        setProfileValue("fullName", name);
      } else {
        // Mock user in local development without Supabase keys
        const mockUser = {
          email: "demo@knordica.com",
          user_metadata: { full_name: "Cliente Demo" },
          created_at: new Date().toISOString()
        };
        setUser(mockUser);
        setProfileValue("fullName", mockUser.user_metadata.full_name);
      }
      setLoading(false);
    }
    loadUser();
  }, [setProfileValue]);

  const onUpdateProfile = async (data: ProfileFormData) => {
    setProfilePending(true);
    setProfileSuccess(null);
    setProfileError(null);

    const hasSupabaseKeys = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD";

    try {
      if (hasSupabaseKeys) {
        const { error } = await supabase.auth.updateUser({
          data: { full_name: data.fullName },
        });

        if (error) {
          setProfileError(error.message);
        } else {
          setProfileSuccess(
            locale === "es"
              ? "Perfil actualizado con éxito."
              : "Profile updated successfully."
          );
          router.refresh();
        }
      } else {
        // Simulate development update
        setTimeout(() => {
          setProfileSuccess(
            locale === "es"
              ? "Perfil de desarrollo actualizado con éxito (Simulado)."
              : "Development profile updated successfully (Simulated)."
          );
          router.refresh();
        }, 800);
      }
    } catch (err: any) {
      setProfileError(err.message || "Error updating profile");
    } finally {
      setProfilePending(false);
    }
  };

  const onUpdatePassword = async (data: PasswordFormData) => {
    setPasswordPending(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    const hasSupabaseKeys = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD";

    try {
      if (hasSupabaseKeys) {
        const { error } = await supabase.auth.updateUser({
          password: data.password,
        });

        if (error) {
          setPasswordError(error.message);
        } else {
          setPasswordSuccess(
            locale === "es"
              ? "Contraseña actualizada con éxito."
              : "Password updated successfully."
          );
          resetPassword();
        }
      } else {
        // Simulate development update
        setTimeout(() => {
          setPasswordSuccess(
            locale === "es"
              ? "Contraseña de desarrollo actualizada con éxito (Simulada)."
              : "Development password updated successfully (Simulated)."
          );
          resetPassword();
        }, 800);
      }
    } catch (err: any) {
      setPasswordError(err.message || "Error updating password");
    } finally {
      setPasswordPending(false);
    }
  };

  const getErrorMessage = (errorKey: string) => {
    const errorMap: Record<string, string> = {
      name_min: locale === "es" ? "El nombre debe tener al menos 3 caracteres" : "Name must be at least 3 characters",
      password_min: locale === "es" ? "La contraseña debe tener al menos 6 caracteres" : "Password must be at least 6 characters",
      passwords_dont_match: locale === "es" ? "Las contraseñas no coinciden" : "Passwords do not match",
    };
    return errorMap[errorKey] || errorKey;
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-20 bg-[var(--surface-2)] rounded-sm border border-[var(--border)]" />
        <div className="h-64 bg-[var(--surface-2)] rounded-sm border border-[var(--border)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold font-display mb-1">
          <Link href={`/${locale}/cliente`} className="hover:text-[var(--accent)] transition-colors">
            {locale === "es" ? "Panel" : "Dashboard"}
          </Link>
          <span>/</span>
          <span className="text-[var(--accent)]">{locale === "es" ? "Mi Perfil" : "My Profile"}</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[var(--text)]">
          {locale === "es" ? "Mi Perfil de Cliente" : "My Client Profile"}
        </h2>
        <p className="text-xs text-[var(--text-2)] font-light mt-1">
          {locale === "es"
            ? "Actualiza tu información personal y configura la seguridad de tu cuenta."
            : "Update your personal information and configure your account security."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Summary Info Card */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass flex flex-col items-center text-center gap-4">
            <div className="h-20 w-20 rounded-full border border-[var(--border-strong)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)]">
              <User className="h-10 w-10 text-[var(--accent)]" />
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-[var(--text)]">
                {user?.user_metadata?.full_name || "Cliente"}
              </h4>
              <p className="text-xs text-[var(--text-2)] font-mono truncate max-w-[200px] mt-0.5">{user?.email}</p>
            </div>
            <div className="w-full border-t border-[var(--border)] pt-4 mt-2 flex flex-col gap-2 text-left">
              <span className="text-[9px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                {locale === "es" ? "Miembro Desde" : "Member Since"}
              </span>
              <span className="text-xs text-[var(--text)] font-light">
                {new Date(user?.created_at).toLocaleDateString(locale === "es" ? "es-VE" : "en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </span>
            </div>
          </div>

          <div className="p-5 border border-amber-500/10 bg-amber-500/5 rounded-sm flex gap-3 text-xs leading-normal text-amber-400/90 font-light">
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
            <p>
              {locale === "es"
                ? "Tus datos personales y búsquedas nunca son compartidos con terceros sin tu consentimiento explícito."
                : "Your personal data and searches are never shared with third parties without your explicit consent."}
            </p>
          </div>
        </div>

        {/* Right Side: Configuration Forms */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* General Information Form */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass flex flex-col gap-6"
          >
            <div>
              <h3 className="font-display font-bold text-base text-[var(--text)] mb-1">
                {locale === "es" ? "Información General" : "General Information"}
              </h3>
              <p className="text-xs text-[var(--text-2)] font-light">
                {locale === "es" ? "Datos de contacto primarios de la cuenta." : "Primary contact information for the account."}
              </p>
            </div>

            {profileSuccess && (
              <div className="flex items-center gap-2.5 p-3 border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs rounded-sm">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="flex items-center gap-2.5 p-3 border border-red-500/20 bg-red-500/5 text-red-400 text-xs rounded-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="flex flex-col gap-5">
              {/* Full name input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Nombre completo" : "Full Name"}
                </label>
                <div className="relative">
                  <User className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    {...registerProfile("fullName")}
                    className={`h-10 w-full pl-9 pr-4 text-xs bg-transparent border rounded-sm focus:ring-0 focus:outline-hidden ${
                      profileErrors.fullName
                        ? "border-[var(--danger)] focus:border-[var(--danger)]"
                        : "border-[var(--border)] focus:border-[var(--accent)]"
                    }`}
                  />
                </div>
                {profileErrors.fullName && (
                  <span className="text-[10px] text-[var(--danger)] font-medium">
                    {getErrorMessage(profileErrors.fullName.message!)}
                  </span>
                )}
              </div>

              {/* Email input (read-only) */}
              <div className="flex flex-col gap-1.5 opacity-60">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Correo electrónico (No modificable)" : "Email Address (Read-only)"}
                </label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="h-10 w-full pl-9 pr-4 text-xs bg-[var(--surface-2)] border border-[var(--border)] rounded-sm cursor-not-allowed text-[var(--text-muted)]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" isLoading={profilePending} className="h-10 rounded-sm px-6 font-display uppercase tracking-wider text-xs">
                  <Save className="h-3.5 w-3.5 mr-2" />
                  <span>{locale === "es" ? "Guardar Cambios" : "Save Changes"}</span>
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Change Password Form */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 border border-[var(--border)] bg-[var(--surface)] rounded-sm glass flex flex-col gap-6"
          >
            <div>
              <h3 className="font-display font-bold text-base text-[var(--text)] mb-1">
                {locale === "es" ? "Seguridad" : "Security"}
              </h3>
              <p className="text-xs text-[var(--text-2)] font-light">
                {locale === "es" ? "Actualiza la contraseña para proteger el acceso a tu cuenta." : "Update password to secure your account access."}
              </p>
            </div>

            {passwordSuccess && (
              <div className="flex items-center gap-2.5 p-3 border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs rounded-sm">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="flex items-center gap-2.5 p-3 border border-red-500/20 bg-red-500/5 text-red-400 text-xs rounded-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit(onUpdatePassword)} className="flex flex-col gap-5">
              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Nueva Contraseña" : "New Password"}
                </label>
                <div className="relative">
                  <KeyRound className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <input
                    type="password"
                    {...registerPassword("password")}
                    placeholder="••••••"
                    className={`h-10 w-full pl-9 pr-4 text-xs bg-transparent border rounded-sm focus:ring-0 focus:outline-hidden ${
                      passwordErrors.password
                        ? "border-[var(--danger)] focus:border-[var(--danger)]"
                        : "border-[var(--border)] focus:border-[var(--accent)]"
                    }`}
                  />
                </div>
                {passwordErrors.password && (
                  <span className="text-[10px] text-[var(--danger)] font-medium">
                    {getErrorMessage(passwordErrors.password.message!)}
                  </span>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-muted)] font-display">
                  {locale === "es" ? "Confirmar Nueva Contraseña" : "Confirm New Password"}
                </label>
                <div className="relative">
                  <KeyRound className="absolute top-1/2 left-3 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <input
                    type="password"
                    {...registerPassword("confirmPassword")}
                    placeholder="••••••"
                    className={`h-10 w-full pl-9 pr-4 text-xs bg-transparent border rounded-sm focus:ring-0 focus:outline-hidden ${
                      passwordErrors.confirmPassword
                        ? "border-[var(--danger)] focus:border-[var(--danger)]"
                        : "border-[var(--border)] focus:border-[var(--accent)]"
                    }`}
                  />
                </div>
                {passwordErrors.confirmPassword && (
                  <span className="text-[10px] text-[var(--danger)] font-medium">
                    {getErrorMessage(passwordErrors.confirmPassword.message!)}
                  </span>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" isLoading={passwordPending} className="h-10 rounded-sm px-6 font-display uppercase tracking-wider text-xs">
                  <span>{locale === "es" ? "Actualizar Contraseña" : "Update Password"}</span>
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
