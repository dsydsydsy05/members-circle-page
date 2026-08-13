import { useEffect, useRef, type CSSProperties, type PointerEvent } from "react";

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
  const rotorRef = useRef<HTMLDivElement>(null);
  const progress = Math.min(1, Math.max(0, flipProgress));
  const side = Math.abs(Math.sin(progress * Math.PI * 2));

  const dragState = useRef({ dragging: false, lastX: 0, velocity: 0 });
  const angleRef = useRef(0);
  const applyAngle = (value: number) => {
    const rotor = rotorRef.current;
    if (rotor) rotor.style.setProperty("--identity-engine-spin", `${value.toFixed(3)}deg`);
  };

  useEffect(() => {
    const rotor = rotorRef.current;
    if (!rotor) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = true;
    let lastFrameAt = performance.now();

    const tick = (now: number) => {
      frame = 0;
      if (!visible || reducedMotion.matches) return;

      const elapsed = Math.min((now - lastFrameAt) / 1000, 0.05);
      lastFrameAt = now;

      const idleVelocity = 11;
      const drag = dragState.current;
      if (drag.dragging) {
        // angle is driven directly by the pointer while dragging
      } else {
        // ease released momentum back into the idle drift
        drag.velocity += (idleVelocity - drag.velocity) * Math.min(1, elapsed * 2.2);
        angleRef.current = (angleRef.current + drag.velocity * elapsed) % 360;
        applyAngle(angleRef.current);
      }

      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame || !visible || reducedMotion.matches) return;
      lastFrameAt = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const onMotionPreferenceChange = () => {
      if (reducedMotion.matches) {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        applyAngle(0);
      } else {
        start();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          start();
        } else if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: "20% 0px" },
    );

    observer.observe(rotor);
    reducedMotion.addEventListener("change", onMotionPreferenceChange);
    start();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      reducedMotion.removeEventListener("change", onMotionPreferenceChange);
    };
  }, []);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    dragState.current.dragging = true;
    dragState.current.lastX = event.clientX;
    dragState.current.velocity = 0;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    reset();
  };

  const onDragMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (!drag.dragging) return;
    const delta = event.clientX - drag.lastX;
    drag.lastX = event.clientX;
    angleRef.current = (angleRef.current + delta * 0.55) % 360;
    drag.velocity = delta * 14;
    applyAngle(angleRef.current);
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    dragState.current.velocity = Math.max(-900, Math.min(900, dragState.current.velocity));
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };


  const move = (event: PointerEvent<HTMLDivElement>) => {
    onDragMove(event);
    if (
      dragState.current.dragging ||
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
          "--identity-flip": `${progress * 360}deg`,
          "--identity-side": side.toFixed(3),
          touchAction: "pan-y",
          cursor: "grab",
        } as CSSProperties
      }
      onPointerDown={onPointerDown}
      onPointerMove={move}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={(event) => {
        endDrag(event);
        reset();
      }}
    >

      <div className="light-identity-float">
        <div ref={rotorRef} className="light-identity-rotor">
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
