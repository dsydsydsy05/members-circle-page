/**
 * Realistic 3D name tag ("工牌") — a true cuboid with front, back and 4 real
 * side faces, floating in mid-air and swaying gently left/right.
 */

const T = 12; // total card thickness in px
const H = T / 2;

const EDGE = "linear-gradient(180deg, oklch(0.82 0.26 138) 0%, oklch(0.6 0.19 141) 50%, oklch(0.78 0.24 138) 100%)";
const EDGE_V = "linear-gradient(90deg, oklch(0.82 0.26 138) 0%, oklch(0.6 0.19 141) 50%, oklch(0.78 0.24 138) 100%)";

export function LanyardCard({
  name = "member",
  subtitle = "Member No. 001",
  price = "$12",
}: {
  name?: string;
  subtitle?: string;
  price?: string;
}) {
  return (
    <div className="perspective-1200 select-none">
      <div className="animate-tag-float preserve-3d relative h-[22rem] w-60 sm:h-[26rem] sm:w-[17.5rem]">

        <div className="preserve-3d animate-tag-spin absolute inset-0">
          {/* ---- side faces (real thickness) ---- */}
          <div
            className="absolute left-0 top-0 h-full"
            style={{
              width: T,
              transformOrigin: "left center",
              transform: `translateZ(${H}px) rotateY(90deg)`,
              background: EDGE_V,
            }}
          />
          <div
            className="absolute right-0 top-0 h-full"
            style={{
              width: T,
              transformOrigin: "right center",
              transform: `translateZ(${H}px) rotateY(-90deg)`,
              background: EDGE_V,
            }}
          />
          <div
            className="absolute left-0 top-0 w-full"
            style={{
              height: T,
              transformOrigin: "center top",
              transform: `translateZ(${H}px) rotateX(-90deg)`,
              background: EDGE,
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-full"
            style={{
              height: T,
              transformOrigin: "center bottom",
              transform: `translateZ(${H}px) rotateX(90deg)`,
              background: EDGE,
            }}
          />

          {/* ---- FRONT ---- */}
          <div
            className="backface-hidden absolute inset-0 overflow-hidden rounded-[14px]"
            style={{
              transform: `translateZ(${H}px)`,
              background:
                "linear-gradient(160deg, oklch(0.92 0.29 136) 0%, oklch(0.86 0.28 138) 55%, oklch(0.76 0.24 140) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(0,0,0,0.2)",
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
                  "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)",
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
                  the room
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

          {/* ---- BACK ---- */}
          <div
            className="backface-hidden absolute inset-0 overflow-hidden rounded-[14px] p-6 pt-10 text-[color:var(--cream)]"
            style={{
              transform: `translateZ(-${H}px) rotateY(180deg)`,
              background:
                "linear-gradient(160deg, oklch(0.2 0 0) 0%, oklch(0.14 0 0) 60%, oklch(0.1 0 0) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.5), inset 0 0 0 1px oklch(0.88 0.29 136 / 0.18)",
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

        {/* ---- floating ground shadow ---- */}
        <div
          className="animate-tag-shadow pointer-events-none absolute -bottom-16 left-1/2 h-10 w-[70%] -translate-x-1/2 rounded-[50%]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 70%)",
            filter: "blur(10px)",
          }}
        />
      </div>
    </div>
  );
}
