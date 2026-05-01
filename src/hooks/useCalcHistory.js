import { useState, useCallback } from 'react';
import * as storage from '../utils/storage.js';

const STORAGE_KEY = 'calc_history';
const MAX_ENTRIES = 10;

/**
 * Persists the last MAX_ENTRIES calculator results across sessions.
 * Each entry: { slug, name, result, unit, interpretation, timestamp }
 */
export function useCalcHistory() {
  const [history, setHistory] = useState(() => {
    const stored = storage.get(STORAGE_KEY);
    return Array.isArray(stored) ? stored : [];
  });

  const add = useCallback(({ slug, name, result, unit, interpretation }) => {
    const entry = {
      slug,
      name,
      result: String(result),
      unit: unit ?? '',
      interpretation,
      timestamp: Date.now(),
    };
    setHistory(prev => {
      const updated = [entry, ...prev].slice(0, MAX_ENTRIES);
      storage.set(STORAGE_KEY, updated);
      return updated;
    });
  }, []);

  const clear = useCallback(() => {
    storage.remove(STORAGE_KEY);
    setHistory([]);
  }, []);

  return { history, add, clear };
}
