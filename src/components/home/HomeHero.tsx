import { Link } from "@tanstack/react-router";
import { BrandMark, DoorSignal } from "@/components/BrandMark";
import { LanyardCard } from "@/components/LanyardCard";

export function HomeHero() {
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <DoorSignal className="hero-door" />
      <div className="home-hero__grid">
        <div className="home-hero__copy">
          <BrandMark className="home-hero__brand" />
          <h1 id="home-title" className="display-title">
            A quieter
            <br />
            place to build.
          </h1>
          <p className="home-hero__kicker">A private community for people building what’s next.</p>
          <div className="home-hero__actions">
            <a href="#who-we-are" className="explore-link">
              Explore <span aria-hidden="true">↓</span>
            </a>
            <Link to="/auth" className="text-link">
              Enter the room ↗
            </Link>
          </div>
        </div>
        <div className="home-hero__visual">
          <LanyardCard />
        </div>
      </div>
      <div className="home-hero__index">Private / Curated / Builder-first</div>
    </section>
  );
}
