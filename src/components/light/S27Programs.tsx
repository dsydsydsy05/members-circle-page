import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { LightPage, LightSectionHeader } from "./LightSite";
import { S27_PROGRAMS, countdownParts } from "@/lib/s27-programs";
import hackerHouseImage from "@/assets/s27-hacker-house.jpg";
import daliImage from "@/assets/s27-dali-residency.jpg";

type ProgramKey = keyof typeof S27_PROGRAMS;
const images = { hackerHouse: hackerHouseImage, dali: daliImage };
const imageAlts = {
  hackerHouse: "Illustrative shared house workspace for founders",
  dali: "Illustrative lakeside workspace in Dali with mountain views",
};

export function S27Countdown({ programKey }: { programKey: ProgramKey }) {
  const program = S27_PROGRAMS[programKey];
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const parts = now === null ? null : countdownParts(program.opensAt, now);
  return (
    <div className="s27-clock-wrap">
      <p className="s27-meta">{parts?.reached ? "Opening date reached · Application details coming soon" : "Applications open in"}</p>
      <div className="s27-clock" role="timer" aria-label={`${program.title} application opening countdown`}>
        {(["days", "hours", "minutes", "seconds"] as const).map((unit) => (
          <div key={unit}>
            <strong>{parts ? String(parts[unit]).padStart(2, "0") : "—"}</strong>
            <span>{unit}</span>
          </div>
        ))}
      </div>
      <p className="s27-opening"><CalendarDays size={14} aria-hidden="true" /> {program.openingLabel} · 00:00 China time</p>
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
              <article className="s27-program" key={key}>
                <Link to={program.path} className="s27-program__image" aria-label={`View ${program.title}`}>
                  <img src={images[key]} alt={imageAlts[key]} width={1440} height={960} loading="lazy" />
                  <span className="s27-program__edition">S27 / {program.category}</span>
                </Link>
                <div className="s27-program__body">
                  <h3><Link to={program.path}>{program.title}<ArrowUpRight size={22} aria-hidden="true" /></Link></h3>
                  <p className="s27-program__description">{program.description}</p>
                  <S27Countdown programKey={key} />
                  <Link to={program.path} className="s27-program__link">View program <ArrowUpRight size={16} aria-hidden="true" /></Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function S27ProgramPage({ programKey }: { programKey: ProgramKey }) {
  const program = S27_PROGRAMS[programKey];
  const otherKey = programKey === "hackerHouse" ? "dali" : "hackerHouse";
  const other = S27_PROGRAMS[otherKey];
  return (
    <LightPage className="s27-page">
      <main>
        <section className="s27-cover" data-nav-tone="dark">
          <img className="s27-cover__image" src={images[programKey]} alt={imageAlts[programKey]} width={1440} height={960} />
          <div className="light-shell s27-cover__content">
            <p className="s27-meta">The Room / {program.category}</p>
            <h1>{program.title}</h1>
            <p>{program.description}</p>
            <a href="#opening" className="light-button light-button--inverse">Application opening <ArrowUpRight size={16} aria-hidden="true" /></a>
          </div>
          <span className="s27-cover__caption">Illustrative image</span>
        </section>
        <section id="opening" className="s27-opening-section">
          <div className="light-shell s27-opening-section__grid">
            <div>
              <p className="s27-meta">S27 / Applications</p>
              <h2>{programKey === "dali" ? "14 days. Dali." : "S27 Hacker House."}</h2>
              <p>{program.detail}</p>
              <p className="s27-opening-note">Application details will be announced here.</p>
            </div>
            <S27Countdown programKey={programKey} />
          </div>
        </section>
        <div className="light-shell s27-other-program">
          <span className="s27-meta">Also in S27</span>
          <Link to={other.path}>{other.title} <ArrowUpRight size={20} aria-hidden="true" /></Link>
        </div>
      </main>
    </LightPage>
  );
}