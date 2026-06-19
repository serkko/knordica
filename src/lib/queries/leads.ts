import { createClient as createBrowserClient } from "../supabase/client";

export interface LeadInput {
  property_id?: string;
  agent_id?: string;
  full_name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  intent?: string;
  message?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export async function createLead(input: LeadInput): Promise<boolean> {
  const supabase = createBrowserClient();

  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD") {
    try {
      const { error } = await supabase.from("leads").insert([
        {
          property_id: input.property_id || null,
          agent_id: input.agent_id || null,
          full_name: input.full_name,
          email: input.email || null,
          phone: input.phone || null,
          whatsapp: input.whatsapp || null,
          intent: input.intent || "info",
          message: input.message || null,
          source: input.source || "web_form",
          utm_source: input.utm_source || null,
          utm_medium: input.utm_medium || null,
          utm_campaign: input.utm_campaign || null,
          status: "nuevo",
          priority: "media",
        },
      ]);

      if (!error) return true;
      console.error("Error creating lead in Supabase:", error);
    } catch (e) {
      console.error("Exception creating lead in Supabase:", e);
    }
  }

  // Fallback: Save to LocalStorage so development leads aren't lost
  try {
    const existing = JSON.parse(localStorage.getItem("knordica-dev-leads") || "[]");
    existing.push({
      ...input,
      id: Math.random().toString(36).substring(7),
      created_at: new Date().toISOString(),
    });
    localStorage.setItem("knordica-dev-leads", JSON.stringify(existing));
    console.log("Saved lead to local development fallback storage:", input);
    return true;
  } catch {
    return true;
  }
}
