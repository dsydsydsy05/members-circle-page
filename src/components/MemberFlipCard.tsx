import { useState } from "react";
import type { Member } from "@/lib/community-data";

export function MemberFlipCard({ member }: { member: Member }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="perspective-1200 h-72">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="preserve-3d relative h-full w-full text-left transition-transform duration-700"
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        aria-label={`Flip card for ${member.name}`}
      >
        {/* Front — mini工牌 */}
        <div className="backface-hidden absolute inset-0 flex flex-col justify-between rounded-xl bg-card p-5 ring-1 ring-border shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>INSIDER</span>
            <span>NO. {member.id.padStart(3, "0")}</span>
          </div>
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--cocoa)] text-lg font-semibold text-[color:var(--cream)]">
              {member.initials}
            </div>
            <div className="mt-3 text-xl font-semibold tracking-tight">{member.name}</div>
            <div className="text-sm text-muted-foreground">{member.role}</div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{member.city}</span>
            <span>Tap to flip →</span>
          </div>
        </div>

        {/* Back — details + visit website */}
        <div
          className="backface-hidden absolute inset-0 flex flex-col justify-between rounded-xl bg-[color:var(--cocoa)] p-5 text-[color:var(--cream)] shadow-sm"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] opacity-70">About</div>
            <p className="mt-2 text-sm leading-relaxed opacity-95">{member.bio}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {member.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-[color:var(--cream)]/25 px-2 py-0.5 text-[10px] opacity-90"
              >
                {t}
              </span>
            ))}
          </div>
          <a
            href={member.website}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-between rounded-md bg-[color:var(--cream)] px-3 py-2 text-xs font-medium text-[color:var(--cocoa)] hover:opacity-90"
          >
            Visit {new URL(member.website).hostname.replace("www.", "")}
            <span>→</span>
          </a>
        </div>
      </button>
    </div>
  );
}
