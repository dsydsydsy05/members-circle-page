import { useEffect, useState } from "react";

// Deadline: Sept 15, 2026 00:00 US Eastern (EDT, UTC-4)
const DEADLINE = Date.UTC(2026, 8, 15, 4, 0, 0);

type Parts = { days: string; hours: string; minutes: string; seconds: string };

function getParts(now: number): Parts {
  const diff = Math.max(0, DEADLINE - now);
  const total = Math.floor(diff / 1000);
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  return {
    days: pad(Math.floor(total / 86400)),
    hours: pad(Math.floor((total % 86400) / 3600)),
    minutes: pad(Math.floor((total % 3600) / 60)),
    seconds: pad(total % 60),
  };
}

const groups: { key: keyof Parts; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

export function LightSponsorCountdown() {
  const [parts, setParts] = useState<Parts>(() => getParts(DEADLINE));

  useEffect(() => {
    setParts(getParts(Date.now()));
    const timer = window.setInterval(() => setParts(getParts(Date.now())), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="light-countdown" role="timer" aria-label="Sponsorship application deadline">
      <div className="light-countdown__grid">
        {groups.map(({ key, label }) => (
          <div key={key} className="light-countdown__cell">
            <div className="light-countdown__digits" aria-label={`${label}: ${parts[key]}`}>
              {parts[key].split("").map((char, index) => (
                <span key={`${key}-${index}`} className="light-countdown__digit">
                  {char}
                </span>
              ))}
            </div>
            <span className="light-countdown__label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
