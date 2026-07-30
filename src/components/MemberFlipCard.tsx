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

/** Notched folder-pocket outline (objectBoundingBox units). */
const POCKET_PATH =
  "M0.035,0.205 H0.505 C0.545,0.205 0.556,0.216 0.567,0.238 L0.60,0.355 C0.611,0.377 0.622,0.388 0.66,0.388 H0.962 C0.985,0.388 1,0.403 1,0.425 V0.955 C1,0.978 0.985,0.993 0.962,0.993 H0.038 C0.015,0.993 0,0.978 0,0.955 V0.243 C0,0.22 0.015,0.205 0.038,0.205 Z";

/** White sheets peeking out of the folder. */
function Papers({ lifted }: { lifted: boolean }) {
  const sheets = [
    { rot: -4, x: 12, w: 46, top: 0, z: 12 },
    { rot: 6, x: 44, w: 40, top: 4, z: 11 },
    { rot: 11, x: 60, w: 34, top: 12, z: 10 },
  ];
  return (
    <>
      {sheets.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-[1.4rem]"
          style={{
            width: `${s.w}%`,
            left: `${s.x}%`,
            top: `${s.top + (lifted ? -3 : 0)}%`,
            height: "40%",
            background: "#fdfdfd",
            transform: `rotate(${s.rot}deg)`,
            transformOrigin: "bottom center",
            boxShadow: "0 10px 22px -16px rgba(0,0,0,0.45)",
            transition: "top 500ms cubic-bezier(0.22,1,0.36,1)",
            zIndex: s.z,
          }}
        >
          <div className="flex h-full flex-col gap-[10%] p-[11%] pt-[14%]">
            {[76, 52, 40, 28].map((w, k) => (
              <div
                key={k}
                className="h-[7%] min-h-[6px] rounded-full bg-[#e6e6e6]"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

/** Dark folder shell + white sheets + frosted notched front pocket. */
function Folder({ member, lifted }: { member: Member; lifted?: boolean }) {
  return (
    <div className="relative h-full w-full">
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="folder-pocket-clip" clipPathUnits="objectBoundingBox">
            <path d={POCKET_PATH} />
          </clipPath>
        </defs>
      </svg>

      {/* dark back shell */}
      <div
        className="absolute inset-x-[5%] bottom-[2%] top-[2%] rounded-[2rem]"
        style={{
          background: "linear-gradient(150deg, #3a3a3c 0%, #232325 60%, #1a1a1c 100%)",
          boxShadow: "0 30px 60px -34px rgba(0,0,0,0.55)",
        }}
      />

      <Papers lifted={!!lifted} />

      {/* frosted front pocket */}
      <div className="absolute inset-0 z-20">
        <div
          className="absolute inset-0"
          style={{
            clipPath: "url(#folder-pocket-clip)",
            WebkitClipPath: "url(#folder-pocket-clip)",
            background:
              "linear-gradient(160deg, rgba(190,190,192,0.55) 0%, rgba(150,150,152,0.50) 45%, rgba(96,96,99,0.62) 100%)",
            backdropFilter: "blur(18px) saturate(120%)",
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
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* pocket content */}
        <div className="absolute inset-x-0 bottom-0 top-[42%] flex flex-col justify-between px-[13%] pb-[9%] pt-[2%] text-white">
          <div className="flex items-center justify-between text-[13px] font-medium uppercase tracking-[0.42em]">
            <span>THE ROOM</span>
            <span className="tracking-[0.18em]">NO. {no(member.memberNo)}</span>
          </div>

          <div className="flex items-center gap-5">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="h-[4.6rem] w-[4.6rem] shrink-0 rounded-full object-cover ring-1 ring-white/50"
              />
            ) : (
              <div className="flex h-[4.6rem] w-[4.6rem] shrink-0 items-center justify-center rounded-full bg-white/20 text-lg font-semibold ring-1 ring-white/40">
                {member.initials}
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate text-[1.85rem] font-bold leading-tight tracking-tight">
                {member.name}
              </div>
              <div className="truncate text-[1rem] text-white/80">
                {member.role}
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between text-[15px] text-white/95">
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

