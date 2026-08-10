/**
 * Teaser-style event cover: heavily blurred/darkened photo behind
 * a script "Coming" + heavy neon "SOON" lockup.
 */
export function EventCover({
  image,
  month,
  year,
  script = "Coming",
  headline = "SOON",
  caption,
  cta,
  revealed = false,
}: {
  image: string;
  month: string;
  year: string;
  script?: string;
  headline?: string;
  caption?: string;
  cta?: string;
  revealed?: boolean;
}) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
      {/* Photo */}
      <img
        src={image}
        alt=""
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
          revealed
            ? "scale-100 opacity-80 blur-0"
            : "scale-110 opacity-45 blur-md grayscale-[0.4]"
        }`}
      />
      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.96) 100%)",
        }}
      />

      <div className="relative flex h-full flex-col items-center justify-between px-5 py-6 text-center">
        {/* Top row: month · icon · year */}
        <div className="flex w-full items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/70">
            {month}
          </span>
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8 text-white/80"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z" />
            <circle cx="12" cy="12" r="3.2" />
            <path d="M3 3l18 18" />
          </svg>
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/70">
            {year}
          </span>
        </div>

        {/* Lockup */}
        <div className="relative -mt-2 w-full">
          <div
            className="relative z-10 text-3xl italic text-white/95 sm:text-4xl"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {script}
          </div>
          <div
            className="-mt-4 text-[3.4rem] font-black leading-[0.85] tracking-tight sm:text-[4.2rem]"
            style={{
              color: "var(--neon)",
              textShadow: "0 0 40px color-mix(in oklab, var(--neon) 35%, transparent)",
            }}
          >
            {headline}
          </div>
          {caption ? (
            <p className="mx-auto mt-3 max-w-[16rem] text-[13px] leading-snug text-white/70">
              {caption}
            </p>
          ) : null}
        </div>

        {/* CTA pill */}
        {cta ? (
          <div className="w-full">
            <span className="inline-block rounded-full bg-white/10 px-5 py-2.5 text-[13px] font-medium text-[color:var(--neon)] ring-1 ring-white/10 backdrop-blur-sm">
              {cta}
            </span>
          </div>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
