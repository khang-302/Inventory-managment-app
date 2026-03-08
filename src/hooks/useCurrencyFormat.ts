import { useState, useEffect, useCallback } from 'react';
import { getSetting } from '@/db/database';
import {
  formatCurrencyAdaptive,
  formatCurrencyAdaptiveFull,
  type CurrencyDisplayMode,
} from '@/utils/currency';

/**
 * Settings-reactive currency formatting hook.
 * Reads `currencyDisplayMode` from DB and provides formatting functions.
 */
export function useCurrencyFormat() {
  const [mode, setMode] = useState<CurrencyDisplayMode>('compact');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const saved = await getSetting<CurrencyDisplayMode>('currencyDisplayMode');
      if (!cancelled && saved) setMode(saved);
    };
    load();

    // Poll every 2s to pick up setting changes (lightweight)
    const interval = setInterval(load, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const formatValue = useCallback(
    (amount: number) => formatCurrencyAdaptive(amount, mode),
    [mode],
  );

  const formatFull = useCallback(
    (amount: number) => formatCurrencyAdaptiveFull(amount, mode),
    [mode],
  );

  return { displayMode: mode, formatValue, formatFull };
}
