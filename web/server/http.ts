// Small HTTP helpers shared by the Netlify Functions.

import { describeError } from "./claude.ts";

export const MAX_BODY_BYTES = 400_000;

export function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function readJson<T>(req: Request): Promise<T | Response> {
  if (req.method !== "POST") return json(405, { error: "Use POST." });
  const len = Number(req.headers.get("content-length") ?? "0");
  if (len > MAX_BODY_BYTES) return json(413, { error: "That paste is too large. Trim it below about 60,000 characters." });
  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) return json(413, { error: "That paste is too large. Trim it below about 60,000 characters." });
  try {
    return JSON.parse(text) as T;
  } catch {
    return json(400, { error: "Body must be JSON." });
  }
}

export type Send = (event: Record<string, unknown>) => void;

/**
 * Streams newline-delimited JSON events. A ping every 5 s keeps the
 * connection alive while the model is thinking. The stream always ends with
 * a "done" or an "error" event; if neither arrives, the client knows the
 * function was cut off and continues the answer.
 */
export function ndjson(run: (send: Send, signal: AbortSignal) => Promise<void>, reqSignal?: AbortSignal): Response {
  const enc = new TextEncoder();
  const abort = new AbortController();
  reqSignal?.addEventListener("abort", () => abort.abort());
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let open = true;
      const send: Send = (e) => {
        if (open) controller.enqueue(enc.encode(JSON.stringify(e) + "\n"));
      };
      const ping = setInterval(() => send({ t: "ping" }), 5_000);
      try {
        await run(send, abort.signal);
      } catch (err) {
        const { message } = describeError(err);
        send({ t: "error", message });
      } finally {
        clearInterval(ping);
        open = false;
        controller.close();
      }
    },
    cancel() {
      abort.abort();
    },
  });
  return new Response(body, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
