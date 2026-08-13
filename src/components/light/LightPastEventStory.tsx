import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { EventRow } from "@/lib/use-site-content";

function storyParagraphs(event: EventRow) {
  return (event.body || "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function LightPastEventStory({
  event,
  onClose,
  returnFocus,
}: {
  event: EventRow | null;
  onClose: () => void;
  returnFocus: HTMLElement | null;
}) {
  const [mountedEvent, setMountedEvent] = useState<EventRow | null>(event);
  const [entered, setEntered] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (event) {
      setMountedEvent(event);
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEntered(true);
          dialogRef.current?.focus();
        });
      });
      return () => {
        cancelAnimationFrame(frame);
        document.body.style.overflow = previousOverflow;
      };
    }

    setEntered(false);
    const timeout = window.setTimeout(() => {
      setMountedEvent(null);
      returnFocus?.focus();
    }, 420);
    return () => window.clearTimeout(timeout);
  }, [event, returnFocus]);

  useEffect(() => {
    if (!mountedEvent) return;

    const onKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") {
        onClose();
        return;
      }
      if (keyboardEvent.key !== "Tab" || !dialogRef.current) return;

      const controls = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]"),
      );
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (keyboardEvent.shiftKey && document.activeElement === first) {
        keyboardEvent.preventDefault();
        last.focus();
      } else if (!keyboardEvent.shiftKey && document.activeElement === last) {
        keyboardEvent.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mountedEvent, onClose]);

  if (!mountedEvent || typeof document === "undefined") return null;

  const paragraphs = storyParagraphs(mountedEvent);
  const heroImage = mountedEvent.detail_image_url || mountedEvent.cover_url || "";

  return createPortal(
    <div
      className={`light-event-story-overlay ${entered ? "light-event-story-overlay--open" : ""}`}
      onMouseDown={(mouseEvent) => {
        if (mouseEvent.target === mouseEvent.currentTarget) onClose();
      }}
    >
      <article
        ref={dialogRef}
        className="light-event-story"
        role="dialog"
        aria-modal="true"
        aria-labelledby="waic-event-story-title"
        tabIndex={-1}
      >
        <header className="light-event-story__hero">
          <img src={heroImage} alt="Guests gathering at The Room founder dinner in Shanghai" />
          <button type="button" className="light-event-story__close" onClick={onClose}>
            Close <span aria-hidden="true">×</span>
          </button>
          <div className="light-event-story__heading">
            <p>Past event · Shanghai</p>
            <h2 id="waic-event-story-title">{mountedEvent.title}</h2>
            <span>{mountedEvent.summary}</span>
          </div>
        </header>

        <div className="light-event-story__content">
          <div className="light-event-story__file-line">
            <span>The Room / Event archive</span>
            <span>File 001 / WAIC 2026</span>
          </div>

          <dl className="light-event-story__facts">
            <div>
              <dt>Date</dt>
              <dd>{mountedEvent.date_label}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{mountedEvent.city}</dd>
            </div>
            <div>
              <dt>Format</dt>
              <dd>By invitation</dd>
            </div>
            <div>
              <dt>At the table</dt>
              <dd>30 guests</dd>
            </div>
          </dl>

          <div className="light-event-story__body">
            <div>
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <footer className="light-event-story__footer">
            <span>Filed in Shanghai / July 2026</span>
            <button type="button" onClick={onClose}>
              Return to Events ↑
            </button>
          </footer>
        </div>
      </article>
    </div>,
    document.body,
  );
}
