// Builds the profile README sections into ../assets/*.svg, in the
// "little corner" design from src/App.tsx, with live stats.
// Run: GH_TOKEN=<token> node cards/build.mjs
// Edit CONFIG below to change what the README says.

import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  fetchNeetCode,
  fetchOwnLanguages,
  fetchQuest,
  fetchRepo,
} from "./fetchers.js";
import {
  renderContact,
  renderFooter,
  renderIntro,
  renderLanguages,
  renderPractice,
  renderProject,
  renderToolbox,
} from "./profile.js";

const CONFIG = {
  username: "chrysalxsms",
  name: "Aishwarya",
  about: "I study at KU Leuven and like making cool things with code.",
  badge: "Student at KU Leuven",
  // [symbol, name, colour: rose | peach | gold | blue | lavender]
  tools: [
    ["Py", "Python", "rose"],
    ["Jv", "Java", "peach"],
    ["JS", "JavaScript", "gold"],
    ["TS", "TypeScript", "blue"],
    ["<>", "HTML", "peach"],
    ["#", "CSS", "lavender"],
    ["λ", "Haskell", "lavender"],
    ["C", "C", "blue"],
    ["DB", "SQL", "gold"],
    ["⌘", "Git", "peach"],
    ["Gd", "Godot", "rose"],
    ["Lx", "Linux", "gold"],
  ],
  languages: { exclude: [], hide: [], count: 11 },
  practice: { leetcodeRepo: "leetcode", neetcodeRepo: "neetcode-submissions" },
  project: {
    repo: "computational-geometry-visualisers",
    title: "Computational Geometry Visualisers",
    description: "Interactive visualisers for computational geometry algorithms like convex hulls.",
    topic: "Algorithms",
    image: "geometry.svg",
  },
};

const ASSETS = fileURLToPath(new URL("../assets/", import.meta.url));

/** @type {Record<string, () => Promise<string>>} */
const jobs = {
  intro: async () => renderIntro(CONFIG),
  "contact-linkedin": async () => renderContact({ kind: "linkedin", label: "LinkedIn" }),
  "contact-email": async () => renderContact({ kind: "email", label: "Email" }),
  toolbox: async () => renderToolbox({ tools: /** @type {any} */ (CONFIG.tools) }),
  "languages-bar": async () => {
    const { exclude, hide, count } = CONFIG.languages;
    const hidden = hide.map((h) => h.toLowerCase());
    const langs = (await fetchOwnLanguages(CONFIG.username, exclude))
      .filter((l) => !hidden.includes(l.name.toLowerCase()))
      .slice(0, count);
    return renderLanguages({ langs });
  },
  "practice-cards": async () => {
    const [lc, nc] = await Promise.allSettled([
      fetchQuest(CONFIG.username, CONFIG.practice.leetcodeRepo),
      fetchNeetCode(CONFIG.username, CONFIG.practice.neetcodeRepo),
    ]);
    if (lc.status === "rejected" && nc.status === "rejected") {
      throw lc.reason;
    }
    return renderPractice({
      leetcode: lc.status === "fulfilled" ? lc.value : { easy: 0, medium: 0, hard: 0 },
      neetcode: nc.status === "fulfilled" ? nc.value : [],
    });
  },
  project: async () => {
    const p = CONFIG.project;
    const repo = await fetchRepo(CONFIG.username, p.repo);
    return renderProject({
      title: p.title,
      description: p.description || repo.description,
      language: repo.language,
      topic: p.topic,
      image: await readFile(`${ASSETS}${p.image}`, "utf8"),
    });
  },
  footer: async () =>
    renderFooter({ cat: await readFile(`${ASSETS}pixel-cat.svg`, "utf8") }),
};

// Each image is saved as <name>-<content hash>.svg and the README is pointed
// at it. GitHub's image cache can keep serving an old file for hours, but a
// new name always loads fresh.
const README = fileURLToPath(new URL("../README.md", import.meta.url));
let readme = await readFile(README, "utf8");

await mkdir(ASSETS, { recursive: true });
const existing = await readdir(ASSETS);
let failed = 0;
for (const [name, job] of Object.entries(jobs)) {
  try {
    const svg = await job();
    const hash = createHash("sha256").update(svg).digest("hex").slice(0, 8);
    const file = `${name}-${hash}.svg`;
    const old = new RegExp(`^${name}(-[0-9a-f]{8})?\\.svg$`);
    for (const f of existing) {
      if (old.test(f) && f !== file) {
        await unlink(`${ASSETS}${f}`);
      }
    }
    await writeFile(`${ASSETS}${file}`, svg);
    readme = readme.replace(
      new RegExp(`assets/${name}(-[0-9a-f]{8})?\\.svg`, "g"),
      `assets/${file}`,
    );
    console.log(`ok    ${file}`);
  } catch (err) {
    // keep the previous image if one section fails
    failed++;
    console.error(`FAIL  ${name}: ${err instanceof Error ? err.message : err}`);
  }
}
await writeFile(README, readme);
process.exit(failed ? 1 : 0);
