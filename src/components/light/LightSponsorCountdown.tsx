import { useEffect, useState } from "react";

// Deadline: Sept 15, 2026 00:00 US Eastern (EDT, UTC-4)
const DEADLINE = Date.UTC(2026, 8, 15, 4, 0, 0);

type Parts = { days: string; hours: string; minutes: string; seconds: string };

function getParts(now: number): Parts {
  const diff = Math.max(0, DEADLINE - now);
  const total = Math.floor(diff / 1000);
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  return {
    days: pad(Math.floor(total / 86400), 3),
    hours: pad(Math.floor((total % 86400) / 3600)),
    minutes: pad(Math.floor((total % 3600) / 60)),
    seconds: pad(total % 60),
  };
}

function FlapGroup({ value, label }: { value: string; label: string }) {
  return (
    <div className="light-flap-group">
      <div className="light-flap-group__tiles">
        {value.split("").map((char, index) => (
          <span key={`${label}-${index}`} className="light-flap" data-char={char}>
            <i aria-hidden="true" />
            <b>{char}</b>
          </span>
        ))}
      </div>
      <span className="light-flap-group__label">{label}</span>
    </div>
  );
}

export function LightSponsorCountdown() {
  const [parts, setParts] = useState<Parts>(() => getParts(DEADLINE));

  useEffect(() => {
    setParts(getParts(Date.now()));
    const timer = window.setInterval(() => setParts(getParts(Date.now())), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="light-flap-board" role="timer" aria-label="Sponsorship application deadline">
      <div className="light-flap-board__head">
        <span>Sponsorship window / closes</span>
        <span>Sep 15, 2026 · 00:00 ET</span>
      </div>
      <div className="light-flap-board__row">
        <FlapGroup value={parts.days} label="Days" />
        <FlapGroup value={parts.hours} label="Hours" />
        <FlapGroup value={parts.minutes} label="Minutes" />
        <FlapGroup value={parts.seconds} label="Seconds" />
      </div>
      <div className="light-flap-board__rail" aria-hidden="true">
        {Array.from({ length: 22 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>
    </div>
  );
}
