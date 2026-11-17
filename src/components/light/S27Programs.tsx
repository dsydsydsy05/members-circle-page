import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { LightPage, LightSectionHeader } from "./LightSite";
import { S27_PROGRAMS } from "@/lib/s27-programs";
import { useCountdown } from "@/components/s27/use-countdown";
import { DaliArt } from "@/components/s27/DaliArt";

type ProgramKey = keyof typeof S27_PROGRAMS;

/** A still of each program's poster, so the card previews the page it links to. */
function S27Cover({ programKey }: { programKey: ProgramKey }) {
  if (programKey === "dali") {
    return (
      <span className="s27-cover s27-cover--dali" aria-hidden="true">
        <DaliArt className="s27-cover__art" />
        <span className="s27-cover__statement dali-worn">
          Fourteen days
          <br />
          between the mountain
          <br />
          and the lake
        </span>
        <span className="s27-cover__name dali-worn">DALI</span>
      </span>
    );
  }
  return (
    <span className="s27-cover s27-cover--hh" aria-hidden="true">
      <span className="s27-cover__term">
        <span className="s27-cover__prompt">$ ./hacker-house --preview</span>
        <span className="s27-cover__title">S27 Hacker House</span>
        <span className="s27-cover__opens">&gt; opens {S27_PROGRAMS.hackerHouse.openingStamp}</span>
      </span>
      <span className="s27-cover__robot">
        <span className="hh-robot__glow" />
        <span className="hh-robot__body">
          <span className="hh-robot__eyes">
            <i />
            <i />
          </span>
        </span>
      </span>
      <span className="s27-cover__scan" />
    </span>
  );
}

export function S27Countdown({ programKey }: { programKey: ProgramKey }) {
  const program = S27_PROGRAMS[programKey];
  const parts = useCountdown(program.opensAt);
  return (
    <div className="s27-clock-wrap">
      <p className="s27-meta">
        {parts?.reached
          ? "Opening date reached · Application details coming soon"
          : "Applications open in"}
      </p>
      <div
        className="s27-clock"
        role="timer"
        aria-label={`${program.title} application opening countdown`}
      >
        {(["days", "hours", "minutes", "seconds"] as const).map((unit) => (
          <div key={unit}>
            <strong>{parts ? String(parts[unit]).padStart(2, "0") : "—"}</strong>
            <span>{unit}</span>
          </div>
        ))}
      </div>
      <p className="s27-opening">
        <CalendarDays size={14} aria-hidden="true" /> {program.openingLabel} · 00:00 China time
      </p>
    </div>
  );
}

export function S27HomeSection() {
  return (
    <section className="light-home-section s27-section" aria-label="S27 programs">
      <div className="light-shell">
        <LightSectionHeader index="04" label="S27" title="The next rooms." />
        <div className="s27-program-grid">
          {(Object.keys(S27_PROGRAMS) as ProgramKey[]).map((key) => {
            const program = S27_PROGRAMS[key];
            return (
              <article className={`s27-program s27-program--${key}`} key={key}>
                <Link
                  to={program.path}
                  className="s27-program__image"
                  aria-label={`View ${program.title}`}
                >
                  <S27Cover programKey={key} />
                  <span className="s27-program__edition">S27 / {program.category}</span>
                </Link>
                <div className="s27-program__body">
                  <h3>
                    <Link to={program.path}>
                      {program.title}
                      <ArrowUpRight size={22} aria-hidden="true" />
                    </Link>
                  </h3>
                  <p className="s27-program__description">{program.description}</p>
                  <S27Countdown programKey={key} />
                  <Link to={program.path} className="s27-program__link">
                    View program <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
