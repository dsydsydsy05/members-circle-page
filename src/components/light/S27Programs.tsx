import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { LightPage, LightSectionHeader } from "./LightSite";
import { S27_PROGRAMS } from "@/lib/s27-programs";
import { useCountdown } from "@/components/s27/use-countdown";
import hackerHouseImage from "@/assets/s27-hacker-house.jpg";
import daliImage from "@/assets/s27-dali-residency.jpg";

type ProgramKey = keyof typeof S27_PROGRAMS;
const images = { hackerHouse: hackerHouseImage, dali: daliImage };
const imageAlts = {
  hackerHouse: "Abstract wireframe planes and a shared cube with halftone and pixel accents",
  dali: "Abstract leaf-like wireframe and halftone ripples with pixel accents",
};

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
                  <img
                    src={images[key]}
                    alt={imageAlts[key]}
                    width={1440}
                    height={960}
                    loading="lazy"
                  />
                  <span className="s27-program__edition">S27 / {program.category}</span>
                  <span className="s27-program__number" aria-hidden="true">
                    {key === "dali" ? "14" : "01"}
                  </span>
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
