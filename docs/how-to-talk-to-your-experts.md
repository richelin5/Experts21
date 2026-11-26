# How to Talk to Your Experts

A practical guide to using the sparring team. The rule behind every answer: **you build the work, the team critiques it.** You get findings, reasoning, questions and the one fix that matters most. You never get a finished model you didn't build. (Team overview: `CLAUDE.md`. Roles and skills: `docs/expert-roster.md`.)

## Before you start

- **Start a new Claude Code session** in this repo (or pull `main`) so the agents and skills load.
- **Save your work in `docs/my-work/`** and point to it by path. Pasting into the message also works: the orchestrator passes pasted work verbatim to each expert. But a file is easier to re-review after you revise it.
- **A good prompt has four parts:** (1) what you built, (2) the claim or recommendation it supports, (3) the question you want answered, (4) the as-of date of your data.
- **Name the stakes** if you want a particular lens: "review it like a VP before it goes to the MD" or "review it like a superday interviewer".

## Example 1: Review a comps table I built

**Prompt**

```text
@agent-orchestrator I built a trading comps table for a hypothetical ASC operator
(~$25M EBITDA, 70% commercial payer mix, physicians own ~40% of each center through
syndication). It's in docs/my-work/asc-comps.md. Peers: SGRY, THC (for USPI), UHS,
HCA, ENSG. I took EV/LTM EBITDA and EV/NTM EBITDA, used the median, and applied it
to the target's adjusted EBITDA to get a value range of $X–$Y. Data pulled from
10-Ks and 10-Qs as of Nov 20, 2026.

Question: would this range hold up if a VP page-turned it? Tell me what's wrong
with my peer set and my EV and EBITDA math. Don't fix the table for me.
```

**Who the orchestrator pulls in**

| Agent | Why |
|---|---|
| `comps-precedents-reviewer` | Peer selection (hospitals mixed with an asset-light ASC?), calendarization, median vs. mean, size discount |
| `accounting-reviewer` | EV bridge: noncontrolling interests for the syndicated ASC model, leases, diluted shares, EV and EBITDA on the same basis |
| `public-data-specialist` | XBRL tags, LTM construction, whether data and prices are as of the same date |
| `vice-president` | Whether the numbers tie across the table and to your summary range |
| `red-team` | You proposed a value range, so it argues why the range is too high (or too low) |

**What to expect**

One combined `sparring-review` report:

- **Verdict:** one or two lines, e.g., whether the range is defensible as built.
- **Critical / Major / Minor findings,** each tagged with the experts who raised it. For example: *(Major) EV includes NCI but EBITDA is shown attributable-only for SGRY, or the reverse, so the multiple is distorted.* Each finding points at the row and explains the mechanism.
- **Red Team counterargument:** the strongest case against your range and the one assumption that would flip it.
- **What holds up, Could not check, Questions to answer before the next draft, If you fix one thing.**
- **Quizzable:** two or three concepts (e.g., "why NCI goes into EV"). The orchestrator queues them in your error log.

**What you won't get:** a corrected comps table or a new peer list. You'll get which peers to question and why.

## Example 2: The team attacks my sell-side pitch

**Prompt**

```text
@agent-orchestrator Here's a sell-side pitch I wrote for a hypothetical multi-state
ABA (autism therapy) platform, ~$18M adjusted EBITDA, 35% Medicaid. It's in
docs/my-work/aba-pitch.md:
- Why this asset: 40 clinics in 5 states, 25% organic growth, de novo engine
- Why now: PE has record dry powder and rates are coming down
- Who buys: 12 sponsors and 3 strategics listed on page 3
- Value: 12–14x adjusted EBITDA, targeted auction, close in 5 months

Attack it. I want the Red Team's strongest case against selling now at this range,
and whether my buyer list and timeline are realistic.
```

**Who the orchestrator pulls in**

| Agent | Why |
|---|---|
| `coverage-banker` | Is the behavioral health thesis right? Are the highlights backed by KPIs? |
| `sponsor-coverage-banker` | Is each sponsor a real fit (Medicaid appetite, existing ABA platforms)? Is 12–14x consistent with an LBO? |
| `reimbursement-payer-mix-analyst` | 35% Medicaid under OBBBA cuts: what a state rate cut does to EBITDA |
| `macro-rates-economist` | Tests "rates are coming down" against the current FOMC stance and spreads |
| `healthcare-regulatory-reviewer` | State notice laws in your 5 states and CHOW: is a 5-month close realistic? |
| `process-timeline-manager` | Whether the targeted auction and calendar fit the asset |
| `red-team` | Always on a recommendation: the buyer's committee view, a pre-mortem, the kill assumption, their walk-away price |

The orchestrator usually staffs 2–5 experts plus the Red Team. On a pitch this broad it may use more, and it states who it brought in and why.

**What to expect**

- A verdict on whether the pitch survives.
- Findings such as: *(Critical) "Why now" rests on falling rates, but the October 2026 FOMC held at 3.75–4.00% with two dissents in favor of a hike.*
- Experts reconciling with each other, e.g., the reimbursement analyst's Medicaid downside feeding into the sponsor banker's view of what a sponsor can pay.
- The Red Team section: the three strongest arguments a buyer would make, two or three pre-mortem stories, and the single assumption that flips your recommendation with the threshold where it flips.
- Questions you must answer to defend the pitch, and the one fix that matters most.

**What you won't get:** a rewritten pitch or a new buyer list.

## Example 3: Audit my regression and tell me what it means for value

**Prompt**

```text
@agent-orchestrator I ran a cross-sectional regression for a comps sanity check:
EV/NTM EBITDA on NTM revenue growth, EBITDA margin, and log(revenue), across 14
public healthcare services companies, OLS, as of Nov 20, 2026. Code, data and output
are in docs/my-work/multiple-regression/. My interpretation: "each extra point of
growth adds 0.4x to the multiple, so our target's 15% growth justifies a 2x premium
to the peer median."

Have the quant reviewer audit it with my regression auditor, and have the valuation
reviewers tell me whether the premium I claim follows for value.
```

(Works the same for a beta, e.g., 60 monthly returns of a peer on the S&P 500, used in your WACC.)

**Who the orchestrator pulls in**

| Agent | Why |
|---|---|
| `quant-model-reviewer` | Always on a regression. Runs **your** `regression-auditor` exactly as written: pins down the claim (predictive or causal?), runs the six checks, rates findings, and uses your report template. Adds `finance-regression-diagnostics` (VIF, Breusch–Pagan/White with HC3, Cook's distance, roughly 4–5 observations per regressor). It may run diagnostics on your code to verify your statistics; it won't re-specify the model. |
| `comps-precedents-reviewer` | What the result means for the multiple you apply: is a 2x premium consistent with your comps and precedents? |
| `dcf-reviewer` | If it's a beta, relevering and the effect on WACC and value |
| `public-data-specialist` | Whether the 14 companies' data are calendarized and on a consistent EBITDA basis |
| `red-team` | Attacks "growth justifies a 2x premium" |

**What to expect**

- The quant reviewer's regression-auditor findings folded into the combined report with their severity ratings intact. For example: *(Major) Payer mix and subsector are omitted. Commercial-heavy companies grow faster and earn higher multiples, so the growth coefficient is probably overstated.* *(Critical, wording) "justifies" is a causal claim the cross-sectional design can't support.*
- Diagnostics in your auditor's format: what passed, what failed, and what could not be checked.
- The valuation reviewers' read on what survives: whether any premium is defensible, and how you would check it against precedents.
- **If you fix one thing**, plus Quizzable items such as the sign of omitted-variable bias and what "holding margin constant" means.

**What you won't get:** a re-estimated regression or a "corrected" specification. You'll get what to change and why.

## Example 4: Quiz me on the technicals behind a review

**Best: a live session** where the coach waits for each answer:

```bash
claude --agent interview-coach
```

Then type:

```text
Quiz me on the queued topics from my ASC comps review, then on my open misses.
One question at a time, interview style.
```

**Inside a normal session** (the coach can't wait mid-run, so it returns 3–5 numbered questions; reply with your answers and it grades them):

```text
@agent-interview-coach Quiz me on the technicals behind my multiple-regression
review: omitted-variable bias, EV vs. equity value, and how a 1-point growth
premium should show up in a comps range.
```

**Through the orchestrator** (if you want the MD to decide what to drill based on the review):

```text
@agent-orchestrator From the review of docs/my-work/aba-pitch.md, have the interview
coach pick the five technicals I'm most likely to be asked about, and queue them.
```

**What to expect:** one question at a time (or a numbered set). Each answer is graded Correct / Partial / Miss, followed by the one-line answer an interviewer wants and a follow-up on the same concept. Every Partial or Miss is logged in `docs/my-work/interview-error-log.md` with a next-review date (1 → 3 → 7 → 21 days). The session ends with three lines: what improved, what is still weak, and what comes next.

## Quick reference

### Ask one specific expert

```text
@agent-lbo-reviewer Check my paper LBO in docs/my-work/paper-lbo.md: 10x entry,
5.5x leverage, SOFR + 500, exit at 10x in year 5. Where do my returns come from?
```

Any agent name works: `@agent-dcf-reviewer`, `@agent-healthcare-regulatory-reviewer`, `@agent-macro-rates-economist`, `@agent-quant-model-reviewer`, and so on (full list in `CLAUDE.md`). One expert answers in its own lane and lists **Hand-offs** for issues that belong to other experts. Send those to the orchestrator if you want them covered.

### Ask the whole team

```text
@agent-orchestrator Review everything in docs/my-work/aba-pitch/ (model, comps,
pitch page) as if it's going to the MD tomorrow. Bring in whoever you need.
```

The orchestrator picks the experts the work actually needs, rather than all 18, and returns one combined answer. To force broad coverage, say so: "bring in every valuation reviewer plus regulatory and the Red Team". That costs more time and tokens.

### See your error log

```text
@agent-interview-coach Show me my error log: open misses, what's due for review
today, and my weakest topics.
```

Or open `docs/my-work/interview-error-log.md` directly. It has three tables: **Misses**, **Queued topics** and **Session notes**.

## Phrases that change the answer

| Say | Effect |
|---|---|
| "Review it like a superday interviewer" | More "why" questions and more Quizzable items |
| "Just the Critical and Major findings" | A shorter report |
| "Have the Red Team go first" | The counterargument frames the review |
| "I revised it after the last review; check whether I fixed the Critical items" | A re-review focused on what changed |
| "Build it for me" | A polite no, plus the steps, inputs and checks so you can build it yourself |
