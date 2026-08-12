import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import coverAsset from "@/assets/waic-dinner-cover.png.asset.json";
import photoAsset from "@/assets/waic-dinner-photo.jpg.asset.json";

export function PastEvents() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
        <article className="group overflow-hidden rounded-xl bg-card ring-1 ring-border">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="block w-full text-left"
            aria-label="Open recap: Founder's Dinner at WAIC 2026"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
              <img
                src={coverAsset.url}
                alt="Founder's Dinner at WAIC 2026 poster"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <span className="inline-block rounded-full bg-black/50 px-4 py-2 text-[13px] font-medium text-[color:var(--neon)] ring-1 ring-white/15 backdrop-blur-sm">
                  Read the recap
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="text-xs text-muted-foreground">Jul 18, 2026 · Shanghai</div>
              <div className="mt-1 text-lg font-semibold tracking-tight">
                Founder&apos;s Dinner at WAIC 2026
              </div>
            </div>
          </button>
        </article>
      </div>

      {open
        ? createPortal(
            <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md sm:p-8">
              <div
                className="absolute inset-0"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />
              <div className="relative my-4 w-full max-w-3xl overflow-hidden rounded-2xl glass-panel">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="absolute right-3 top-3 z-10 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white/80 ring-1 ring-white/15 hover:text-[color:var(--neon)]"
                >
                  Close
                </button>

                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <img
                    src={photoAsset.url}
                    alt="Founder's Dinner at WAIC 2026 — on-site photo"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full scale-105 object-cover opacity-85 blur-[3px]"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 55%, rgba(18,20,22,0.92) 100%)",
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--neon)]">
                      Past Event · Shanghai
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                      Exclusive Founder&apos;s Dinner at WAIC 2026 Convenes Elite Circle of Global AI
                      Leaders
                    </h3>
                  </div>
                </div>

                <div className="space-y-4 p-6 text-[15px] leading-relaxed text-white/75 sm:p-8">
                  <p>
                    <span className="font-medium text-foreground">SHANGHAI — July 18, 2026 —</span>{" "}
                    During the World Artificial Intelligence Conference (WAIC), we hosted an
                    invitation-only Founder&apos;s Dinner bringing together 30 of the most accomplished
                    founders, investors, and researchers in AI. Nearly 400 applied for 30 seats,
                    making it one of the most carefully curated private gatherings of WAIC week.
                  </p>
                  <p>
                    Guests included senior executives from leading global tech companies and a formerly
                    NYSE-listed enterprise, PhD researchers from Tsinghua University&apos;s top AI labs,
                    partners from top-tier investment institutions, influential creators, and one of the
                    world&apos;s youngest founders to bring a product into clinical trials.
                  </p>
                  <p className="border-l-2 border-[color:var(--neon)]/60 pl-4 text-foreground">
                    This dinner is the first in a series of curated, high-caliber gatherings planned
                    throughout 2026.
                  </p>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
