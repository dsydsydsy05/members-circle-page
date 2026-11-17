/**
 * Engraving-style line drawing of Dali: the Cangshan range, the Three Pagodas of Chongsheng
 * Temple, a Bai gatehouse with its screen wall, and Erhai Lake. Everything is generated once from
 * a seeded random source, so the drawing is identical on the server and in the browser.
 */

const W = 1600;
const H = 720;
const HORIZON = 548;

function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

const f = (n: number) => n.toFixed(1);

/* Cangshan: a jagged ridge with snow hatching under each summit. */
// Taller at the sides, lower behind the centre, so the stacked lettering stays clear.
const PEAKS = [
  { x: 60, h: 250, w: 150 },
  { x: 300, h: 330, w: 170 },
  { x: 560, h: 245, w: 150 },
  { x: 800, h: 185, w: 170 },
  { x: 1060, h: 250, w: 160 },
  { x: 1320, h: 345, w: 175 },
  { x: 1580, h: 260, w: 150 },
];
const RIDGE_BASE = 470;

function ridgeY(x: number, scale = 1, shift = 0) {
  let height = 0;
  for (const peak of PEAKS) {
    const dx = Math.abs(x - peak.x - shift) / peak.w;
    height = Math.max(height, peak.h * scale * Math.exp(-dx * 2.1));
  }
  const grain = Math.sin(x * 0.061) * 5 + Math.sin(x * 0.173 + 1.3) * 3 + Math.sin(x * 0.41) * 1.5;
  return RIDGE_BASE - height - grain * scale;
}

function mountains() {
  const rand = seeded(11);
  const ridge: string[] = [];
  const far: string[] = [];
  for (let x = 0; x <= W; x += 6) {
    ridge.push(`${x === 0 ? "M" : "L"}${f(x)} ${f(ridgeY(x))}`);
    far.push(`${x === 0 ? "M" : "L"}${f(x)} ${f(ridgeY(x, 0.78, 140) - 40)}`);
  }
  // Snow: short strokes falling from the ridge, longer near the summits, leaning down the slope.
  const snow: string[] = [];
  for (let x = 4; x < W; x += 5 + rand() * 3) {
    const y = ridgeY(x);
    const depth = RIDGE_BASE - y;
    if (depth < 150) continue;
    const slope = (ridgeY(x + 3) - ridgeY(x - 3)) / 6;
    const length = (depth - 140) * (0.35 + rand() * 0.55);
    const lean = Math.max(-0.9, Math.min(0.9, slope)) * length * 0.55;
    snow.push(`M${f(x)} ${f(y + 2)}L${f(x + lean)} ${f(y + 2 + length)}`);
  }
  // Shade: diagonal gouges down the right-hand faces, as on a woodcut block.
  const shade: string[] = [];
  for (let x = 6; x < W; x += 6 + rand() * 3) {
    const y = ridgeY(x);
    const slope = (ridgeY(x + 4) - ridgeY(x - 4)) / 8;
    if (slope < 0.25 || RIDGE_BASE - y < 60) continue;
    const length = Math.min(110, (RIDGE_BASE - y) * (0.45 + rand() * 0.4));
    shade.push(`M${f(x)} ${f(y + 4)}l${f(-length * 0.55)} ${f(length)}`);
  }
  // Contour lines along the lower slopes, broken into dashes like a worn plate.
  const contours: string[] = [];
  for (const offset of [46, 92, 140]) {
    let drawing = false;
    for (let x = 0; x <= W; x += 8) {
      const y = ridgeY(x) + offset;
      const visible = y < RIDGE_BASE + 8 && rand() > 0.18;
      if (visible) {
        contours.push(`${drawing ? "L" : "M"}${f(x)} ${f(y)}`);
        drawing = true;
      } else drawing = false;
    }
  }
  return {
    ridge: ridge.join(""),
    far: far.join(""),
    snow: snow.join(""),
    shade: shade.join(""),
    contours: contours.join(""),
  };
}

/* A square Tang-style pagoda: tiers narrow towards the top with a slight swell in the middle. */
function pagoda(cx: number, base: number, height: number, tiers: number, width: number) {
  const parts: string[] = [];
  const plinth = width * 1.5;
  parts.push(
    `M${f(cx - plinth / 2)} ${f(base)}h${f(plinth)}v-14h${f(-plinth)}z`,
    `M${f(cx - plinth / 2 + 8)} ${f(base - 14)}h${f(plinth - 16)}v-10h${f(-(plinth - 16))}z`,
  );
  const shaftTop = base - height;
  // The first storey is tall, the rest are close-set eaves.
  const first = height * 0.16;
  let y = base - 24;
  const bodyW = (t: number) => width * (1 + 0.1 * Math.sin(Math.PI * t)) * (1 - 0.48 * t);
  parts.push(
    `M${f(cx - bodyW(0) / 2)} ${f(y)}V${f(y - first)}M${f(cx + bodyW(0) / 2)} ${f(y)}V${f(y - first)}`,
    `M${f(cx - 7)} ${f(y)}v-24q7 -10 14 0v24`,
  );
  y -= first;
  const step = (y - shaftTop) / tiers;
  for (let i = 0; i < tiers; i += 1) {
    const t = i / tiers;
    const bw = bodyW(t);
    const ew = bw + 16 * (1 - t * 0.5);
    const lift = 6 * (1 - t * 0.4);
    // Eave: a flat soffit that sweeps up at both corners.
    parts.push(
      `M${f(cx - ew / 2)} ${f(y - lift)}Q${f(cx - ew / 2 + 6)} ${f(y)} ${f(cx - bw / 2)} ${f(y)}` +
        `H${f(cx + bw / 2)}Q${f(cx + ew / 2 - 6)} ${f(y)} ${f(cx + ew / 2)} ${f(y - lift)}` +
        `L${f(cx + bw / 2 - 2)} ${f(y - 4)}H${f(cx - bw / 2 + 2)}Z`,
    );
    const next = y - step;
    const nw = bodyW((i + 1) / tiers);
    parts.push(
      `M${f(cx - bw / 2 + 2)} ${f(y - 4)}L${f(cx - nw / 2 + 2)} ${f(next)}`,
      `M${f(cx + bw / 2 - 2)} ${f(y - 4)}L${f(cx + nw / 2 - 2)} ${f(next)}`,
    );
    if (i % 2 === 0 && step > 12) parts.push(`M${f(cx - 2.5)} ${f(y - 6)}h5v${f(-(step - 9))}h-5z`);
    y = next;
  }
  // Finial: a mast with rings and a gourd.
  parts.push(
    `M${f(cx)} ${f(y)}V${f(y - 46)}`,
    `M${f(cx - 9)} ${f(y - 10)}h18M${f(cx - 7)} ${f(y - 18)}h14M${f(cx - 5)} ${f(y - 26)}h10`,
    `M${f(cx)} ${f(y - 46)}q-7 -6 0 -14q7 8 0 14`,
  );
  return parts.join("");
}

/* A Bai gatehouse: double sweeping roofs on posts, beside a screen wall with a tiled cap. */
function gatehouse(cx: number, base: number) {
  const parts: string[] = [];
  const hatch: string[] = [];
  const roof = (y: number, half: number, rise: number, flare: number) => {
    // Ridge with upturned ends, a concave slope, and eaves that kick up at the corners.
    parts.push(
      `M${f(cx - half * 0.62)} ${f(y - rise)}H${f(cx + half * 0.62)}`,
      `M${f(cx - half * 0.62)} ${f(y - rise)}q-6 -2 -9 -14M${f(cx + half * 0.62)} ${f(y - rise)}q6 -2 9 -14`,
      `M${f(cx - half * 0.62)} ${f(y - rise)}Q${f(cx - half * 0.8)} ${f(y - 4)} ${f(cx - half)} ${f(y - flare)}` +
        `Q${f(cx - half * 0.85)} ${f(y + 4)} ${f(cx)} ${f(y + 4)}` +
        `Q${f(cx + half * 0.85)} ${f(y + 4)} ${f(cx + half)} ${f(y - flare)}` +
        `Q${f(cx + half * 0.8)} ${f(y - 4)} ${f(cx + half * 0.62)} ${f(y - rise)}`,
    );
    for (let x = -half * 0.86; x <= half * 0.86; x += 7) {
      const top = y - rise + 3;
      const edge = Math.abs(x) / half;
      const bottom = y + 3 - flare * Math.pow(edge, 4);
      const inner = x * (0.62 + 0.38 * 0.2);
      hatch.push(`M${f(cx + inner * 0.95)} ${f(top)}L${f(cx + x)} ${f(bottom)}`);
    }
  };
  // Platform and steps.
  parts.push(
    `M${f(cx - 150)} ${f(base)}h300v-12h-300z`,
    `M${f(cx - 40)} ${f(base)}v8h80v-8M${f(cx - 30)} ${f(base + 8)}v6h60v-6`,
  );
  // Posts, beam, brackets and the door.
  const top = base - 96;
  for (const x of [-104, -46, 46, 104]) parts.push(`M${f(cx + x)} ${f(base - 12)}V${f(top)}`);
  parts.push(
    `M${f(cx - 118)} ${f(top)}h236v-12h-236z`,
    `M${f(cx - 34)} ${f(base - 12)}V${f(base - 74)}q34 -16 68 0V${f(base - 12)}`,
    `M${f(cx)} ${f(base - 12)}V${f(base - 82)}`,
  );
  for (const x of [-104, -46, 46, 104]) parts.push(`M${f(cx + x - 9)} ${f(top - 12)}q9 -10 18 0`);
  roof(top - 18, 168, 46, 18);
  // Upper storey and its roof.
  parts.push(`M${f(cx - 72)} ${f(top - 62)}v-34M${f(cx + 72)} ${f(top - 62)}v-34`);
  parts.push(`M${f(cx - 80)} ${f(top - 96)}h160v-9h-160z`);
  roof(top - 112, 116, 40, 15);

  // Screen wall (zhaobi) to the right: a plastered panel framed in a border, under a small roof.
  const wx = cx + 236;
  const ww = 150;
  const wt = base - 92;
  parts.push(
    `M${f(wx - ww / 2)} ${f(base)}V${f(wt)}H${f(wx + ww / 2)}V${f(base)}`,
    `M${f(wx - ww / 2 + 14)} ${f(base - 12)}V${f(wt + 16)}H${f(wx + ww / 2 - 14)}V${f(base - 12)}Z`,
    `M${f(wx - 22)} ${f(wt + 46)}a22 18 0 1 0 44 0a22 18 0 1 0 -44 0`,
    `M${f(wx - ww / 2 - 14)} ${f(wt)}Q${f(wx - ww / 2)} ${f(wt - 4)} ${f(wx - ww / 2 + 10)} ${f(wt - 20)}` +
      `H${f(wx + ww / 2 - 10)}Q${f(wx + ww / 2)} ${f(wt - 4)} ${f(wx + ww / 2 + 14)} ${f(wt)}Z`,
  );
  for (let x = wx - ww / 2 + 14; x < wx + ww / 2 - 8; x += 7)
    hatch.push(`M${f(x)} ${f(wt - 18)}L${f(x - 2)} ${f(wt - 2)}`);
  return { body: parts.join(""), hatch: hatch.join("") };
}

/* Erhai: wave lines that open up towards the viewer, plus a sail and a few birds. */
function lake() {
  const rand = seeded(29);
  const lines: string[] = [];
  for (let k = 0; k < 15; k += 1) {
    const depth = k / 14;
    const y = HORIZON + 8 + Math.pow(depth, 1.5) * (H - HORIZON - 14);
    const amp = 0.8 + depth * 4.5;
    const period = 26 + depth * 44;
    const phase = rand() * 6;
    let drawing = false;
    for (let x = 0; x <= W; x += 6) {
      if (rand() < 0.035) drawing = false;
      const gap = rand() < 0.08 + (1 - depth) * 0.12;
      if (gap) {
        drawing = false;
        continue;
      }
      const yy = y + Math.sin(x / period + phase) * amp;
      lines.push(`${drawing ? "L" : "M"}${f(x)} ${f(yy)}`);
      drawing = true;
    }
  }
  const boat =
    "M1010 612q38 9 84 0l-10 10q-32 6 -64 0z" +
    "M1052 609V532M1052 532q26 30 30 72q-16 4 -30 5M1052 538q-18 30 -24 66q12 4 24 5";
  const birds =
    "M220 200q8 -7 15 0q7 -7 15 0M262 176q6 -5 11 0q5 -5 11 0M188 226q5 -4 10 0q5 -4 10 0" +
    "M1430 150q7 -6 13 0q6 -6 13 0";
  return { waves: lines.join(""), boat, birds };
}

const MOUNTAINS = mountains();
const PAGODAS = [
  pagoda(398, HORIZON, 248, 10, 34),
  pagoda(612, HORIZON, 248, 10, 34),
  pagoda(505, HORIZON, 372, 16, 46),
].join("");
const GATE = gatehouse(1150, HORIZON);
const LAKE = lake();

/** The Dali drawing. The two ridge lines draw themselves in; the rest fades up in layers. */
export function DaliArt({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        {/* Relief print: wobble the lines, let the ink spread, then knock speckles out of it. */}
        <filter id="dali-ink" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.045"
            numOctaves="2"
            seed="4"
            result="warp"
          />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="4.5" result="rough" />
          <feMorphology in="rough" operator="dilate" radius="0.5" result="spread" />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            seed="9"
            result="grain"
          />
          <feColorMatrix
            in="grain"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.6 2.15"
            result="holes"
          />
          <feComposite in="spread" in2="holes" operator="in" />
        </filter>
      </defs>
      <g filter="url(#dali-ink)" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path className="dali-art__line dali-art__line--far" d={MOUNTAINS.far} pathLength={1} />
        <path className="dali-art__line dali-art__line--ridge" d={MOUNTAINS.ridge} pathLength={1} />
        <path className="dali-art__line dali-art__line--snow" d={MOUNTAINS.snow} />
        <path className="dali-art__line dali-art__line--shade" d={MOUNTAINS.shade} />
        <path className="dali-art__line dali-art__line--contour" d={MOUNTAINS.contours} />
        <path className="dali-art__line dali-art__line--birds" d={LAKE.birds} />
        <path className="dali-art__solid dali-art__line--pagoda" d={PAGODAS} />
        <path className="dali-art__solid dali-art__line--gate" d={GATE.body} />
        <path className="dali-art__line dali-art__line--tiles" d={GATE.hatch} />
        <path className="dali-art__line dali-art__line--waves" d={LAKE.waves} />
        <path className="dali-art__solid dali-art__line--boat" d={LAKE.boat} />
      </g>
    </svg>
  );
}
