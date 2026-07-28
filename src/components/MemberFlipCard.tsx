import { useEffect, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import type { Member } from "@/lib/community-data";

type MotionBox = {
  start: { left: number; top: number; width: number; height: number };
  end: { left: number; top: number; width: number; height: number };
};

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

export function MemberFlipCard({ member }: { member: Member }) {
  const [open, setOpen] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const [entered, setEntered] = useState(false);
  const [motionBox, setMotionBox] = useState<MotionBox | null>(null);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Move toward the center and flip on the same frame.
    const raf = requestAnimationFrame(() => {
      setEntered(true);
      setShowBack(true);
    });
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = original;
    };
  }, [open]);


  const close = () => {
    setOpen(false);
    setShowBack(false);
    setEntered(false);
  };

  const openCard = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = Math.min(448, Math.max(280, window.innerWidth - 48));
    const height = Math.min(448, Math.max(360, window.innerHeight - 96));

    setMotionBox({
      start: {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      },
      end: {
        left: (window.innerWidth - width) / 2,
        top: Math.max(48, (window.innerHeight - height) / 2),
        width,
        height,
      },
    });
    setEntered(false);
    setShowBack(false);
    setOpen(true);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const CardFace = ({ expanded }: { expanded: boolean }) => (
    <>
      {/* Front — mini工牌 */}
      <div
        className={`backface-hidden absolute inset-0 flex flex-col justify-between rounded-xl bg-card ring-1 ring-border shadow-sm ${
          expanded ? "p-8" : "p-5"
        }`}
      >
        <div
          className={`flex items-center justify-between text-muted-foreground ${
            expanded ? "text-xs" : "text-[11px]"
          }`}
        >
          <span>THE ROOM</span>
          <span>NO. {member.id.padStart(3, "0")}</span>
        </div>
        <div>
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={member.name}
              className={`rounded-full object-cover ring-1 ring-border ${
                expanded ? "h-20 w-20" : "h-14 w-14"
              }`}
            />
          ) : (
            <div
              className={`flex items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground ${
                expanded ? "h-20 w-20 text-2xl" : "h-14 w-14 text-lg"
              }`}
            >
              {member.initials}
            </div>
          )}

          <div
            className={`mt-3 font-semibold tracking-tight ${
              expanded ? "text-3xl" : "text-xl"
            }`}
          >
            {member.name}
          </div>
          <div
            className={`text-muted-foreground ${
              expanded ? "text-base" : "text-sm"
            }`}
          >
            {member.role}
          </div>
        </div>
        <div
          className={`flex items-center justify-between text-muted-foreground ${
            expanded ? "text-xs" : "text-[11px]"
          }`}
        >
          <span>{member.city}</span>
          <span>Tap to flip →</span>
        </div>
      </div>

      {/* Back — details + visit website */}
      <div
        className={`backface-hidden absolute inset-0 flex flex-col justify-between rounded-xl border border-primary/30 bg-[color:var(--cocoa)] text-[color:var(--cream)] shadow-sm ${
          expanded ? "p-8" : "p-5"
        }`}
        style={{ transform: "rotateY(180deg)" }}
      >
        <div>
          <div
            className={`uppercase tracking-[0.18em] opacity-70 ${
              expanded ? "text-xs" : "text-[11px]"
            }`}
          >
            About
          </div>
          <p
            className={`leading-relaxed opacity-95 ${
              expanded ? "mt-3 text-base" : "mt-2 text-sm"
            }`}
          >
            {member.bio}
          </p>
        </div>
        <div className={`flex flex-wrap ${expanded ? "gap-2" : "gap-1.5"}`}>
          {member.tags.map((t) => (
            <span
              key={t}
              className={`rounded-full border border-primary/40 text-primary ${
                expanded ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]"
              }`}
            >
              {t}
            </span>
          ))}
        </div>
        {member.website ? (
          <a
            href={member.website}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`inline-flex items-center justify-between rounded-md bg-primary font-medium text-primary-foreground hover:opacity-90 ${
              expanded ? "px-4 py-3 text-sm" : "px-3 py-2 text-xs"
            }`}
          >
            Visit {hostnameOf(member.website)}
            <span>→</span>
          </a>
        ) : null}

      </div>
    </>
  );

  return (
    <>
      {/* Grid card — tap to open */}
      <div className="perspective-1200 h-72">
        <button
          type="button"
          onClick={openCard}
          className="preserve-3d relative h-full w-full text-left"
          aria-label={`Open card for ${member.name}`}
        >
          <CardFace expanded={false} />
        </button>
      </div>

      {/* Expanded centered card with dark backdrop */}
      {open && motionBox &&
        createPortal(
          <div
            className={`fixed inset-0 z-50 backdrop-blur-sm transition-[background-color] duration-500 ${
              entered ? "bg-black/70" : "bg-black/0"
            }`}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={`${member.name} member card`}
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
                  "left 900ms cubic-bezier(0.22, 1, 0.36, 1), top 900ms cubic-bezier(0.22, 1, 0.36, 1), width 900ms cubic-bezier(0.22, 1, 0.36, 1), height 900ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <button
                type="button"
                onClick={close}
                className={`absolute -top-12 right-0 rounded-full p-2 text-white/80 transition-opacity duration-300 hover:bg-white/10 hover:text-white ${
                  entered ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                aria-label="Close card"
              >
                <CloseIcon className="h-6 w-6" />
              </button>
              <div className="perspective-1200 h-full">
                <button
                  type="button"
                  onClick={() => setShowBack((f) => !f)}
                  className="preserve-3d relative h-full w-full text-left"
                  style={{
                    transform: showBack ? "rotateY(180deg)" : "rotateY(0deg)",
                    transition: "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                  aria-label={`Flip card for ${member.name}`}
                >
                  <CardFace expanded={entered} />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

