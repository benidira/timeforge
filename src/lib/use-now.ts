"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Returns the current time in milliseconds (or null before the first client tick, so the
 * server-rendered HTML never contains a time that would mismatch on hydration).
 * Ticks at the start of each second while `active` is true.
 */
export function useNow(active = true): { now: number | null; refresh: () => void } {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!active) return;
    let timer: number;
    const tick = () => {
      setNow(Date.now());
      timer = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
    };
    timer = window.setTimeout(tick, 0);
    return () => window.clearTimeout(timer);
  }, [active]);

  const refresh = useCallback(() => setNow(Date.now()), []);
  return { now, refresh };
}
