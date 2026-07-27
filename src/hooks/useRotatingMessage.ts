import { useEffect, useState } from 'react';

export function useRotatingMessage(messages: string[], intervalMs = 2800, active = true): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || messages.length === 0) return;
    setIndex(0);
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [active, messages, intervalMs]);

  return messages[index] ?? '';
}
