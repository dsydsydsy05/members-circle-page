import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/BrandMark";
import { useAuth } from "@/lib/use-auth";
import { useCommunityMembers } from "@/lib/use-community-members";
import { useFactoryCount } from "@/lib/use-factory-count";
import { useFamilyBusinessCount } from "@/lib/use-family-business-count";
import { useEvents } from "@/lib/use-site-content";
import { LightEventStudies } from "@/components/light/LightEventStudies";
import { LightArchiveIndex } from "@/components/light/LightMemberArchive";
import { LightIdentityPass } from "@/components/light/LightIdentityPass";
import { LightPartnerLogoGrid } from "@/components/light/LightPartnerLogoGrid";
import { LightButton, LightPage, LightSectionHeader } from "@/components/light/LightSite";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function LightCount({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        if (reduced) {
          setDisplay(value);
          return;
        }
        const started = performance.now();
        const tick = (now: number) => {
          const progress = clamp((now - started) / 650);
          setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.45 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{display}</span>;
}

function LightFlipHero() {
  const { isSignedIn, profile } = useAuth();
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const name = isSignedIn && profile?.full_name ? profile.full_name : "Member Name";
  const number = profile?.member_no == null ? "000" : String(profile.member_no).padStart(3, "0");
  const role =
    [profile?.position, profile?.startup].filter(Boolean).join(" / ") || "What you're building";
  const location = profile?.school || "Boston / The Room";

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setProgress(0);
        return;
      }
      const rect = section.getBoundingClientRect();
      const distance = Math.max(section.offsetHeight - window.innerHeight, 1);
      setProgress(clamp(-rect.top / distance));
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, []);

  const flipProgress = 0;

  return (
    <section
      ref={sectionRef}
      className="light-home-hero"
      style={
        {
          "--flip-y": `${flipProgress * 180}deg`,
          "--light-hero-progress": progress.toFixed(3),
        } as CSSProperties
      }
    >
      <div className="light-shell light-home-hero__frame">
        <div className="light-pass-stage">
          <LightIdentityPass
            name={name}
            number={number}
            role={role}
            location={location}
            flipProgress={flipProgress}
          />
        </div>
        <a className="light-home-scroll-cue" href="#founding-letter" aria-label="Scroll down">
          <span>Scroll down</span>
          <i aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

function FoundingLetter() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setProgress(1);
        return;
      }
      const rect = section.getBoundingClientRect();
      const distance = Math.max(section.offsetHeight - window.innerHeight, 1);
      setProgress(clamp(-rect.top / distance));
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, []);

  const metaProgress = clamp((progress - 0.015) / 0.16);
  const noteProgress = clamp((progress - 0.1) / 0.2);
  const mapProgress = clamp((progress - 0.06) / 0.4);
  const photoProgress = clamp((progress - 0.18) / 0.25);

  return (
    <section
      id="founding-letter"
      ref={sectionRef}
      className="light-letter-stage"
      style={
        {
          "--letter-progress": progress.toFixed(3),
          "--letter-meta-progress": metaProgress.toFixed(3),
          "--letter-note-progress": noteProgress.toFixed(3),
          "--letter-map-progress": mapProgress.toFixed(3),
          "--letter-photo-progress": photoProgress.toFixed(3),
        } as CSSProperties
      }
    >
      <div className="light-letter-stage__sticky">
        <article className="light-letter">
          <header className="light-letter__head">
            <div className="light-letter__origin">
              <span>Boston, Massachusetts</span>
              <span>August, 2026</span>
            </div>
            <div className="light-letter__recipient">
              <span>To</span>
              <span>Founders, builders,</span>
              <span>and people creating what’s next</span>
            </div>
          </header>
          <div className="light-letter__meta">The Room / Founding letter / 08—2026</div>
          <aside
            className="light-letter__annotation light-letter__annotation--left"
            aria-hidden="true"
          >
            A room to ask.
            <br />A room to meet.
          </aside>
          <aside
            className="light-letter__annotation light-letter__annotation--right"
            aria-hidden="true"
          >
            Capital · opportunities
            <br />· resources
          </aside>
          <div className="light-letter__body">
            <p className="light-letter__line" style={{ "--line-at": 0.04 } as CSSProperties}>
              The Room is a <mark>founder community</mark> born in Boston in 2026.
            </p>
            <p className="light-letter__line" style={{ "--line-at": 0.1 } as CSSProperties}>
              We believe founders <mark>don’t need more noise.</mark>
              <br />
              They need <mark className="light-letter__highlight--warm">the right room.</mark>
            </p>
            <p className="light-letter__line" style={{ "--line-at": 0.18 } as CSSProperties}>
              A room to ask.
              <br />
              A room to meet people who’ve done it before.
              <br />A room for <mark>capital, opportunities, and resources.</mark>
              <br />A room for whatever you need next.
            </p>
            <p className="light-letter__line" style={{ "--line-at": 0.28 } as CSSProperties}>
              We create{" "}
              <mark className="light-letter__highlight--warm">outside-the-box events</mark> and open
              up the resources we receive back to the founder community — so the{" "}
              <mark>right things can reach the right people.</mark>
            </p>
            <p
              className="light-letter__line light-letter__closing"
              style={{ "--line-at": 0.38 } as CSSProperties}
            >
              Find the room you need.
              <br />
              Be in the right room.
            </p>
            <div
              className="light-letter__line light-letter__signature"
              style={{ "--line-at": 0.46 } as CSSProperties}
              aria-label="Signed, The Room"
            >
              <span>with care,</span>
              <span className="light-letter__signature-art" aria-hidden="true">
                <img src="/images/the-room-signature.png" alt="" />
              </span>
            </div>
          </div>
          <figure className="light-letter__campus">
            <img
              src="/images/babson-college.jpg"
              alt="Babson College entrance in Wellesley, Massachusetts"
            />
            <figcaption>Babson College / Wellesley, Massachusetts</figcaption>
          </figure>
          <span className="light-letter__coordinates" aria-hidden="true">
            42.3601° N · 71.0589° W
          </span>
          <figure
            className="light-letter__map"
            aria-label="Pencil outline of Boston, Massachusetts"
          >
            <svg viewBox="0 0 220 132" role="img" aria-hidden="true">
              <path
                className="light-letter__map-echo"
                d="M22 16 L112 18 L138 26 L146 38 L138 46 L128 50 L136 60 L154 60 L172 50 L184 34 L178 30 L170 40 L158 62 L140 80 L122 88 L98 92 L44 88 L22 84 Z"
                pathLength="1"
                strokeDasharray="1 1"
                strokeDashoffset={1 - mapProgress}
              />
              <path
                className="light-letter__map-outline"
                d="M22 16 L112 18 L138 26 L146 38 L138 46 L128 50 L136 60 L154 60 L172 50 L184 34 L178 30 L170 40 L158 62 L140 80 L122 88 L98 92 L44 88 L22 84 Z"
                pathLength="1"
                strokeDasharray="1 1"
                strokeDashoffset={1 - mapProgress}
              />
              <path
                className="light-letter__map-detail"
                d="M53 30 C78 35 101 31 126 39 M48 65 C74 60 103 68 126 57 M93 19 C91 43 96 65 98 91"
                pathLength="1"
                strokeDasharray="1 1"
                strokeDashoffset={1 - mapProgress}
              />
              <g className="light-letter__map-point">
                <circle cx="128" cy="50" r="2" />
                <circle cx="128" cy="50" r="7" />
              </g>
              <text x="134" y="47">
                Boston
              </text>
            </svg>
            <figcaption>
              <span>Boston / Massachusetts</span>
            </figcaption>
          </figure>
          <span className="light-letter__registration" aria-hidden="true">
            TR—001 / BOSTON / ARCHIVE
          </span>
        </article>
      </div>
    </section>
  );
}

export function LightHome() {
  const { members, loading: membersLoading } = useCommunityMembers();
  const familyBusinessCount = useFamilyBusinessCount();
  const factoryCount = useFactoryCount();
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const upcoming = events.filter((event) => event.status.toLowerCase() !== "past").slice(0, 3);
  const cityCount = new Set(members.map((member) => member.city).filter(Boolean)).size;

  return (
    <LightPage className="light-home">
      <main>
        <LightFlipHero />

        <FoundingLetter />

        <section className="light-data-line" aria-label="The Room in numbers">
          <div className="light-shell light-data-line__grid">
            {[
              [members.length, "Members"],
              [cityCount, "Cities"],
              [familyBusinessCount, "Family businesses"],
              [factoryCount, "Vetted factories"],
            ].map(([value, label]) => (
              <div key={label}>
                <strong>
                  <LightCount value={Number(value)} />
                </strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="light-home-section light-home-members">
          <div className="light-shell">
            <LightSectionHeader title={<>People in the room.</>} />
            {membersLoading ? (
              <p className="light-empty">Preparing member files…</p>
            ) : members.length ? (
              <LightArchiveIndex members={members} />
            ) : (
              <p className="light-empty">The first member files are being prepared.</p>
            )}
          </div>
        </section>

        <section className="light-home-section light-home-events">
          <div className="light-shell">
            <LightSectionHeader
              index="03"
              label="Events"
              title="Upcoming events."
              action={<Link to="/events">See all ↗</Link>}
            />
            {eventsLoading ? (
              <p className="light-empty">Loading the agenda…</p>
            ) : upcoming.length ? (
              <LightEventStudies events={upcoming} />
            ) : (
              <p className="light-empty">The next gathering is being prepared.</p>
            )}
          </div>
        </section>

        <section className="light-partner-rail">
          <div className="light-shell light-partner-rail__heading">
            <div className="light-partner-rail__label">04 / Ecosystem partners</div>
          </div>
          <LightPartnerLogoGrid compact />
        </section>

        <section className="light-final-cta">
          <div className="light-shell light-final-cta__panel">
            <BrandMark compact className="light-final-cta__watermark" aria-hidden="true" />
            <BrandMark className="light-final-cta__mark" />
            <h2>
              Join the room,
              <br /> now.
            </h2>
            <LightButton to="/auth" inverse>
              Enter the room ↗
            </LightButton>
          </div>
        </section>
      </main>
    </LightPage>
  );
}
