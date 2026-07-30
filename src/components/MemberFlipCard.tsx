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

const POCKET_PATH =
  "M0.05,0.235 H0.50 C0.545,0.235 0.545,0.375 0.585,0.375 H0.955 C0.98,0.375 1,0.395 1,0.42 V0.955 C1,0.98 0.98,1 0.955,1 H0.045 C0.02,1 0,0.98 0,0.955 V0.26 C0,0.238 0.022,0.235 0.05,0.235 Z";

/** Fanned white sheets peeking out of the folder, staggered to the right. */
function Papers({ lifted }: { lifted: boolean }) {
  const sheets = [
    { rot: 13, x: 56, y: 12, w: 27, o: 1, z: 12 },
    { rot: 7, x: 38, y: 5, w: 28, o: 1, z: 11 },
    { rot: -3, x: 14, y: 0, w: 30, o: 1, z: 10 },

  ];
  return (
    <>
      {sheets.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-[1.1rem]"
          style={{
            width: `${s.w}%`,
            left: `${s.x}%`,
            top: `${(lifted ? -2 : 3) + s.y * 0.4}%`,
            height: "42%",
            background: "linear-gradient(180deg, #ffffff 0%, #f2f2f3 100%)",
            opacity: s.o,
            boxShadow: "0 14px 26px -18px rgba(0,0,0,0.55)",
            transform: `rotate(${s.rot}deg)`,
            transformOrigin: "bottom center",
            transition: "top 600ms cubic-bezier(0.22,1,0.36,1)",
            zIndex: s.z,
          }}
        >
          <div className="flex h-full flex-col gap-[9%] p-[12%] pt-[16%]">
            {[70, 46, 58, 34].map((w, k) => (
              <div
                key={k}
                className="h-[6px] rounded-full bg-black/[0.09]"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

/** Translucent frosted folder: dark shell + fanned papers + glass front pocket. */
function Folder({ member, lifted }: { member: Member; lifted?: boolean }) {
  return (
    <div
      className="relative h-full w-full"
      style={{ perspective: "1100px" }}
    >
      <div
        className="relative h-full w-full"
        style={{
          transformStyle: "preserve-3d",
          transform: lifted
            ? "rotateX(6deg) rotateY(-5deg) translateZ(10px)"
            : "rotateX(3deg) rotateY(-2deg)",
          transition: "transform 700ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
      {/* svg clip for the notched pocket shape */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="folder-pocket-clip" clipPathUnits="objectBoundingBox">
            <path d={POCKET_PATH} />
          </clipPath>
        </defs>
      </svg>

      {/* dark back shell */}
      <div
        className="absolute inset-x-[4%] bottom-[3%] top-[1%] rounded-[1.6rem]"
        style={{
          background:
            "linear-gradient(160deg, #46423e 0%, #2c2926 45%, #15130f 100%)",
          boxShadow:
            "0 46px 80px -34px rgba(0,0,0,0.85), 0 6px 0 -2px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -20px 40px -24px rgba(0,0,0,0.9)",
          transform: "translateZ(-14px)",
        }}
      />

      <Papers lifted={!!lifted} />

      {/* frosted front pocket */}
      <div
        className="absolute inset-x-0 bottom-0 top-0 z-20"
        style={{ transform: "translateZ(22px)" }}
      >
        {/* thickness / bottom edge of the glass slab */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: "url(#folder-pocket-clip)",
            WebkitClipPath: "url(#folder-pocket-clip)",
            background:
              "linear-gradient(180deg, rgba(120,104,94,0.55) 0%, rgba(40,34,30,0.9) 100%)",
            transform: "translate3d(0, 6px, 0)",
            filter: "blur(0.4px)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            clipPath: "url(#folder-pocket-clip)",
            WebkitClipPath: "url(#folder-pocket-clip)",
            background:
              "linear-gradient(155deg, rgba(255,255,255,0.42) 0%, rgba(232,219,209,0.20) 38%, rgba(70,58,50,0.44) 100%)",
            backdropFilter: "blur(24px) saturate(165%)",
            boxShadow:
              "0 30px 55px -26px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.55), inset 0 -1px 1px rgba(255,255,255,0.2), inset 0 -30px 60px -40px rgba(0,0,0,0.7)",
          }}
        />
        {/* specular sheen across the top of the glass */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            clipPath: "url(#folder-pocket-clip)",
            WebkitClipPath: "url(#folder-pocket-clip)",
            background:
              "radial-gradient(120% 70% at 12% 22%, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.10) 34%, rgba(255,255,255,0) 62%)",
            mixBlendMode: "screen",
            opacity: lifted ? 0.95 : 0.75,
            transition: "opacity 600ms ease",
          }}
        />
        {/* stroked outline for the glass edge */}
        <svg
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="glass-edge" x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
              <stop offset="45%" stopColor="rgba(255,255,255,0.28)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.55)" />
            </linearGradient>
          </defs>
          <path
            d={POCKET_PATH}
            fill="none"
            stroke="url(#glass-edge)"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* pocket content */}
        <div className="absolute inset-x-0 bottom-0 top-[40%] flex flex-col justify-between px-[9%] pb-[7%] pt-[4%]">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.34em] text-[color:var(--cream,#f2ece6)]/85">
            <span>THE ROOM</span>
            <span className="tracking-[0.22em]">NO. {no(member.memberNo)}</span>
          </div>

          <div className="flex items-center gap-4">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="h-[4.2rem] w-[4.2rem] shrink-0 rounded-full object-cover ring-1 ring-white/40"
              />
            ) : (
              <div className="flex h-[4.2rem] w-[4.2rem] shrink-0 items-center justify-center rounded-full bg-white/25 text-lg font-semibold text-[color:var(--cream,#f2ece6)]">
                {member.initials}
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate text-2xl font-bold tracking-tight text-white">
                {member.name}
              </div>
              <div className="truncate text-[15px] text-white/70">
                {member.role}
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between text-[14px] text-white/80">
            <span className="truncate">{member.city}</span>
            <span className="shrink-0">Open file →</span>
          </div>
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

