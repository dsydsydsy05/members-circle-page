import type { SVGProps } from "react";

type BrandMarkProps = SVGProps<SVGSVGElement> & {
  compact?: boolean;
};

export function BrandMark({ compact = false, ...props }: BrandMarkProps) {
  if (compact) {
    return (
      <svg viewBox="0 0 28 36" aria-hidden="true" {...props}>
        <path d="M4 32V4l19 5v23" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="18.4" cy="19" r="1.3" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 270 34" role="img" aria-label="The Room" {...props}>
      <g fill="currentColor">
        <path d="M1 8h34v2H19v18h-2V10H1V8Z" />
        <path d="M47 8h2v9h23V8h2v20h-2v-9H49v9h-2V8Z" />
        <path d="M88 8h29v2H90v7h23v2H90v7h27v2H88V8Z" />
        <path d="M139 8h19.5c6.5 0 10.5 3.1 10.5 8 0 3.8-2.6 6.5-7 7.5l8 4.5h-4l-7.4-4.2H141V28h-2V8Zm2 2v11.8h17.3c5.2 0 8.7-2.1 8.7-5.8s-3.5-6-8.7-6H141Z" />
        <path d="M204 18c0-6.2 5.1-10.5 13-10.5S230 11.8 230 18s-5.1 10.5-13 10.5S204 24.2 204 18Zm2 0c0 5.1 4.2 8.5 11 8.5s11-3.4 11-8.5-4.2-8.5-11-8.5-11 3.4-11 8.5Z" />
        <path d="M240 8h2l12 17 12-17h2v20h-2V11.4L254.8 28h-1.6L242 11.4V28h-2V8Z" />
      </g>
      <g transform="translate(177 1)" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M3 31V2l20 5.5V31" />
        <circle cx="18.5" cy="18.5" r="1.1" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

export function DoorSignal({ className = "" }: { className?: string }) {
  return (
    <div className={`door-signal ${className}`} aria-hidden="true">
      <svg viewBox="0 0 180 250" className="door-signal__door">
        <path d="M36 228V28l108 30v170" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="117" cy="146" r="3" fill="currentColor" />
      </svg>
      <div className="door-signal__beam" />
    </div>
  );
}
