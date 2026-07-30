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
    <div className="relative h-full w-full">
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
            "linear-gradient(160deg, #3a3835 0%, #2a2725 45%, #1b1917 100%)",
          boxShadow:
            "0 40px 70px -34px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.10)",
        }}
      />

      <Papers lifted={!!lifted} />

      {/* frosted front pocket */}
      <div className="absolute inset-x-0 bottom-0 top-0 z-20">
        <div
          className="absolute inset-0"
          style={{
            clipPath: "url(#folder-pocket-clip)",
            WebkitClipPath: "url(#folder-pocket-clip)",
            background:
              "linear-gradient(155deg, rgba(255,255,255,0.34) 0%, rgba(226,214,205,0.20) 40%, rgba(60,52,47,0.42) 100%)",
            backdropFilter: "blur(22px) saturate(150%)",
            boxShadow: "0 26px 50px -26px rgba(0,0,0,0.6)",
          }}
        />
        {/* stroked outline for the glass edge */}
        <svg
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <path
            d={POCKET_PATH}
            fill="none"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="0.004"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* pocket content */}
        <div className="absolute inset-x-0 bottom-0 top-[24%] flex flex-col justify-between px-[9%] pb-[7%] pt-[6%]">
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
      <div className="aspect-[6/5]">
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
