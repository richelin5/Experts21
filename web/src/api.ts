// Browser-side API client. Talks only to this site's Netlify Functions;
// the Anthropic API key never reaches the browser.

export type Stage = "single" | "expert" | "redteam" | "synthesis";

export interface HistoryMessage {
  role: "user" | "assistant";
  text: string;
}

export interface Report {
  agent: string;
  text: string;
}

export interface PlanExpert {
  agent: string;
  why: string;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type Event = { t: string; [k: string]: unknown };

async function post(path: string, password: string, body: unknown, signal?: AbortSignal): Promise<Response> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json", "x-app-password": password },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status}).`;
    try {
      const j = (await res.json()) as { error?: string };
      if (j.error) message = j.error;
    } catch {
      /* not JSON */
    }
    throw new ApiError(res.status, message);
  }
  return res;
}

/** Reads an NDJSON stream. Returns how it ended: "done", "error" or "cut". */
async function readEvents(res: Response, onEvent: (e: Event) => void): Promise<{ end: "done" | "error" | "cut"; error?: string; last?: Event }> {
  if (!res.body) return { end: "cut" };
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let end: "done" | "error" | "cut" = "cut";
  let error: string | undefined;
  let last: Event | undefined;
  const handle = (line: string) => {
    if (!line.trim()) return;
    let e: Event;
    try {
      e = JSON.parse(line) as Event;
    } catch {
      return;
    }
    if (e.t === "done") {
      end = "done";
      last = e;
    } else if (e.t === "error") {
      end = "error";
      error = String(e.message ?? "Unknown error");
    }
    onEvent(e);
  };
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let nl: number;
      while ((nl = buf.indexOf("\n")) >= 0) {
        handle(buf.slice(0, nl));
        buf = buf.slice(nl + 1);
      }
    }
    handle(buf);
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    // Network drop or function time limit: treat as cut off.
  }
  return { end, error, last };
}

export async function login(password: string): Promise<{ limits: { messages: number; teams: number }; maxTeamExperts: number; apiKeyConfigured: boolean }> {
  const res = await post("/api/login", password, {});
  return res.json();
}

export interface AnswerArgs {
  password: string;
  ticket: string;
  agent: string;
  stage: Stage;
  question: string;
  work?: string;
  history?: HistoryMessage[];
  reports?: Report[];
}

export interface AnswerCallbacks {
  onText: (fullText: string) => void;
  onStatus?: (status: string) => void;
}

/**
 * Streams one agent's answer. If the Netlify Function is cut off by its time
 * limit before the answer finishes, it asks the agent to continue from where
 * it stopped (up to 2 continuations).
 */
export async function streamAnswer(args: AnswerArgs, cb: AnswerCallbacks, signal?: AbortSignal): Promise<{ text: string; stop?: string; complete: boolean }> {
  let text = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) cb.onStatus?.("continuing");
    const res = await post("/api/chat", args.password, { ...args, password: undefined, partial: attempt > 0 ? text : undefined }, signal);
    const result = await readEvents(res, (e) => {
      if (e.t === "delta" && typeof e.text === "string") {
        text += e.text;
        cb.onText(text);
      } else if (e.t === "status" && typeof e.s === "string") {
        cb.onStatus?.(e.s);
      }
    });
    if (result.end === "error") throw new ApiError(502, result.error ?? "Error");
    if (result.end === "done") {
      const stop = typeof result.last?.stop === "string" ? result.last.stop : undefined;
      if (stop === "refusal") {
        text += "\n\n> The model declined to continue this answer.";
        cb.onText(text);
      } else if (stop === "max_tokens") {
        text += "\n\n> This answer hit its length cap. Ask a narrower question for the rest.";
        cb.onText(text);
      }
      return { text, stop, complete: true };
    }
    // "cut": loop and continue.
  }
  text += "\n\n> This answer was cut off by the server's time limit. Ask again with a narrower question.";
  cb.onText(text);
  return { text, complete: false };
}

export async function startSingle(password: string, agent: string, signal?: AbortSignal): Promise<{ ticket: string; remaining: number }> {
  const res = await post("/api/start", password, { mode: "single", agent }, signal);
  return res.json();
}

export interface TeamCallbacks {
  onPlan: (experts: PlanExpert[], note: string) => void;
  onStage: (stage: "staffing" | "experts" | "redteam" | "synthesis") => void;
  onReport: (agent: string, text: string, status: string) => void;
  onSynthesis: (text: string, status: string) => void;
}

/** "Ask the whole team": Victoria staffs, experts review in parallel, Red Team, then Victoria combines. */
export async function runTeam(password: string, question: string, work: string, cb: TeamCallbacks, signal?: AbortSignal): Promise<string> {
  cb.onStage("staffing");
  const res = await post("/api/start", password, { mode: "team", question, work }, signal);
  let plan: { experts: PlanExpert[]; note: string; ticket: string } | null = null;
  const started = await readEvents(res, (e) => {
    if (e.t === "plan") plan = { experts: e.experts as PlanExpert[], note: String(e.note ?? ""), ticket: String(e.ticket) };
  });
  if (started.end === "error") throw new ApiError(502, started.error ?? "Error");
  if (!plan) throw new ApiError(504, "Victoria's staffing call timed out. Try again.");
  const { experts, note, ticket } = plan as { experts: PlanExpert[]; note: string; ticket: string };
  cb.onPlan(experts, note);

  cb.onStage("experts");
  const reports: Report[] = await Promise.all(
    experts.map(async (e) => {
      try {
        const r = await streamAnswer(
          { password, ticket, agent: e.agent, stage: "expert", question, work },
          { onText: (t) => cb.onReport(e.agent, t, "writing"), onStatus: (s) => cb.onReport(e.agent, "", s) },
          signal,
        );
        cb.onReport(e.agent, r.text, "done");
        return { agent: e.agent, text: r.text };
      } catch (err) {
        if ((err as Error).name === "AbortError") throw err;
        const msg = `(This expert's review failed: ${(err as Error).message})`;
        cb.onReport(e.agent, msg, "failed");
        return { agent: e.agent, text: msg };
      }
    }),
  );

  cb.onStage("redteam");
  const red = await streamAnswer(
    { password, ticket, agent: "red-team", stage: "redteam", question, work, reports },
    { onText: (t) => cb.onReport("red-team", t, "writing"), onStatus: (s) => cb.onReport("red-team", "", s) },
    signal,
  );
  cb.onReport("red-team", red.text, "done");

  cb.onStage("synthesis");
  const final = await streamAnswer(
    { password, ticket, agent: "orchestrator", stage: "synthesis", question, work, reports: [...reports, { agent: "red-team", text: red.text }] },
    { onText: (t) => cb.onSynthesis(t, "writing"), onStatus: (s) => cb.onSynthesis("", s) },
    signal,
  );
  cb.onSynthesis(final.text, "done");
  return final.text;
}
