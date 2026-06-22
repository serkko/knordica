import { useCallback, useEffect, useRef } from 'react';
import type { AutoSaveStatus } from '@/types/panel';
import { usePanelStore } from '@/store/panelStore';

interface UseAutoSaveResult {
  status: AutoSaveStatus;
  lastSavedAt: Date | null;
  triggerSave: () => void;
}

/**
 * Debounced auto-save hook.
 * @param saveFn  Async function that performs the actual save.
 * @param debounceMs  Delay in ms before triggering save (default 3000).
 */
export function useAutoSave(
  saveFn: () => Promise<void>,
  debounceMs = 3000,
): UseAutoSaveResult {
  const { autoSaveStatus, autoSaveLastAt, setAutoSaveStatus } = usePanelStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveFnRef = useRef(saveFn);

  // Keep saveFn ref up to date without re-running effects
  useEffect(() => {
    saveFnRef.current = saveFn;
  }, [saveFn]);

  const runSave = useCallback(async () => {
    setAutoSaveStatus('saving');
    try {
      await saveFnRef.current();
      setAutoSaveStatus('saved');
    } catch (err) {
      console.error('[useAutoSave] Save failed:', err);
      setAutoSaveStatus('error');
    }
  }, [setAutoSaveStatus]);

  const triggerSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      runSave();
    }, debounceMs);
  }, [runSave, debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    status: autoSaveStatus,
    lastSavedAt: autoSaveLastAt,
    triggerSave,
  };
}
