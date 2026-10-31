// Renders the sections of the "little corner" profile README (src/App.tsx)
// as standalone SVGs, so the same design shows on GitHub. Sizes and colours
// follow src/index.css.

import { JERSEY_15_WIDTHS, JERSEY_15_WOFF2, PLEX_MONO_WOFF2 } from "./fonts.js";

export const W = 840;

const C = {
  bg: "#0d1117",
  text: "#c9d1d9",
  bright: "#f0f6fc",
  muted: "#9198a1",
  line: "#212830",
  card: "#151b23",
  cardBorder: "#30363d",
};

// Tool chip colours (.rose, .peach, ... in index.css).
export const CHIP = {
  rose: { fg: "#f2a6c4", bg: "#492b3b" },
  peach: { fg: "#f0b28c", bg: "#453026" },
  gold: { fg: "#f0d084", bg: "#433824" },
  blue: { fg: "#9ac8f1", bg: "#29384d" },
  lavender: { fg: "#cba8ed", bg: "#3d2e50" },
};

// Language colours, by rank.
const LANG_COLORS = [
  "#ec9fbb", "#8fbce8", "#efca7d", "#bd9de2", "#e6a282", "#d78db8",
  "#83b4d4", "#ef938b", "#eac2a3", "#a5a4e3", "#cc9ecb",
];

// Line icons from App.tsx (24x24, 1.5 stroke).
const ICONS = {
  code: '<path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16"/>',
  branch: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M6 7v10m0-4h5a7 7 0 0 0 7-6"/>',
  book: '<path d="M4 3h15v18H4zM8 3v18M12 7h4"/>',
  file: '<path d="M14 2H6v20h14V8z"/><path d="M14 2v6h6M9 13h8M9 17h6"/>',
  arrow: '<path d="M5 19 19 5M5 5h14v14"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
};

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
 * Width of IBM Plex Mono text (every glyph is 0.6em).
 *
 * @param {string} text Text.
 * @param {number} size Font size.
 * @returns {number} Width.
 */
const mono = (text, size) => [...text].length * 0.6 * size;

/**
 * Width of Jersey 15 text.
 *
 * @param {string} text Text.
 * @param {number} size Font size.
 * @returns {number} Width.
 */
const jersey = (text, size) => {
  let w = 0;
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    w += code >= 32 && code <= 126 ? JERSEY_15_WIDTHS[code - 32] : 600;
  }
  return (w * size) / 1000;
};

/**
 * Word-wrap monospace text.
 *
 * @param {string} text Text.
 * @param {number} maxWidth Max width.
 * @param {number} size Font size.
 * @returns {string[]} Lines.
 */
const wrap = (text, maxWidth, size) => {
  const lines = [];
  let cur = "";
  for (const word of String(text).split(/\s+/).filter(Boolean)) {
    const next = cur ? `${cur} ${word}` : word;
    if (mono(next, size) <= maxWidth || !cur) {
      cur = next;
    } else {
      lines.push(cur);
      cur = word;
    }
  }
  if (cur) {
    lines.push(cur);
  }
  return lines;
};

/**
 * A line icon.
 *
 * @param {keyof ICONS} name Icon.
 * @param {number} x Left.
 * @param {number} y Top.
 * @param {number} size Size.
 * @param {string} color Stroke colour.
 * @returns {string} SVG.
 */
const icon = (name, x, y, size, color) =>
  `<g transform="translate(${x} ${y}) scale(${size / 24})" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</g>`;

/**
 * Section heading: icon + label (the h3s in App.tsx).
 *
 * @param {number} y Top.
 * @param {keyof ICONS} name Icon.
 * @param {string} color Icon colour.
 * @param {string} label Text.
 * @returns {string} SVG.
 */
const heading = (y, name, color, label) =>
  `${icon(name, 0, y, 16, color)}<text x="25" y="${y + 12}" class="m" font-size="12" fill="${C.bright}">${esc(label)}</text>`;

/**
 * Wrap content in a complete SVG with the fonts.
 *
 * @param {number} w Width.
 * @param {number} h Height.
 * @param {string} title Accessible title.
 * @param {string} body Content.
 * @param {boolean} background Paint the page colour behind it.
 * @returns {string} SVG.
 */
const doc = (w, h, title, body, background = true) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${Math.ceil(h)}" viewBox="0 0 ${w} ${Math.ceil(h)}" role="img" aria-labelledby="t">
<title id="t">${esc(title)}</title>
<style>
  @font-face { font-family: "Plex"; src: url(data:font/woff2;base64,${PLEX_MONO_WOFF2}) format("woff2"); }
  @font-face { font-family: "Jersey"; src: url(data:font/woff2;base64,${JERSEY_15_WOFF2}) format("woff2"); }
  .m { font-family: "Plex", "IBM Plex Mono", ui-monospace, monospace; }
  .j { font-family: "Jersey", "Jersey 15", monospace; }
</style>
${background ? `<rect width="${w}" height="${Math.ceil(h)}" fill="${C.bg}"/>` : ""}
${body}
</svg>`;

/**
 * An SVG file embedded as an image.
 *
 * @param {string} svg SVG source.
 * @param {number} x Left.
 * @param {number} y Top.
 * @param {number} w Width.
 * @param {number} h Height.
 * @param {string=} clip Clip-path id.
 * @returns {string} SVG.
 */
const embed = (svg, x, y, w, h, clip) =>
  `<image x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"${clip ? ` clip-path="url(#${clip})"` : ""} href="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}"/>`;

// ---------------------------------------------------------------------------

/**
 * "Hi, I'm <name>." with the student badge and intro line.
 *
 * @param {{ name: string, about: string, badge: string }} o Options.
 * @returns {string} SVG.
 */
export const renderIntro = ({ name, about, badge }) => {
  let b = `<text x="0" y="70" class="j" font-size="48" fill="${C.bright}">Hi, I'm <tspan fill="#efa9c3">${esc(name)}.</tspan></text>`;
  const bw = 9 + 5 + 7 + mono(badge, 9) + 9 + 2;
  const by = 29 + 27.6 - 12.5;
  b += `<rect x="${W - bw + 0.5}" y="${by}" width="${bw - 1}" height="25" rx="4" fill="#2d273a" stroke="#4a405e"/>
    <rect x="${W - bw + 10}" y="${by + 10}" width="5" height="5" fill="#c4a1e8"/>
    <text x="${W - bw + 22}" y="${by + 16}" class="m" font-size="9" fill="#cdb5ec">${esc(badge)}</text>`;
  const lines = wrap(about, W, 12);
  lines.forEach((line, i) => {
    b += `<text x="0" y="${111 + i * 22.8}" class="m" font-size="12" fill="${C.text}">${esc(line)}</text>`;
  });
  return doc(W, 95 + lines.length * 22.8 + 8, `Hi, I'm ${name}. ${about}`, b);
};

/**
 * A contact link (LinkedIn / Email) as in the intro.
 *
 * @param {{ kind: "linkedin" | "email", label: string }} o Options.
 * @returns {string} SVG.
 */
export const renderContact = ({ kind, label }) => {
  const color = "#d2c8b5";
  let x = 1;
  let b = "";
  if (kind === "linkedin") {
    b += `<rect x="1.5" y="5.5" width="14" height="14" fill="none" stroke="#9b7f8b"/>
      <text x="8.5" y="16.5" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="12" fill="#bda9b1">in</text>`;
    x += 15;
  } else {
    b += icon("mail", 1, 5, 15, color);
    x += 15;
  }
  x += 8;
  b += `<text x="${x}" y="16.5" class="m" font-size="11" fill="${color}">${esc(label)}</text>`;
  x += mono(label, 11) + mono(" ", 11);
  b += icon("arrow", x, 6.5, 12, color);
  return doc(Math.ceil(x + 14), 26, label, b);
};

/**
 * Toolbox chips.
 *
 * @param {{ tools: [string, string, keyof CHIP][] }} o Options: [symbol, name, colour].
 * @returns {string} SVG.
 */
export const renderToolbox = ({ tools }) => {
  let b = `<rect x="0" y="10" width="${W}" height="1" fill="${C.line}"/>`;
  b += heading(36, "code", "#e8a9bf", "Toolbox");
  const CH = 36;
  let x = 0;
  let y = 36 + 16 + 17;
  for (const [symbol, name, tone] of tools) {
    const sw = Math.max(21, mono(symbol, 9) + 8);
    const cw = 1 + 7 + sw + 8 + mono(name, 10) + 11 + 1;
    if (x > 0 && x + cw > W) {
      x = 0;
      y += CH + 8;
    }
    const chip = CHIP[tone] || CHIP.rose;
    b += `<rect x="${x + 0.5}" y="${y + 0.5}" width="${cw - 1}" height="${CH - 1}" rx="4" fill="${C.card}" stroke="${C.cardBorder}"/>
      <rect x="${x + 8}" y="${y + 8}" width="${sw}" height="20" rx="2" fill="${chip.bg}"/>
      <text x="${x + 8 + sw / 2}" y="${y + 21}" text-anchor="middle" class="m" font-size="9" fill="${chip.fg}">${esc(symbol)}</text>
      <text x="${x + 8 + sw + 8}" y="${y + 21.5}" class="m" font-size="10" fill="${C.text}">${esc(name)}</text>`;
    x += cw + 8;
  }
  return doc(W, y + CH + 4, `Toolbox: ${tools.map((t) => t[1]).join(", ")}`, b);
};

/**
 * Languages: one split bar and a legend.
 *
 * @param {{ langs: { name: string, size: number }[] }} o Options.
 * @returns {string} SVG.
 */
export const renderLanguages = ({ langs }) => {
  const total = langs.reduce((a, l) => a + l.size, 0) || 1;
  const pct = (/** @type {number} */ p) =>
    p > 0 && p < 0.1 ? "<0.1%" : `${p.toFixed(1)}%`;
  let b = heading(27, "branch", "#9abfeb", "Languages");

  // bar: flex by share, every language at least 2px, 3px gaps
  const barY = 27 + 16 + 17;
  const GAP = 3;
  const free = W - GAP * Math.max(0, langs.length - 1);
  const raw = langs.map((l) => (l.size / total) * free);
  const small = raw.filter((w) => w < 2).length;
  const big = raw.filter((w) => w >= 2).reduce((a, w) => a + w, 0) || 1;
  const widths = raw.map((w) => (w < 2 ? 2 : (w / big) * (free - small * 2)));
  b += `<clipPath id="bar"><rect x="0" y="${barY}" width="${W}" height="8" rx="2"/></clipPath><g clip-path="url(#bar)">`;
  let x = 0;
  langs.forEach((l, i) => {
    b += `<rect x="${x.toFixed(2)}" y="${barY}" width="${widths[i].toFixed(2)}" height="8" fill="${LANG_COLORS[i % LANG_COLORS.length]}"><title>${esc(`${l.name}: ${pct((l.size / total) * 100)}`)}</title></rect>`;
    x += widths[i] + GAP;
  });
  b += "</g>";

  // legend
  let lx = 0;
  let ly = barY + 8 + 12;
  const RH = 12;
  langs.forEach((l, i) => {
    const value = pct((l.size / total) * 100);
    const iw = 5 + 5 + mono(`${l.name} `, 9) + 3 + mono(value, 9);
    if (lx > 0 && lx + iw > W) {
      lx = 0;
      ly += RH + 15;
    }
    b += `<rect x="${lx}" y="${ly + 3.5}" width="5" height="5" fill="${LANG_COLORS[i % LANG_COLORS.length]}"/>
      <text x="${lx + 10}" y="${ly + 9}" class="m" font-size="9" fill="${C.text}">${esc(l.name)} <tspan dx="3" fill="${C.muted}">${esc(value)}</tspan></text>`;
    lx += iw + 15;
  });
  return doc(W, ly + RH + 4, `Languages: ${langs.map((l) => `${l.name} ${pct((l.size / total) * 100)}`).join(", ")}`, b);
};

/**
 * Practice: LeetCode and NeetCode side by side.
 *
 * @param {{ leetcode: { easy: number, medium: number, hard: number }, neetcode: { name: string, count: number }[] }} o Options.
 * @returns {string} SVG.
 */
export const renderPractice = ({ leetcode, neetcode }) => {
  const lc = leetcode.easy + leetcode.medium + leetcode.hard;
  const nc = neetcode.reduce((a, c) => a + c.count, 0);
  let b = heading(29, "book", "#edc482", "Practice");
  b += `<text x="${W}" y="${29 + 12}" text-anchor="end" class="m" font-size="13" fill="#edc482">${lc + nc} <tspan font-size="9" fill="${C.muted}">solved</tspan></text>`;

  const top = 29 + 16 + 16;
  const cw = (W - 13) / 2;
  const courses = [...neetcode].sort((a, z) => z.count - a.count);
  const lcH = 13 + 14.3 + 14 + 8 + 11 + 11.7 + 13 + 2;
  const ncH = 13 + 14.3 + courses.length * 11.7 + Math.max(0, courses.length - 1) * 8 + 12 + 13 + 2;
  const ch = Math.max(lcH, ncH);

  const card = (/** @type {number} */ x, /** @type {string} */ mark, /** @type {string} */ markColor, /** @type {string} */ name, /** @type {number} */ n) =>
    `<rect x="${x + 0.5}" y="${top + 0.5}" width="${cw - 1}" height="${ch - 1}" rx="4" fill="${C.card}" stroke="${C.cardBorder}"/>
    <text x="${x + 15}" y="${top + 26}" class="m" font-size="11" fill="${C.text}"><tspan font-size="14" font-weight="600" fill="${markColor}">${mark}</tspan> ${esc(name)}</text>
    <text x="${x + cw - 15}" y="${top + 26}" text-anchor="end" class="m" font-size="11" fill="${C.text}">${n} <tspan font-size="9" fill="${C.muted}">solved</tspan></text>`;

  // LeetCode: 36 cells split by difficulty
  b += card(0, "/", "#f0d084", "LeetCode", lc);
  const DIFF = [
    ["Easy", leetcode.easy, "#e6a2be"],
    ["Medium", leetcode.medium, "#ecc777"],
    ["Hard", leetcode.hard, "#be9bdd"],
  ];
  const CELLS = 36;
  const counts = DIFF.map(([, n]) => (lc ? Math.round((/** @type {number} */ (n) / lc) * CELLS) : 0));
  if (lc) {
    counts[counts.indexOf(Math.max(...counts))] += CELLS - counts.reduce((a, n) => a + n, 0);
  }
  const cellW = (cw - 30 - 3 * (CELLS - 1)) / CELLS;
  const py = top + 13 + 14.3 + 14;
  let cell = 0;
  counts.forEach((n, k) => {
    for (let j = 0; j < n; j++, cell++) {
      b += `<rect x="${(15 + cell * (cellW + 3)).toFixed(2)}" y="${py}" width="${cellW.toFixed(2)}" height="8" fill="${DIFF[k][2]}"/>`;
    }
  });
  for (; cell < CELLS; cell++) {
    b += `<rect x="${(15 + cell * (cellW + 3)).toFixed(2)}" y="${py}" width="${cellW.toFixed(2)}" height="8" fill="${C.line}"/>`;
  }
  let lx = 15;
  for (const [label, n, color] of DIFF) {
    b += `<rect x="${lx}" y="${py + 8 + 11 + 3.5}" width="5" height="5" fill="${color}"/>
      <text x="${lx + 10}" y="${py + 8 + 11 + 9}" class="m" font-size="9" fill="${C.muted}">${label} <tspan fill="${C.text}">${n}</tspan></text>`;
    lx += 10 + mono(`${label} ${n}`, 9) + 23;
  }

  // NeetCode: solved per course
  const nx = cw + 13;
  b += card(nx, "≋", "#9ac8f1", "NeetCode", nc);
  let ry = top + 13 + 14.3 + 12;
  for (const course of courses) {
    b += `<text x="${nx + 15}" y="${ry + 9}" class="m" font-size="9" fill="${C.muted}">${esc(course.name)}</text>
      <text x="${nx + cw - 15}" y="${ry + 9}" text-anchor="end" class="m" font-size="9" fill="${C.text}">${course.count}</text>`;
    ry += 11.7 + 8;
  }
  if (!courses.length) {
    b += `<text x="${nx + 15}" y="${ry + 9}" class="m" font-size="9" fill="${C.muted}">Nothing synced yet</text>`;
  }
  return doc(W, top + ch + 4, `Practice: ${lc + nc} solved (LeetCode ${lc}, NeetCode ${nc})`, b);
};

/**
 * Project card with its picture.
 *
 * @param {{ title: string, description: string, language?: string, topic?: string, image: string }} o Options.
 * @returns {string} SVG.
 */
export const renderProject = ({ title, description, language, topic, image }) => {
  let b = heading(29, "file", "#c8a4e9", "Projects");
  const top = 29 + 16 + 17;
  const ix = 16;
  const tx = ix + 177 + 22;
  const tw = W - tx - 16;
  const lines = wrap(description, tw, 10);
  const infoH = 5 + 28.6 + 5 + lines.length * 17 + 14 + 12;
  const inner = Math.max(112, infoH);
  const ch = inner + 32;
  b += `<rect x="0.5" y="${top + 0.5}" width="${W - 1}" height="${ch - 1}" rx="4" fill="${C.card}" stroke="${C.cardBorder}"/>`;
  const iy = top + 16 + (inner - 112) / 2;
  b += `<clipPath id="pic"><rect x="${ix}" y="${iy}" width="177" height="112" rx="3"/></clipPath>`;
  b += embed(image, ix, iy, 177, 112, "pic");
  let y = top + 16 + (inner - infoH) / 2 + 5;
  b += `<text x="${tx}" y="${y + 22}" class="j" font-size="22" fill="${C.bright}">${esc(title)}</text>`;
  y += 28.6 + 5;
  lines.forEach((line) => {
    b += `<text x="${tx}" y="${y + 12}" class="m" font-size="10" fill="${C.muted}">${esc(line)}</text>`;
    y += 17;
  });
  y += 14;
  if (language) {
    b += `<circle cx="${tx + 2.5}" cy="${y + 6}" r="2.5" fill="#d2bd83"/>
      <text x="${tx + 11}" y="${y + 9}" class="m" font-size="9" fill="#bea1ad">${esc(language)}${topic ? `<tspan dx="7" fill="${C.muted}">${esc(topic)}</tspan>` : ""}</text>`;
  }
  const view = "View repo";
  const vx = W - 16 - 12 - 5 - mono(view, 9);
  b += `<text x="${vx}" y="${y + 9}" class="m" font-size="9" fill="#b5cbef">${view}</text>${icon("arrow", W - 16 - 12, y, 12, "#b5cbef")}`;
  return doc(W, top + ch + 4, `Project: ${title}. ${description}`, b);
};

/**
 * Footer: the little cat and three pixels.
 *
 * @param {{ cat: string }} o Options: the cat SVG source.
 * @returns {string} SVG.
 */
export const renderFooter = ({ cat }) => {
  let b = `<rect x="0" y="10" width="${W}" height="1" fill="${C.line}"/>`;
  b += embed(cat, 0, 34, 39, 45);
  ["#e8a3be", "#a9bcec", "#e9c582"].forEach((color, i) => {
    b += `<rect x="${W - 25 + i * 10}" y="${34 + 20}" width="5" height="5" fill="${color}"/>`;
  });
  return doc(W, 34 + 45 + 26, "My little pixel cat", b);
};
