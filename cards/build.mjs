// Builds the pixel README cards into ../assets/*.svg.
// Run: GH_TOKEN=<token> node cards/build.mjs
// Edit CONFIG below to change what the cards say.

import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  renderButton,
  renderFooter,
  renderHeader,
  renderInventory,
  renderLanguages,
  renderPractice,
  renderProject,
} from "./cards.js";
import {
  fetchNeetCode,
  fetchOwnLanguages,
  fetchQuest,
  fetchRepo,
} from "./fetchers.js";
import { C } from "./kit.js";

const CONFIG = {
  username: "chrysalxsms",
  name: "Aishwarya",
  about:
    "Hello! Welcome to my GitHub. I study at KU Leuven and like making cute things with code.",
  tz: "Europe/Brussels",
  buttons: [
    { file: "button-linkedin", label: "LinkedIn", icon: "linkedin", color: C.sky },
    { file: "button-email", label: "Email", icon: "email", color: C.mint },
  ],
  inventory: ["Python", "Java", "JavaScript", "TypeScript", "HTML", "CSS", "Haskell", "C", "SQL", "Git", "Godot", "Linux"],
  languages: { exclude: [], hide: [], count: 12 },
  practice: { leetcodeRepo: "leetcode", neetcodeRepo: "neetcode-submissions" },
  projects: [{ repo: "computational-geometry-visualisers", tags: "algorithms" }],
  footer: "THANKS FOR STOPPING BY",
};

const OUT = fileURLToPath(new URL("../assets/", import.meta.url));

/** @type {Record<string, () => Promise<string>>} */
const jobs = {
  header: async () =>
    renderHeader({ name: CONFIG.name, about: CONFIG.about, date: new Date(), tz: CONFIG.tz }),
  inventory: async () => renderInventory({ items: CONFIG.inventory }),
  languages: async () => {
    const { exclude, hide, count } = CONFIG.languages;
    const hidden = hide.map((h) => h.toLowerCase());
    const list = (await fetchOwnLanguages(CONFIG.username, exclude))
      .filter((l) => !hidden.includes(l.name.toLowerCase()))
      .slice(0, count);
    const total = list.reduce((a, l) => a + l.size, 0);
    return renderLanguages(list, total, { title: "Languages" });
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
      title: "LeetCode + NeetCode",
      leetcode: lc.status === "fulfilled" ? lc.value : { easy: 0, medium: 0, hard: 0 },
      neetcode: nc.status === "fulfilled" ? nc.value : [],
    });
  },
  footer: async () => renderFooter({ text: CONFIG.footer }),
};
for (const b of CONFIG.buttons) {
  jobs[b.file] = async () => renderButton(b);
}
CONFIG.projects.forEach((p, i) => {
  jobs[`project-${p.repo}`] = async () => {
    const repo = await fetchRepo(CONFIG.username, p.repo);
    return renderProject({
      index: i + 1,
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stars,
      tags: p.tags,
    });
  };
});

await mkdir(OUT, { recursive: true });
let failed = 0;
for (const [file, job] of Object.entries(jobs)) {
  try {
    await writeFile(`${OUT}${file}.svg`, await job());
    console.log(`ok    ${file}.svg`);
  } catch (err) {
    // keep the previous image if one card fails
    failed++;
    console.error(`FAIL  ${file}.svg: ${err instanceof Error ? err.message : err}`);
  }
}
process.exit(failed ? 1 : 0);
