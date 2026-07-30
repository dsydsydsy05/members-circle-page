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

/** Fanned white sheets peeking out of the folder, staggered to the right. */
function Papers({ lifted }: { lifted: boolean }) {
  const sheets = [
    { rot: 3.5, x: 30, y: 10, w: 46, o: 0.82 },
    { rot: 2, x: 16, y: 5, w: 50, o: 0.9 },
    { rot: -1.5, x: 0, y: 0, w: 54, o: 1 },
  ];
  return (
    <>
      {sheets.map((s, i) => (
        <div
          key={i}
          className="absolute left-[12%] rounded-2xl"
          style={{
            width: `${s.w}%`,
            top: `${(lifted ? -1 : 4) + s.y * 0.5}%`,
            height: "62%",
            background:
              "linear-gradient(180deg, #ffffff 0%, #f6f4f2 100%)",
            opacity: s.o,
            boxShadow: "0 18px 34px -22px rgba(0,0,0,0.7)",
            transform: `translateX(${s.x}%) rotate(${s.rot}deg)`,
            transformOrigin: "bottom center",
            transition: "top 600ms cubic-bezier(0.22,1,0.36,1)",
            zIndex: 10 + i,
          }}
        >
          <div className="flex h-full flex-col gap-[6px] p-5 pt-6">
            {[62, 40, 78, 34].map((w, k) => (
              <div
                key={k}
                className="h-[7px] rounded-full bg-[#000]/10"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

/** Warm translucent folder: dark shell + fanned papers + frosted front pocket. */
function Folder({ member, lifted }: { member: Member; lifted?: boolean }) {
  return (
    <div className="relative h-full w-full">
      {/* dark back shell */}
      <div
        className="absolute inset-x-0 bottom-0 top-[2%] rounded-[2rem]"
        style={{
          background:
            "linear-gradient(155deg, #43342c 0%, #2b211c 45%, #1b1512 100%)",
          boxShadow:
            "0 40px 70px -34px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.10)",
        }}
      />

      <Papers lifted={!!lifted} />

      {/* frosted front pocket */}
      <div
        className="absolute inset-x-0 bottom-[2%] z-20 flex flex-col justify-between overflow-hidden rounded-[1.8rem] border border-white/25 p-6"
        style={{
          height: "72%",
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.30) 0%, rgba(233,169,130,0.14) 45%, rgba(45,32,26,0.42) 100%)",
          backdropFilter: "blur(18px) saturate(150%)",
          boxShadow:
            "0 26px 50px -26px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.55)",
        }}
      >
        <div className="flex items-start justify-between">
          <span className="text-[10px] uppercase tracking-[0.34em] text-[color:var(--cream)]/85">
            THE ROOM
          </span>
        </div>

        <div className="flex items-center justify-end text-[10px] tracking-[0.24em] text-[color:var(--cream)]/70">
          NO. {no(member.memberNo)}
        </div>

        <div className="flex items-center gap-4">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={member.name}
              className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-white/40"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/25 text-base font-semibold text-[color:var(--cream)]">
              {member.initials}
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate text-xl font-semibold tracking-tight text-[color:var(--cream)]">
              {member.name}
            </div>
            <div className="truncate text-[13px] text-[color:var(--cream)]/70">
              {member.role}
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between text-[12px] text-[color:var(--cream)]/65">
          <span className="truncate">{member.city}</span>
          <span className="shrink-0 text-[11px] uppercase tracking-[0.2em] opacity-80">
            Open file →
          </span>
        </div>
      </div>
    </div>
  );
}

/** The white member document, pulled out of the folder and centered. */
function DocumentSheet({ member, shown }: { member: Member; shown: boolean }) {
  return (
    <div
      className="w-full overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f5f2ef 100%)",
        boxShadow:
          "0 50px 110px -40px rgba(0,0,0,0.85), 0 2px 0 rgba(255,255,255,0.6) inset",
        transform: shown
          ? "translateY(0) scale(1) rotate(0deg)"
          : "translateY(90px) scale(0.9) rotate(-2deg)",
        opacity: shown ? 1 : 0,
        transition:
          "transform 620ms cubic-bezier(0.22,1,0.36,1), opacity 380ms ease",
      }}
    >
      <div className="flex max-h-[82vh] flex-col gap-5 overflow-y-auto p-8 text-[#221a15]">
        <div className="flex items-center justify-between border-b border-black/10 pb-4 text-[10px] uppercase tracking-[0.3em] text-black/45">
          <span>THE ROOM</span>
          <span>NO. {no(member.memberNo)}</span>
        </div>

        <div className="flex items-center gap-4">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={member.name}
              className="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-black/10"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-black/8 text-xl font-semibold">
              {member.initials}
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate text-2xl font-semibold tracking-tight">
              {member.name}
            </div>
            <div className="truncate text-sm text-black/60">{member.role}</div>
            {member.city ? (
              <div className="truncate text-sm text-black/40">{member.city}</div>
            ) : null}
          </div>
        </div>

        {member.bio ? (
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-black/40">
              About
            </div>
            <p className="mt-1 text-sm leading-relaxed text-black/75">
              {member.bio}
            </p>
          </div>
        ) : null}

        {member.tags.length ? (
          <div className="flex flex-wrap gap-1.5">
            {member.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-black/10 bg-black/[0.04] px-2.5 py-0.5 text-[11px] text-black/70"
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
            className="mt-1 inline-flex items-center justify-between rounded-xl border border-black/10 bg-black/[0.04] px-4 py-3 text-sm font-medium transition-colors hover:bg-black/[0.08]"
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
      <div className="aspect-[4/3]">
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
              entered ? "bg-black/55 backdrop-blur-2xl" : "bg-black/0"
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
              <DocumentSheet member={member} shown={entered} />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
