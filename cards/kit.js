// @ts-check
// Shared design kit for the pixel cards: palette, fonts, frames, sprites, effects.

import { JERSEY_15_WIDTHS, JERSEY_15_WOFF2 } from "./fonts.js";

export const FULL = 840;
export const HALF = 414;

// GitHub dark-mode surfaces with bright, retro (PICO-8-ish) accents.
export const C = {
  bg: "#0d1117", // GitHub dark canvas
  panel: "#161b22", // GitHub dark card
  shadow: "#010409", // hard drop shadow
  border: "#3d444d",
  ink: "#0d1117", // dark text on bright bars
  text: "#e6edf3",
  muted: "#8b949e",
  dim: "#484f58",
  line: "#21262d",
  pink: "#ff77a8",
  sky: "#29adff",
  butter: "#ffd84d",
  mint: "#3ddc84",
  peach: "#ffa94d",
  lilac: "#b48cff",
  teal: "#3fd8c8",
  coral: "#ff6b6b",
  white: "#ffffff",
};

// Order used when colouring lists (languages, items, ...).
export const ACCENTS = [
  C.pink,
  C.sky,
  C.butter,
  C.mint,
  C.peach,
  C.lilac,
  C.teal,
  C.coral,
  "#ffccaa",
  "#a3e635",
];

export const PX = 2;

// Jersey 15 has small capitals for its em size, so every font size the cards
// ask for is drawn this much larger (measure() accounts for it too).
export const FS = 1.2;

/**
 * Escape text for SVG.
 *
 * @param {any} s Raw text.
 * @returns {string} Escaped text.
 */
export const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Width of text in Jersey 15.
 *
 * @param {string} text Text.
 * @param {number} size Font size (px).
 * @param {number} _weight Unused (Jersey 15 has one weight).
 * @param {number} spacing Letter spacing (px).
 * @returns {number} Width (px).
 */
export const measure = (text, size, _weight = 500, spacing = 0) => {
  const table = JERSEY_15_WIDTHS;
  let w = 0;
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    w += code >= 32 && code <= 126 ? table[code - 32] : 650;
  }
  return (w * size * FS) / 1000 + spacing * text.length;
};

/**
 * Shorten text with an ellipsis so it fits in maxWidth.
 *
 * @param {string} text Text.
 * @param {number} maxWidth Max width.
 * @param {number} size Font size.
 * @param {number} weight Weight.
 * @returns {string} Text that fits.
 */
export const fit = (text, maxWidth, size, weight = 500) => {
  if (measure(text, size, weight) <= maxWidth) {
    return text;
  }
  let t = text;
  while (t.length > 1 && measure(`${t}…`, size, weight) > maxWidth) {
    t = t.slice(0, -1);
  }
  return `${t.trimEnd()}…`;
};

/**
 * Word-wrap text into lines no wider than maxWidth.
 *
 * @param {string} text Text.
 * @param {number} maxWidth Max width.
 * @param {number} size Font size.
 * @param {number} maxLines Max number of lines.
 * @returns {string[]} Lines.
 */
export const wrap = (text, maxWidth, size, maxLines = 4) => {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (measure(next, size) <= maxWidth || !cur) {
      cur = next;
    } else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) {
    lines.push(cur);
  }
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = fit(`${kept[maxLines - 1]} …`, maxWidth, size);
    return kept;
  }
  return lines;
};

// ---------------------------------------------------------------------------
// sprites

/**
 * Draw a pixel sprite. Each key in the palette maps a character to a colour;
 * "." is transparent.
 *
 * @param {string[]} map Rows.
 * @param {number} x Left.
 * @param {number} y Top.
 * @param {Record<string, string> | string} palette Colours ("X" when a string).
 * @param {number} px Pixel size.
 * @returns {string} SVG.
 */
export const sprite = (map, x, y, palette, px = PX) => {
  const pal = typeof palette === "string" ? { X: palette } : palette;
  /** @type {Record<string, string>} */
  const groups = {};
  map.forEach((row, r) => {
    // merge horizontal runs of the same colour into one rect
    let c = 0;
    while (c < row.length) {
      const ch = row[c];
      let run = 1;
      while (row[c + run] === ch) {
        run++;
      }
      if (pal[ch]) {
        groups[ch] =
          (groups[ch] || "") +
          `<rect x="${x + c * px}" y="${y + r * px}" width="${run * px}" height="${px}"/>`;
      }
      c += run;
    }
  });
  return Object.entries(groups)
    .map(([ch, rects]) => `<g fill="${pal[ch]}">${rects}</g>`)
    .join("");
};

export const HEART = [
  ".XX.XX.",
  "XXXXXXX",
  "XXXXXXX",
  ".XXXXX.",
  "..XXX..",
  "...X...",
];

export const SPARKLE = [
  "...X...",
  "...X...",
  "..XXX..",
  "XXXXXXX",
  "..XXX..",
  "...X...",
  "...X...",
];

export const PLUS = [".X.", "XXX", ".X."];

// Original cat mascot: a little black chibi cat, sitting.
// O outline, F fur, S shine, W white chest, P inner ear, N nose, Y eye,
// E pupil, L closed-eye line, B blush, K mouth inside.
const CAT_SIT = [
  ".O........O...",
  "OPO......OPO..",
  "OPPOOOOOOPPO..",
  "OFFFFFFFFFFO..",
  "OFSFFFFFFFFO..",
  "OFYEYFFYEYFO..",
  "OFYEYFFYEYFO..",
  "OBFFFNNFFFBO..",
  ".OFFOFFOFFO...",
  "..OOOOOOOO....",
  "..OFWWWWFO.OO.",
  ".OFFFWWFFFOFO.",
  ".OFFFFFFFFOO..",
  ".OFSFFFFSFO...",
  "..OOOOOOOO....",
];

/**
 * Copy of a sprite with some cells replaced.
 *
 * @param {string[]} base Sprite.
 * @param {Record<number, Record<number, string>>} edits Row -> column -> char.
 * @returns {string[]} New sprite.
 */
const edit = (base, edits) =>
  base.map((row, r) =>
    edits[r]
      ? [...row].map((ch, c) => (edits[r][c] !== undefined ? edits[r][c] : ch)).join("")
      : row,
  );

const EYES_SHUT = {
  5: { 2: "F", 3: "F", 4: "F", 7: "F", 8: "F", 9: "F" },
  6: { 2: "L", 3: "L", 4: "L", 7: "L", 8: "L", 9: "L" },
};

// Each pose is a full sprite so the animation can just flip between them.
export const CAT_POSES = {
  sit: CAT_SIT,
  blink: edit(CAT_SIT, EYES_SHUT),
  lookL: edit(CAT_SIT, { 5: { 2: "E", 3: "Y", 7: "E", 8: "Y" }, 6: { 2: "E", 3: "Y", 7: "E", 8: "Y" } }),
  lookR: edit(CAT_SIT, { 5: { 3: "Y", 4: "E", 8: "Y", 9: "E" }, 6: { 3: "Y", 4: "E", 8: "Y", 9: "E" } }),
  happy: edit(CAT_SIT, {
    5: { 2: "F", 3: "L", 4: "F", 7: "F", 8: "L", 9: "F" },
    6: { 2: "L", 3: "F", 4: "L", 7: "L", 8: "F", 9: "L" },
  }),
  yawn: edit(CAT_SIT, { ...EYES_SHUT, 8: { 4: "F", 5: "K", 6: "K", 7: "F" }, 9: { 5: "K", 6: "K" } }),
  ear: edit(CAT_SIT, { 0: { 1: "." }, 1: { 0: ".", 1: "O", 2: "O" } }),
  tail: edit(CAT_SIT, {
    10: { 11: ".", 12: ".", 13: "." },
    11: { 11: ".", 12: "." },
    12: { 10: "O", 11: ".", 12: "." },
    13: { 10: "F", 11: "O", 12: "O", 13: "O" },
    14: { 10: "O", 11: "O", 12: "O", 13: "." },
  }),
};
CAT_POSES.sleep = CAT_POSES.blink;
CAT_POSES.sleepEar = edit(CAT_POSES.ear, EYES_SHUT);

export const CAT = CAT_SIT;

export const CAT_PALETTE = {
  O: "#05060a",
  F: "#2f3446",
  S: "#4f5772",
  W: "#e6edf3",
  P: "#ff77a8",
  N: "#ff77a8",
  Y: "#ffd84d",
  E: "#05060a",
  L: "#9aa3c0",
  B: "#ff77a8",
  K: "#ff6b6b",
};

// Pose timeline in ms (loops). Mostly sitting, with little moments.
const AWAKE = [
  ["sit", 2200], ["blink", 140], ["sit", 1500], ["lookL", 900], ["sit", 250],
  ["lookR", 900], ["sit", 1000], ["tail", 380], ["sit", 320], ["tail", 380],
  ["sit", 1600], ["blink", 140], ["happy", 1400], ["sit", 1400], ["ear", 220],
  ["sit", 180], ["ear", 220], ["sit", 1300], ["yawn", 1000], ["blink", 300],
];
const ASLEEP = [["sleep", 4200], ["sleepEar", 200], ["sleep", 300], ["sleepEar", 200], ["sleep", 3000]];

let catId = 0;

/**
 * CSS that shows one pose at a time along a timeline.
 *
 * @param {string} id Unique prefix.
 * @param {[string, number][]} timeline Poses and durations.
 * @returns {{ css: string, poses: string[] }} Keyframes and the poses used.
 */
const poseCss = (id, timeline) => {
  const total = timeline.reduce((a, [, ms]) => a + ms, 0);
  const poses = [...new Set(timeline.map(([p]) => p))];
  const pct = (/** @type {number} */ t) => `${+((t / total) * 100).toFixed(3)}%`;
  let css = "";
  poses.forEach((pose, i) => {
    let t = 0;
    let frames = "";
    let prev = null;
    timeline.forEach(([p, ms]) => {
      const on = p === pose ? 1 : 0;
      if (on !== prev) {
        frames += `${pct(t)}{opacity:${on}}`;
      }
      prev = on;
      t += ms;
    });
    frames += `100%{opacity:${timeline[0][0] === pose ? 1 : 0}}`;
    css += `@keyframes ${id}p${i}{${frames}}.${id}p${i}{animation:${id}p${i} ${total}ms step-end infinite}`;
  });
  return { css, poses };
};

/**
 * The cat, flipping between little poses (blink, look around, swish tail,
 * happy with a heart, ear twitch, yawn). Asleep it breathes, dreams and
 * twitches an ear. Without animation only the first pose shows.
 *
 * @param {number} x Left.
 * @param {number} y Top.
 * @param {number} px Pixel size.
 * @param {boolean} sleeping Asleep with "z"s.
 * @returns {string} SVG.
 */
export const cat = (x, y, px = 3, sleeping = false) => {
  const id = `c${catId++}`;
  const { css, poses } = poseCss(id, sleeping ? ASLEEP : AWAKE);
  const w = CAT_SIT[0].length;
  let out = `<style>${css}</style><g class="${sleeping ? "breathe" : ""}">`;
  poses.forEach((pose, i) => {
    // @ts-ignore
    let art = sprite(CAT_POSES[pose], x, y, CAT_PALETTE, px);
    if (pose === "happy") {
      art += sprite(HEART, x + 9 * px, y - 6 * px, C.pink, Math.max(1, px - 1));
    }
    out += `<!--pose${i}--><g class="${id}p${i}"${i === 0 ? "" : ' opacity="0"'}>${art}</g><!--/pose${i}-->`;
  });
  out += "</g>";
  if (sleeping) {
    out += `<g class="zzz" fill="${C.sky}">
        <text x="${x + (w - 3) * px}" y="${y + 2 * px}" class="z1">z</text>
        <text x="${x + w * px}" y="${y - 3 * px}" class="z2">z</text>
      </g>`;
  }
  return out;
};

const MOON_SHAPES = {
  new: [
    "..XXX..",
    ".X...X.",
    "X.....X",
    "X.....X",
    "X.....X",
    ".X...X.",
    "..XXX..",
  ],
  crescent: [
    "..XX...",
    ".XX....",
    "XX.....",
    "XX.....",
    "XX.....",
    ".XX....",
    "..XX...",
  ],
  half: [
    "..XX...",
    ".XXX...",
    "XXXX...",
    "XXXX...",
    "XXXX...",
    ".XXX...",
    "..XX...",
  ],
  gibbous: [
    "..XXX..",
    ".XXXX..",
    "XXXXXX.",
    "XXXXXX.",
    "XXXXXX.",
    ".XXXX..",
    "..XXX..",
  ],
  full: [
    "..XXX..",
    ".XXXXX.",
    "XXXXXXX",
    "XXXXXXX",
    "XXXXXXX",
    ".XXXXX.",
    "..XXX..",
  ],
};

/**
 * Moon phase for a date, as a pixel sprite.
 *
 * @param {Date} date Date.
 * @param {number} x Left.
 * @param {number} y Top.
 * @param {string} color Colour.
 * @param {number} px Pixel size.
 * @returns {string} SVG.
 */
export const moon = (date, x, y, color, px = PX) => {
  const synodic = 29.530588853;
  const ref = Date.UTC(2000, 0, 6, 18, 14);
  const age =
    ((((date.getTime() - ref) / 86400000) % synodic) + synodic) % synodic;
  const p = age / synodic; // 0 new, .5 full
  const waning = p > 0.5;
  const f = waning ? 1 - p : p; // 0..0.5
  const shape =
    f < 0.04
      ? MOON_SHAPES.new
      : f < 0.19
        ? MOON_SHAPES.crescent
        : f < 0.31
          ? MOON_SHAPES.half
          : f < 0.46
            ? MOON_SHAPES.gibbous
            : MOON_SHAPES.full;
  // waxing moons are lit on the right in the northern hemisphere
  const rows = waning ? shape : shape.map((r) => [...r].reverse().join(""));
  return sprite(rows, x, y, color, px);
};

// ---------------------------------------------------------------------------
// frames

/**
 * Pixel-rounded rectangle points (stepped corners).
 *
 * @param {number} x Left.
 * @param {number} y Top.
 * @param {number} w Width.
 * @param {number} h Height.
 * @param {number} big Corner size hint (>= 10 gives a larger step).
 * @param {number} _small Unused (kept for call compatibility).
 * @returns {string} Points.
 */
export const chamfer = (x, y, w, h, big = 14, _small = 4) => {
  const s = big >= 10 ? 3 : 2;
  const r = x + w;
  const b = y + h;
  return [
    [x + 2 * s, y], [r - 2 * s, y], [r - 2 * s, y + s], [r - s, y + s],
    [r - s, y + 2 * s], [r, y + 2 * s], [r, b - 2 * s], [r - s, b - 2 * s],
    [r - s, b - s], [r - 2 * s, b - s], [r - 2 * s, b], [x + 2 * s, b],
    [x + 2 * s, b - s], [x + s, b - s], [x + s, b - 2 * s], [x, b - 2 * s],
    [x, y + 2 * s], [x + s, y + 2 * s], [x + s, y + s], [x + 2 * s, y + s],
  ]
    .map((p) => p.join(","))
    .join(" ");
};

/**
 * Retro window: hard drop shadow, pixel corners and a bright title bar.
 * The bar sits around `y` (where the old name tab was), so content can
 * start about 24px below `y`.
 *
 * @param {object} o Options.
 * @param {number} o.x Left.
 * @param {number} o.y Top of the content area (the title bar sits on it).
 * @param {number} o.w Width.
 * @param {number} o.h Height.
 * @param {string} o.color Title bar colour.
 * @param {string=} o.label Title.
 * @param {boolean=} o.trace Unused (kept for call compatibility).
 * @returns {string} SVG.
 */
export const hud = ({ x, y, w, h, color, label }) => {
  const top = y - 14;
  const height = h + 14;
  let out = `<polygon points="${chamfer(x + 4, top + 4, w, height)}" fill="${C.shadow}"/>
    <polygon points="${chamfer(x, top, w, height)}" fill="${C.panel}" stroke="${C.border}" stroke-width="2"/>
    <polygon points="${chamfer(x + 3, top + 3, w - 6, 22, 6)}" fill="${color}"/>`;
  // two little window buttons
  out += `<g fill="none" stroke="${C.ink}" stroke-width="1.5" opacity=".55">
      <rect x="${x + w - 36}" y="${top + 10}" width="8" height="8"/>
      <rect x="${x + w - 22}" y="${top + 10}" width="8" height="8"/>
    </g>`;
  if (label) {
    out += `<text x="${x + 14}" y="${top + 19}" class="tab">${esc(label.toUpperCase())}</text>`;
  }
  return out;
};

/**
 * Twinkling background stars at fixed pseudo-random spots.
 *
 * @param {number} w Width.
 * @param {number} h Height.
 * @param {number} count How many.
 * @param {number} seed Seed.
 * @param {{x:number,y:number,w:number,h:number}[]} avoid Areas to keep clear.
 * @returns {string} SVG.
 */
export const starfield = (w, h, count, seed = 1, avoid = []) => {
  let s = seed * 9301 + 49297;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  let out = "";
  let placed = 0;
  for (let tries = 0; placed < count && tries < count * 20; tries++) {
    const x = Math.round((8 + rnd() * (w - 16)) / PX) * PX;
    const y = Math.round((8 + rnd() * (h - 16)) / PX) * PX;
    if (
      avoid.some(
        (a) =>
          x > a.x - 6 && x < a.x + a.w + 6 && y > a.y - 6 && y < a.y + a.h + 6,
      )
    ) {
      continue;
    }
    const kind = rnd();
    const color = [C.white, C.sky, C.white, C.butter][Math.floor(rnd() * 4)];
    const shape =
      kind < 0.88
        ? `<rect x="${x}" y="${y}" width="${PX}" height="${PX}" fill="${color}"/>`
        : sprite(PLUS, x, y, color);
    out += `<g class="twinkle" opacity="${(0.25 + rnd() * 0.35).toFixed(2)}" style="animation-delay:${(rnd() * 3).toFixed(2)}s">${shape}</g>`;
    placed++;
  }
  return out;
};

/**
 * Typewriter text: a cover slides off each line, one line after another.
 *
 * @param {string[]} lines Lines.
 * @param {number} x Left.
 * @param {number} y Baseline of first line.
 * @param {number} lineH Line height.
 * @param {number} size Font size.
 * @param {string} cover Background colour behind the text (solid).
 * @param {string} id Unique id.
 * @param {number} start Start delay (ms).
 * @returns {{ svg: string, end: number }} SVG and end time (ms).
 */
export const typewriter = (
  lines,
  x,
  y,
  lineH,
  size,
  cover,
  id,
  start = 400,
) => {
  const MS = 32;
  let t = start;
  let svg = "";
  lines.forEach((ln, i) => {
    const w = Math.ceil(measure(ln, size)) + 6;
    const by = y + i * lineH;
    const chars = Math.max(1, ln.length);
    svg += `<clipPath id="${id}${i}"><rect x="${x - 2}" y="${by - size}" width="${w + 4}" height="${size + 6}"/></clipPath>
      <text x="${x}" y="${by}" class="body">${esc(ln)}</text>
      <g clip-path="url(#${id}${i})"><rect class="type" x="${x - 2}" y="${by - size}" width="${w + 4}" height="${size + 6}" fill="${cover}" transform="translate(${w + 4} 0)"
        style="--w:${w + 4}px;animation-delay:${t}ms;animation-duration:${chars * MS}ms;animation-timing-function:steps(${chars})"/></g>`;
    t += chars * MS + 120;
  });
  return { svg, end: t };
};

// ---------------------------------------------------------------------------
// document

/**
 * Wrap content in a complete SVG document with fonts, filters and animations.
 *
 * @param {number} w Width.
 * @param {number} h Height.
 * @param {string} title Accessible title.
 * @param {string} body Content.
 * @param {object} opts Options.
 * @param {boolean=} opts.background Paint the background.
 * @param {boolean=} opts.animate Include animations.
 * @returns {string} SVG.
 */
export const doc = (
  w,
  h,
  title,
  body,
  { background = true, animate = true } = {},
) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t" shape-rendering="crispEdges">
<title id="t">${esc(title)}</title>
<style>
  @font-face { font-family: "Jersey 15"; font-weight: 400; src: url(data:font/woff2;base64,${JERSEY_15_WOFF2}) format("woff2"); }
  text { font-family: "Jersey 15", monospace; font-weight: 400; }
  .tab { font-size: ${12 * FS}px; fill: ${C.ink}; letter-spacing: 1.5px; }
  .body { font-size: ${15 * FS}px; fill: ${C.text}; }
  .small { font-size: ${12 * FS}px; fill: ${C.muted}; letter-spacing: 1px; }
  .label { font-size: ${14 * FS}px; fill: ${C.text}; }
  .value { font-size: ${14 * FS}px; }
  .zzz text { font-size: ${13 * FS}px; }
  ${
    animate
      ? `
  .twinkle { animation: twinkle 2.6s steps(1) infinite; }
  .breathe { animation: bob 2.4s steps(1) infinite; }
  .z1 { animation: zz 2.4s steps(3) infinite; }
  .z2 { animation: zz 2.4s steps(3) infinite .8s; }
  .pop { animation: pop .3s steps(3) backwards; }
  .fade { animation: fade .5s steps(4) backwards; }
  .type { animation-name: type; animation-fill-mode: backwards; }
  .cursor { animation: cursor 1s steps(1) infinite; }
  .pulse { animation: pulse 1.4s steps(2) infinite; }
  @keyframes twinkle { 50% { opacity: .1; } }
  @keyframes bob { 50% { transform: translateY(-3px); } }
  @keyframes zz { 0% { opacity: 0; transform: translateY(4px); } 50% { opacity: 1; } 100% { opacity: 0; transform: translateY(-6px); } }
  @keyframes pop { from { opacity: 0; transform: translateY(-4px); } }
  @keyframes fade { from { opacity: 0; } }
  @keyframes type { from { transform: translateX(0); } to { transform: translateX(var(--w)); } }
  @keyframes cursor { 50% { opacity: 0; } }
  @keyframes pulse { 50% { opacity: .35; } }`
      : ""
  }
</style>
${background ? `<rect width="${w}" height="${h}" fill="${C.bg}"/>` : ""}
${body.replace(/font-size:([\d.]+)px/g, (_, v) => `font-size:${+(v * FS).toFixed(1)}px`)}
</svg>`;
