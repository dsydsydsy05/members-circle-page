import { useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { LightSiteFooter, LightSiteNav } from "@/components/light/LightSite";

export const Route = createFileRoute("/challenge")({
  head: () => ({
    meta: [
      { title: "The Ultimate Entrepreneurial Challenge · The Room" },
      {
        name: "description",
        content: "Apply to play The Ultimate Entrepreneurial Challenge, hosted by The Room in Boston.",
      },
      { property: "og:title", content: "The Ultimate Entrepreneurial Challenge" },
      { property: "og:description", content: "One challenge. The boldest founders. Apply to play." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChallengePage,
});

const STAGES = [
  { n: "01", title: "Apply", body: "Tell us who you are and why you want in." },
  { n: "02", title: "Get selected", body: "We pick a small, sharp field of players." },
  { n: "03", title: "Play", body: "Compete live. Build, pitch, survive the rounds." },
];

function ChallengePage() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = root.current?.querySelectorAll("[data-reveal]") ?? [];
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.2 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const onMove = (event: React.PointerEvent<HTMLElement>) => {
    const r = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${((event.clientX - r.left) / r.width) * 100}%`);
    event.currentTarget.style.setProperty("--my", `${((event.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div className="theme-light">
      <div className="uec" ref={root}>
        <LightSiteNav />
        <section className="uec-hero" onPointerMove={onMove}>
          <div className="uec-hero__glow" aria-hidden="true" />
          <p className="uec-kicker">The Room presents · Boston 2026</p>
          <h1 className="uec-title">
            {["The Ultimate", "Entrepreneurial", "Challenge"].map((line, i) => (
              <span key={line} className="uec-line" style={{ "--i": i } as React.CSSProperties}>
                <span>{line}</span>
              </span>
            ))}
          </h1>
          <div className="uec-hero__row">
            <p>One stage. The boldest founders. Only a few get to play.</p>
            <a href="#apply" className="uec-badge" aria-label="Apply to play">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <defs>
                  <path id="uec-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
                </defs>
                <text>
                  <textPath href="#uec-circle">APPLY TO PLAY · APPLY TO PLAY · </textPath>
                </text>
              </svg>
              <span>↓</span>
            </a>
          </div>
        </section>

        <div className="uec-marquee" aria-hidden="true">
          <div>
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k}>
                BUILD ✦ PITCH ✦ COMPETE ✦ WIN ✦ BUILD ✦ PITCH ✦ COMPETE ✦ WIN ✦{" "}
              </span>
            ))}
          </div>
        </div>

        <section className="uec-stages">
          {STAGES.map((s, i) => (
            <article
              key={s.n}
              data-reveal
              className="uec-stage"
              style={{ "--i": i } as React.CSSProperties}
            >
              <span>{s.n}</span>
              <h2>{s.title}</h2>
              <p>{s.body}</p>
            </article>
          ))}
        </section>

        <section id="apply" className="uec-apply" data-reveal>
          <p className="uec-kicker">Application</p>
          <h2>Think you’ve got what it takes?</h2>
          <p>
            Application questions drop very soon. Create your account now so you’re ready the
            moment it opens.
          </p>
          <div className="uec-apply__actions">
            <span className="uec-pill">
              <i aria-hidden="true" /> Opening soon
            </span>
            <Link to="/auth" search={{ mode: "signup", next: "/challenge" }} className="uec-cta">
              Get ready ↗
            </Link>
          </div>
        </section>
        <LightSiteFooter />
      </div>
    </div>
  );
}
