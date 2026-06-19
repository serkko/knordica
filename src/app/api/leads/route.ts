import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as zod from "zod";

const leadSchema = zod.object({
  fullName: zod.string().min(3),
  email: zod.string().email(),
  phone: zod.string().min(7),
  intent: zod.string(),
  message: zod.string().optional(),
  propertyId: zod.string().uuid().nullable().optional(),
  agentId: zod.string().uuid().nullable().optional(),
  source: zod.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate inputs
    const result = leadSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation Error", details: result.error.format() },
        { status: 400 }
      );
    }

    const data = result.data;
    const supabase = await createClient();
    
    // Check if Supabase keys are defined
    const hasKeys = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD";

    if (hasKeys) {
      const { data: dbData, error } = await supabase
        .from("leads")
        .insert([
          {
            full_name: data.fullName,
            email: data.email,
            phone: data.phone,
            intent: data.intent,
            message: data.message || null,
            property_id: data.propertyId || null,
            agent_id: data.agentId || null,
            source: data.source || "api_contact_form",
            status: "nuevo",
            priority: "media",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Database error inserting lead:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      return NextResponse.json({ success: true, data: dbData });
    }

    // Development Fallback if Supabase is offline
    console.log("Mock lead recorded successfully on server API route:", data);
    return NextResponse.json({
      success: true,
      data: {
        id: Math.random().toString(36).substring(7),
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        intent: data.intent,
        message: data.message,
        source: data.source,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in leads API route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
