import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { clamp, useScrollProgress } from "@/components/print/use-scroll-progress";

const FOCUS_Y = 0.45;
// Light → dark, so denser glyphs print more ink on the paper.
const RAMP = " .,:-=+*#%@";
const PAPER = "#ffffff";
const INK = "#161616";

function smooth(value: number) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

type Grid = {
  cols: number;
  rows: number;
  cell: number;
  dpr: number;
  order: Float32Array;
  atlas: HTMLCanvasElement;
  sample: HTMLCanvasElement;
  levels: Uint8Array;
  zoom: number;
};

function createGrid(width: number, height: number): Grid {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cell = width < 640 ? 7 : 9;
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const order = new Float32Array(cols * rows);
  for (let i = 0; i < order.length; i += 1) {
    const x = i % cols;
    const y = Math.floor(i / cols);
    const noise = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
    // A diagonal sweep broken up by noise, so the plate re-prints corner to corner.
    order[i] = clamp(0.6 * noise + 0.4 * ((x / cols + y / rows) / 2));
  }

  const atlas = document.createElement("canvas");
  atlas.width = RAMP.length * cell * dpr;
  atlas.height = cell * dpr;
  const actx = atlas.getContext("2d")!;
  actx.scale(dpr, dpr);
  actx.font = `500 ${Math.round(cell * 1.08)}px "IBM Plex Mono", ui-monospace, monospace`;
  actx.textAlign = "center";
  actx.textBaseline = "middle";
  actx.fillStyle = INK;
  for (let level = 0; level < RAMP.length; level += 1) {
    actx.fillText(RAMP[level], level * cell + cell / 2, cell / 2 + 0.5);
  }

  const sample = document.createElement("canvas");
  sample.width = cols;
  sample.height = rows;
  return {
    cols,
    rows,
    cell,
    dpr,
    order,
    atlas,
    sample,
    levels: new Uint8Array(cols * rows),
    zoom: 0,
  };
}

// Re-sample the photo at the current zoom. Zooming here instead of with CSS keeps glyphs sharp.
function sampleGrid(grid: Grid, image: HTMLImageElement, zoom: number) {
  if (Math.abs(grid.zoom - zoom) < 0.0005) return;
  grid.zoom = zoom;
  const { cols, rows, sample, levels } = grid;
  const ctx = sample.getContext("2d", { willReadFrequently: true })!;
  const scale = Math.max(cols / image.naturalWidth, rows / image.naturalHeight) * zoom;
  const dw = image.naturalWidth * scale;
  const dh = image.naturalHeight * scale;
  ctx.clearRect(0, 0, cols, rows);
  ctx.drawImage(image, (cols - dw) / 2, (rows - dh) * FOCUS_Y, dw, dh);
  const { data } = ctx.getImageData(0, 0, cols, rows);
  const lum = new Float32Array(levels.length);
  for (let i = 0; i < levels.length; i += 1) {
    lum[i] = (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) / 255;
  }
  for (let i = 0; i < levels.length; i += 1) {
    // Unsharp mask so the sign, trunks and wall edges survive the coarse grid.
    const x = i % cols;
    const y = Math.floor(i / cols);
    let sum = 0;
    let n = 0;
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        sum += lum[ny * cols + nx];
        n += 1;
      }
    }
    const luma = lum[i] + 1.6 * (lum[i] - sum / n);
    const ink = clamp((1 - luma - 0.22) * 1.45);
    levels[i] = Math.round(Math.pow(ink, 1.25) * (RAMP.length - 1));
  }
}

function drawGrid(ctx: CanvasRenderingContext2D, grid: Grid, amount: number, time: number) {
  const { cols, cell, dpr, order, atlas, levels } = grid;
  const size = cell * dpr;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (amount <= 0) return;
  ctx.fillStyle = PAPER;
  const full = amount >= 1;
  if (full) ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const tick = Math.floor(time / 110);
  for (let i = 0; i < levels.length; i += 1) {
    const local = (amount - order[i]) / 0.1;
    if (local <= 0) continue;
    const x = (i % cols) * size;
    const y = Math.floor(i / cols) * size;
    if (!full) ctx.fillRect(x, y, size, size);
    let level = levels[i];
    // Mid-dissolve cells over-ink first, like a plate being struck.
    if (local < 1) level = Math.min(RAMP.length - 1, level + Math.round((1 - local) * 5));
    // While held, a sparse flicker keeps the frozen frame alive.
    else if (full && level > 1 && (i * 7919 + tick * 104729) % 131 === 0) level -= 1;
    if (level === 0) continue;
    ctx.drawImage(atlas, level * size, 0, size, size, x, y, size, size);
  }
}

/**
 * Pinned intro: the photo plate opens to full bleed, re-prints itself as type, holds
 * (bullet time) and resolves back to the photo.
 */
export function PrintFrame({
  photo,
  alt,
  plate,
  caption,
  hud,
  line,
}: {
  photo: string;
  alt: string;
  plate: string;
  caption: [string, string];
  hud: [string, string];
  line: ReactNode;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const stateRef = useRef({ amount: 0, zoom: 1 });
  const { progress, reduced } = useScrollProgress(sectionRef, 0);

  // Timeline: plate → open to full bleed → re-print as type → hold → back to the photo.
  const push = smooth((progress - 0.03) / 0.2);
  const toType = clamp((progress - 0.26) / 0.14);
  const toPhoto = clamp((progress - 0.8) / 0.12);
  const amount = reduced ? 0 : toType * (1 - toPhoto) * 1.1;
  const hold = clamp((progress - 0.38) / 0.42);
  stateRef.current = { amount, zoom: 1 + smooth(hold) * 0.08 };
  const held = amount >= 1;
  const shutter = held
    ? `HELD 00:0${Math.floor(hold * 9)}:${String(Math.floor(hold * 600) % 60).padStart(2, "0")}`
    : "1/125 S";

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    const image = imageRef.current;
    const section = sectionRef.current;
    const frame = canvas?.parentElement;
    if (!canvas || !image || !section || !frame) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let grid: Grid | null = null;
    let raf = 0;
    let visible = false;
    let cancelled = false;

    const rebuild = () => {
      const width = frame.clientWidth;
      const height = frame.clientHeight;
      if (!width || !height) return;
      grid = createGrid(width, height);
      canvas.width = grid.cols * grid.cell * grid.dpr;
      canvas.height = grid.rows * grid.cell * grid.dpr;
      canvas.style.width = `${grid.cols * grid.cell}px`;
      canvas.style.height = `${grid.rows * grid.cell}px`;
    };
    const loop = (time: number) => {
      raf = 0;
      if (cancelled || !visible) return;
      const ready = image.complete && image.naturalWidth > 0;
      if (grid && ready) {
        const { amount: a, zoom } = stateRef.current;
        if (a > 0) sampleGrid(grid, image, zoom);
        drawGrid(ctx, grid, a, time);
      }
      raf = requestAnimationFrame(loop);
    };

    void (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (!cancelled) rebuild();
    });
    const resize = new ResizeObserver(rebuild);
    resize.observe(frame);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    observer.observe(section);
    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      resize.disconnect();
      observer.disconnect();
    };
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      className={`print-frame${reduced ? " print-frame--still" : ""}`}
      aria-label={alt}
      style={
        {
          "--frame-push": push.toFixed(4),
          "--frame-type": clamp(amount).toFixed(3),
          // The photo drifts with the same dolly as the type, so the handoff back is seamless.
          "--frame-zoom": stateRef.current.zoom.toFixed(4),
        } as CSSProperties
      }
    >
      <div className="print-frame__sticky">
        <i className="print-frame__corner print-frame__corner--tl" aria-hidden="true" />
        <i className="print-frame__corner print-frame__corner--tr" aria-hidden="true" />
        <i className="print-frame__corner print-frame__corner--bl" aria-hidden="true" />
        <i className="print-frame__corner print-frame__corner--br" aria-hidden="true" />
        <span className="print-frame__plate-no" aria-hidden="true">
          {plate}
        </span>
        <div className="print-frame__window">
          <img ref={imageRef} src={photo} alt={alt} />
          <canvas ref={canvasRef} aria-hidden="true" />
        </div>
        <p className="print-frame__caption" aria-hidden="true">
          <span>{caption[0]}</span>
          <span>{caption[1]}</span>
        </p>

        <div className="print-frame__hud" aria-hidden="true">
          <span>{hud[0]}</span>
          <span>{hud[1]}</span>
          <span>
            {held ? "▌▌" : "▶"} {shutter}
          </span>
        </div>
        <div className="print-frame__line">{line}</div>
      </div>
    </section>
  );
}
