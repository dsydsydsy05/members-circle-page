import { useEffect, useRef, useState, type CSSProperties } from "react";
import { LightPage } from "@/components/light/LightSite";
import { S27_PROGRAMS } from "@/lib/s27-programs";
import { pad, useCountdown } from "./use-countdown";

const program = S27_PROGRAMS.hackerHouse;

const GREETING = "WELCOME TO THE ROOM!";

/**
 * A soft two-eyed robot peeking up from the bottom of the screen; its eyes follow the pointer.
 * Clicking it opens a speech bubble with a greeting, which closes again after a few seconds.
 */
function PeekingRobot() {
  const robotRef = useRef<HTMLButtonElement>(null);
  // Counts greetings, so each click re-types the bubble from the start.
  const [greeting, setGreeting] = useState(0);

  useEffect(() => {
    if (!greeting) return;
    const timer = window.setTimeout(() => setGreeting(0), 4500);
    return () => window.clearTimeout(timer);
  }, [greeting]);

  useEffect(() => {
    const robot = robotRef.current;
    if (!robot) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let target = { x: 0, y: 0 };
    let current = { x: 0, y: 0 };
    let raf = 0;
    let lastMove = 0;

    const aim = (clientX: number, clientY: number) => {
      const face = robot.getBoundingClientRect();
      const cx = face.left + face.width / 2;
      const cy = face.top + face.height * 0.3;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const distance = Math.hypot(dx, dy) || 1;
      // Eyes reach their limit about a face-width away, so they settle rather than snap.
      const reach = Math.min(1, distance / (face.width * 1.2));
      target = { x: (dx / distance) * reach, y: (dy / distance) * reach };
      lastMove = performance.now();
    };
    const onPointer = (event: PointerEvent) => aim(event.clientX, event.clientY);
    const loop = (time: number) => {
      // With no pointer for a while, the robot looks around on its own.
      if (!reduced && time - lastMove > 3200) {
        const t = time / 1000;
        target = { x: Math.sin(t * 0.7) * 0.7, y: Math.sin(t * 0.45) * 0.35 - 0.2 };
      }
      current = {
        x: current.x + (target.x - current.x) * 0.14,
        y: current.y + (target.y - current.y) * 0.14,
      };
      robot.style.setProperty("--look-x", current.x.toFixed(3));
      robot.style.setProperty("--look-y", current.y.toFixed(3));
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    <button
      ref={robotRef}
      type="button"
      className="hh-robot"
      aria-label="Say hello to the robot"
      aria-expanded={greeting > 0}
      onClick={() => setGreeting((count) => count + 1)}
    >
      <span className="hh-robot__glow" aria-hidden="true" />
      <span className="hh-robot__body" aria-hidden="true">
        <span className="hh-robot__eyes">
          <i />
          <i />
        </span>
      </span>
      <span className="hh-robot__bubble-slot" aria-live="polite">
        {greeting > 0 ? (
          <span key={greeting} className="hh-bubble">
            <span
              className="hh-bubble__text"
              style={{ "--chars": GREETING.length } as CSSProperties}
            >
              {GREETING}
            </span>
          </span>
        ) : null}
      </span>
    </button>
  );
}

/** A line typed out character by character; `at` is its start in the sequence, in characters. */
function Typed({ text, at, className = "" }: { text: string; at: number; className?: string }) {
  return (
    <span
      className={`hh-typed ${className}`}
      style={{ "--chars": text.length, "--at": at } as CSSProperties}
    >
      {text}
    </span>
  );
}

export function HackerHouseTerminal() {
  const parts = useCountdown(program.opensAt);
  const countdown = parts
    ? parts.reached
      ? "Open now"
      : `${parts.days}d ${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`
    : "--d --:--:--";
  const rows: [string, string][] = [
    ["where", program.location],
    ["when", program.programDates],
    ["closes", program.closingLabel],
  ];
  // Running character offsets, so each line starts typing when the one before it finishes.
  let at = 0;
  const next = (text: string) => {
    const start = at;
    at += text.length + 2;
    return start;
  };
  const prompt = "the-room:~/s27 $ ./hacker-house --preview";
  const notes = [
    `// ${program.description}`,
    `// ${program.detail}`,
    "// Application details will be announced here.",
  ];

  return (
    <LightPage className="s27-reveal-page hh-page">
      <main>
        <section className="hh-screen" data-nav-tone="dark" aria-labelledby="hh-title">
          <div className="hh-screen__inner">
            <p className="hh-prompt">
              <Typed text={prompt} at={next(prompt)} />
            </p>
            <h1 id="hh-title" className="hh-title">
              <Typed text={program.title} at={next(program.title)} />
            </h1>
            {/* The two facts that matter most, set large: when applications open, and how long until then. */}
            <div className="hh-key" style={{ "--at": next("opens") } as CSSProperties}>
              <p className="hh-key__label">&gt; applications open</p>
              <p className="hh-key__value">{program.openingStamp}</p>
              <p className="hh-key__count" role="timer" aria-label="Time until applications open">
                {countdown}
              </p>
            </div>
            <dl className="hh-table">
              {rows.map(([label, value]) => {
                const text = `> ${label.padEnd(8, " ")}${value}`;
                return (
                  <div key={label}>
                    <dt className="print-visually-hidden">{label}</dt>
                    <dd>
                      <Typed text={text} at={next(text)} />
                    </dd>
                  </div>
                );
              })}
            </dl>
            {notes.map((note, index) => (
              <p key={note} className="hh-line hh-line--comment">
                <Typed text={note} at={next(note)} />
                {index === notes.length - 1 ? (
                  <span
                    className="hh-cursor"
                    style={{ "--at": at } as CSSProperties}
                    aria-hidden="true"
                  />
                ) : null}
              </p>
            ))}
          </div>
          <PeekingRobot />
          <span className="hh-scanlines" aria-hidden="true" />
        </section>
      </main>
    </LightPage>
  );
}
