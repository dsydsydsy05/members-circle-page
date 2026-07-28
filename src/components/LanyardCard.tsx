/**
 * Realistic 3D name tag ("工牌") — no lanyard strap.
 * Surface layout inspired by the premium green-to-black gradient badge.
 */
export function LanyardCard({
  name = "Member Name",
  role = "Founding Member",
  location = "City, State Zip",
  number = "001",
}: {
  name?: string;
  role?: string;
  location?: string;
  number?: string;
}) {
  return (
    <div className="perspective-1200 select-none">
      <div className="preserve-3d animate-tag-spin relative h-[26rem] w-72 sm:h-[30rem] sm:w-80">
        {/* Thickness layers — stacked slabs behind the front face */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-2xl"
            style={{
              transform: `translateZ(${-2 - i * 1.2}px)`,
              background: "oklch(0.42 0.15 136)",
              filter: `brightness(${0.55 + i * 0.05})`,
            }}
          />
        ))}

        {/* FRONT */}
        <div
          className="backface-hidden absolute inset-0 overflow-hidden rounded-2xl ring-1 ring-black/10"
          style={{
            background: "oklch(0.95 0 0)",
            boxShadow:
              "0 40px 80px -30px rgba(0,0,0,0.65), 0 12px 24px -12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(0,0,0,0.08), inset 0 0 0 1px rgba(0,0,0,0.04)",
            transform: "translateZ(0.5px)",
          }}
        >
          {/* Punched slot */}
          <div className="absolute left-1/2 top-5 -translate-x-1/2">
            <div
              className="h-3.5 w-12 rounded-full"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0.6) 100%)",
                boxShadow:
                  "inset 0 1.5px 2px rgba(0,0,0,0.95), 0 1px 0 rgba(255,255,255,0.45)",
              }}
            />
          </div>

          {/* Gloss sweep */}
          <div
            className="pointer-events-none absolute inset-0 animate-tag-gloss"
            style={{
              background:
                "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.42) 50%, transparent 60%)",
              mixBlendMode: "screen",
            }}
          />
          {/* Subtle grain */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(0,0,0,0.9) 1px, transparent 1px)",
              backgroundSize: "3px 3px",
            }}
          />

          <div className="flex h-full flex-col gap-3 p-4 pt-12 text-black">
            {/* Top gradient block */}
            <div
              className="relative flex-1 overflow-hidden rounded-xl"
              style={{
                background:
                  "linear-gradient(155deg, oklch(0.88 0.3 136) 0%, oklch(0.76 0.31 136) 25%, oklch(0.55 0.27 140) 50%, oklch(0.32 0.14 145) 72%, oklch(0.16 0.04 150) 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.2)",
              }}
            >
              {/* Vertical brand text */}
              <div
                className="absolute bottom-4 left-3 top-4 flex items-center justify-center"
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                }}
              >
                <span className="text-sm font-semibold tracking-[0.22em] text-white/95">
                  the room
                </span>
              </div>

              {/* Shine */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.22) 45%, transparent 60%)",
                }}
              />
              {/* Bottom edge vignette */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 25%)",
                }}
              />
            </div>

            {/* Bottom info panel */}
            <div className="flex flex-1 flex-col justify-between rounded-xl bg-[oklch(0.97_0_0)] p-4 ring-1 ring-black/5">
              <div className="flex items-start justify-between">
                {/* Diamond icon */}
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7"
                  fill="none"
                  stroke="oklch(0.72 0.32 136)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 3h12l4 6-10 13L2 9z" />
                  <path d="M12 22V9" />
                  <path d="M12 9H2" />
                  <path d="M12 9h10" />
                  <path d="M6 3l6 6" />
                  <path d="M18 3l-6 6" />
                </svg>
                <span className="text-[10px] font-medium tracking-widest text-black/40">
                  NO. {number}
                </span>
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-black/40">
                  Member
                </div>
                <div className="text-3xl font-semibold leading-none tracking-tight text-black">
                  {name}
                </div>
                <div className="mt-1.5 text-xs font-medium text-black/60">
                  {role}
                </div>
              </div>

              <div className="text-[10px] font-medium text-black/40">
                {location}
              </div>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div
          className="backface-hidden absolute inset-0 overflow-hidden rounded-2xl p-6 pt-10 text-white ring-1 ring-black/20"
          style={{
            transform: "rotateY(180deg) translateZ(0.5px)",
            background:
              "linear-gradient(160deg, oklch(0.26 0.05 150) 0%, oklch(0.19 0.04 150) 60%, oklch(0.14 0.03 150) 100%)",
            boxShadow:
              "0 40px 80px -30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          <div className="absolute left-1/2 top-4 -translate-x-1/2">
            <div
              className="h-3 w-10 rounded-full"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,1) 60%)",
                boxShadow: "inset 0 1.5px 2px rgba(0,0,0,0.95)",
              }}
            />
          </div>
          <div
            className="pointer-events-none absolute inset-0 animate-tag-gloss"
            style={{
              background:
                "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.14) 50%, transparent 60%)",
            }}
          />
          <div className="flex h-full flex-col justify-between">
            <div className="text-xs uppercase tracking-[0.24em] opacity-70">Members Only</div>
            <div>
              <div className="text-3xl font-semibold tracking-tight text-[color:var(--neon)]">
                A quieter<br />place to build.
              </div>
              <p className="mt-3 text-xs leading-relaxed opacity-80">
                Founders, makers, buyers. Real conversations, real resources.
              </p>
            </div>
            <div className="flex items-center justify-between text-[10px] opacity-80">
              <span>NO. {number}</span>
              <span>EST. 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
