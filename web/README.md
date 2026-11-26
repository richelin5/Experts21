# Sparring Team web app

A private web app for talking to your healthcare services M&A sparring team. It has:

- **A sidebar** listing every agent with its persona, role, voice and model (from `docs/agent-brains.md`).
- **A chat window**, so you can have a back-and-forth with one expert.
- **A large work box** for pasting your own work: a comps table, a pitch paragraph, a regression output.
- **"Ask the whole team" mode**, which goes through Victoria (orchestrator). She picks up to 4 experts, they review in parallel, then the Red Team argues the other side, and Victoria writes one combined answer.

Every answer follows the sparring-partner rule in `CLAUDE.md`: the team critiques work you built yourself, explains its reasoning, and never hands you a finished model. Every answer uses the `sparring-review` format and ends with Quizzable concepts.

## How it works

| Piece | Where | What it does |
|---|---|---|
| Team bundle | `scripts/build-team.mjs` (runs at build time) | Reads `.claude/agents/`, each agent's preloaded skills in `.claude/skills/` (verbatim, including your regression auditor), `CLAUDE.md`, the docs each agent relies on, and `knowledge/<agent>/`. Writes the prompts to `server/generated/team.json` (server only) and the public roster to `src/generated/roster.json`. |
| Browser app | `src/` (React + Vite) | Sidebar, chat, work box, team mode. It holds no API key and no prompts. |
| Netlify Functions | `netlify/functions/` | `login` checks the password. `start` applies your daily limits and, in team mode, asks Victoria to staff the review. `chat` streams one agent's answer from the Claude API. |
| Shared server code | `server/` | Prompt assembly, model mapping, password check, signed tickets, per-visitor limits. |

**What the bundle never includes:**
- Anything under `docs/my-work/test-cases/`.
- Any file whose path mentions an answer key.
- Any line elsewhere (for example in the interview error log) that names a test case, so earlier review findings can't act as an answer key.
- Any file outside the repository; symlinks are skipped.
- The `team-builder` meta agent, which edits files and so has no role in the web app.

**Models:** opus maps to `claude-opus-5-5`, sonnet to `claude-sonnet-5-5`, haiku to `claude-haiku-5-5`, each agent following its row in `docs/agent-brains.md`. Opus and Sonnet calls use Anthropic's server-side refusal fallback (`fallbacks: "default"`), so a false-positive safety decline is retried on a fallback model instead of losing the review.

**Streaming and Netlify's time limit:**
- Answers stream token by token.
- Netlify still stops a streaming function after a fixed time (documented as 60 s, and reported as 30 s in practice). The app therefore splits work into short calls:
  - one call per agent turn;
  - in team mode, a staffing call, one call per expert (run in parallel), one Red Team call and one synthesis call.
- If a call is cut off before it finishes, the browser automatically asks that agent to continue from where it stopped, up to 2 times.

**Cost and abuse controls:**
- `APP_PASSWORD` is required for every request.
- Each visitor (identified by a hash of their IP address) gets `DAILY_MESSAGE_LIMIT` one-to-one messages (default 30) and `DAILY_TEAM_LIMIT` team reviews (default 5) per UTC day. Usage is stored in Netlify Blobs.
- Team mode is capped at 4 experts plus the Red Team, enforced on the server. `start` issues a signed ticket listing exactly which agent calls are allowed, so the browser can't add experts.
- Each call is allowed at most 3 times: the first try plus 2 continuations.
- Prompt caching: each agent's large system prompt is identical on every call, so repeat calls within about 5 minutes read it from the cache at roughly a tenth of the input price.

**Rough cost per use** at Anthropic list prices. These are estimates, not measurements, so check your Console usage after a few runs.
- One-to-one message: about $0.03–$0.20, depending on the agent's model and the length of the answer.
- "Ask the whole team": about $0.60–$1.00. That's Victoria's staffing call, up to 4 experts, the Red Team and the synthesis.
- Worst case per visitor per day at the default limits: about $10. Set a monthly spend limit in the Anthropic Console as a backstop.

## Deploy on Netlify (step by step)

1. **Get an Anthropic API key.** In the [Anthropic Console](https://console.anthropic.com/), go to **API keys** and create a key. Copy it. Under **Limits**, set a monthly spend limit.
2. **Choose an app password.** Make it long; you'll type it once per browser session.
3. **Create the site.** In [Netlify](https://app.netlify.com/), click **Add new site** → **Import an existing project** → **GitHub** and authorize Netlify. Pick `richelin5/Experts21` and the `main` branch.
4. **Leave the build settings alone.** `netlify.toml` at the repo root sets the base directory (`web`), the build command (`npm run build`), the publish directory (`dist`), the functions directory and Node 22. Netlify fills these in automatically.
5. **Add the environment variables** before the first deploy: **Site configuration** → **Environment variables** → **Add a variable**.
   - `ANTHROPIC_API_KEY`: your key. Tick **Contains secret values** and scope it to **Functions** only.
   - `APP_PASSWORD`: your password. Tick **Contains secret values**. It is needed at runtime by the functions.
   - Optional:

     | Variable | Default | What it controls |
     |---|---|---|
     | `DAILY_MESSAGE_LIMIT` | 30 | One-to-one messages per visitor per day |
     | `DAILY_TEAM_LIMIT` | 5 | Team reviews per visitor per day |
     | `MAX_TEAM_EXPERTS` | 4 | Experts per team review; can only be lowered |
     | `EFFORT_SINGLE` | `medium` | How hard the model thinks on one-to-one answers |
     | `EFFORT_TEAM` | `low` | Same, for expert and Red Team calls |
     | `EFFORT_SYNTHESIS` | `medium` | Same, for Victoria's combined answer |
     | `TICKET_SECRET` | derived | Signing secret for tickets; set a random string if you want to rotate it independently |

     Effort values are `low`, `medium`, `high`, `xhigh` or `max`. Higher means slower answers, more cost, and more risk of hitting the time limit.
6. **Deploy.** Click **Deploy site**, or go to **Deploys** → **Trigger deploy** if the site already exists. The build log shows `Bundled 19 agents (18 skills)` with a prompt size per agent.
7. **Test it.**
   1. Open the site URL and enter your password.
   2. Pick one expert, paste a small piece of your work, and send. You should see it stream.
   3. Try **Ask the whole team**.
   4. If you see "ANTHROPIC_API_KEY is not set", re-check step 5, then redeploy, because environment variable changes need a new deploy.
8. **Keep it private.** The site sends `noindex` headers and requires the password. Don't share the URL publicly; anyone with the URL and the password spends your API credit.

**Updating the team:** the bundle is built from the repo at deploy time. When you change an agent, skill, doc or knowledge folder and push to `main`, Netlify rebuilds and the app uses the new version.

## Run locally

```bash
cd web
npm install
npm test          # builds the team bundle, then runs the server tests against a mock Claude API
npm run build     # builds the bundle, type-checks, builds the site into dist/
```

To run the full app with functions locally, install the [Netlify CLI](https://docs.netlify.com/cli/get-started/). Then run `netlify dev` from the repo root, with `ANTHROPIC_API_KEY` and `APP_PASSWORD` set in your shell or in `netlify env`.

## Limitations

- **The Interview Coach can't write your error log from the web app.** After grading an answer, Margaret gives you a "Log this:" line to paste into `docs/my-work/interview-error-log.md` yourself. A Claude Code session (`@agent-interview-coach`) can still write to it directly.
- **Conversations live only in the browser tab.** Reloading clears them. One-to-one chats send the last 10 turns as context. Each team review starts fresh.
- **Visitor limits use a hash of the IP address.** People behind the same network share a limit. One person switching networks gets a new one.
- **Very long answers at high effort can still hit Netlify's time limit** after two automatic continuations. Lower the effort settings or ask a narrower question.
