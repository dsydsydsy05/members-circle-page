import { useEffect, useState, type RefObject } from "react";

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

/**
 * 0 → 1 progress of a tall section scrolling past a pinned viewport.
 * Reduced-motion visitors get `reducedValue` so sections render their settled state.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, reducedValue = 1) {
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = ref.current;
      if (!section) return;
      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setReduced(isReduced);
      if (isReduced) {
        setProgress(reducedValue);
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
  }, [ref, reducedValue]);

  return { progress, reduced };
}
