import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // 1. Enforce file size limit (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 10MB limit" },
        { status: 400 }
      );
    }

    // 2. Enforce allowed MIME types (images only)
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WEBP, AVIF, and GIF images are allowed." },
        { status: 400 }
      );
    }

    const hasSupabaseKeys = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD";

    if (hasSupabaseKeys) {
      const supabase = await createClient();
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `property-uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from("property-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Supabase storage upload error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const { data: urlData } = supabase.storage
        .from("property-images")
        .getPublicUrl(filePath);

      return NextResponse.json({ url: urlData.publicUrl });
    } else {
      // Local development fallback: Return a realistic Unsplash mockup cover image
      // To simulate diverse uploads, we select a random Unsplash house/interior URL
      const mockUrls = [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
      ];
      const randomUrl = mockUrls[Math.floor(Math.random() * mockUrls.length)];
      
      return NextResponse.json({ 
        url: randomUrl,
        note: "Local development mode simulation: Returned a random Unsplash placeholder image."
      });
    }
  } catch (error: any) {
    console.error("API upload exception:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
