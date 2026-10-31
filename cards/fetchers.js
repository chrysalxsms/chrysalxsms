// @ts-check
// GitHub data for the pixel cards (standalone: only needs GH_TOKEN).

/**
 * Run a GitHub GraphQL query with the token in GH_TOKEN.
 *
 * @param {string} query Query.
 * @param {Record<string, any>} variables Variables.
 * @returns {Promise<any>} The `data` object.
 */
const graphql = async (query, variables) => {
  const token = process.env.GH_TOKEN;
  if (!token) {
    throw new Error("Set GH_TOKEN to a GitHub token.");
  }
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "pixel-readme-cards",
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(json.errors?.[0]?.message || `GitHub API error (${res.status})`);
  }
  return json.data;
};

/**
 * Language sizes summed over the user's own repositories: repos they own,
 * excluding forks and mirrors. Private repos are included when the
 * instance's token belongs to that user and can read private repos.
 *
 * @param {string} username GitHub username.
 * @param {string[]} exclude Repo names to leave out.
 * @returns {Promise<{ name: string, size: number }[]>} Languages, biggest first.
 */
export const fetchOwnLanguages = async (username, exclude = []) => {
  const skip = new Set(exclude.map((r) => r.toLowerCase()));
  /** @type {Record<string, number>} */
  const sizes = {};
  let after = null;
  for (let page = 0; page < 10; page++) {
    const data = await graphql(
      `
        query ($login: String!, $after: String) {
          user(login: $login) {
            repositories(
              ownerAffiliations: OWNER
              isFork: false
              first: 100
              after: $after
            ) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                name
                isMirror
                languages(first: 20, orderBy: { field: SIZE, direction: DESC }) {
                  edges {
                    size
                    node {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      `,
      { login: username, after },
    );
    if (!data.user) {
      throw new Error("Could not find that user");
    }
    const repos = data.user.repositories;
    for (const repo of repos.nodes) {
      if (repo.isMirror || skip.has(repo.name.toLowerCase())) {
        continue;
      }
      for (const edge of repo.languages.edges) {
        sizes[edge.node.name] = (sizes[edge.node.name] || 0) + edge.size;
      }
    }
    if (!repos.pageInfo.hasNextPage) {
      break;
    }
    after = repos.pageInfo.endCursor;
  }
  return Object.entries(sizes)
    .map(([name, size]) => ({ name, size }))
    .sort((a, b) => b.size - a.size);
};

/**
 * Parse LeetHub's stats.json and README topic tables.
 *
 * @param {string} statsText stats.json contents.
 * @param {string} readme README.md contents.
 * @returns {{ easy: number, medium: number, hard: number, topics: { name: string, count: number }[] }} Progress.
 */
export const parseQuest = (statsText, readme) => {
  let easy = 0;
  let medium = 0;
  let hard = 0;
  try {
    const stats = JSON.parse(statsText || "{}").leetcode || {};
    easy = Number(stats.easy) || 0;
    medium = Number(stats.medium) || 0;
    hard = Number(stats.hard) || 0;
  } catch {
    // no stats.json: leave at zero
  }
  /** @type {{ name: string, count: number }[]} */
  const topics = [];
  let current = null;
  for (const line of readme.split("\n")) {
    const heading = /^##\s+(.+)$/.exec(line.trim());
    if (heading) {
      current = { name: heading[1].trim(), count: 0 };
      topics.push(current);
    } else if (current && /^\|\s*\[/.test(line.trim())) {
      current.count++;
    }
  }
  return {
    easy,
    medium,
    hard,
    topics: topics.filter((t) => t.count > 0).sort((a, b) => b.count - a.count),
  };
};

/**
 * First real paragraph of a README (skips the title, badges and images).
 *
 * @param {string} md Markdown.
 * @returns {string} Plain text.
 */
export const readmeBlurb = (md) => {
  const paragraphs = md
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(
      (p) =>
        p &&
        !p.startsWith("#") &&
        !p.startsWith("![") &&
        !p.startsWith("[![") &&
        !p.startsWith("<") &&
        !p.startsWith("|") &&
        !p.startsWith("```") &&
        !p.startsWith("-"),
    );
  if (!paragraphs.length) {
    return "";
  }
  return paragraphs[0]
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Repository info for a project card.
 *
 * @param {string} owner Owner.
 * @param {string} name Repo name.
 * @returns {Promise<{ name: string, description: string, language?: string, stars: number }>} Repo info.
 */
export const fetchRepo = async (owner, name) => {
  const data = await graphql(
    `
      query ($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          name
          description
          stargazerCount
          primaryLanguage {
            name
          }
          readme: object(expression: "HEAD:README.md") {
            ... on Blob {
              text
            }
          }
        }
      }
    `,
    { owner, name },
  );
  const repo = data.repository;
  if (!repo) {
    throw new Error("Could not find that repository");
  }
  return {
    name: repo.name,
    description: repo.description || readmeBlurb(repo.readme?.text || ""),
    language: repo.primaryLanguage?.name,
    stars: repo.stargazerCount,
  };
};

/**
 * LeetCode progress from a LeetHub-style repo (stats.json + README topics).
 *
 * @param {string} owner Owner.
 * @param {string} name Repo name.
 * @returns {Promise<{ easy: number, medium: number, hard: number, topics: { name: string, count: number }[] }>} Progress.
 */
export const fetchQuest = async (owner, name) => {
  const data = await graphql(
    `
      query ($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          stats: object(expression: "HEAD:stats.json") {
            ... on Blob {
              text
            }
          }
          readme: object(expression: "HEAD:README.md") {
            ... on Blob {
              text
            }
          }
        }
      }
    `,
    { owner, name },
  );
  const repo = data.repository;
  if (!repo) {
    throw new Error("Could not find that repository");
  }
  return parseQuest(repo.stats?.text || "", repo.readme?.text || "");
};

/**
 * NeetCode progress from the repo NeetCode's GitHub Sync writes to
 * (`<course>/<problem-id>/submission-N.ext`): solved problems per course.
 *
 * @param {string} owner Owner.
 * @param {string} name Repo name.
 * @returns {Promise<{ name: string, count: number }[]>} Courses.
 */
export const fetchNeetCode = async (owner, name) => {
  const data = await graphql(
    `
      query ($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          tree: object(expression: "HEAD:") {
            ... on Tree {
              entries {
                name
                type
                object {
                  ... on Tree {
                    entries {
                      type
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    { owner, name },
  );
  const repo = data.repository;
  if (!repo) {
    throw new Error("Could not find that repository");
  }
  return (repo.tree?.entries || [])
    .filter((/** @type {any} */ e) => e.type === "tree" && !e.name.startsWith("."))
    .map((/** @type {any} */ e) => ({
      name: e.name,
      count: (e.object?.entries || []).filter(
        (/** @type {any} */ p) => p.type === "tree",
      ).length,
    }))
    .filter((/** @type {{ count: number }} */ c) => c.count > 0);
};
