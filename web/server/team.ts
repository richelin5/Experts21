// Team data bundled at build time by scripts/build-team.mjs.
import team from "./generated/team.json" with { type: "json" };

export interface TeamFile {
  path: string;
  text: string;
}

export interface TeamAgent {
  name: string;
  model: "opus" | "sonnet" | "haiku" | string;
  description: string;
  body: string;
  skills: { name: string; files: TeamFile[] }[];
  knowledge: TeamFile[];
  docs: TeamFile[];
  role: string;
  persona: string;
  voice: string;
  style: string;
  modelReason: string;
}

export interface TeamBundle {
  builtAt: string;
  claudeMd: string;
  agents: TeamAgent[];
}

export const TEAM = team as TeamBundle;

export const AGENTS: ReadonlyMap<string, TeamAgent> = new Map(TEAM.agents.map((a) => [a.name, a]));

/** Agents that are never staffed as round-1 experts in "Ask the whole team". */
export const NOT_ROUND_ONE = new Set(["orchestrator", "red-team", "interview-coach"]);

export const ROUND_ONE_CANDIDATES = TEAM.agents.filter((a) => !NOT_ROUND_ONE.has(a.name));

export function getAgent(name: string): TeamAgent | undefined {
  return AGENTS.get(name);
}

export function firstName(agent: TeamAgent): string {
  return agent.persona.split(/\s+/)[0] ?? agent.name;
}
