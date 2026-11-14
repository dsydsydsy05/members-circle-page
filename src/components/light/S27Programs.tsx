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
  hackerHouse: "Halftone collage of builders collaborating around a shared table with laptops and monitors",
  dali: "Retro digital collage of Dali mountains, halftone lake and a pixel sun",
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
              <article className={`s27-program s27-program--${key}`} key={key}>
                <Link to={program.path} className="s27-program__image" aria-label={`View ${program.title}`}>
                  <img src={images[key]} alt={imageAlts[key]} width={1440} height={960} loading="lazy" />
                  <span className="s27-program__edition">S27 / {program.category}</span>
                  <span className="s27-program__number" aria-hidden="true">{key === "dali" ? "14" : "01"}</span>
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
    <LightPage className={`s27-page s27-page--${programKey}`}>
      <main>
        <section className="s27-cover" aria-labelledby="s27-title">
          <img className="s27-cover__image" src={images[programKey]} alt={imageAlts[programKey]} width={1440} height={960} />
          <div className="s27-cover__registration" aria-hidden="true"><span>FIELD NOTES / S27</span><span>{programKey === "dali" ? "25°41′ N / 100°09′ E" : "THE ROOM / 001"}</span></div>
          <div className="light-shell s27-cover__content">
            <p className="s27-meta">The Room / {program.category}</p>
            <h1 id="s27-title" aria-label={program.title}>
              <span className="s27-title__season">S27</span>
              {programKey === "dali" ? <><span>Dali.</span><span className="s27-title__subtitle">Founder Residency</span></> : <><span>Hacker</span><span className="s27-title__last">House.</span></>}
            </h1>
            <p>{program.description}</p>
            <a href="#opening" className="light-button">Application opening <ArrowUpRight size={16} aria-hidden="true" /></a>
          </div>
          <aside className="s27-ticket" aria-label="Application opening pass">
            <div className="s27-ticket__top"><span>THE ROOM</span><span>S27 / {programKey === "dali" ? "02" : "01"}</span></div>
            <p className="s27-ticket__name">{programKey === "dali" ? "DALI / 14 DAYS" : "HACKER HOUSE"}</p>
            <S27Countdown programKey={programKey} />
            <div className="s27-ticket__bottom"><span className="s27-ticket__barcode" aria-hidden="true" /><span>APPLICATION<br />OPENING PASS</span></div>
          </aside>
          <span className="s27-cover__caption">THE ROOM / S27 — FIELD NOTES SERIES</span>
        </section>
        <section id="opening" className="s27-opening-section">
          <div className="light-shell s27-opening-section__grid">
            <div>
              <p className="s27-meta">S27 / Applications</p>
              <h2>{programKey === "dali" ? "14 days. Dali." : "S27 Hacker House."}</h2>
              <p>{program.detail}</p>
              <p className="s27-opening-note">Application details will be announced here.</p>
            </div>
            <div className="s27-specs">
              <div><span>01 / PROGRAM</span><strong>{program.category}</strong></div>
              <div><span>02 / APPLICATIONS</span><strong>{program.openingLabel}</strong></div>
              <div><span>03 / STATUS</span><strong>Opening soon <ArrowUpRight size={18} aria-hidden="true" /></strong></div>
            </div>
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