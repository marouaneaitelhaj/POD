import { useCallback, useEffect, useState } from 'react';

function readValue<T>(key: string, initialValue: T): T {
  if (typeof window === 'undefined') return initialValue;
  try {
    const item = window.localStorage.getItem(key);
    return item !== null ? (JSON.parse(item) as T) : initialValue;
  } catch {
    return initialValue;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => readValue(key, initialValue));

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Storage may be unavailable (private mode, quota exceeded); ignore.
        }
        return next;
      });
    },
    [key],
  );

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
    setStoredValue(initialValue);
  }, [key, initialValue]);

  useEffect(() => {
    setStoredValue(readValue(key, initialValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [storedValue, setValue, remove];
}

export const STORAGE_KEYS = {
  lastLinks: 'pod-studio:last-links',
  candidateResponse: 'pod-studio:candidate-response',
  selectedAsin: 'pod-studio:selected-asin',
  generatedResult: 'pod-studio:generated-result',
} as const;
