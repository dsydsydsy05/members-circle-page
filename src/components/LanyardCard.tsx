import { useRef } from "react";
import { BrandMark } from "@/components/BrandMark";

export function LanyardCard({
  name = "Member Name",
  role = "What you're building",
  location = "City",
  number = "001",
}: {
  name?: string;
  role?: string;
  location?: string;
  number?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType === "touch" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty("--pass-ry", `${px * 9}deg`);
    card.style.setProperty("--pass-rx", `${py * -7}deg`);
    card.style.setProperty("--pass-shine", `${px * 45 - 35}%`);
  };

  const reset = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--pass-ry", "-7deg");
    card.style.setProperty("--pass-rx", "3deg");
    card.style.setProperty("--pass-shine", "-55%");
  };

  return (
    <div className="member-pass-wrap" onPointerMove={onPointerMove} onPointerLeave={reset}>
      <div ref={cardRef} className="member-pass" aria-label="The Room member pass specimen">
        <div className="member-pass__slot" />
        <div className="member-pass__signal">
          <BrandMark compact className="member-pass__door" />
        </div>
        <div className="member-pass__body">
          <div className="member-pass__meta">
            <span>The Room</span>
            <span>No. {number}</span>
          </div>
          <div className="member-pass__identity">
            <small>Member</small>
            <strong>{name}</strong>
            <span>{role}</span>
          </div>
          <div className="member-pass__foot">
            <span>{location}</span>
            <span>Members only</span>
          </div>
        </div>
      </div>
    </div>
  );
}
