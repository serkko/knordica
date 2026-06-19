"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface LogoutButtonProps {
  text: string;
}

export function LogoutButton({ text }: LogoutButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Error signing out", err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 w-full px-4 py-2 rounded-sm text-xs font-semibold text-red-400/80 hover:bg-red-500/5 hover:text-red-400 transition-all cursor-pointer text-left"
    >
      <LogOut className="h-4 w-4 shrink-0" />
      <span>{text}</span>
    </button>
  );
}
