import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import roster from "./generated/roster.json";
import { ApiError, login, runTeam, startSingle, streamAnswer, type HistoryMessage, type PlanExpert } from "./api";

interface RosterAgent {
  name: string;
  persona: string;
  role: string;
  voice: string;
  style: string;
  model: string;
  modelReason: string;
}

const AGENTS = roster as RosterAgent[];
const BY_NAME = new Map(AGENTS.map((a) => [a.name, a]));
const TEAM = "__team__";

interface Expert {
  agent: string;
  why: string;
  text: string;
  status: string;
}

interface Msg {
  id: string;
  role: "user" | "agent";
  agent?: string;
  text: string;
  work?: string;
  status?: string;
  error?: string;
  note?: string;
  experts?: Expert[];
}

const uid = () => Math.random().toString(36).slice(2);

function storageGet(k: string): string {
  try {
    return sessionStorage.getItem(k) ?? "";
  } catch {
    return "";
  }
}
function storageSet(k: string, v: string) {
  try {
    if (v) sessionStorage.setItem(k, v);
    else sessionStorage.removeItem(k);
  } catch {
    /* storage unavailable */
  }
}

function persona(name?: string) {
  const a = name ? BY_NAME.get(name) : undefined;
  return a ? `${a.persona.split(" ")[0]} · ${a.role}` : "Victoria · Managing Director";
}

function Markdown({ text }: { text: string }) {
  return (
    <div className="md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
  staffing: "Victoria is choosing the experts…",
  experts: "Experts are reviewing in parallel…",
  redteam: "Felix (Red Team) is arguing the other side…",
  synthesis: "Victoria is writing the combined answer…",
  thinking: "thinking…",
  writing: "writing…",
  continuing: "continuing after a time limit…",
  done: "done",
  failed: "failed",
  queued: "waiting",
};

function Login({ onOk }: { onOk: (pw: string) => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="login">
      <form
        className="login-card"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr("");
          try {
            const info = await login(pw);
            if (!info.apiKeyConfigured) setErr("Signed in, but ANTHROPIC_API_KEY is not set in Netlify yet.");
            onOk(pw);
          } catch (e2) {
            setErr((e2 as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <h1>Sparring Team</h1>
        <p className="muted">Healthcare services M&amp;A. Bring your own work; the team critiques it.</p>
        <label htmlFor="pw">Password</label>
        <input id="pw" type="password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} />
        <button type="submit" disabled={busy || !pw}>
          {busy ? "Checking…" : "Enter"}
        </button>
        {err && <p className="error">{err}</p>}
      </form>
    </div>
  );
}

export default function App() {
  const [password, setPassword] = useState(() => storageGet("experts21-pw"));
  const [selected, setSelected] = useState<string>(TEAM);
  const [threads, setThreads] = useState<Record<string, Msg[]>>({});
  const [question, setQuestion] = useState("");
  const [work, setWork] = useState("");
  const [showWork, setShowWork] = useState(true);
  const [busy, setBusy] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const thread = threads[selected] ?? [];
  const current = selected === TEAM ? null : BY_NAME.get(selected) ?? null;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread]);

  const grouped = useMemo(() => {
    const order = ["opus", "sonnet", "haiku"];
    return [...AGENTS].sort((a, b) => order.indexOf(a.model) - order.indexOf(b.model));
  }, []);

  if (!password) {
    return (
      <Login
        onOk={(pw) => {
          storageSet("experts21-pw", pw);
          setPassword(pw);
        }}
      />
    );
  }

  const update = (key: string, id: string, patch: (m: Msg) => Msg) =>
    setThreads((t) => ({ ...t, [key]: (t[key] ?? []).map((m) => (m.id === id ? patch(m) : m)) }));

  async function send() {
    const q = question.trim();
    const w = work.trim();
    if (!q && !w) return;
    const key = selected;
    const userMsg: Msg = { id: uid(), role: "user", text: q || "(review the work below)", work: w || undefined };
    const reply: Msg = { id: uid(), role: "agent", agent: key === TEAM ? "orchestrator" : key, text: "", status: key === TEAM ? "staffing" : "thinking" };
    const priorHistory: HistoryMessage[] = (threads[key] ?? [])
      .filter((m) => !m.error && m.text)
      .map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        text: m.role === "user" && m.work ? `${m.text}\n\n[Work she pasted]\n${m.work}` : m.text,
      }));
    setThreads((t) => ({ ...t, [key]: [...(t[key] ?? []), userMsg, reply] }));
    setQuestion("");
    setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      if (key === TEAM) {
        await runTeam(
          password,
          q || "Review this work.",
          w,
          {
            onStage: (s) => update(key, reply.id, (m) => ({ ...m, status: s })),
            onPlan: (experts: PlanExpert[], note) =>
              update(key, reply.id, (m) => ({ ...m, note, experts: experts.map((e) => ({ ...e, text: "", status: "queued" })) })),
            onReport: (agent, text, status) =>
              update(key, reply.id, (m) => {
                const list = m.experts ?? [];
                const has = list.some((e) => e.agent === agent);
                const next = has
                  ? list.map((e) => (e.agent === agent ? { ...e, text: text || e.text, status } : e))
                  : [...list, { agent, why: "Round 2: argues the other side", text, status }];
                return { ...m, experts: next };
              }),
            onSynthesis: (text, status) => update(key, reply.id, (m) => ({ ...m, text: text || m.text, status })),
          },
          ctrl.signal,
        );
      } else {
        const { ticket } = await startSingle(password, key, ctrl.signal);
        await streamAnswer(
          { password, ticket, agent: key, stage: "single", question: q || "Review this work.", work: w, history: priorHistory },
          {
            onText: (text) => update(key, reply.id, (m) => ({ ...m, text, status: "writing" })),
            onStatus: (s) => update(key, reply.id, (m) => ({ ...m, status: s })),
          },
          ctrl.signal,
        );
      }
      update(key, reply.id, (m) => ({ ...m, status: "done" }));
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        update(key, reply.id, (m) => ({ ...m, status: "done", error: "Stopped." }));
      } else {
        if (err instanceof ApiError && err.status === 401) {
          storageSet("experts21-pw", "");
          setPassword("");
        }
        update(key, reply.id, (m) => ({ ...m, status: "done", error: (err as Error).message }));
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  return (
    <div className={`app ${sidebarOpen ? "sidebar-open" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-head">
          <h1>Sparring Team</h1>
          <p className="muted">You build it. They stress-test it.</p>
        </div>
        <button
          className={`team-btn ${selected === TEAM ? "active" : ""}`}
          onClick={() => {
            setSelected(TEAM);
            setSidebarOpen(false);
          }}
        >
          <span className="team-title">Ask the whole team</span>
          <span className="muted small">Victoria staffs up to 4 experts, then the Red Team, then one combined answer</span>
        </button>
        <ul className="roster">
          {grouped.map((a) => (
            <li key={a.name}>
              <button
                className={`agent ${selected === a.name ? "active" : ""}`}
                onClick={() => {
                  setSelected(a.name);
                  setSidebarOpen(false);
                }}
                title={`${a.voice}\n\nWhy ${a.model}: ${a.modelReason}`}
              >
                <span className="agent-top">
                  <span className="agent-name">{a.persona}</span>
                  <span className={`model model-${a.model}`}>{a.model}</span>
                </span>
                <span className="agent-role">{a.role}</span>
                <span className="agent-voice">{a.voice}</span>
              </button>
            </li>
          ))}
        </ul>
        <button
          className="link"
          onClick={() => {
            storageSet("experts21-pw", "");
            setPassword("");
          }}
        >
          Sign out
        </button>
      </aside>

      <main className="main">
        <header className="main-head">
          <button className="menu" aria-label="Show team" onClick={() => setSidebarOpen((v) => !v)}>
            ☰
          </button>
          {current ? (
            <div>
              <h2>
                {current.persona} <span className="muted">· {current.role}</span>
              </h2>
              <p className="muted small">
                {current.style} <span className={`model model-${current.model}`}>{current.model}</span>
              </p>
            </div>
          ) : (
            <div>
              <h2>
                Whole team <span className="muted">· routed through Victoria (orchestrator)</span>
              </h2>
              <p className="muted small">One combined answer in the sparring-review format. Uses one of your daily team reviews.</p>
            </div>
          )}
        </header>

        <section className="chat" aria-live="polite">
          {thread.length === 0 && (
            <div className="empty">
              <p>Paste something you built yourself: a comps table, a pitch paragraph, a regression output, an LBO summary.</p>
              <p className="muted">
                The team critiques it, explains the reasoning, and never hands you a finished model. Every answer ends with Quizzable concepts for the Interview Coach.
              </p>
            </div>
          )}
          {thread.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="msg user">
                <div className="who">You</div>
                <Markdown text={m.text} />
                {m.work && (
                  <details className="work-sent">
                    <summary>Work you pasted ({m.work.length.toLocaleString()} characters)</summary>
                    <pre>{m.work}</pre>
                  </details>
                )}
              </div>
            ) : (
              <div key={m.id} className="msg agent">
                <div className="who">
                  {persona(m.agent)}
                  {m.status && m.status !== "done" && <span className="status">{STATUS_LABEL[m.status] ?? m.status}</span>}
                </div>
                {m.experts && (
                  <div className="experts">
                    {m.note && <p className="muted small">Victoria: {m.note}</p>}
                    {m.experts.map((e) => (
                      <details key={e.agent} className="expert">
                        <summary>
                          <strong>{BY_NAME.get(e.agent)?.persona ?? e.agent}</strong>{" "}
                          <span className="muted">({e.agent})</span> · <span className="status">{STATUS_LABEL[e.status] ?? e.status}</span>
                          <span className="muted small expert-why">{e.why}</span>
                        </summary>
                        {e.text ? <Markdown text={e.text} /> : <p className="muted">…</p>}
                      </details>
                    ))}
                  </div>
                )}
                {m.text ? <Markdown text={m.text} /> : !m.error && <p className="muted">…</p>}
                {m.error && <p className="error">{m.error}</p>}
              </div>
            ),
          )}
          <div ref={endRef} />
        </section>

        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <div className="work-toggle">
            <button type="button" className="link" onClick={() => setShowWork((v) => !v)}>
              {showWork ? "Hide" : "Show"} work box
            </button>
            {work && <span className="muted small">{work.length.toLocaleString()} characters pasted</span>}
          </div>
          {showWork && (
            <textarea
              className="work"
              placeholder="Paste your own work here: a comps table, a pitch paragraph, regression output, an LBO summary…"
              value={work}
              onChange={(e) => setWork(e.target.value)}
              spellCheck={false}
            />
          )}
          <div className="ask-row">
            <textarea
              className="question"
              placeholder={current ? `Ask ${current.persona.split(" ")[0]}…` : "Ask the whole team…"}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void send();
              }}
              rows={2}
            />
            {busy ? (
              <button type="button" className="stop" onClick={() => abortRef.current?.abort()}>
                Stop
              </button>
            ) : (
              <button type="submit" disabled={!question.trim() && !work.trim()}>
                {current ? "Send" : "Ask the team"}
              </button>
            )}
          </div>
          <p className="muted small hint">Ctrl/⌘ + Enter to send. The work box stays filled so you can ask follow-ups or revise it.</p>
        </form>
      </main>
    </div>
  );
}
