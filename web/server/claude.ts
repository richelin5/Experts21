// Claude API calls (server side only). The API key comes from the
// ANTHROPIC_API_KEY environment variable and never reaches the browser.

import Anthropic from "@anthropic-ai/sdk";
import type { TeamAgent } from "./team.ts";
import { modelIdFor, stageSettings, supportsServerFallback, type Stage } from "./models.ts";
import { systemPrompt } from "./prompts.ts";

let cached: Anthropic | null = null;
function client(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new MissingKeyError();
  }
  cached ??= new Anthropic({ maxRetries: 2 });
  return cached;
}

export class MissingKeyError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY is not set on the server. Add it in Netlify > Site configuration > Environment variables.");
  }
}

function requestParams(agent: TeamAgent, stage: Stage, messages: Anthropic.Beta.BetaMessageParam[]) {
  const model = modelIdFor(agent.model);
  const { effort, maxTokens } = stageSettings(stage);
  return {
    model,
    max_tokens: maxTokens,
    system: systemPrompt(agent),
    messages,
    // Adaptive thinking is on by default for these models; effort sets its depth.
    output_config: { effort },
    ...(supportsServerFallback(model)
      ? { betas: ["server-side-fallback-2026-07-01"] as Anthropic.Beta.AnthropicBeta[], fallbacks: "default" as const }
      : {}),
  };
}

export interface StreamCallbacks {
  onText: (text: string) => void;
  onStatus: (status: "thinking" | "writing") => void;
}

export interface StreamResult {
  stopReason: string | null;
  model: string;
  usage: { input: number; output: number; cacheRead: number; cacheWrite: number };
}

/** Streams one agent turn, forwarding text deltas as they arrive. */
export async function streamAgent(
  agent: TeamAgent,
  stage: Stage,
  messages: Anthropic.Beta.BetaMessageParam[],
  cb: StreamCallbacks,
  signal?: AbortSignal,
): Promise<StreamResult> {
  const stream = client().beta.messages.stream(requestParams(agent, stage, messages), { signal });
  for await (const event of stream) {
    if (event.type === "content_block_start") {
      if (event.content_block.type === "thinking") cb.onStatus("thinking");
      else if (event.content_block.type === "text") cb.onStatus("writing");
    } else if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      cb.onText(event.delta.text);
    }
  }
  const final = await stream.finalMessage();
  return {
    stopReason: final.stop_reason,
    model: final.model,
    usage: {
      input: final.usage.input_tokens,
      output: final.usage.output_tokens,
      cacheRead: final.usage.cache_read_input_tokens ?? 0,
      cacheWrite: final.usage.cache_creation_input_tokens ?? 0,
    },
  };
}

/** One structured (JSON) turn, used for Victoria's staffing plan. */
export async function structuredTurn<T>(
  agent: TeamAgent,
  messages: Anthropic.Beta.BetaMessageParam[],
  schema: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<{ value: T; stopReason: string | null }> {
  const base = requestParams(agent, "plan", messages);
  const stream = client().beta.messages.stream(
    { ...base, output_config: { ...base.output_config, format: { type: "json_schema", schema } } },
    { signal },
  );
  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") throw new RefusalError();
  const text = final.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
  return { value: JSON.parse(text) as T, stopReason: final.stop_reason };
}

export class RefusalError extends Error {
  constructor() {
    super("The model declined this request.");
  }
}

/** Safe, user-facing error text (never includes the key). */
export function describeError(err: unknown): { message: string; status: number } {
  if (err instanceof MissingKeyError) return { message: err.message, status: 500 };
  if (err instanceof RefusalError) return { message: err.message, status: 422 };
  if (err instanceof Anthropic.AuthenticationError) {
    return { message: "The server's Anthropic API key was rejected. Check ANTHROPIC_API_KEY in Netlify.", status: 502 };
  }
  if (err instanceof Anthropic.PermissionDeniedError) {
    return { message: "The API key does not have access to this model.", status: 502 };
  }
  if (err instanceof Anthropic.RateLimitError) {
    return { message: "Anthropic rate limit reached. Wait a minute and try again.", status: 429 };
  }
  if (err instanceof Anthropic.BadRequestError) {
    return { message: `The request was rejected: ${err.message}`, status: 400 };
  }
  if (err instanceof Anthropic.APIError) {
    return { message: `Anthropic API error (${err.status ?? "network"}). Try again.`, status: 502 };
  }
  if (err instanceof SyntaxError) return { message: "Could not read the model's staffing plan. Try again.", status: 502 };
  if (err instanceof Error && err.name === "AbortError") return { message: "Request cancelled.", status: 499 };
  return { message: "Unexpected server error.", status: 500 };
}
