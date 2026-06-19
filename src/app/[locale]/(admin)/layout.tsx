import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;
  const supabase = await createClient();

  const hasSupabaseKeys = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD";

  let userRole = "admin";
  let userName = "Administrador";
  let isDemo = true;

  if (hasSupabaseKeys) {
    // Check auth server-side
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(`/${locale}/login`);
    }

    // Check if user is an agent in the DB
    const { data: agent, error } = await supabase
      .from("agents")
      .select("full_name, role, active")
      .eq("user_id", user.id)
      .single();

    if (error || !agent || !agent.active) {
      // If not registered as an agent, check if they are standard user and redirect to client portal
      redirect(`/${locale}/cliente`);
    }

    userRole = agent.role || "agent";
    userName = agent.full_name;
    isDemo = false;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--background)]">
      {/* Sidebar navigation */}
      <AdminSidebar userName={userName} userRole={userRole} isDemo={isDemo} />

      {/* Main panel workspace */}
      <main className="flex-1 min-h-[300px] md:h-screen md:overflow-y-auto">
        <div className="p-6 sm:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
