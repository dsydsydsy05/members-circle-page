import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Member } from "@/lib/community-data";

function normalizeUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function hostnameOf(url: string) {
  try {
    return new URL(normalizeUrl(url)).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const no = (n?: number | null) => (n ? String(n).padStart(4, "0") : "----");

/** Fanned paper sheets peeking above the pocket, like the macOS folder icon. */
function Papers({ lifted }: { lifted: boolean }) {
  const sheets = [
    { rot: 8, x: 26, y: 6, w: 62 },
    { rot: 4, x: 14, y: 2, w: 66 },
    { rot: -2, x: -2, y: 0, w: 70 },
  ];
  return (
    <>
      {sheets.map((s, i) => (
        <div
          key={i}
          className="absolute left-[8%] rounded-xl border border-white/50"
          style={{
            width: `${s.w}%`,
            top: `${(lifted ? 2 : 9) + s.y}%`,
            height: "58%",
            background:
              "linear-gradient(165deg, rgba(255,255,255,0.94) 0%, rgba(244,238,231,0.9) 60%, rgba(228,216,206,0.88) 100%)",
            boxShadow: "0 16px 30px -20px rgba(0,0,0,0.65)",
            transform: `translateX(${s.x}px) rotate(${s.rot}deg)`,
            transition: "top 600ms cubic-bezier(0.22,1,0.36,1)",
            zIndex: 10 + i,
          }}
        >
          <div className="flex h-full flex-col gap-2 p-4">
            {[70, 88, 52, 78].map((w, k) => (
              <div
                key={k}
                className="h-[4px] rounded-full bg-[color:var(--cocoa)]/15"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

/** Warm translucent folder: back shell + fanned papers + frosted front pocket. */
function Folder({
  member,
  lifted,
  className = "",
}: {
  member: Member;
  lifted?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative h-full w-full ${className}`}>
      {/* back shell (with tab) */}
      <div className="absolute inset-x-0 bottom-0 top-[8%]">
        <div
          className="absolute -top-[6%] left-[3%] h-[14%] w-[42%] rounded-t-[1.1rem]"
          style={{
            background: "linear-gradient(160deg, #5a4034 0%, #3a2a22 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16)",
          }}
        />
        <div
          className="absolute inset-0 rounded-[1.5rem]"
          style={{
            background:
              "linear-gradient(160deg, #5c4034 0%, #3d2c24 46%, #2a1f1a 100%)",
            boxShadow:
              "0 34px 70px -30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        />
      </div>

      <Papers lifted={!!lifted} />

      {/* frosted front pocket */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 flex flex-col justify-between overflow-hidden rounded-[1.5rem] border border-white/25 p-5"
        style={{
          height: "60%",
          background:
            "linear-gradient(165deg, rgba(255,255,255,0.34) 0%, rgba(233,169,130,0.16) 42%, rgba(69,48,39,0.32) 100%)",
          backdropFilter: "blur(16px) saturate(150%)",
          boxShadow:
            "0 26px 50px -26px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.5)",
        }}
      >
        <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.24em] text-[color:var(--cream)]/75">
          <span>THE ROOM</span>
          <span>NO. {no(member.memberNo)}</span>
        </div>

        <div className="flex items-end gap-3">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={member.name}
              className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-white/50"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/25 text-sm font-semibold text-[color:var(--cream)]">
              {member.initials}
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate text-base font-semibold tracking-tight text-[color:var(--cream)]">
              {member.name}
            </div>
            <div className="truncate text-[11px] text-[color:var(--cream)]/70">
              {member.role}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-[color:var(--cream)]/60">
          <span className="truncate">{member.city}</span>
          <span className="shrink-0">Open file →</span>
        </div>
      </div>
    </div>
  );
}

/** The member detail sheet, shown centered over a blurred backdrop. */
function DetailSheet({ member, shown }: { member: Member; shown: boolean }) {
  return (
    <div
      className="w-full overflow-hidden rounded-2xl border border-white/25"
      style={{
        background:
          "linear-gradient(165deg, rgba(255,255,255,0.20) 0%, rgba(233,169,130,0.12) 45%, rgba(40,30,25,0.45) 100%)",
        backdropFilter: "blur(26px) saturate(160%)",
        boxShadow:
          "0 40px 90px -40px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.4)",
        transform: shown ? "translateY(0) scale(1)" : "translateY(18px) scale(0.96)",
        opacity: shown ? 1 : 0,
        transition:
          "transform 520ms cubic-bezier(0.22,1,0.36,1), opacity 420ms ease",
      }}
    >
      <div className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto p-7 text-[color:var(--cream)]">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-[color:var(--cream)]/60">
          <span>Member file</span>
          <span>NO. {no(member.memberNo)}</span>
        </div>

        <div className="flex items-center gap-4">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={member.name}
              className="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-white/40"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/20 text-xl font-semibold">
              {member.initials}
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate text-2xl font-semibold tracking-tight">
              {member.name}
            </div>
            <div className="truncate text-sm text-[color:var(--cream)]/70">
              {member.role}
            </div>
            {member.city ? (
              <div className="truncate text-sm text-[color:var(--cream)]/50">
                {member.city}
              </div>
            ) : null}
          </div>
        </div>

        {member.bio ? (
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--cream)]/50">
              About
            </div>
            <p className="mt-1 text-sm leading-relaxed text-[color:var(--cream)]/85">
              {member.bio}
            </p>
          </div>
        ) : null}

        {member.tags.length ? (
          <div className="flex flex-wrap gap-1.5">
            {member.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] text-[color:var(--cream)]/80"
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}

        {member.website ? (
          <a
            href={normalizeUrl(member.website)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-2 inline-flex items-center justify-between rounded-xl border border-white/25 bg-white/15 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/25"
          >
            Visit {hostnameOf(member.website)}
            <span>→</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}

export function MemberFlipCard({ member }: { member: Member }) {
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = original;
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setEntered(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="h-80">
        <button
          type="button"
          onClick={() => setOpen(true)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="relative h-full w-full text-left transition-transform duration-500 hover:-translate-y-1"
          aria-label={`Open file for ${member.name}`}
        >
          <Folder member={member} lifted={hover} />
        </button>
      </div>

      {open &&
        createPortal(
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-6 transition-all duration-500 ${
              entered ? "bg-black/60 backdrop-blur-xl" : "bg-black/0"
            }`}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={`${member.name} member file`}
          >
            <div
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={close}
                className={`absolute -top-11 right-0 rounded-full p-2 text-white/80 transition-opacity duration-300 hover:bg-white/10 hover:text-white ${
                  entered ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                aria-label="Close file"
              >
                <CloseIcon className="h-6 w-6" />
              </button>
              <DetailSheet member={member} shown={entered} />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
