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

/** The paper "file" that sits inside the folder pocket. */
function FileSheet({
  member,
  pulled,
  detailed,
}: {
  member: Member;
  pulled: boolean;
  detailed: boolean;
}) {
  return (
    <div
      className="absolute inset-x-[6%] top-0 rounded-xl border border-white/15 bg-[color:var(--cocoa)]/80 p-5 text-[color:var(--cream)] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl"
      style={{
        height: detailed ? "88%" : "78%",
        transform: pulled ? "translateY(-46%)" : "translateY(-12%)",
        transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1), height 700ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] opacity-60">
        <span>Member file</span>
        <span>NO. {no(member.memberNo)}</span>
      </div>

      {detailed ? (
        <div className="mt-4 flex h-[calc(100%-2.5rem)] flex-col gap-3 overflow-y-auto pr-1">
          <div>
            <div className="text-2xl font-semibold tracking-tight">{member.name}</div>
            <div className="text-sm opacity-70">{member.role}</div>
            {member.city ? <div className="text-sm opacity-60">{member.city}</div> : null}
          </div>
          {member.bio ? (
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">About</div>
              <p className="mt-1 text-sm leading-relaxed opacity-95">{member.bio}</p>
            </div>
          ) : null}
          {member.tags.length ? (
            <div className="flex flex-wrap gap-1.5">
              {member.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/20 bg-white/5 px-2.5 py-0.5 text-[11px] backdrop-blur-md"
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
              className="mt-auto inline-flex items-center justify-between rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur-md transition-colors hover:bg-white/20"
            >
              Visit {hostnameOf(member.website)}
              <span>→</span>
            </a>
          ) : null}
        </div>
      ) : (
        <div className="mt-3">
          <div className="text-base font-semibold tracking-tight">{member.name}</div>
          <div className="text-xs opacity-70">{member.role}</div>
        </div>
      )}
    </div>
  );
}

/** Frosted glass folder pocket that covers the lower part of the file. */
function FolderPocket({
  member,
  expanded,
}: {
  member: Member;
  expanded: boolean;
}) {
  return (
    <div
      className={`absolute inset-x-0 bottom-0 flex flex-col justify-between rounded-2xl border border-white/25 bg-white/10 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.8)] backdrop-blur-2xl ${
        expanded ? "p-7" : "p-5"
      }`}
      style={{
        height: "68%",
        backgroundImage:
          "linear-gradient(160deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.14) 100%)",
      }}
    >
      <div
        className={`flex items-center justify-between text-[color:var(--cream)]/70 ${
          expanded ? "text-xs" : "text-[11px]"
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
            className={`shrink-0 rounded-full object-cover ring-1 ring-white/30 ${
              expanded ? "h-16 w-16" : "h-12 w-12"
            }`}
          />
        ) : (
          <div
            className={`flex shrink-0 items-center justify-center rounded-full bg-white/20 font-semibold text-[color:var(--cream)] backdrop-blur-md ${
              expanded ? "h-16 w-16 text-xl" : "h-12 w-12 text-base"
            }`}
          >
            {member.initials}
          </div>
        )}
        <div className="min-w-0">
          <div
            className={`truncate font-semibold tracking-tight text-[color:var(--cream)] ${
              expanded ? "text-2xl" : "text-lg"
            }`}
          >
            {member.name}
          </div>
          <div className={`truncate text-[color:var(--cream)]/70 ${expanded ? "text-sm" : "text-xs"}`}>
            {member.role}
          </div>
        </div>
      </div>

      <div
        className={`flex items-center justify-between text-[color:var(--cream)]/60 ${
          expanded ? "text-xs" : "text-[11px]"
        }`}
      >
        <span className="truncate">{member.city}</span>
        <span className="shrink-0">{expanded ? "Pull the file ↑" : "Open folder →"}</span>
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
    const t = setTimeout(() => setPulled(true), 320);
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
          <FileSheet member={member} pulled={hover} detailed={false} />
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
                <FileSheet member={member} pulled={pulled} detailed={entered} />
                <FolderPocket member={member} expanded={entered} />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
