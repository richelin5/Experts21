import type { Config } from "@netlify/functions";
import type Anthropic from "@anthropic-ai/sdk";
import { getAgent } from "../../server/team.ts";
import { CONTINUE_PROMPT, historyMessages, userTurn, type HistoryMessage, type Report } from "../../server/prompts.ts";
import { streamAgent } from "../../server/claude.ts";
import { json, ndjson, readJson } from "../../server/http.ts";
import { getKV, checkPassword, maxTeamExperts, useTicketStep, verifyTicket } from "../../server/security.ts";
import type { Stage } from "../../server/models.ts";

interface ChatBody {
  ticket: string;
  agent: string;
  stage: Stage;
  question?: string;
  work?: string;
  history?: HistoryMessage[];
  reports?: Report[];
  /** Text already received before the previous call was cut off. */
  partial?: string;
}

const CHAT_STAGES: Stage[] = ["single", "expert", "redteam", "synthesis"];

// POST /api/chat: streams one agent's answer as NDJSON events.
export default async (req: Request) => {
  const auth = checkPassword(req);
  if (!auth.ok) return json(auth.status, { error: auth.message });
  const body = await readJson<ChatBody>(req);
  if (body instanceof Response) return body;

  const ticket = verifyTicket(body.ticket);
  if (!ticket) return json(403, { error: "This session expired. Send your message again." });
  if (!CHAT_STAGES.includes(body.stage)) return json(400, { error: "Unknown stage." });
  const agent = getAgent(body.agent);
  if (!agent) return json(400, { error: "Unknown agent." });

  const kv = await getKV();
  if (!(await useTicketStep(kv, ticket, agent.name, body.stage))) {
    return json(403, { error: "That call is not allowed for this session (expert cap or retry limit reached)." });
  }

  const step = ticket.steps.find((s) => s.agent === agent.name && s.stage === body.stage);
  const plan = ticket.steps.filter((s) => s.stage === "expert").map((s) => ({ agent: s.agent, why: s.why ?? "" }));
  const turn = userTurn(
    agent,
    body.stage,
    { question: body.question ?? "", work: body.work, why: step?.why, reports: body.reports, plan },
    maxTeamExperts(),
  );

  const messages: Anthropic.Beta.BetaMessageParam[] = [
    ...(body.stage === "single" ? historyMessages(body.history) : []),
    { role: "user", content: turn },
  ];
  if (body.partial && body.partial.trim()) {
    messages.push({ role: "assistant", content: body.partial.slice(0, 60_000) });
    messages.push({ role: "user", content: CONTINUE_PROMPT });
  }

  return ndjson(async (send, signal) => {
    send({ t: "start", agent: agent.name, persona: agent.persona });
    const result = await streamAgent(
      agent,
      body.stage,
      messages,
      { onText: (text) => send({ t: "delta", text }), onStatus: (s) => send({ t: "status", s }) },
      signal,
    );
    send({ t: "done", stop: result.stopReason, model: result.model, usage: result.usage });
  }, req.signal);
};

export const config: Config = { path: "/api/chat", method: "POST" };
