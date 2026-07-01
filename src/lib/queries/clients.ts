import { createClient } from "@/lib/supabase/client";
import type { CRMStage, ClientType, CRMClient } from "@/types/panel";

// ─── Mapeo de campos: DB usa "status", el CRM usa "stage" ───────────────────
// Son el mismo valor, solo se renombra en la interfaz para claridad.
// La tabla `leads` en Supabase tiene el campo `status`.

export interface Lead extends CRMClient {
  // Hereda todos los campos de CRMClient que ya están en la tabla leads:
  // id, full_name, email, phone, whatsapp, client_type, agent_id,
  // budget_min, budget_max, budget_currency, interested_zones, interested_types,
  // properties_shown, notes, last_contact, next_action, next_action_date,
  // created_at, updated_at
  // + campos específicos de lead:
  intent?: string | null;
  message?: string | null;
  source?: string | null;
  priority?: "alta" | "media" | "baja";
  property_id?: string | null;
}

// Campos que seleccionamos de la tabla leads para el CRM
const CRM_SELECT_FIELDS = [
  "id",
  "full_name",
  "email",
  "phone",
  "whatsapp",
  "status",           // mapea a stage en CRMClient
  "client_type",
  "agent_id",
  "budget_min",
  "budget_max",
  "budget_currency",
  "interested_zones",
  "interested_types",
  "properties_shown",
  "notes",
  "last_contact",
  "next_action",
  "next_action_date",
  "priority",
  "intent",
  "source",
  "req_bedrooms",
  "req_bathrooms",
  "req_parking",
  "bath_preference",
  "cedula_rif",
  "preferred_payment",
  "urgency",
  "photo_url",
  "created_at",
  "updated_at",
].join(", ");

// Convierte una fila de la DB (con `status`) a CRMClient (con `stage`)
function rowToClient(row: any): CRMClient {
  const { status, ...rest } = row;
  return {
    ...rest,
    stage: (status as CRMStage) ?? "nuevo",
  } as CRMClient;
}

// ─── Obtener clientes del agente ─────────────────────────────────────────────
export async function getClients(
  userId: string | null,
  role: string | null
): Promise<CRMClient[]> {
  const supabase = createClient();

  let query = supabase
    .from("leads")
    .select(CRM_SELECT_FIELDS)
    .order("created_at", { ascending: false });

  // Admin ve todos los leads; agente solo los suyos
  if (role !== "admin" && userId) {
    query = query.eq("agent_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[clients] Error fetching leads:", error.message);
    return [];
  }

  return (data as any[] ?? []).map(rowToClient);
}

// ─── Crear o actualizar un cliente ───────────────────────────────────────────
export async function upsertClient(
  client: Partial<CRMClient> & { agent_id: string }
): Promise<CRMClient | null> {
  const supabase = createClient();

  // Mapeamos stage → status para la DB
  const { stage, ...rest } = client;

  // Sanitizar fechas vacías ("" -> null) para evitar errores sintácticos de fecha en Postgres
  const sanitized = { ...rest } as any;
  if (sanitized.next_action_date === "") {
    sanitized.next_action_date = null;
  }
  if (sanitized.last_contact === "") {
    sanitized.last_contact = null;
  }
  if (sanitized.bath_preference === "") {
    sanitized.bath_preference = null;
  }

  const payload = {
    ...sanitized,
    status: stage ?? "nuevo",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("leads")
    .upsert(payload, { onConflict: "id" })
    .select(CRM_SELECT_FIELDS)
    .single();

  if (error) {
    console.error("[clients] Error upserting client:", error.message);
    return null;
  }

  return rowToClient(data);
}

// ─── Actualizar solo el stage (status en DB) ─────────────────────────────────
export async function updateClientStage(
  id: string,
  stage: CRMStage
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("leads")
    .update({ status: stage, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[clients] Error updating stage:", error.message);
    return false;
  }
  return true;
}

// ─── Archivar cliente (soft-delete → perdido) ────────────────────────────────
export async function archiveClient(id: string): Promise<boolean> {
  return updateClientStage(id, "perdido");
}

// ─── Guardar notas ───────────────────────────────────────────────────────────
export async function saveClientNotes(
  id: string,
  notes: string
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("leads")
    .update({ notes, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[clients] Error saving notes:", error.message);
    return false;
  }
  return true;
}

// ─── Guardar próxima acción ──────────────────────────────────────────────────
export async function saveNextAction(
  id: string,
  next_action: string,
  next_action_date: string | null
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("leads")
    .update({
      next_action,
      next_action_date,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("[clients] Error saving next action:", error.message);
    return false;
  }
  return true;
}
