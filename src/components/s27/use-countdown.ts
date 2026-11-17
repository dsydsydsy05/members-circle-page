import { useEffect, useState } from "react";
import { countdownParts } from "@/lib/s27-programs";

/** Live countdown to `opensAt`; null until mounted, so server and client render the same markup. */
export function useCountdown(opensAt: string) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return now === null ? null : countdownParts(opensAt, now);
}

export const pad = (value: number) => String(value).padStart(2, "0");
