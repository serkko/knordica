import { redirect } from "next/navigation";
import { getUserWithRole } from "@/lib/auth/getUserRole";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;

  const hasSupabaseKeys =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "YOUR_ANON_KEY_FROM_SUPABASE_DASHBOARD";

  let userRole = "admin";
  let userName = "Administrador";
  let userEmail = "";
  let avatarUrl: string | null = null;
  let isDemo = true;

  if (hasSupabaseKeys) {
    const authUser = await getUserWithRole();

    if (!authUser) {
      redirect(`/${locale}/login`);
    }

    // Only agents (admin / senior / agent) can access the admin panel
    if (authUser.role === "cliente" || authUser.role === null) {
      redirect(`/${locale}/cliente`);
    }

    userRole = authUser.role ?? "agent";
    userName = authUser.full_name;
    userEmail = authUser.email;
    avatarUrl = authUser.avatar_url;
    isDemo = false;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--background)]">
      {/* Sidebar navigation */}
      <AdminSidebar
        userName={userName}
        userRole={userRole}
        userEmail={userEmail}
        avatarUrl={avatarUrl}
        isDemo={isDemo}
      />

      {/* Main panel workspace */}
      <main className="flex-1 min-h-[300px] md:h-screen md:overflow-y-auto">
        <div className="p-6 sm:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

