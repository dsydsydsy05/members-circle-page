/**
 * Auto-rotating 3D name card ("工牌") inspired by the nuuds Insider lanyard.
 * Pure CSS 3D — no external libs.
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
    <div className="relative flex flex-col items-center select-none">
      {/* Lanyard strap */}
      <div className="animate-lanyard-sway flex flex-col items-center">
        <div className="relative h-40 w-8 overflow-hidden rounded-b-sm bg-[color:var(--cream)] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
          <div className="absolute inset-0 flex flex-col items-center justify-around">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="text-[10px] font-black leading-none text-[color:var(--cocoa)]"
                style={{ transform: `rotate(${i % 2 === 0 ? -18 : 18}deg)` }}
              >
                N
              </span>
            ))}
          </div>
        </div>
        {/* Clip */}
        <div className="-mt-1 flex flex-col items-center">
          <div className="h-3 w-6 rounded-t-md bg-neutral-400 shadow" />
          <div className="h-2 w-2 rounded-full bg-neutral-500" />
        </div>

        {/* 3D card */}
        <div className="perspective-1200 mt-2">
          <div className="preserve-3d animate-lanyard-spin relative h-80 w-56 sm:h-96 sm:w-64">
            {/* Front */}
            <div className="backface-hidden absolute inset-0 overflow-hidden rounded-xl bg-[color:var(--cream)] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
              <div className="flex h-full flex-col justify-between p-5">
                <div className="text-sm font-medium text-[color:var(--cocoa)]">{price}</div>
                <div>
                  <div className="text-lg font-semibold lowercase tracking-tight text-[color:var(--cocoa)]">
                    insider
                  </div>
                  <div className="mt-1 text-5xl font-semibold tracking-tight text-[color:var(--cocoa)]">
                    {name}
                    <span className="text-[color:var(--cocoa)]/70">˜</span>
                  </div>
                </div>
                <div className="rounded-md bg-[color:var(--cocoa)] px-4 py-4 text-[11px] leading-snug text-[color:var(--cream)]">
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
            {/* Back */}
            <div
              className="backface-hidden absolute inset-0 overflow-hidden rounded-xl bg-[color:var(--cocoa)] p-5 text-[color:var(--cream)] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] ring-1 ring-black/5"
              style={{ transform: "rotateY(180deg)" }}
            >
              <div className="flex h-full flex-col justify-between">
                <div className="text-xs uppercase tracking-[0.2em] opacity-70">Members Only</div>
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
      </div>
    </div>
  );
}
