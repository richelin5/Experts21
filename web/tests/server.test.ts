// Run with: npm test   (builds the team bundle first)
// Exercises the real Netlify Function handlers against a local mock of the
// Anthropic Messages streaming API, so no API key or network is needed.

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import type { AddressInfo } from "node:net";

process.env.APP_PASSWORD = "test-password";
process.env.ANTHROPIC_API_KEY = "sk-ant-test-not-real";
process.env.EXPERTS21_MEMORY_STORE = "1";
process.env.DAILY_MESSAGE_LIMIT = "3";
process.env.DAILY_TEAM_LIMIT = "1";

interface Seen {
  headers: http.IncomingHttpHeaders;
  body: Record<string, any>;
}
const seen: Seen[] = [];
let server: http.Server;

function sse(res: http.ServerResponse, model: string, text: string, stop = "end_turn") {
  res.writeHead(200, { "content-type": "text/event-stream" });
  const ev = (type: string, data: unknown) => res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
  ev("message_start", {
    type: "message_start",
    message: { id: "msg_test", type: "message", role: "assistant", model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 10, output_tokens: 1 } },
  });
  ev("content_block_start", { type: "content_block_start", index: 0, content_block: { type: "thinking", thinking: "", signature: "" } });
  ev("content_block_stop", { type: "content_block_stop", index: 0 });
  ev("content_block_start", { type: "content_block_start", index: 1, content_block: { type: "text", text: "" } });
  for (const chunk of text.match(/.{1,20}/gs) ?? []) {
    ev("content_block_delta", { type: "content_block_delta", index: 1, delta: { type: "text_delta", text: chunk } });
  }
  ev("content_block_stop", { type: "content_block_stop", index: 1 });
  ev("message_delta", { type: "message_delta", delta: { stop_reason: stop, stop_sequence: null }, usage: { output_tokens: 42 } });
  ev("message_stop", { type: "message_stop" });
  res.end();
}

before(async () => {
  server = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      const body = JSON.parse(raw);
      seen.push({ headers: req.headers, body });
      if (body.output_config?.format) {
        // Staffing plan: try to sneak in 6 experts, a duplicate and a non-roster name.
        const plan = {
          note: "Staffed for a comps review.",
          experts: [
            { agent: "comps-precedents-reviewer", why: "peer set" },
            { agent: "accounting-reviewer", why: "EV basis" },
            { agent: "accounting-reviewer", why: "duplicate" },
            { agent: "team-builder", why: "not allowed" },
            { agent: "red-team", why: "not allowed in round 1" },
            { agent: "vice-president", why: "tie-out" },
            { agent: "lbo-reviewer", why: "ability to pay" },
            { agent: "sponsor-coverage-banker", why: "buyers" },
          ],
        };
        return sse(res, body.model, JSON.stringify(plan));
      }
      sse(res, body.model, `## Sparring review\n**Verdict:** reviewed by ${body.model}.\n\n## Quizzable\n- EV bridge`);
    });
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", () => r()));
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => server.close());

const { default: login } = await import("../netlify/functions/login.mts");
const { default: start } = await import("../netlify/functions/start.mts");
const { default: chat } = await import("../netlify/functions/chat.mts");
const { TEAM } = await import("../server/team.ts");
const { verifyTicket, signTicket } = await import("../server/security.ts");

const ctx = { ip: "203.0.113.7" } as any;
const req = (path: string, body: unknown, pw = "test-password") =>
  new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-app-password": pw },
    body: JSON.stringify(body),
  });

async function events(res: Response) {
  const text = await res.text();
  return text
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

test("bundle: no test-case content, team-builder excluded, regression-auditor verbatim", async () => {
  const s = JSON.stringify(TEAM).toLowerCase();
  for (const w of ["comps-test-v1", "test-cases", "harborview", "meridian health plans"]) assert.ok(!s.includes(w), `leaked: ${w}`);
  assert.ok(!TEAM.agents.some((a) => a.name === "team-builder"));
  const fs = await import("node:fs");
  const original = fs.readFileSync(new URL("../../docs/my-work/regression-auditor/SKILL.md", import.meta.url), "utf8");
  const quant = TEAM.agents.find((a) => a.name === "quant-model-reviewer")!;
  const bundled = quant.skills.find((x) => x.name === "regression-auditor")!.files.find((f) => f.path.endsWith("SKILL.md"))!;
  assert.equal(bundled.text, original);
});

test("password is required everywhere", async () => {
  assert.equal((await login(req("/api/login", {}, "wrong"))).status, 401);
  assert.equal((await start(req("/api/start", { mode: "single", agent: "dcf-reviewer" }, "wrong"), ctx)).status, 401);
  assert.equal((await chat(req("/api/chat", {}, "wrong"))).status, 401);
  const ok = await (await login(req("/api/login", {}))).json();
  assert.equal(ok.maxTeamExperts, 4);
});

test("single agent: streams, uses the agent's model, sparring rule and fallbacks", async () => {
  const s = await start(req("/api/start", { mode: "single", agent: "dcf-reviewer" }), ctx);
  assert.equal(s.status, 200);
  const { ticket } = await s.json();
  const res = await chat(req("/api/chat", { ticket, agent: "dcf-reviewer", stage: "single", question: "Check my WACC", work: "WACC = 9%" }));
  const ev = await events(res);
  assert.equal(ev.at(-1).t, "done");
  assert.match(ev.filter((e) => e.t === "delta").map((e) => e.text).join(""), /claude-opus-5-5/);
  const call = seen.at(-1)!;
  assert.equal(call.body.model, "claude-opus-5-5");
  assert.equal(call.body.stream, true);
  assert.equal(call.body.fallbacks, "default");
  assert.match(String(call.headers["anthropic-beta"]), /server-side-fallback-2026-07-01/);
  const system = call.body.system[0].text as string;
  assert.match(system, /Never hand her a finished model/);
  assert.match(system, /sparring-review/);
  assert.match(system, /knowledge\/dcf-reviewer\/README\.md/);
  assert.equal(call.body.system[0].cache_control.type, "ephemeral");
  assert.match(call.body.messages.at(-1).content, /<submitted_work>\nWACC = 9%/);
  // The ticket only covers dcf-reviewer.
  const other = await chat(req("/api/chat", { ticket, agent: "lbo-reviewer", stage: "single", question: "x" }));
  assert.equal(other.status, 403);
});

test("haiku agent gets no server-side fallback; continuation appends partial + continue prompt", async () => {
  const { ticket } = await (await start(req("/api/start", { mode: "single", agent: "public-data-specialist" }), ctx)).json();
  await events(await chat(req("/api/chat", { ticket, agent: "public-data-specialist", stage: "single", question: "DGS10?", partial: "The 10-year series is" })));
  const call = seen.at(-1)!;
  assert.equal(call.body.model, "claude-haiku-5-5");
  assert.equal(call.body.fallbacks, undefined);
  const msgs = call.body.messages;
  assert.equal(msgs.at(-2).role, "assistant");
  assert.equal(msgs.at(-2).content, "The 10-year series is");
  assert.match(msgs.at(-1).content, /Continue exactly where it stopped/);
});

test("ticket step budget: at most 3 calls per step", async () => {
  // Daily limit is 3 messages and two were used above.
  const { ticket } = await (await start(req("/api/start", { mode: "single", agent: "red-team" }), ctx)).json();
  for (let i = 0; i < 3; i++) {
    assert.equal((await chat(req("/api/chat", { ticket, agent: "red-team", stage: "single", question: "x" }))).status, 200);
  }
  assert.equal((await chat(req("/api/chat", { ticket, agent: "red-team", stage: "single", question: "x" }))).status, 403);
});

test("daily message limit per visitor", async () => {
  const res = await start(req("/api/start", { mode: "single", agent: "dcf-reviewer" }), ctx);
  assert.equal(res.status, 429);
  // A different visitor is unaffected.
  assert.equal((await start(req("/api/start", { mode: "single", agent: "dcf-reviewer" }), { ip: "198.51.100.9" } as any)).status, 200);
});

test("team mode: Victoria staffs at most 4 valid experts, then Red Team and synthesis", async () => {
  const res = await start(req("/api/start", { mode: "team", question: "Pitch-ready?", work: "comps table" }), ctx);
  const ev = await events(res);
  const plan = ev.find((e) => e.t === "plan");
  assert.ok(plan, JSON.stringify(ev));
  const names = plan.experts.map((e: any) => e.agent);
  assert.deepEqual(names, ["comps-precedents-reviewer", "accounting-reviewer", "vice-president", "lbo-reviewer"]);
  const t = verifyTicket(plan.ticket)!;
  assert.deepEqual(t.steps.map((s) => `${s.agent}:${s.stage}`), [
    "comps-precedents-reviewer:expert", "accounting-reviewer:expert", "vice-president:expert", "lbo-reviewer:expert",
    "red-team:redteam", "orchestrator:synthesis",
  ]);
  const planCall = seen.find((c) => c.body.output_config?.format)!;
  assert.equal(planCall.body.model, "claude-opus-5-5");

  // An expert not on the ticket is refused, even though it's a real agent.
  assert.equal((await chat(req("/api/chat", { ticket: plan.ticket, agent: "sponsor-coverage-banker", stage: "expert", question: "x" }))).status, 403);
  // A tampered ticket is refused.
  const forged = signTicket({ ...t, steps: [...t.steps] }).replace(/.$/, (c) => (c === "A" ? "B" : "A"));
  assert.equal((await chat(req("/api/chat", { ticket: forged, agent: "comps-precedents-reviewer", stage: "expert", question: "x" }))).status, 403);

  // Expert, Red Team and synthesis calls stream.
  const exp = await events(await chat(req("/api/chat", { ticket: plan.ticket, agent: "comps-precedents-reviewer", stage: "expert", question: "Pitch-ready?", work: "comps table" })));
  assert.equal(exp.at(-1).t, "done");
  assert.equal(seen.at(-1)!.body.model, "claude-sonnet-5-5");
  const red = await events(await chat(req("/api/chat", {
    ticket: plan.ticket, agent: "red-team", stage: "redteam", question: "Pitch-ready?", work: "comps table",
    reports: [{ agent: "comps-precedents-reviewer", text: "Finding A" }],
  })));
  assert.equal(red.at(-1).t, "done");
  assert.match(seen.at(-1)!.body.messages[0].content, /<expert_report agent="comps-precedents-reviewer">\nFinding A/);
  const syn = await events(await chat(req("/api/chat", {
    ticket: plan.ticket, agent: "orchestrator", stage: "synthesis", question: "Pitch-ready?", work: "comps table",
    reports: [{ agent: "comps-precedents-reviewer", text: "Finding A" }, { agent: "red-team", text: "Too high" }],
  })));
  assert.equal(syn.at(-1).t, "done");
  assert.match(seen.at(-1)!.body.messages[0].content, /comps-precedents-reviewer: peer set/);

  // Daily team limit is 1.
  assert.equal((await start(req("/api/start", { mode: "team", question: "again" }), ctx)).status, 429);
});
