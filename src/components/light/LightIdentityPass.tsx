import { useRef, type CSSProperties, type PointerEvent } from "react";

const edgeLayers = [-3, -2, -1, 0, 1, 2, 3];

export function LightIdentityPass({
  name,
  role,
  location,
  number,
  flipProgress,
}: {
  name: string;
  role: string;
  location: string;
  number: string;
  flipProgress: number;
}) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const progress = Math.min(1, Math.max(0, flipProgress));
  const side = Math.sin(progress * Math.PI);

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType === "touch" ||
      (progress > 0.08 && progress < 0.92) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const element = tiltRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const direction = progress > 0.9 ? -1 : 1;
    element.style.setProperty("--identity-tilt-y", `${x * 4 * direction}deg`);
    element.style.setProperty("--identity-tilt-x", `${y * -3}deg`);
    element.style.setProperty("--identity-light", `${48 + x * 25}%`);
  };

  const reset = () => {
    const element = tiltRef.current;
    if (!element) return;
    element.style.setProperty("--identity-tilt-y", "0deg");
    element.style.setProperty("--identity-tilt-x", "0deg");
    element.style.setProperty("--identity-light", "48%");
  };

  return (
    <div
      className="light-identity-stage"
      style={
        {
          "--identity-flip": `${progress * 180}deg`,
          "--identity-side": side.toFixed(3),
        } as CSSProperties
      }
      onPointerMove={move}
      onPointerLeave={reset}
    >
      <div className="light-identity-float">
        <div className="light-identity-rotor">
          <div ref={tiltRef} className="light-identity-tilt">
            {edgeLayers.map((depth) => (
              <span
                key={depth}
                className="light-identity-edge"
                style={{ "--identity-depth": `${depth}px` } as CSSProperties}
                aria-hidden="true"
              />
            ))}

            <article className="light-identity-pass light-identity-pass--front">
              <span className="light-identity-slot" aria-hidden="true" />
              <div className="light-identity-sheet">
                <header className="light-identity-mast">
                  <span>The Room / Member</span>
                  <span>No. {number}</span>
                </header>
                <div className="light-identity-signal">
                  <svg viewBox="0 0 90 112" aria-hidden="true">
                    <path d="M20 96V14L69 31V96" />
                    <circle cx="59" cy="63" r="2.7" />
                  </svg>
                </div>
                <div className="light-identity-person">
                  <span>Member</span>
                  <strong>{name}</strong>
                  <p>{role}</p>
                </div>
                <footer className="light-identity-details">
                  <div>
                    <span>Based in</span>
                    <b>{location}</b>
                  </div>
                  <div>
                    <span>Access</span>
                    <b>Members only</b>
                  </div>
                </footer>
              </div>
              <span className="light-identity-glint" aria-hidden="true" />
            </article>

            <article className="light-identity-pass light-identity-pass--back" aria-hidden="true">
              <span className="light-identity-slot" />
              <div className="light-identity-sheet light-identity-sheet--back">
                <header className="light-identity-mast">
                  <span>The Room / Boston</span>
                  <span>Est. 2026</span>
                </header>
                <span className="light-identity-back-code">R / {number}</span>
                <div className="light-identity-statement">
                  <strong>
                    A quieter
                    <br /> place to build.
                  </strong>
                  <p>Founders, builders, operators. Real conversations, real work.</p>
                </div>
                <footer className="light-identity-back-footer">
                  <span>No. {number}</span>
                  <span>Members only</span>
                </footer>
              </div>
              <span className="light-identity-glint" aria-hidden="true" />
            </article>
          </div>
        </div>
      </div>
      <span className="light-identity-contact" aria-hidden="true" />
    </div>
  );
}
