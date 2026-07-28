export function LanyardCard() {
  return (
    <div className="pointer-events-none relative select-none [perspective:1600px]">
      {/* ambient glow behind the card */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -z-10 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--neon) 55%, transparent) 0%, transparent 68%)",
        }}
      />

      <div className="animate-real-badge-float relative w-[min(66vw,17rem)] sm:w-[min(30vw,20rem)] [transform-style:preserve-3d]">
        <div
          className="relative aspect-[3/4.15] w-full overflow-hidden rounded-[1.25rem]"
          style={{
            background:
              "linear-gradient(150deg, color-mix(in oklab, var(--neon) 92%, white) 0%, var(--neon) 42%, color-mix(in oklab, var(--neon) 82%, black) 100%)",
            boxShadow:
              "0 40px 70px -20px oklch(0 0 0 / 0.75), 0 0 60px color-mix(in oklab, var(--neon) 35%, transparent), inset 0 1px 0 oklch(1 0 0 / 0.5), inset 0 -2px 6px oklch(0 0 0 / 0.18)",
          }}
        >
          {/* slot */}
          <div className="absolute left-1/2 top-[4.5%] h-[1.6%] w-[14%] -translate-x-1/2 rounded-full bg-black/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]" />

          {/* gloss sweep */}
          <div
            aria-hidden
            className="animate-tag-gloss absolute -inset-y-10 left-0 w-1/2 opacity-60"
            style={{
              background:
                "linear-gradient(105deg, transparent 0%, oklch(1 0 0 / 0.42) 45%, transparent 80%)",
            }}
          />

          {/* content */}
          <div className="absolute inset-0 flex flex-col px-[9%] pb-[7%] pt-[13%] text-black">
            <span className="text-[0.5rem] font-medium tracking-wide opacity-80">
              No. 001
            </span>

            <div className="mt-auto">
              <span className="text-[0.55rem] font-medium tracking-wide opacity-80">
                member
              </span>
              <h2 className="-mt-0.5 text-[1.7rem] font-semibold leading-none tracking-tight sm:text-[2rem]">
                The Room
                <sup className="ml-0.5 text-[0.9rem] align-super">~</sup>
              </h2>
            </div>

            <div className="mt-[8%] rounded-[0.5rem] bg-black/90 p-[5%] text-[0.42rem] leading-snug text-white/90">
              <p>
                Member No. 001 — your all-access pass to factory tours, guest
                salons, and a very small group chat.
              </p>
              <div className="mt-2 flex h-4 items-end gap-[1.5px]">
                {Array.from({ length: 42 }).map((_, i) => (
                  <span
                    key={i}
                    className="block w-[1.5px] bg-white"
                    style={{ height: `${i % 3 === 0 ? 100 : i % 2 ? 70 : 88}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
