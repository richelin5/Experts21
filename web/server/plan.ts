// Turns Victoria's staffing plan into a ticket, enforcing the roster and the
// expert cap regardless of what the model returned.

import { ROUND_ONE_CANDIDATES } from "./team.ts";
import type { TicketStep } from "./security.ts";

export interface PlanExpert {
  agent: string;
  why: string;
}

export const PLAN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["experts", "note"],
  properties: {
    note: { type: "string" },
    experts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["agent", "why"],
        properties: {
          agent: { type: "string", enum: ROUND_ONE_CANDIDATES.map((a) => a.name) },
          why: { type: "string" },
        },
      },
    },
  },
} as const;

export function sanitizePlan(raw: unknown, cap: number): PlanExpert[] {
  const list = raw && typeof raw === "object" && Array.isArray((raw as { experts?: unknown }).experts)
    ? ((raw as { experts: unknown[] }).experts)
    : [];
  const allowed = new Set(ROUND_ONE_CANDIDATES.map((a) => a.name));
  const seen = new Set<string>();
  const out: PlanExpert[] = [];
  for (const e of list) {
    if (!e || typeof e !== "object") continue;
    const agent = (e as { agent?: unknown }).agent;
    if (typeof agent !== "string" || !allowed.has(agent) || seen.has(agent)) continue;
    seen.add(agent);
    out.push({ agent, why: String((e as { why?: unknown }).why ?? "").slice(0, 300) });
    if (out.length >= cap) break;
  }
  if (out.length === 0) out.push({ agent: "vice-president", why: "General quality control of the submission." });
  return out;
}

export function teamSteps(experts: PlanExpert[]): TicketStep[] {
  return [
    ...experts.map((e) => ({ agent: e.agent, stage: "expert" as const, why: e.why })),
    { agent: "red-team", stage: "redteam" as const },
    { agent: "orchestrator", stage: "synthesis" as const },
  ];
}
