import { useCallback, useState } from "react";

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

/**
 * Persists a piece of state to localStorage, keeping it in sync across
 * re-renders. Falls back to `initialValue` if storage is empty, unavailable
 * (e.g. private browsing), or holds unparsable data.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback<SetValue<T>>(
    (value) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Storage can be unavailable (e.g. private browsing) — keep the
          // in-memory value updated even if persisting it fails.
        }
        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue];
}
