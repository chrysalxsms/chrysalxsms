// @ts-check
// Pixel README cards. Each render function returns a complete SVG string.

import {
  ACCENTS,
  C,
  FULL,
  HALF,
  HEART,
  PLUS,
  PX,
  SPARKLE,
  cat,
  chamfer,
  doc,
  esc,
  fit,
  hud,
  measure,
  moon,
  sprite,
  starfield,
  typewriter,
  wrap,
} from "./kit.js";

// ---------------------------------------------------------------------------
// helpers

/**
 * Format a date in a time zone as "2026.10.28 (Wed)".
 *
 * @param {Date} date Date.
 * @param {string} tz IANA time zone.
 * @returns {string} Formatted date.
 */
const vnDate = (date, tz) => {
  let zone = tz;
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone });
  } catch {
    zone = "UTC";
  }
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/-/g, ".");
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    weekday: "short",
  }).format(date);
  return `${ymd} (${wd})`;
};

/**
 * Chunky extruded title text (like an arcade logo).
 * A "♥" in the text is drawn as a pixel heart.
 *
 * @param {string} text Text.
 * @param {number} cx Centre x.
 * @param {number} y Baseline.
 * @param {number} size Font size.
 * @param {string} top Face colour.
 * @param {string} side Extrusion colour.
 * @returns {string} SVG.
 */
const chunky = (text, cx, y, size, top, side) => {
  const SP = size * 0.04;
  const parts = text.split("♥");
  const heartPx = Math.max(2, Math.round(size / 9));
  const heartW = 7 * heartPx;
  const gap = size * 0.08;
  const widths = parts.map((p) => measure(p, size, 700, SP));
  const total =
    widths.reduce((a, b) => a + b, 0) + (parts.length - 1) * (heartW + 2 * gap);
  let x = cx - total / 2;
  const depth = Math.max(2, Math.round(size / 18));
  let layers = "";
  let face = "";
  parts.forEach((p, i) => {
    if (p) {
      for (let d = depth; d >= 1; d--) {
        layers += `<text x="${x}" y="${y + d}" fill="${side}" style="font-size:${size}px;letter-spacing:${SP}px" class="big">${esc(p)}</text>`;
      }
      face += `<text x="${x}" y="${y}" fill="${top}" style="font-size:${size}px;letter-spacing:${SP}px" class="big">${esc(p)}</text>`;
    }
    x += widths[i];
    if (i < parts.length - 1) {
      const hx = x + gap;
      const hy = y - size * 0.68;
      for (let d = depth; d >= 1; d--) {
        layers += sprite(HEART, hx, hy + d, side, heartPx);
      }
      face += `<g class="pulse">${sprite(HEART, hx, hy, C.coral, heartPx)}</g>`;
      x += heartW + 2 * gap;
    }
  });
  return `<g>${layers}${face}</g>`;
};

/**
 * Visual-novel style box (thin double line), optional name tab.
 *
 * @param {number} x Left.
 * @param {number} y Top.
 * @param {number} w Width.
 * @param {number} h Height.
 * @param {string} color Line colour.
 * @param {string=} name Name tab text.
 * @returns {string} SVG.
 */
const vnBox = (x, y, w, h, color, name) =>
  hud({ x, y: y + 14, w, h: h - 14, color, label: name });

/**
 * "Next" arrow shown at the end of a dialog line.
 *
 * @param {number} x Left.
 * @param {number} y Top.
 * @param {number} delay Delay before it appears (ms).
 * @returns {string} SVG.
 */
const nextArrow = (x, y, delay) =>
  `<g class="fade" style="animation-delay:${delay}ms"><g class="cursor">${sprite(
    ["XXXXX", ".XXX.", "..X.."],
    x,
    y,
    C.pink,
  )}</g></g>`;

/**
 * Small date box with moon (visual-novel corner widget).
 *
 * @param {Date} date Date.
 * @param {string} tz Time zone.
 * @param {number} x Left.
 * @param {number} y Top.
 * @returns {{ svg: string, width: number }} Widget.
 */
const dateBox = (date, tz, x, y) => {
  const label = vnDate(date, tz);
  const width = Math.ceil(measure(label, 14)) + 44;
  return {
    width,
    svg: `<polygon points="${chamfer(x + 3, y + 3, width, 28, 6)}" fill="${C.shadow}"/>
      <polygon points="${chamfer(x, y, width, 28, 6)}" fill="${C.panel}" stroke="${C.border}" stroke-width="2"/>
      <text x="${x + 10}" y="${y + 19}" fill="${C.text}" style="font-size:14px">${esc(label)}</text>
      ${moon(date, x + width - 22, y + 7, C.butter)}`,
  };
};

// ---------------------------------------------------------------------------
// header

/**
 * Intro header.
 *
 * @param {object} o Options.
 * @param {string} o.name Name on the dialog tab.
 * @param {string} o.about About text.
 * @param {Date} o.date Today.
 * @param {string} o.tz Time zone.
 * @returns {string} SVG.
 */
export const renderHeader = ({ name, about, date, tz }) => {
  const W = FULL;
  const H = 300;
  let b = starfield(W, 190, 22, 3, [
    { x: 170, y: 50, w: 500, h: 140 },
    { x: 620, y: 0, w: 220, h: 50 },
  ]);

  // date in the corner
  const boxW = dateBox(date, tz, 0, 0).width;
  b += dateBox(date, tz, W - 20 - boxW, 16).svg;

  // titles
  const cx = W / 2;
  b += `<text x="${cx}" y="76" text-anchor="middle" fill="${C.sky}" style="font-size:14px;letter-spacing:5px" class="big">HELLO AND</text>`;
  b += chunky("WELC♥ME", cx, 144, 58, C.pink, "#7a1f48");

  // moon (today's phase) and cat
  b += moon(date, 104, 86, C.butter, 6);
  b += cat(W - 162, 78, 4);
  b += `<g class="twinkle" style="animation-delay:.6s">${sprite(PLUS, W - 186, 92, C.butter, 3)}</g>`;

  // dialog
  const dx = 70;
  const dy = 186;
  const dw = W - 140;
  const dh = 98;
  b += vnBox(dx, dy, dw, dh, C.pink, name);
  const lines = wrap(about, dw - 60, 15, 2);
  const tw = typewriter(lines, dx + 22, dy + 52, 24, 15, C.panel, "ab", 700);
  b += tw.svg;
  b += nextArrow(dx + dw - 26, dy + dh - 16, tw.end);

  return doc(W, H, `Hello and welcome! ${about}`, b);
};

// ---------------------------------------------------------------------------
// buttons

const ICONS = {
  linkedin: [
    "XXXXXXXXX",
    "XX.XXXXXX",
    "XXXXXXXXX",
    "XX.X..XXX",
    "XX.X.X.XX",
    "XX.X.X.XX",
    "XX.X.X.XX",
    "XXXXXXXXX",
  ],
  email: [
    "XXXXXXXXXX",
    "XX......XX",
    "X.X....X.X",
    "X..XXXX..X",
    "X........X",
    "X........X",
    "XXXXXXXXXX",
  ],
  github: [
    "..XXXXX..",
    ".XXXXXXX.",
    "XX.XXX.XX",
    "XXXXXXXXX",
    "XXXXXXXXX",
    ".XXXXXXX.",
    "X.XX.XX..",
    ".X.XXX...",
  ],
  heart: HEART,
  star: SPARKLE,
};

/**
 * Pixel button.
 *
 * @param {object} o Options.
 * @param {string} o.label Label.
 * @param {string} o.icon Icon name.
 * @param {string} o.color Colour.
 * @returns {string} SVG.
 */
export const renderButton = ({ label, icon, color }) => {
  const text = label.toUpperCase();
  // @ts-ignore
  const ic = ICONS[icon] || HEART;
  const iconW = ic[0].length * PX;
  const tw = measure(text, 14, 700, 2);
  const W = Math.ceil(16 + iconW + 10 + tw + 18) + 8;
  const H = 46;
  let b = `<polygon points="${chamfer(10, 10, W - 12, H - 14, 8, 3)}" fill="${C.shadow}"/>
    <polygon points="${chamfer(6, 6, W - 12, H - 14, 8, 3)}" fill="${color}" stroke="${C.ink}" stroke-width="2"/>`;
  b += sprite(ic, 20, 6 + (H - 14 - ic.length * PX) / 2, C.ink);
  b += `<text x="${20 + iconW + 10}" y="${6 + (H - 14) / 2 + 5}" fill="${C.ink}" style="font-size:14px;letter-spacing:2px" class="big">${esc(text)}</text>`;
  return doc(W, H, label, b, { background: false });
};

// ---------------------------------------------------------------------------
// inventory (tech stack)

const ABBR = {
  c: "C",
  "c++": "C+",
  "c#": "C#",
  html5: "<>",
  html: "<>",
  css: "{}",
  css3: "{}",
  java: "Jv",
  javascript: "JS",
  typescript: "TS",
  markdown: "MD",
  python: "Py",
  sqlite: "DB",
  sql: "DB",
  canva: "Cv",
  github: "GH",
  gitlab: "GL",
  git: "Gt",
  haskell: ">>=",
  godot: "Gd",
  gdscript: "Gd",
  react: "Re",
  linux: "Lx",
};

/**
 * Inventory of tools.
 *
 * @param {object} o Options.
 * @param {string[]} o.items Item names.
 * @returns {string} SVG.
 */
export const renderInventory = ({ items }) => {
  const W = FULL;
  const COLS = 5;
  const SLOT_W = 140;
  const SLOT_H = 44;
  const GAP_X = 12;
  const GAP_Y = 14;
  const rows = Math.ceil(items.length / COLS);
  const gridW = COLS * SLOT_W + (COLS - 1) * GAP_X;
  const x0 = (W - gridW) / 2;
  const y0 = 52;
  const H = y0 + rows * SLOT_H + (rows - 1) * GAP_Y + 40;
  let b = hud({
    x: 16,
    y: 24,
    w: W - 32,
    h: H - 46,
    color: C.sky,
    label: "Inventory",
  });
  items.forEach((item, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = x0 + col * (SLOT_W + GAP_X);
    const y = y0 + row * (SLOT_H + GAP_Y);
    const color = ACCENTS[i % ACCENTS.length];
    // @ts-ignore
    const abbr = ABBR[item.toLowerCase()] || item.slice(0, 2);
    b += `<g class="pop" style="animation-delay:${200 + i * 70}ms">
      <polygon points="${chamfer(x, y, SLOT_W, SLOT_H, 8, 2)}" fill="${C.bg}" stroke="${C.border}" stroke-width="1.5"/>
      <polygon points="${chamfer(x + 7, y + 7, 30, 30, 6, 2)}" fill="${color}"/>
      <text x="${x + 22}" y="${y + 27}" text-anchor="middle" fill="${C.ink}" style="font-size:${abbr.length > 2 ? 11 : 13}px" class="big">${esc(abbr)}</text>
      <text x="${x + 46}" y="${y + 27}" class="label">${esc(fit(item, SLOT_W - 54, 14))}</text>
    </g>`;
  });
  return doc(W, H, `Inventory: ${items.join(", ")}`, b);
};

// ---------------------------------------------------------------------------
// languages

/**
 * Languages card: a pixel-art pie chart with a legend beside it. The legend
 * flows into three columns and grows downwards, so any number of languages
 * fits.
 *
 * @param {{ name: string, size: number }[]} langs Sorted languages.
 * @param {number} total Total size.
 * @param {object} o Options.
 * @param {number=} o.width Width.
 * @param {string} o.title Title.
 * @returns {string} SVG.
 */
export const renderLanguages = (langs, total, { width = FULL, title }) => {
  const W = width;
  const R = 13; // radius in cells
  const CELL = 4;
  const D = 2 * R + 2; // with outline ring
  const px0 = 42;
  const py0 = 50;
  const legendX = px0 + D * CELL + 40;
  const COLS = W >= 600 ? 3 : 1;
  const colW = (W - 36 - legendX) / COLS;
  const rows = Math.max(1, Math.ceil(langs.length / COLS));
  const ROW_H = 24;
  const H = Math.max(py0 + D * CELL + 34, py0 + 6 + rows * ROW_H + 30);

  let b = hud({ x: 16, y: 24, w: W - 32, h: H - 46, color: C.pink, label: title });

  // pie: every cell inside the circle takes the colour of its slice
  const KEYS = "abcdefghijklmnopqrst";
  const ends = [];
  let acc = 0;
  for (const l of langs) {
    acc += total ? l.size / total : 0;
    ends.push(acc);
  }
  /** @type {string[]} */
  const grid = [];
  for (let r = 0; r < D; r++) {
    let row = "";
    for (let c = 0; c < D; c++) {
      const dx = c - D / 2 + 0.5;
      const dy = r - D / 2 + 0.5;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d >= R + 1) {
        row += ".";
      } else if (d >= R || !langs.length) {
        row += "#";
      } else {
        const turn = (Math.atan2(dx, -dy) / (2 * Math.PI) + 1) % 1;
        const i = ends.findIndex((e) => turn < e);
        row += KEYS[(i === -1 ? langs.length - 1 : i) % KEYS.length];
      }
    }
    grid.push(row);
  }
  /** @type {Record<string, string>} */
  const pal = { "#": C.border };
  langs.forEach((_, i) => {
    pal[KEYS[i % KEYS.length]] = ACCENTS[i % ACCENTS.length];
  });
  const shadow = grid.map((row) => row.replace(/[^.]/g, "X"));
  b += sprite(shadow, px0 + 4, py0 + 4, C.shadow, CELL);
  b += `<g class="pop" style="animation-delay:200ms">${sprite(grid, px0, py0, pal, CELL)}</g>`;

  // legend
  const pct = (/** @type {number} */ p) =>
    p > 0 && p < 0.1 ? "<0.1%" : `${p.toFixed(1)}%`;
  if (!langs.length) {
    b += `<text x="${legendX}" y="${py0 + 20}" class="label">no languages yet!</text>`;
  }
  langs.forEach((lang, i) => {
    const col = Math.floor(i / rows);
    const row = i % rows;
    const x = legendX + col * colW;
    const y = py0 + 6 + row * ROW_H;
    const color = ACCENTS[i % ACCENTS.length];
    const value = pct((lang.size / total) * 100);
    const name = fit(lang.name, colW - 30 - measure(value, 13) - 8, 14);
    b += `<g class="fade" style="animation-delay:${400 + i * 60}ms">
      <rect x="${x}" y="${y + 2}" width="10" height="10" fill="${color}"/>
      <text x="${x + 18}" y="${y + 12}" class="label">${esc(name)}</text>
      <text x="${x + colW - 22}" y="${y + 12}" text-anchor="end" fill="${color}" style="font-size:13px">${esc(value)}</text>
    </g>`;
  });
  return doc(W, H, title, b);
};

// ---------------------------------------------------------------------------
// practice (LeetCode + NeetCode)

/**
 * LeetCode and NeetCode progress side by side, with a combined total.
 *
 * @param {object} o Options.
 * @param {string} o.title Title.
 * @param {{ easy: number, medium: number, hard: number }} o.leetcode LeetCode solved by difficulty.
 * @param {{ name: string, count: number }[]} o.neetcode NeetCode solved per course.
 * @returns {string} SVG.
 */
export const renderPractice = ({ title, leetcode, neetcode }) => {
  const W = FULL;
  const H = 222;
  const lc = leetcode.easy + leetcode.medium + leetcode.hard;
  const nc = neetcode.reduce((a, c) => a + c.count, 0);
  let b = hud({ x: 16, y: 24, w: W - 32, h: H - 46, color: C.peach, label: title });

  b += `<text x="38" y="72" fill="${C.text}" style="font-size:30px">${lc + nc}</text>
    <text x="${44 + measure(String(lc + nc), 30)}" y="72" fill="${C.muted}" style="font-size:15px">problems solved</text>`;

  const py = 86;
  const ph = 100;
  const pw = (W - 32 - 44 - 16) / 2;
  const panel = (
    /** @type {number} */ x,
    /** @type {string} */ name,
    /** @type {number} */ n,
    /** @type {string} */ color,
  ) =>
    `<polygon points="${chamfer(x, py, pw, ph, 6)}" fill="${C.bg}" stroke="${C.border}" stroke-width="1.5"/>
    <rect x="${x + 14}" y="${py + 12}" width="4" height="16" fill="${color}"/>
    <text x="${x + 26}" y="${py + 26}" fill="${color}" style="font-size:16px">${name}</text>
    <text x="${x + pw - 14}" y="${py + 26}" text-anchor="end" fill="${C.text}" style="font-size:16px">${n} <tspan fill="${C.muted}">solved</tspan></text>`;

  // LeetCode: one bar split by difficulty
  const lx = 38;
  b += panel(lx, "LeetCode", lc, C.peach);
  const diffs = [
    ["Easy", leetcode.easy, C.mint],
    ["Medium", leetcode.medium, C.butter],
    ["Hard", leetcode.hard, C.coral],
  ];
  const SEG = 6;
  const GAP = 2;
  const cells = Math.floor((pw - 28 + GAP) / (SEG + GAP));
  const counts = diffs.map(([, n]) =>
    lc ? Math.round((/** @type {number} */ (n) / lc) * cells) : 0,
  );
  if (lc) {
    counts[counts.indexOf(Math.max(...counts))] +=
      cells - counts.reduce((a, n) => a + n, 0);
  }
  let cell = 0;
  counts.forEach((n, k) => {
    for (let j = 0; j < n; j++, cell++) {
      b += `<rect x="${lx + 14 + cell * (SEG + GAP)}" y="${py + 42}" width="${SEG}" height="12" fill="${diffs[k][2]}" class="pop" style="animation-delay:${200 + cell * 10}ms"/>`;
    }
  });
  for (; cell < cells; cell++) {
    b += `<rect x="${lx + 14 + cell * (SEG + GAP)}" y="${py + 42}" width="${SEG}" height="12" fill="${C.line}"/>`;
  }
  const third = (pw - 28) / 3;
  diffs.forEach(([label, n, color], k) => {
    const x = lx + 14 + k * third;
    b += `${sprite(HEART, x, py + 70, /** @type {string} */ (color))}
      <text x="${x + 18}" y="${py + 81}" fill="${C.muted}" style="font-size:14px">${label} <tspan fill="${C.text}">${n}</tspan></text>`;
  });

  // NeetCode: solved per course
  const nx = lx + pw + 16;
  b += panel(nx, "NeetCode", nc, C.teal);
  const courses = [...neetcode].sort((a, z) => z.count - a.count);
  const shown = courses.slice(0, courses.length > 3 ? 2 : 3);
  shown.forEach((course, k) => {
    const y = py + 42 + k * 20;
    const color = [C.teal, C.sky, C.lilac][k];
    b += `<rect x="${nx + 14}" y="${y + 2}" width="8" height="8" fill="${color}"/>
      <text x="${nx + 30}" y="${y + 11}" fill="${C.text}" style="font-size:14px">${esc(fit(course.name, pw - 90, 14))}</text>
      <text x="${nx + pw - 14}" y="${y + 11}" text-anchor="end" fill="${color}" style="font-size:14px">${course.count}</text>`;
  });
  if (courses.length > shown.length) {
    const rest = courses.slice(shown.length).reduce((a, c) => a + c.count, 0);
    b += `<text x="${nx + 30}" y="${py + 42 + 2 * 20 + 11}" fill="${C.muted}" style="font-size:14px">+${courses.length - shown.length} more courses (${rest})</text>`;
  }
  if (!courses.length) {
    b += `<text x="${nx + 14}" y="${py + 53}" fill="${C.muted}" style="font-size:14px">nothing synced yet</text>`;
  }
  return doc(W, H, `${title}: ${lc + nc} problems solved`, b);
};

// ---------------------------------------------------------------------------
// project

/**
 * Convex hull illustration (gift wrapping), animated edge by edge.
 *
 * @param {number} x Left.
 * @param {number} y Top.
 * @param {number} w Width.
 * @param {number} h Height.
 * @returns {string} SVG.
 */
const hullArt = (x, y, w, h) => {
  let s = 7;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  /** @type {[number, number][]} */
  const pts = [];
  for (let i = 0; i < 22; i++) {
    pts.push([
      Math.round(x + 18 + rnd() * (w - 36)),
      Math.round(y + 16 + rnd() * (h - 32)),
    ]);
  }
  // Jarvis march
  const cross = (
    /** @type {number[]} */ o,
    /** @type {number[]} */ a,
    /** @type {number[]} */ b,
  ) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  let start = pts.reduce((a, p) => (p[0] < a[0] ? p : a), pts[0]);
  const hull = [];
  let p = start;
  do {
    hull.push(p);
    let q = pts[0] === p ? pts[1] : pts[0];
    for (const r of pts) {
      if (r !== p && cross(p, q, r) < 0) {
        q = r;
      }
    }
    p = q;
  } while (p !== start && hull.length < pts.length);

  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.bg}"/>`;
  // grid
  for (let gx = x + 25; gx < x + w; gx += 25) {
    out += `<line x1="${gx}" y1="${y}" x2="${gx}" y2="${y + h}" stroke="${C.line}" stroke-width="1"/>`;
  }
  for (let gy = y + 25; gy < y + h; gy += 25) {
    out += `<line x1="${x}" y1="${gy}" x2="${x + w}" y2="${gy}" stroke="${C.line}" stroke-width="1"/>`;
  }
  // hull edges appear one by one
  hull.forEach((a, k) => {
    const bpt = hull[(k + 1) % hull.length];
    out += `<line x1="${a[0]}" y1="${a[1]}" x2="${bpt[0]}" y2="${bpt[1]}" stroke="${C.mint}" stroke-width="2" class="fade" style="animation-delay:${600 + k * 260}ms" shape-rendering="auto"/>`;
  });
  pts.forEach((pt) => {
    const onHull = hull.includes(pt);
    out += onHull
      ? sprite(PLUS, pt[0] - 3, pt[1] - 3, C.pink)
      : `<rect x="${pt[0] - 2}" y="${pt[1] - 2}" width="4" height="4" fill="${C.sky}"/>`;
  });
  return out;
};

/**
 * Project card.
 *
 * @param {object} o Options.
 * @param {number} o.index Number shown on the tab.
 * @param {string} o.name Repo name.
 * @param {string} o.description Description.
 * @param {string=} o.language Main language.
 * @param {number} o.stars Stars.
 * @param {string=} o.tags Extra tag text.
 * @returns {string} SVG.
 */
export const renderProject = ({
  index,
  name,
  description,
  language,
  stars,
  tags,
}) => {
  const W = FULL;
  const H = 214;
  let b = hud({
    x: 16,
    y: 24,
    w: W - 32,
    h: H - 46,
    color: C.sky,
    label: `Project ${String(index).padStart(2, "0")}`,
  });
  b += hullArt(38, 48, 250, 134);
  const tx = 318;
  const pretty = name
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  b += `<text x="${tx}" y="70" fill="${C.text}" style="font-size:22px" class="big">${esc(fit(pretty, W - tx - 50, 22, 700))}</text>`;
  const lines = wrap(description || "No description yet.", W - tx - 56, 15, 3);
  lines.forEach((ln, k) => {
    b += `<text x="${tx}" y="${98 + k * 21}" fill="${C.muted}" style="font-size:15px">${esc(ln)}</text>`;
  });
  let cx = tx;
  const chips = [
    language ? [language, C.mint] : null,
    [`${stars} star${stars === 1 ? "" : "s"}`, C.butter],
    tags ? [tags, C.lilac] : null,
  ].filter(Boolean);
  chips.forEach((chip) => {
    // @ts-ignore
    const [label, color] = chip;
    const text = String(label).toUpperCase();
    const w = Math.ceil(measure(text, 11, 500, 1.5)) + 20;
    b += `<rect x="${cx}" y="160" width="${w}" height="20" fill="${color}" fill-opacity=".14" stroke="${color}" stroke-opacity=".7"/>
      <text x="${cx + 10}" y="174" fill="${color}" style="font-size:11px;letter-spacing:1.5px">${esc(text)}</text>`;
    cx += w + 8;
  });
  b += `<text x="${W - 40}" y="174" text-anchor="end" fill="${C.sky}" style="font-size:13px;letter-spacing:1.5px" class="big">VIEW REPO</text>
    <g class="cursor">${sprite(["X..", "XX.", "XXX", "XX.", "X.."], W - 34, 165, C.sky)}</g>`;
  return doc(W, H, `Project: ${pretty}`, b);
};

// ---------------------------------------------------------------------------
// footer

/**
 * Footer banner.
 *
 * @param {object} o Options.
 * @param {string} o.text Big text.
 * @returns {string} SVG.
 */
export const renderFooter = ({ text }) => {
  const W = FULL;
  const H = 170;
  let b = starfield(W, H, 18, 9, [{ x: 150, y: 30, w: 540, h: 100 }]);
  b += chunky(text, W / 2, 76, 34, C.pink, "#7a1f48");
  const press = "PRESS START TO CONTINUE";
  const pw = 14 + 10 + measure(press, 12, 700, 3);
  const px0 = W / 2 - pw / 2;
  b += `<g class="cursor">${sprite(HEART, px0, 103, C.coral)}
    <text x="${px0 + 24}" y="113" fill="${C.muted}" style="font-size:12px;letter-spacing:3px" class="big">${press}</text></g>`;
  b += cat(56, H - 70, 3, true);
  b += `<g class="twinkle">${sprite(SPARKLE, W - 100, 118, C.butter, 3)}</g>`;
  return doc(W, H, text, b);
};
