// Builds the profile README sections into ../assets/*.svg, in the
// "little corner" design from src/App.tsx, with live stats.
// Run: GH_TOKEN=<token> node cards/build.mjs
// Edit CONFIG below to change what the README says.

import { mkdir, readFile, writeFile } from "node:fs/promises";
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
  about: "I study at KU Leuven and like making cute things with code.",
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
  languages: async () => {
    const { exclude, hide, count } = CONFIG.languages;
    const hidden = hide.map((h) => h.toLowerCase());
    const langs = (await fetchOwnLanguages(CONFIG.username, exclude))
      .filter((l) => !hidden.includes(l.name.toLowerCase()))
      .slice(0, count);
    return renderLanguages({ langs });
  },
  practice: async () => {
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

await mkdir(ASSETS, { recursive: true });
let failed = 0;
for (const [file, job] of Object.entries(jobs)) {
  try {
    await writeFile(`${ASSETS}${file}.svg`, await job());
    console.log(`ok    ${file}.svg`);
  } catch (err) {
    // keep the previous image if one section fails
    failed++;
    console.error(`FAIL  ${file}.svg: ${err instanceof Error ? err.message : err}`);
  }
}
process.exit(failed ? 1 : 0);
