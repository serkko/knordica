import { useEffect, useState } from 'react';
import type { PanelRole, KPIStat } from '@/types/panel';

interface UseKPIDataResult {
  stats: KPIStat[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches KPI stats from Supabase.
 * Admin sees global stats; agent sees only their own properties.
 */
export function useKPIData(role?: PanelRole | null, agentId?: string | null): UseKPIDataResult {
  const [stats, setStats] = useState<KPIStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!role) return;

    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        const isGlobal = role === 'admin' || role === 'senior';

        let query = supabase
          .from('properties')
          .select('id, status, price, price_currency, agent_id, created_at');

        if (!isGlobal && agentId) {
          query = query.eq('agent_id', agentId);
        }

        const { data, error: dbError } = await query;
        if (dbError) throw dbError;

        const properties = data ?? [];
        const active = properties.filter((p) => p.status === 'activa');
        const totalValue = active.reduce((sum, p) => sum + (p.price ?? 0), 0);

        // Build last-7-days sparkline from created_at
        const now = Date.now();
        const sparkline = Array.from({ length: 7 }, (_, i) => {
          const dayStart = now - (6 - i) * 86400000;
          const dayEnd = dayStart + 86400000;
          return properties.filter((p) => {
            const t = new Date(p.created_at).getTime();
            return t >= dayStart && t < dayEnd;
          }).length;
        });

        const built: KPIStat[] = [
          {
            key: 'propiedades',
            title_es: 'Propiedades Activas',
            title_en: 'Active Listings',
            value: active.length,
            sparkline,
          },
          {
            key: 'portafolio',
            title_es: 'Valor del Portafolio',
            title_en: 'Portfolio Value',
            value: totalValue,
            is_currency: true,
            unit: 'USD',
          },
          {
            key: 'vistas',
            title_es: 'Vistas Este Mes',
            title_en: 'Views This Month',
            value: Math.floor(Math.random() * 2000) + 500, // placeholder until views table exists
            change: 12,
            sparkline: Array.from({ length: 7 }, () => Math.floor(Math.random() * 200) + 50),
          },
          {
            key: 'clientes',
            title_es: 'Clientes en Pipeline',
            title_en: 'Clients in Pipeline',
            value: Math.floor(Math.random() * 40) + 5, // placeholder until crm_clients table exists
            change: 4,
          },
        ];

        setStats(built);
      } catch (err) {
        console.error('[useKPIData] Error:', err);
        setError('Error loading stats');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [role, agentId]);

  return { stats, loading, error };
}
