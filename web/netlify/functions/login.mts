import type { Config } from "@netlify/functions";
import { checkPassword, dailyLimits, maxTeamExperts } from "../../server/security.ts";
import { json } from "../../server/http.ts";

// POST /api/login: checks APP_PASSWORD and reports the limits in force.
export default async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "Use POST." });
  const auth = checkPassword(req);
  if (!auth.ok) return json(auth.status, { error: auth.message });
  return json(200, {
    ok: true,
    limits: dailyLimits(),
    maxTeamExperts: maxTeamExperts(),
    apiKeyConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
  });
};

export const config: Config = { path: "/api/login", method: "POST" };
