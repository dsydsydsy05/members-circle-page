import type { CSSProperties } from "react";
import { LightPage } from "@/components/light/LightSite";
import { S27_PROGRAMS } from "@/lib/s27-programs";
import { DaliArt } from "./DaliArt";
import { pad, useCountdown } from "./use-countdown";

const program = S27_PROGRAMS.dali;

// The statement is set line by line, like the stacked lettering of a woodblock poster.
const STATEMENT = [
  "Fourteen days",
  "between",
  "the mountain",
  "and the lake",
  "for those",
  "who build",
];

function Badge({
  top,
  bottom,
  delay,
}: {
  top: [string, string];
  bottom: [string, string];
  delay: number;
}) {
  return (
    <div className="dali-badge" style={{ "--delay": `${delay}ms` } as CSSProperties}>
      <span className="dali-badge__oval">
        {top[0]}
        <br />
        {top[1]}
      </span>
      <span className="dali-badge__oval">
        {bottom[0]}
        <br />
        {bottom[1]}
      </span>
    </div>
  );
}

export function DaliReveal() {
  const parts = useCountdown(program.opensAt);
  return (
    <LightPage className="s27-reveal-page dali-page">
      <main>
        <section className="dali-poster" data-nav-tone="dark" aria-labelledby="dali-title">
          <div className="dali-poster__badges dali-poster__badges--left dali-worn">
            <Badge top={["The Room", "S27"]} bottom={["Founder", "Residency"]} delay={60} />
            <Badge top={["Dali", "Yunnan"]} bottom={["Fourteen", "days"]} delay={160} />
          </div>
          <div className="dali-poster__badges dali-poster__badges--right dali-worn">
            <Badge
              top={["Applications", "open"]}
              bottom={["Feb 1 2027", "00:00 CST"]}
              delay={100}
            />
            <Badge top={["Applications", "close"]} bottom={["To be", "announced"]} delay={200} />
          </div>

          <div className="dali-poster__center dali-worn">
            <p className="dali-poster__statement" aria-label={STATEMENT.join(" ")}>
              {STATEMENT.map((line, index) => (
                <span key={line} style={{ "--line": index } as CSSProperties} aria-hidden="true">
                  {line}
                </span>
              ))}
            </p>
            <p className="dali-poster__countdown" role="timer" aria-label="Applications open in">
              {parts?.reached ? (
                "Applications are open"
              ) : (
                <>
                  <span>Opens in</span>
                  <b>{parts ? parts.days : "—"}</b> days
                  <b>
                    {parts
                      ? `${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`
                      : "—"}
                  </b>
                </>
              )}
            </p>
          </div>

          <DaliArt className="dali-poster__art" />

          <h1 id="dali-title" className="dali-poster__title dali-worn" aria-label={program.title}>
            {"DALI".split("").map((letter, index) => (
              <span key={index} style={{ "--letter": index } as CSSProperties} aria-hidden="true">
                {letter}
              </span>
            ))}
          </h1>
          <span className="dali-poster__corner dali-poster__corner--left" aria-hidden="true">
            25°41′ N · 100°09′ E
          </span>
          <span className="dali-poster__corner dali-poster__corner--right" aria-hidden="true">
            The Room · S27 / 02
          </span>
        </section>

        <section className="dali-details" data-nav-tone="dark" aria-label="Residency details">
          <div className="light-shell dali-details__grid">
            <div>
              <p className="dali-details__kicker">S27 / Applications</p>
              <h2 className="dali-worn">{program.description}</h2>
              <p>{program.detail}</p>
              <p className="dali-details__note">Application details will be announced here.</p>
            </div>
            <dl className="dali-details__specs">
              {[
                ["Program", program.category],
                ["Location", program.location],
                ["Residency", program.programDates],
                ["Applications open", program.openingStamp],
                ["Applications close", program.closingLabel],
                ["Status", parts?.reached ? "Open" : "Opening soon"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
    </LightPage>
  );
}
