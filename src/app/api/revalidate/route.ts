import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, path } = body;

    // Verify token using the service role key as a secure secret
    const revalidateToken = process.env.SUPABASE_SERVICE_ROLE_KEY || "temp-secret";
    if (secret !== revalidateToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!path) {
      return NextResponse.json({ error: "Path parameter is required" }, { status: 400 });
    }

    // Perform Next.js on-demand cache revalidation
    revalidatePath(path);
    console.log(`Successfully revalidated path: ${path}`);
    
    return NextResponse.json({ revalidated: true, path, now: Date.now() });
  } catch (error: any) {
    console.error("Cache revalidation API error:", error);
    return NextResponse.json(
      { error: error.message || "Revalidation failed" },
      { status: 500 }
    );
  }
}
