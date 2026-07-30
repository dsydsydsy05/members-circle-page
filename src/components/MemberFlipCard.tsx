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

/** Notched folder-pocket outline (objectBoundingBox units), traced from the design. */
const POCKET_PATH =
  "M0.075,0.215 H0.525 C0.552,0.215 0.565,0.226 0.575,0.246 L0.605,0.352 C0.615,0.372 0.63,0.383 0.655,0.383 H0.935 C0.962,0.383 0.98,0.401 0.98,0.428 V0.925 C0.98,0.952 0.962,0.97 0.935,0.97 H0.075 C0.048,0.97 0.03,0.952 0.03,0.925 V0.26 C0.03,0.233 0.048,0.215 0.075,0.215 Z";

/** White sheets peeking out of the folder. */
function Papers({ lifted }: { lifted: boolean }) {
  const sheets = [
    { rot: -4, x: 13, w: 44, top: 1.5, z: 12 },
    { rot: 6, x: 42, w: 33, top: 6, z: 11 },
    { rot: 11, x: 58, w: 28, top: 15, z: 10 },
  ];
  return (
    <>
      {sheets.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-[3cqw]"
          style={{
            width: `${s.w}%`,
            left: `${s.x}%`,
            top: `${s.top + (lifted ? -3 : 0)}%`,
            height: "36%",
            background: "linear-gradient(150deg, #ffffff 0%, #f3f3f4 100%)",
            transform: `rotate(${s.rot}deg)`,
            transformOrigin: "bottom center",
            boxShadow: "0 2cqw 4cqw -3cqw rgba(0,0,0,0.35)",
            transition: "top 500ms cubic-bezier(0.22,1,0.36,1)",
            zIndex: s.z,
          }}
        >
          <div className="flex h-full flex-col gap-[9%] p-[13%] pt-[16%]">
            {[78, 55, 40, 26].map((w, k) => (
              <div
                key={k}
                className="h-[1.6cqw] rounded-full bg-[#e4e4e6]"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

/** Dark folder shell + white sheets + gradient glass front pocket. */
function Folder({ member, lifted }: { member: Member; lifted?: boolean }) {
  return (
    <div className="relative h-full w-full" style={{ containerType: "inline-size" }}>
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="folder-pocket-clip" clipPathUnits="objectBoundingBox">
            <path d={POCKET_PATH} />
          </clipPath>
        </defs>
      </svg>

      {/* dark back shell */}
      <div
        className="absolute left-[7.5%] right-[8%] top-[3%] bottom-[8%] rounded-[4.5cqw]"
        style={{
          background:
            "linear-gradient(145deg, #4b4b4d 0%, #333335 30%, #232325 62%, #151517 100%)",
          boxShadow: "0 4cqw 8cqw -4cqw rgba(0,0,0,0.6)",
        }}
      />

      <Papers lifted={!!lifted} />

      {/* gradient glass front pocket */}
      <div className="absolute inset-0 z-20">
        <div
          className="absolute inset-0"
          style={{
            clipPath: "url(#folder-pocket-clip)",
            WebkitClipPath: "url(#folder-pocket-clip)",
            background:
              "linear-gradient(150deg, rgba(214,214,216,0.62) 0%, rgba(178,178,181,0.55) 28%, rgba(126,126,130,0.58) 62%, rgba(74,74,78,0.68) 100%)",
            backdropFilter: "blur(16px) saturate(115%)",
            boxShadow: "0 3cqw 7cqw -4cqw rgba(0,0,0,0.55)",
          }}
        />
        {/* soft top-left sheen */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            clipPath: "url(#folder-pocket-clip)",
            WebkitClipPath: "url(#folder-pocket-clip)",
            background:
              "linear-gradient(155deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.06) 38%, rgba(255,255,255,0) 70%)",
          }}
        />
        <svg
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <path
            d={POCKET_PATH}
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* pocket content — proportions traced from the design */}
        <div className="absolute inset-0 text-white">
          <div className="absolute left-[13.5%] right-[12%] top-[43%] flex items-center justify-between text-[2.05cqw] font-medium uppercase leading-none tracking-[0.34em]">
            <span>THE ROOM</span>
            <span className="tracking-[0.16em]">NO. {no(member.memberNo)}</span>
          </div>

          <div className="absolute left-[14.5%] right-[9%] top-[54%] flex items-center gap-[4cqw]">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="h-[18cqw] w-[18cqw] shrink-0 rounded-full object-cover ring-1 ring-white/45"
              />
            ) : (
              <div className="flex h-[18cqw] w-[18cqw] shrink-0 items-center justify-center rounded-full bg-white/20 text-[4cqw] font-semibold ring-1 ring-white/40">
                {member.initials}
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate text-[4.6cqw] font-bold leading-[1.15] tracking-[-0.01em]">
                {member.name}
              </div>
              <div className="truncate text-[2.9cqw] font-normal leading-tight text-white/85">
                {member.role}
              </div>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-[9%] flex items-end justify-between px-[13.5%] text-[2.75cqw] leading-none text-white/95">
            <span className="truncate">{member.city}</span>
            <span className="shrink-0">Open file →</span>
          </div>
        </div>
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
      <div className="aspect-[6/5]">
        <button
          ref={cardRef}
          type="button"
          onClick={openFile}
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

