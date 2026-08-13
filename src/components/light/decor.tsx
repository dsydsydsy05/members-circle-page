import type { CSSProperties, ReactNode } from "react";

/**
 * Archive decor kit for the final paper edition.
 * Styles live in styles/light.css (.hl, .hand-circle, .tape, .stamp).
 */

/** Green highlighter stroke behind a word or short phrase. */
export function Hl({ children }: { children: ReactNode }) {
  return <span className="hl">{children}</span>;
}

/** Hand-drawn green circle around a word. */
export function HandCircle({ children }: { children: ReactNode }) {
  return (
    <span className="hand-circle">
      {children}
      <svg viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
        <path d="M52 4 C76 3 96 13 97 28 C98 44 75 56 49 56 C24 56 4 46 3 30 C2 15 27 4 55 5" />
      </svg>
    </span>
  );
}

/** A strip of translucent tape. Position with className/style (absolute). */
export function Tape({ style }: { style?: CSSProperties }) {
  return <span className="tape" style={style} aria-hidden="true" />;
}

/** Rotated archive stamp, one short line per row. */
export function Stamp({ lines, className = "" }: { lines: string[]; className?: string }) {
  return (
    <span className={`stamp ${className}`.trim()}>
      {lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </span>
  );
}
