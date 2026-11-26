// Password check, signed tickets and per-visitor daily limits.

import crypto from "node:crypto";
import type { Stage } from "./models.ts";

// ---- Password -------------------------------------------------------------

function sha256(s: string): Buffer {
  return crypto.createHash("sha256").update(s, "utf8").digest();
}

export type AuthResult = { ok: true } | { ok: false; status: number; message: string };

export function checkPassword(req: Request): AuthResult {
  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    return { ok: false, status: 500, message: "APP_PASSWORD is not set on the server. Add it in Netlify > Site configuration > Environment variables." };
  }
  const given = req.headers.get("x-app-password") ?? "";
  // Compare fixed-length digests so the comparison time does not leak the password.
  if (!crypto.timingSafeEqual(sha256(given), sha256(expected))) {
    return { ok: false, status: 401, message: "Wrong password." };
  }
  return { ok: true };
}

// ---- Tickets ----------------------------------------------------------------
// A ticket is issued by /api/start and lists exactly which agent+stage calls
// the browser may make. It is HMAC-signed, so the browser cannot add experts
// beyond the cap or switch to other agents. How many times each step has
// been used is tracked server-side in the store.

export interface TicketStep {
  agent: string;
  stage: Stage;
  why?: string;
}

export interface Ticket {
  id: string;
  mode: "single" | "team";
  steps: TicketStep[];
  exp: number; // epoch ms
}

function ticketSecret(): string {
  return (
    process.env.TICKET_SECRET ||
    crypto
      .createHash("sha256")
      .update(`experts21-ticket:${process.env.APP_PASSWORD ?? ""}:${process.env.ANTHROPIC_API_KEY ?? ""}`)
      .digest("hex")
  );
}

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64url");

export function signTicket(t: Ticket): string {
  const payload = b64(JSON.stringify(t));
  const mac = crypto.createHmac("sha256", ticketSecret()).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

export function verifyTicket(token: unknown, now = Date.now()): Ticket | null {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [payload, mac] = token.split(".");
  const expected = crypto.createHmac("sha256", ticketSecret()).update(payload).digest("base64url");
  const a = Buffer.from(mac ?? "");
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const t = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Ticket;
    if (typeof t.exp !== "number" || t.exp < now) return null;
    return t;
  } catch {
    return null;
  }
}

export function newTicket(mode: Ticket["mode"], steps: TicketStep[], ttlMs = 20 * 60_000): Ticket {
  return { id: crypto.randomUUID(), mode, steps, exp: Date.now() + ttlMs };
}

/** One step may be called this many times: the first call plus continuations. */
export const MAX_CALLS_PER_STEP = 3;

// ---- Store (Netlify Blobs in production, memory in tests) --------------------

export interface KV {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

export function memoryKV(): KV {
  const m = new Map<string, string>();
  return {
    async get(k) {
      return m.get(k) ?? null;
    },
    async set(k, v) {
      m.set(k, v);
    },
  };
}

let testKV: KV | null = null;

/** The usage store: Netlify Blobs in production; in-memory only when EXPERTS21_MEMORY_STORE=1 (tests). */
export async function getKV(): Promise<KV> {
  if (process.env.EXPERTS21_MEMORY_STORE === "1") return (testKV ??= memoryKV());
  return blobsKV();
}

export async function blobsKV(): Promise<KV> {
  const { getStore } = await import("@netlify/blobs");
  const store = getStore({ name: "experts21-usage", consistency: "strong" });
  return {
    async get(k) {
      return (await store.get(k, { type: "text" })) ?? null;
    },
    async set(k, v) {
      await store.set(k, v);
    },
  };
}

/** Records one call to a ticket step; false if the step's budget is used up. */
export async function useTicketStep(kv: KV, ticket: Ticket, agent: string, stage: Stage): Promise<boolean> {
  if (!ticket.steps.some((s) => s.agent === agent && s.stage === stage)) return false;
  const key = `ticket/${ticket.id}/${agent}/${stage}`;
  const used = Number((await kv.get(key)) ?? "0");
  if (used >= MAX_CALLS_PER_STEP) return false;
  await kv.set(key, String(used + 1));
  return true;
}

// ---- Per-visitor daily limits --------------------------------------------------

export function dailyLimits() {
  const n = (v: string | undefined, d: number) => {
    const x = Number.parseInt(v ?? "", 10);
    return Number.isFinite(x) && x >= 0 ? x : d;
  };
  return {
    messages: n(process.env.DAILY_MESSAGE_LIMIT, 30),
    teams: n(process.env.DAILY_TEAM_LIMIT, 5),
  };
}

/** Max round-1 experts per team review. An env var may lower it, never raise it above 4. */
export function maxTeamExperts(): number {
  const x = Number.parseInt(process.env.MAX_TEAM_EXPERTS ?? "", 10);
  return Number.isFinite(x) && x >= 1 ? Math.min(x, 4) : 4;
}

export function visitorId(ip: string | undefined): string {
  return crypto.createHash("sha256").update(`experts21-visitor:${ip ?? "unknown"}`).digest("hex").slice(0, 32);
}

export type LimitKind = "messages" | "teams";

/** Consumes one unit of today's allowance; returns remaining or null if exhausted. */
export async function consumeDaily(kv: KV, visitor: string, kind: LimitKind, now = new Date()): Promise<number | null> {
  const day = now.toISOString().slice(0, 10);
  const key = `visitor/${visitor}/${day}`;
  const raw = await kv.get(key);
  const used = raw ? (JSON.parse(raw) as Record<LimitKind, number>) : { messages: 0, teams: 0 };
  const limit = dailyLimits()[kind];
  if ((used[kind] ?? 0) >= limit) return null;
  used[kind] = (used[kind] ?? 0) + 1;
  await kv.set(key, JSON.stringify(used));
  return limit - used[kind];
}
