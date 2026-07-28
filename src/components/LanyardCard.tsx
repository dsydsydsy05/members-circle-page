/**
 * Realistic 3D name tag ("工牌") — no lanyard strap.
 * Thick edges, soft shadows, gloss sweep, gentle auto-rotation.
 */
export function LanyardCard({
  name = "Insider",
  subtitle = "Member No. 001",
  price = "$12",
}: {
  name?: string;
  subtitle?: string;
  price?: string;
}) {
  return (
    <div className="perspective-1200 select-none">
      <div className="preserve-3d animate-tag-spin relative h-[26rem] w-72 sm:h-[30rem] sm:w-80">
        {/* Thickness layers — stacked slabs behind the front face */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-2xl bg-[color:var(--cocoa)]/70"
            style={{
              transform: `translateZ(${-2 - i * 1.2}px)`,
              filter: `brightness(${0.55 + i * 0.05})`,
            }}
          />
        ))}

        {/* FRONT */}
        <div
          className="backface-hidden absolute inset-0 overflow-hidden rounded-2xl ring-1 ring-white/10"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.9 0.29 136) 0%, oklch(0.85 0.28 138) 55%, oklch(0.74 0.24 140) 100%)",
            boxShadow:
              "0 40px 90px -30px oklch(0.88 0.29 136 / 0.45), 0 12px 24px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.25), inset 0 0 0 1px rgba(0,0,0,0.15)",
            transform: "translateZ(0.5px)",
          }}
        >
          {/* Punched hole */}
          <div className="absolute left-1/2 top-4 -translate-x-1/2">
            <div
              className="h-3 w-10 rounded-full"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0.6) 100%)",
                boxShadow:
                  "inset 0 1.5px 2px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.7)",
              }}
            />
          </div>

          {/* Gloss sweep */}
          <div
            className="pointer-events-none absolute inset-0 animate-tag-gloss"
            style={{
              background:
                "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.55) 50%, transparent 60%)",
              mixBlendMode: "screen",
            }}
          />
          {/* Subtle paper grain */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(0,0,0,0.9) 1px, transparent 1px)",
              backgroundSize: "3px 3px",
            }}
          />

          <div className="flex h-full flex-col justify-between p-6 pt-10">
            <div className="text-sm font-medium text-[color:var(--cocoa)]">{price}</div>
            <div>
              <div className="text-sm font-semibold lowercase tracking-tight text-[color:var(--cocoa)]/80">
                insider
              </div>
              <div className="mt-1 text-6xl font-semibold tracking-tight text-[color:var(--cocoa)]">
                {name}
                <span className="text-[color:var(--cocoa)]/60">˜</span>
              </div>
            </div>
            <div
              className="rounded-lg px-4 py-4 text-[11px] leading-snug text-[color:var(--cream)]"
              style={{
                background:
                  "linear-gradient(180deg, oklch(0.18 0 0) 0%, oklch(0.11 0 0) 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.6)",
              }}
            >
              {subtitle} — your all-access pass to early drops, factory tours, and a very small group chat.
              <div className="mt-3 flex h-5 items-end gap-[2px]">
                {Array.from({ length: 34 }).map((_, i) => (
                  <span
                    key={i}
                    className="block bg-[color:var(--cream)]"
                    style={{ width: i % 3 === 0 ? 3 : 1, height: `${60 + ((i * 13) % 40)}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div
          className="backface-hidden absolute inset-0 overflow-hidden rounded-2xl p-6 pt-10 text-[color:var(--cream)] ring-1 ring-black/20"
          style={{
            transform: "rotateY(180deg) translateZ(0.5px)",
            background:
              "linear-gradient(160deg, oklch(0.28 0.032 40) 0%, oklch(0.22 0.03 40) 60%, oklch(0.18 0.028 40) 100%)",
            boxShadow:
              "0 40px 80px -30px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04)",
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
              <div className="text-3xl font-semibold tracking-tight">
                A quieter<br />place to build.
              </div>
              <p className="mt-3 text-xs leading-relaxed opacity-80">
                Founders, makers, buyers. Real conversations, real resources.
              </p>
            </div>
            <div className="flex items-center justify-between text-[10px] opacity-80">
              <span>NO. 001</span>
              <span>EST. 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
