// Build-time bundler for the sparring team.
//
// Reads the agents (.claude/agents), their preloaded skills (.claude/skills),
// CLAUDE.md, the docs each agent relies on, and each agent's knowledge folder
// from THIS repository, and writes two files:
//   server/generated/team.json  - full prompts, used only by Netlify Functions
//   src/generated/roster.json   - public sidebar data (name, persona, role,
//                                 voice, model), shipped to the browser
//
// Safety rules enforced here:
//   - Only files inside the repository are read (realpath check, no symlinks).
//   - Nothing under docs/my-work/test-cases/ is ever read, and no file whose
//     path mentions an answer key is read anywhere.
//   - Only text files (.md, .txt, .csv, .json, .tsv) up to 200 KB are read.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const here = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(here, "..");
const REPO = fs.realpathSync(path.resolve(WEB, ".."));

const EXCLUDED_DIRS = [path.join(REPO, "docs", "my-work", "test-cases")];
const ANSWER_KEY = /answer[\s_-]*keys?/i;
const TEXT_EXT = new Set([".md", ".txt", ".csv", ".json", ".tsv"]);
const MAX_BYTES = 200 * 1024;

/** Not a team member in the web app: it edits repository files. */
const WEB_EXCLUDED_AGENTS = new Set(["team-builder"]);

function isAllowedPath(abs) {
  let real;
  try {
    const st = fs.lstatSync(abs);
    if (st.isSymbolicLink()) return false;
    real = fs.realpathSync(abs);
  } catch {
    return false;
  }
  if (real !== REPO && !real.startsWith(REPO + path.sep)) return false; // outside the repo
  if (EXCLUDED_DIRS.some((d) => real === d || real.startsWith(d + path.sep))) return false;
  if (ANSWER_KEY.test(path.relative(REPO, real))) return false;
  return true;
}

function readRaw(rel) {
  const abs = path.join(REPO, rel);
  if (!isAllowedPath(abs)) throw new Error(`Refusing to read ${rel}`);
  const st = fs.statSync(abs);
  if (!st.isFile() || st.size > MAX_BYTES || !TEXT_EXT.has(path.extname(abs).toLowerCase())) {
    throw new Error(`Not a readable text file: ${rel}`);
  }
  return fs.readFileSync(abs, "utf8");
}

function listFiles(relDir) {
  const absDir = path.join(REPO, relDir);
  if (!isAllowedPath(absDir) || !fs.statSync(absDir).isDirectory()) return [];
  const out = [];
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const rel = path.join(relDir, entry.name);
    const abs = path.join(REPO, rel);
    if (!isAllowedPath(abs)) continue;
    if (entry.isDirectory()) out.push(...listFiles(rel));
    else if (entry.isFile() && TEXT_EXT.has(path.extname(entry.name).toLowerCase()) && fs.statSync(abs).size <= MAX_BYTES) {
      out.push(rel);
    }
  }
  return out;
}

function parseFrontmatter(text, file) {
  if (!text.startsWith("---\n")) throw new Error(`${file}: frontmatter must start on line 1`);
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) throw new Error(`${file}: unterminated frontmatter`);
  return { data: YAML.parse(text.slice(4, end)), body: text.slice(end + 5).trim() };
}

// ---- docs/agent-brains.md: persona, role, voice, model per agent ----------
function parseBrains() {
  const text = readText("docs/agent-brains.md");
  const rows = {};
  for (const line of text.split("\n")) {
    if (!line.startsWith("| `")) continue;
    const cells = line
      .slice(1, -1)
      .split(/(?<!\\)\|/)
      .map((c) => c.trim().replace(/\\\|/g, "|"));
    if (cells.length < 7) continue;
    const name = cells[0].replace(/`/g, "");
    rows[name] = {
      role: cells[1],
      model: cells[2].replace(/\*/g, ""),
      modelReason: cells[3],
      persona: cells[4].replace(/\*/g, ""),
      voice: cells[5],
      style: cells[6],
    };
  }
  return rows;
}

// ---- Skills ----------------------------------------------------------------
function loadSkill(name) {
  const dir = `.claude/skills/${name}`;
  const files = listFiles(dir);
  if (!files.includes(`${dir}/SKILL.md`)) throw new Error(`Missing skill ${name}`);
  // SKILL.md first, then supporting references, verbatim.
  return files
    .sort((a, b) => (a.endsWith("SKILL.md") ? -1 : b.endsWith("SKILL.md") ? 1 : a.localeCompare(b)))
    .map((f) => ({ path: f, text: readText(f) }));
}

// ---- Docs each agent relies on ---------------------------------------------
const DOC_FILES = fs
  .readdirSync(path.join(REPO, "docs"))
  .filter((f) => /^0\d-.*\.md$/.test(f))
  .sort();

function docsFor(name, body) {
  const wanted = new Set();
  for (const m of body.matchAll(/docs\/(0\d-[a-z0-9-]+\.md)/g)) wanted.add(m[1]);
  // Short references such as "docs/02, docs/04"
  for (const m of body.matchAll(/docs\/(0\d)\b(?!-)/g)) {
    const f = DOC_FILES.find((d) => d.startsWith(m[1] + "-"));
    if (f) wanted.add(f);
  }
  const extra = [];
  if (name === "orchestrator") extra.push("docs/expert-roster.md");
  if (name === "interview-coach") extra.push("docs/my-work/interview-error-log.md");
  return [...[...wanted].sort().map((f) => `docs/${f}`), ...extra].filter((f) => fs.existsSync(path.join(REPO, f)));
}

// ---- Test-case leak guard -----------------------------------------------------
// We never read docs/my-work/test-cases/, but other files (e.g. the interview
// error log) can quote findings from a test-case review, which would act as an
// answer key. Strip any line that names a test case. Only file *names* are
// listed here; their contents are never opened.
const TEST_CASE_STEMS = (() => {
  const dir = path.join(REPO, "docs", "my-work", "test-cases");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).map((f) => path.parse(f).name.toLowerCase()).filter(Boolean);
})();

function stripTestCaseLines(text) {
  if (TEST_CASE_STEMS.length === 0) return text;
  return text
    .split("\n")
    .filter((line) => {
      const l = line.toLowerCase();
      return !l.includes("test-case") && !l.includes("test case") && !TEST_CASE_STEMS.some((s) => l.includes(s));
    })
    .join("\n");
}

function readText(rel) {
  return stripTestCaseLines(readRaw(rel));
}

// ---- Main ------------------------------------------------------------------
const brains = parseBrains();
const claudeMd = readText("CLAUDE.md");
const agents = [];
const skillCache = new Map();

for (const file of listFiles(".claude/agents").filter((f) => f.endsWith(".md"))) {
  const { data, body } = parseFrontmatter(readText(file), file);
  const name = data.name;
  if (WEB_EXCLUDED_AGENTS.has(name)) continue;
  const brain = brains[name];
  if (!brain) throw new Error(`docs/agent-brains.md has no row for ${name}`);
  const skillNames = Array.isArray(data.skills) ? data.skills : [];
  const skills = skillNames.map((s) => {
    if (!skillCache.has(s)) skillCache.set(s, loadSkill(s));
    return { name: s, files: skillCache.get(s) };
  });
  const knowledge = listFiles(`knowledge/${name}`).map((f) => ({ path: f, text: readText(f) }));
  const docs = docsFor(name, body).map((f) => ({ path: f, text: readText(f) }));
  agents.push({
    name,
    model: data.model ?? brain.model,
    description: data.description,
    body,
    skills,
    knowledge,
    docs,
    ...brain,
  });
}

const order = Object.keys(brains);
agents.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));

for (const a of agents) {
  if (brains[a.name].model !== a.model) {
    console.warn(`warning: ${a.name} model in agent file (${a.model}) differs from agent-brains.md (${brains[a.name].model})`);
  }
}

const serverOut = path.join(WEB, "server", "generated", "team.json");
const clientOut = path.join(WEB, "src", "generated", "roster.json");
fs.mkdirSync(path.dirname(serverOut), { recursive: true });
fs.mkdirSync(path.dirname(clientOut), { recursive: true });

fs.writeFileSync(serverOut, JSON.stringify({ builtAt: new Date().toISOString(), claudeMd, agents }, null, 0));
fs.writeFileSync(
  clientOut,
  JSON.stringify(
    agents.map(({ name, persona, role, voice, style, model, modelReason }) => ({ name, persona, role, voice, style, model, modelReason })),
    null,
    2,
  ),
);

const sizes = agents.map((a) => {
  const chars = a.body.length + a.skills.reduce((n, s) => n + s.files.reduce((m, f) => m + f.text.length, 0), 0) +
    a.docs.reduce((n, d) => n + d.text.length, 0) + a.knowledge.reduce((n, k) => n + k.text.length, 0) + claudeMd.length;
  return `${a.name}: ~${Math.round(chars / 4 / 1000)}K tokens`;
});
console.log(`Bundled ${agents.length} agents (${skillCache.size} skills). Prompt sizes:\n  ${sizes.join("\n  ")}`);
