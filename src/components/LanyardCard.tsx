/**

/**
 * Realistic 3D name tag ("工牌") — no lanyard strap.
 * Surface layout inspired by the premium green-to-black gradient badge.
 */
export function LanyardCard({
  name = "Member Name",
  role = "Company Name",
  location = "School",
  number = "001",
}: {
  name?: string;
  role?: string;
  location?: string;
  number?: string;
}) {
  return (
    <div className="perspective-1200 select-none">
      <div className="preserve-3d animate-tag-spin relative h-[20rem] w-[15rem] sm:h-[24rem] sm:w-[17rem]">
        {/* Thickness layers — stacked slabs behind the front face */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-2xl"
            style={{
              transform: `translateZ(${-2 - i * 1.2}px)`,
              background: "#5a3a28",
              filter: `brightness(${0.55 + i * 0.05})`,
            }}
          />
        ))}

        {/* FRONT */}
        <div
          className="backface-hidden absolute inset-0 overflow-hidden rounded-2xl ring-1 ring-black/10"
          style={{
            background:
              "linear-gradient(150deg, #ffffff 0%, #f6f1ec 38%, #ece3db 62%, #f8f5f2 100%)",
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

          {/* Pearlescent sheen — soft iridescent bands instead of a dot grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                "linear-gradient(118deg, rgba(255,255,255,0) 18%, rgba(255,214,183,0.35) 34%, rgba(255,255,255,0.65) 42%, rgba(226,232,240,0.30) 50%, rgba(255,255,255,0) 66%)",
              mixBlendMode: "soft-light",
            }}
          />



          <div className="flex h-full flex-col gap-2.5 p-3.5 pt-10 text-black">
            {/* Top gradient block */}
            <div
              className="relative flex-[1.3] overflow-hidden rounded-lg"
              style={{
                background:
                  "linear-gradient(152deg, #f3d8c2 0%, #e0a77e 18%, #cf7f52 40%, #9c5c3c 62%, #4d382c 82%, #241c19 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.25), inset 0 0 40px rgba(255,180,120,0.18)",
              }}
            >
              {/* Anisotropic metal sweep */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(112deg, transparent 22%, rgba(255,255,255,0.10) 34%, rgba(255,255,255,0.42) 44%, rgba(255,255,255,0.08) 52%, transparent 70%)",
                }}
              />
              {/* Warm bloom in the upper-left */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(70% 60% at 18% 8%, rgba(255,236,214,0.42), transparent 70%)",
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
            <div
              className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-lg p-3.5 ring-1 ring-black/5"
              style={{
                background:
                  "linear-gradient(160deg, #ffffff 0%, #faf7f4 55%, #efe8e1 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,1), inset 0 -10px 22px rgba(120,80,55,0.07)",
              }}
            >

              <div className="flex items-start justify-between">
                {/* Diamond icon */}
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="#c9714a"
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
                <span className="text-[9px] font-medium tracking-widest text-black/40">
                  NO. {number}
                </span>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-black/40">
                  Member
                </div>
                <div className="text-2xl font-semibold leading-none tracking-tight text-black">
                  {name}
                </div>
                <div className="mt-1 text-[11px] font-medium text-black/60">
                  {role}
                </div>
              </div>

              <div className="text-[9px] font-medium text-black/40">
                {location}
              </div>
            </div>
          </div>

          {/* Unified lighting over the WHOLE card (content included), synced to the sway */}
          <div
            className="pointer-events-none absolute inset-0 animate-tag-shade rounded-2xl"
            style={{
              background:
                "linear-gradient(100deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.14) 35%, rgba(0,0,0,0) 65%)",
              backgroundSize: "220% 100%",
              mixBlendMode: "multiply",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 animate-tag-light rounded-2xl"
            style={{
              background:
                "linear-gradient(100deg, transparent 32%, rgba(255,255,255,0.30) 47%, rgba(255,255,255,0.55) 52%, rgba(255,255,255,0.18) 58%, transparent 74%)",
              backgroundSize: "220% 100%",
              mixBlendMode: "screen",
            }}
          />
          {/* Edge falloff so the surface reads as one solid slab */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              boxShadow:
                "inset 0 0 34px rgba(0,0,0,0.14), inset 0 -12px 24px rgba(0,0,0,0.10)",
            }}
          />
        </div>


        {/* BACK */}
        <div
          className="backface-hidden absolute inset-0 overflow-hidden rounded-2xl p-6 pt-10 text-white ring-1 ring-black/20"
          style={{
            transform: "rotateY(180deg) translateZ(0.5px)",
            background:
              "linear-gradient(160deg, #453027 0%, #2a1f1a 60%, #161316 100%)",
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

          {/* Unified lighting, synced to the sway */}
          <div
            className="pointer-events-none absolute inset-0 animate-tag-shade rounded-2xl"
            style={{
              background:
                "linear-gradient(100deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0) 70%)",
              backgroundSize: "220% 100%",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 animate-tag-light rounded-2xl"
            style={{
              background:
                "linear-gradient(100deg, transparent 34%, rgba(255,255,255,0.10) 48%, rgba(255,255,255,0.20) 52%, transparent 70%)",
              backgroundSize: "220% 100%",
              mixBlendMode: "screen",
            }}
          />
        </div>

      </div>
    </div>
  );
}
