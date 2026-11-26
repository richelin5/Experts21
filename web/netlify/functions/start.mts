import type { Config, Context } from "@netlify/functions";
import { getAgent } from "../../server/team.ts";
import { userTurn } from "../../server/prompts.ts";
import { structuredTurn } from "../../server/claude.ts";
import { PLAN_SCHEMA, sanitizePlan, teamSteps } from "../../server/plan.ts";
import { json, ndjson, readJson } from "../../server/http.ts";
import { getKV, checkPassword, consumeDaily, maxTeamExperts, newTicket, signTicket, visitorId } from "../../server/security.ts";

interface StartBody {
  mode: "single" | "team";
  agent?: string;
  question?: string;
  work?: string;
}

// POST /api/start
//  - single mode: counts one message against today's limit and returns a
//    ticket for one agent.
//  - team mode: counts one team review, asks Victoria (orchestrator) to staff
//    it (max 4 experts, enforced in sanitizePlan), and returns a ticket that
//    lists exactly those experts plus the Red Team and Victoria's synthesis.
export default async (req: Request, context: Context) => {
  const auth = checkPassword(req);
  if (!auth.ok) return json(auth.status, { error: auth.message });
  const body = await readJson<StartBody>(req);
  if (body instanceof Response) return body;

  const kv = await getKV();
  const visitor = visitorId(context.ip);

  if (body.mode === "single") {
    const agent = body.agent ? getAgent(body.agent) : undefined;
    if (!agent) return json(400, { error: "Unknown agent." });
    const remaining = await consumeDaily(kv, visitor, "messages");
    if (remaining === null) return json(429, { error: "Daily message limit reached for this visitor. It resets at midnight UTC." });
    return json(200, { ticket: signTicket(newTicket("single", [{ agent: agent.name, stage: "single" }])), remaining });
  }

  if (body.mode !== "team") return json(400, { error: "mode must be 'single' or 'team'." });
  if (!body.question?.trim() && !body.work?.trim()) return json(400, { error: "Type a question or paste your work." });

  const victoria = getAgent("orchestrator");
  if (!victoria) return json(500, { error: "Orchestrator missing from the bundle." });

  const remaining = await consumeDaily(kv, visitor, "teams");
  if (remaining === null) return json(429, { error: "Daily 'Ask the whole team' limit reached for this visitor. It resets at midnight UTC." });

  const cap = maxTeamExperts();
  return ndjson(async (send, signal) => {
    send({ t: "status", s: "staffing" });
    const { value } = await structuredTurn<unknown>(
      victoria,
      [{ role: "user", content: userTurn(victoria, "plan", { question: body.question ?? "", work: body.work }, cap) }],
      PLAN_SCHEMA as unknown as Record<string, unknown>,
      signal,
    );
    const experts = sanitizePlan(value, cap);
    const note = value && typeof value === "object" ? String((value as { note?: unknown }).note ?? "").slice(0, 400) : "";
    const ticket = signTicket(newTicket("team", teamSteps(experts)));
    send({ t: "plan", experts, note, ticket, remaining });
    send({ t: "done" });
  }, req.signal);
};

export const config: Config = { path: "/api/start", method: "POST" };
