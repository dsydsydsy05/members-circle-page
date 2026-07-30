import { useEffect, useRef, useState } from "react";
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

/** White sheets peeking out of the folder (geometry from the approved reference). */
function Papers({ lifted }: { lifted: boolean }) {
  const sheets = [
    { w: 50, h: 39, left: 11, top: 4, rot: -7, lines: [[15, 34, 64], [68, 71, 13]] },
    { w: 31, h: 37, left: 56, top: 7, rot: 0, lines: [[17, 37, 64], [18, 67, 32], [18, 82, 24]] },
    { w: 30, h: 28, left: 60, top: 17, rot: 5, lines: [[16, 48, 54]] },
  ];
  return (
    <>
      {sheets.map((s, i) => (
        <div
          key={i}
          className="absolute overflow-hidden"
          style={{
            width: `${s.w}%`,
            height: `${s.h}%`,
            left: `${s.left}%`,
            top: `${s.top + (lifted ? -2.5 : 0)}%`,
            transform: `rotate(${s.rot}deg)`,
            borderRadius: "3.6cqw",
            background:
              "linear-gradient(145deg, rgba(255,255,255,.98), rgba(245,245,247,.92))",
            border: "1px solid rgba(210,210,214,.8)",
            boxShadow:
              "0 1.5cqw 3cqw rgba(44,44,48,.14), inset 0 1px 0 rgba(255,255,255,1)",
            transition: "top 500ms cubic-bezier(0.22,1,0.36,1)",
            zIndex: 2,
          }}
        >
          {s.lines.map(([l, t, w], k) => (
            <span
              key={k}
              className="absolute block rounded-full"
              style={{
                left: `${l}%`,
                top: `${t}%`,
                width: `${w}%`,
                height: "7%",
                background: "rgba(190,190,194,.55)",
              }}
            />
          ))}
        </div>
      ))}
    </>
  );
}

/** Dark folder shell + white sheets + frosted glass front, matching the approved design. */
function Folder({ member, lifted }: { member: Member; lifted?: boolean }) {
  return (
    <div
      className="relative h-full w-full"
      style={{
        containerType: "inline-size",
        filter: "drop-shadow(0 2cqw 2.4cqw rgba(31,31,34,0.18))",
      }}
    >
      {/* rear dark folder */}
      <div
        className="absolute"
        style={{
          inset: "0 4.5% 45% 4.5%",
          borderRadius: "5.4cqw 5.4cqw 2.3cqw 2.3cqw",
          background: "linear-gradient(180deg, rgba(20,20,22,.94), rgba(35,35,38,.98))",
          border: "1px solid rgba(255,255,255,.22)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,.18), inset 0 -1.6cqw 2.9cqw rgba(0,0,0,.18)",
        }}
      />

      <Papers lifted={!!lifted} />

      {/* frosted glass tab (notched top-left) */}
      <div
        className="absolute"
        style={{
          zIndex: 3,
          left: 0,
          top: "22%",
          width: "59%",
          height: "32%",
          borderRadius: "5.1cqw 0 0 0",
          background:
            "linear-gradient(128deg, rgba(245,245,247,.56), rgba(155,157,162,.43) 52%, rgba(80,82,87,.40))",
          borderTop: "1px solid rgba(255,255,255,.58)",
          borderLeft: "1px solid rgba(255,255,255,.42)",
          backdropFilter: "blur(28px) saturate(120%)",
          WebkitBackdropFilter: "blur(28px) saturate(120%)",
          clipPath: "polygon(0 0, 58% 0, 72% 0, 92% 55%, 100% 55%, 100% 100%, 0 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,.45), inset 0 -1.6cqw 3.7cqw rgba(0,0,0,.09)",
        }}
      />

      {/* frosted glass front pocket */}
      <div
        className="absolute flex flex-col overflow-hidden text-white"
        style={{
          zIndex: 4,
          inset: "38% 0 0",
          padding: "6.2% 9.6% 6.7%",
          borderRadius: "3.8cqw 3.8cqw 5.2cqw 5.2cqw",
          background:
            "linear-gradient(118deg, rgba(35,36,39,.73) 0%, rgba(111,112,116,.47) 48%, rgba(22,23,26,.76) 100%)",
          border: "1px solid rgba(255,255,255,.48)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,.45), inset 0 -3.7cqw 5.7cqw rgba(0,0,0,.23), 0 1.8cqw 3.1cqw rgba(0,0,0,.13)",
          backdropFilter: "blur(30px) saturate(115%)",
          WebkitBackdropFilter: "blur(30px) saturate(115%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 49% 20%, rgba(255,255,255,.18), transparent 37%), linear-gradient(90deg, rgba(255,255,255,.04), transparent 28%, rgba(255,255,255,.03))",
          }}
        />

        <header className="relative z-[1] flex items-center justify-between whitespace-nowrap text-[2.2cqw] font-normal tracking-[0.28em]">
          <span>THE ROOM</span>
          <span>NO. {no(member.memberNo)}</span>
        </header>

        <div className="relative z-[1] mt-[5.5cqw] flex items-center gap-[4.4cqw]">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={member.name}
              className="aspect-square w-[16cqw] shrink-0 rounded-full object-cover"
              style={{
                border: "3px solid rgba(255,255,255,.68)",
                boxShadow: "0 1cqw 2.2cqw rgba(0,0,0,.14)",
              }}
            />
          ) : (
            <div
              className="flex aspect-square w-[16cqw] shrink-0 items-center justify-center rounded-full bg-white/20 text-[4cqw] font-semibold"
              style={{ border: "3px solid rgba(255,255,255,.68)" }}
            >
              {member.initials}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="truncate text-[6cqw] font-semibold leading-[.98] tracking-[-0.045em]">
              {member.name}
            </h3>
            <p className="mt-[1.8cqw] truncate text-[2.9cqw] font-light leading-[1.15] text-white/75">
              {member.role}
            </p>
          </div>
        </div>

        <footer className="relative z-[1] mt-auto flex items-center justify-between text-[2.7cqw] text-white/80">
          <span className="truncate">{member.city}</span>
          <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-[3px]">
            Open file →
          </span>
        </footer>
      </div>
    </div>
  );
}





/** The white member document, pulled out of the folder and centered. */
function DocumentSheet({
  member,
  shown,
  from,
}: {
  member: Member;
  shown: boolean;
  from: string;
}) {
  return (
    <div
      className="w-full overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f5f2ef 100%)",
        boxShadow:
          "0 50px 110px -40px rgba(0,0,0,0.85), 0 2px 0 rgba(255,255,255,0.6) inset",
        transformOrigin: "center bottom",
        transform: shown
          ? "translate3d(0,0,0) scale(1) rotate(0deg)"
          : from,
        opacity: shown ? 1 : 0,
        transition:
          "transform 780ms cubic-bezier(0.16,1,0.3,1), opacity 300ms ease",
        willChange: "transform, opacity",
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
  const [from, setFrom] = useState(
    "translate3d(0, 120px, 0) scale(0.35) rotate(-4deg)"
  );
  const cardRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const openFile = () => {
    const r = cardRef.current?.getBoundingClientRect();
    if (r) {
      // start where the papers sit inside the folder, scaled to its size
      const originX = r.left + r.width / 2 - window.innerWidth / 2;
      const originY = r.top + r.height * 0.42 - window.innerHeight / 2;
      const scale = Math.max(0.18, Math.min(0.5, r.width / 620));
      setFrom(
        `translate3d(${originX}px, ${originY}px, 0) scale(${scale}) rotate(-6deg)`
      );
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setEntered(true))
    );
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = original;
    };
  }, [open]);

  const close = () => {
    setEntered(false);
    window.setTimeout(() => setOpen(false), 380);
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
      <div className="aspect-[1.22/1]">
        <button
          ref={cardRef}
          type="button"
          onClick={openFile}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="group relative h-full w-full text-left transition-transform duration-500 hover:-translate-y-1"
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
            style={{ perspective: "1400px" }}
          >
            <div
              ref={sheetRef}
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
              <DocumentSheet member={member} shown={entered} from={from} />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

