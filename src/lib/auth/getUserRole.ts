import { createClient } from "@/lib/supabase/server";

export type UserRole = "admin" | "senior" | "agent" | "cliente" | null;

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
}

/**
 * Server-side utility: returns the authenticated user with their role.
 *
 * Logic:
 *  1. Get user from Supabase auth.
 *  2. Query the `agents` table by user_id.
 *     - If found and active → role comes from agents.role
 *     - If not found      → role = 'cliente'
 *  3. Returns null if not authenticated.
 */
export async function getUserWithRole(): Promise<AuthUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Try to find an agent record
  const { data: agent } = await supabase
    .from("agents")
    .select("full_name, role, active, avatar_url")
    .eq("user_id", user.id)
    .maybeSingle();

  const role: UserRole =
    agent && agent.active ? (agent.role as UserRole) ?? "agent" : "cliente";

  const full_name =
    agent?.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Usuario";

  return {
    id: user.id,
    email: user.email ?? "",
    full_name,
    role,
    avatar_url: agent?.avatar_url ?? null,
  };
}
