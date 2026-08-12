import coverAsset from "@/assets/waic-dinner-cover.png.asset.json";
import photoAsset from "@/assets/waic-dinner-photo.jpg.asset.json";

const facts = [
  { k: "30", v: "Seats" },
  { k: "~400", v: "Applications" },
  { k: "<8%", v: "Acceptance" },
];

export function WaicRecap() {
  return (
    <section className="mt-8 overflow-hidden rounded-2xl glass-panel">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* Visual: blurred photo backdrop + poster cover */}
        <div className="relative min-h-[22rem] overflow-hidden">
          <img
            src={photoAsset.url}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl saturate-[0.7]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 30%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.72) 70%, rgba(0,0,0,0.9) 100%)",
            }}
          />
          <div className="relative flex h-full items-center justify-center p-6 sm:p-8">
            <img
              src={coverAsset.url}
              alt="Founder's Dinner at WAIC 2026 — Shanghai, July 18, 2026"
              loading="lazy"
              decoding="async"
              className="w-full max-w-[19rem] rounded-xl ring-1 ring-white/12"
              style={{ boxShadow: "var(--shadow-warm)" }}
            />
          </div>
        </div>

        {/* Copy */}
        <div className="p-6 sm:p-9">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="rounded-full px-2.5 py-1 text-[color:var(--neon)] ring-1 ring-[color:var(--neon)]/35">
              Recap
            </span>
            <span>Shanghai · July 18, 2026</span>
          </div>

          <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            Exclusive Founder&apos;s Dinner at WAIC 2026 Convenes an{" "}
            <span className="text-[color:var(--neon)]">Elite Circle</span> of Global AI Leaders
          </h3>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {facts.map((f) => (
              <div key={f.v} className="rounded-xl bg-white/[0.04] px-3 py-3 ring-1 ring-white/10">
                <div className="text-xl font-semibold tracking-tight text-[color:var(--neon)] sm:text-2xl">
                  {f.k}
                </div>
                <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {f.v}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-white/75">
            <p>
              <span className="font-medium text-foreground">SHANGHAI — July 18, 2026 —</span> During the
              World Artificial Intelligence Conference (WAIC), we hosted an invitation-only Founder&apos;s
              Dinner bringing together 30 of the most accomplished founders, investors, and researchers in
              AI. Nearly 400 applied for 30 seats — an acceptance rate under 8%, making it one of the most
              selective private gatherings of WAIC week.
            </p>
            <p>
              Guests included senior executives from leading global tech companies and a formerly
              NYSE-listed enterprise, PhD researchers from Tsinghua University&apos;s top AI labs, partners
              from top-tier investment institutions, influential creators, and one of the world&apos;s
              youngest founders to bring a product into clinical trials.
            </p>
            <p className="border-l-2 border-[color:var(--neon)]/60 pl-4 text-foreground">
              This dinner is the first in a series of curated, high-caliber gatherings planned throughout
              2026.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
