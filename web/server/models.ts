// Maps each agent's "brain" (docs/agent-brains.md) to a Claude model ID.

export const MODEL_IDS: Record<string, string> = {
  opus: "claude-opus-5-5",
  sonnet: "claude-sonnet-5-5",
  haiku: "claude-haiku-5-5",
};

export function modelIdFor(brain: string): string {
  const id = MODEL_IDS[brain];
  if (!id) throw new Error(`Unknown model brain "${brain}"`);
  return id;
}

/**
 * Server-side refusal fallbacks are available for the Opus and Sonnet 5.5
 * models (not Haiku). With `fallbacks: "default"`, a request a safety
 * classifier declines is re-run on a suitable fallback model inside the same
 * call, so a review is not lost to a false-positive refusal.
 */
export function supportsServerFallback(modelId: string): boolean {
  return modelId === MODEL_IDS.opus || modelId === MODEL_IDS.sonnet;
}

export type Stage = "single" | "plan" | "expert" | "redteam" | "synthesis";

type Effort = "low" | "medium" | "high" | "xhigh" | "max";

function envEffort(name: string, fallback: Effort): Effort {
  const v = (process.env[name] ?? "").toLowerCase();
  return (["low", "medium", "high", "xhigh", "max"] as const).includes(v as Effort) ? (v as Effort) : fallback;
}

/**
 * Effort and output caps per stage. Each call must finish inside a single
 * Netlify streaming function invocation, so team-stage calls are kept tight;
 * the client also continues any answer that gets cut off.
 */
export function stageSettings(stage: Stage): { effort: Effort; maxTokens: number } {
  switch (stage) {
    case "plan":
      return { effort: "low", maxTokens: 2000 };
    case "expert":
      return { effort: envEffort("EFFORT_TEAM", "low"), maxTokens: 6000 };
    case "redteam":
      return { effort: envEffort("EFFORT_TEAM", "low"), maxTokens: 6000 };
    case "synthesis":
      return { effort: envEffort("EFFORT_SYNTHESIS", "medium"), maxTokens: 10000 };
    case "single":
    default:
      return { effort: envEffort("EFFORT_SINGLE", "medium"), maxTokens: 10000 };
  }
}
