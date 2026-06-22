import { useEffect, useState } from 'react';
import type { PanelRole } from '@/types/panel';
import { usePanelStore } from '@/store/panelStore';

interface UsePanelRoleResult {
  role: PanelRole | null;
  userId: string | null;
  loading: boolean;
}

/**
 * Reads the current user's role from Supabase auth metadata.
 * Falls back to checking the `agents` table.
 * If not found in agents → role = 'user'.
 */
export function usePanelRole(): UsePanelRoleResult {
  const { userRole, userId, setUser } = usePanelStore();
  const [loading, setLoading] = useState(!userRole);

  useEffect(() => {
    if (userRole && userId) {
      setLoading(false);
      return;
    }

    async function fetchRole() {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // 1. Try metadata first (fast)
        const metaRole = user.user_metadata?.role as PanelRole | undefined;
        if (metaRole && ['user', 'agent', 'senior', 'admin'].includes(metaRole)) {
          setUser(user.id, metaRole);
          setLoading(false);
          return;
        }

        // 2. Fallback: check agents table
        const { data: agentRow } = await supabase
          .from('agents')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        const resolvedRole: PanelRole = (agentRow?.role as PanelRole) ?? 'user';
        setUser(user.id, resolvedRole);
      } catch (err) {
        console.error('[usePanelRole] Error fetching role:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, [userRole, userId, setUser]);

  return { role: userRole, userId, loading };
}
