import { useEffect, useState, type MouseEvent } from "react";
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

/** Dark folder shell: tab + body, sitting behind the papers. */
function FolderBack() {
  return (
    <div className="absolute inset-x-0 bottom-0 top-[10%]">
      {/* tab */}
      <div
        className="absolute -top-[7%] left-0 h-[16%] w-[46%] rounded-t-2xl"
        style={{
          background: "linear-gradient(150deg, #3b2b23 0%, #241b17 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
      />
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(155deg, #43302a 0%, #2a1f1a 45%, #161316 100%)",
          boxShadow:
            "0 30px 70px -30px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.10), inset 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      />
    </div>
  );
}

/** Fanned paper sheets peeking above the pocket. */
function Papers({ member, lifted }: { member: Member; lifted: boolean }) {
  const sheets = [
    { rot: -7, x: -14, delay: 0 },
    { rot: 5, x: 16, delay: 0 },
    { rot: -1, x: 1, delay: 0 },
  ];
  return (
    <>
      {sheets.map((s, i) => {
        const front = i === sheets.length - 1;
        return (
          <div
            key={i}
            className="absolute left-[10%] right-[10%] rounded-lg border border-black/5"
            style={{
              top: lifted ? "2%" : "12%",
              height: "62%",
              background:
                "linear-gradient(170deg, #ffffff 0%, #f4f0ea 55%, #e6ded4 100%)",
              boxShadow: "0 14px 30px -18px rgba(0,0,0,0.7)",
              transform: `translateX(${s.x}px) rotate(${s.rot}deg)`,
              transition: "top 650ms cubic-bezier(0.22,1,0.36,1)",
              zIndex: 10 + i,
            }}
          >
            {front ? (
              <div className="flex h-full flex-col gap-2 p-4 text-[color:var(--ink,#1a1512)]">
                <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.22em] text-black/40">
                  <span>Member file</span>
                  <span>NO. {no(member.memberNo)}</span>
                </div>
                <div className="mt-1 text-lg font-semibold leading-tight tracking-tight text-black">
                  {member.name}
                </div>
                <div className="text-[11px] text-black/55">{member.role}</div>
                <div className="mt-1 space-y-1.5">
                  {[88, 72, 94, 64].map((w, k) => (
                    <div
                      key={k}
                      className="h-[3px] rounded-full bg-black/10"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col gap-2 p-4">
                {[70, 90, 55, 80, 40].map((w, k) => (
                  <div
                    key={k}
                    className="h-[3px] rounded-full bg-black/10"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

/** Frosted glass front pocket. */
function FolderPocket({
  member,
  expanded,
}: {
  member: Member;
  expanded: boolean;
}) {
  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-20 flex flex-col justify-between overflow-hidden rounded-2xl border border-white/25 ${
        expanded ? "p-6" : "p-4"
      }`}
      style={{
        height: "58%",
        background:
          "linear-gradient(165deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.10) 40%, rgba(60,42,34,0.35) 100%)",
        backdropFilter: "blur(18px) saturate(140%)",
        boxShadow:
          "0 24px 50px -25px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.45)",
      }}
    >
      <div
        className={`flex items-center justify-between uppercase tracking-[0.2em] text-[color:var(--cream)]/75 ${
          expanded ? "text-[11px]" : "text-[9px]"
        }`}
      >
        <span>THE ROOM</span>
        <span>NO. {no(member.memberNo)}</span>
      </div>

      <div className="flex items-end gap-3">
        {member.avatarUrl ? (
          <img
            src={member.avatarUrl}
            alt={member.name}
            className={`shrink-0 rounded-full object-cover ring-1 ring-white/40 ${
              expanded ? "h-16 w-16" : "h-11 w-11"
            }`}
          />
        ) : (
          <div
            className={`flex shrink-0 items-center justify-center rounded-full bg-white/25 font-semibold text-[color:var(--cream)] ${
              expanded ? "h-16 w-16 text-xl" : "h-11 w-11 text-sm"
            }`}
          >
            {member.initials}
          </div>
        )}
        <div className="min-w-0">
          <div
            className={`truncate font-semibold tracking-tight text-[color:var(--cream)] ${
              expanded ? "text-2xl" : "text-base"
            }`}
          >
            {member.name}
          </div>
          <div
            className={`truncate text-[color:var(--cream)]/70 ${
              expanded ? "text-sm" : "text-[11px]"
            }`}
          >
            {member.role}
          </div>
        </div>
      </div>

      <div
        className={`flex items-center justify-between text-[color:var(--cream)]/60 ${
          expanded ? "text-xs" : "text-[10px]"
        }`}
      >
        <span className="truncate">{member.city}</span>
        <span className="shrink-0">{expanded ? "Pull the file ↑" : "Open folder →"}</span>
      </div>
    </div>
  );
}

/** The detail sheet that slides fully out of the folder when opened. */
function DetailSheet({ member, pulled }: { member: Member; pulled: boolean }) {
  return (
    <div
      className="absolute inset-x-[7%] top-0 z-30 overflow-hidden rounded-xl border border-black/5"
      style={{
        height: "82%",
        background:
          "linear-gradient(170deg, #ffffff 0%, #f6f2ec 55%, #eae2d8 100%)",
        boxShadow: "0 30px 60px -25px rgba(0,0,0,0.8)",
        transform: pulled ? "translateY(-40%)" : "translateY(6%)",
        transition: "transform 750ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <div className="flex h-full flex-col gap-3 overflow-y-auto p-6 text-black">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-black/40">
          <span>Member file</span>
          <span>NO. {no(member.memberNo)}</span>
        </div>
        <div>
          <div className="text-2xl font-semibold tracking-tight">{member.name}</div>
          <div className="text-sm text-black/60">{member.role}</div>
          {member.city ? <div className="text-sm text-black/45">{member.city}</div> : null}
        </div>
        {member.bio ? (
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-black/40">About</div>
            <p className="mt-1 text-sm leading-relaxed text-black/80">{member.bio}</p>
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
            className="mt-auto inline-flex items-center justify-between rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-85"
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
  const [pulled, setPulled] = useState(false);
  const [hover, setHover] = useState(false);
  const [motionBox, setMotionBox] = useState<{
    start: { left: number; top: number; width: number; height: number };
    end: { left: number; top: number; width: number; height: number };
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => setEntered(true));
    const t = setTimeout(() => setPulled(true), 340);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      document.body.style.overflow = original;
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setEntered(false);
    setPulled(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openFolder = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = Math.min(460, Math.max(280, window.innerWidth - 48));
    const height = Math.min(560, Math.max(420, window.innerHeight - 120));
    setMotionBox({
      start: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      end: {
        left: (window.innerWidth - width) / 2,
        top: Math.max(56, (window.innerHeight - height) / 2),
        width,
        height,
      },
    });
    setEntered(false);
    setPulled(false);
    setOpen(true);
  };

  return (
    <>
      <div className="h-80">
        <button
          type="button"
          onClick={openFolder}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="relative h-full w-full text-left"
          aria-label={`Open folder for ${member.name}`}
        >
          <FolderBack />
          <Papers member={member} lifted={hover} />
          <FolderPocket member={member} expanded={false} />
        </button>
      </div>

      {open && motionBox &&
        createPortal(
          <div
            className={`fixed inset-0 z-50 backdrop-blur-sm transition-[background-color] duration-500 ${
              entered ? "bg-black/70" : "bg-black/0"
            }`}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={`${member.name} member folder`}
          >
            <div
              className="fixed"
              onClick={(e) => e.stopPropagation()}
              style={{
                left: `${entered ? motionBox.end.left : motionBox.start.left}px`,
                top: `${entered ? motionBox.end.top : motionBox.start.top}px`,
                width: `${entered ? motionBox.end.width : motionBox.start.width}px`,
                height: `${entered ? motionBox.end.height : motionBox.start.height}px`,
                transition:
                  "left 800ms cubic-bezier(0.22, 1, 0.36, 1), top 800ms cubic-bezier(0.22, 1, 0.36, 1), width 800ms cubic-bezier(0.22, 1, 0.36, 1), height 800ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <button
                type="button"
                onClick={close}
                className={`absolute -top-12 right-0 rounded-full p-2 text-white/80 transition-opacity duration-300 hover:bg-white/10 hover:text-white ${
                  entered ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                aria-label="Close folder"
              >
                <CloseIcon className="h-6 w-6" />
              </button>
              <div
                className="relative h-full w-full cursor-pointer"
                onClick={() => setPulled((p) => !p)}
              >
                <FolderBack />
                {entered ? (
                  <DetailSheet member={member} pulled={pulled} />
                ) : (
                  <Papers member={member} lifted />
                )}
                <FolderPocket member={member} expanded={entered} />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
