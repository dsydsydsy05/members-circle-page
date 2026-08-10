import { Link } from "@tanstack/react-router";
import { DoorSignal } from "@/components/BrandMark";

export function EnterSection() {
  return (
    <section className="enter-section" aria-labelledby="enter-title">
      <DoorSignal />
      <div className="enter-section__content reveal-in">
        <div className="eyebrow justify-center">08 / Access</div>
        <h2 id="enter-title" className="mt-10">
          Good people.
          <br />
          Real work.
          <br />
          What’s next.
        </h2>
        <Link to="/auth" className="signal-link">
          Enter the room ↗
        </Link>
      </div>
    </section>
  );
}
