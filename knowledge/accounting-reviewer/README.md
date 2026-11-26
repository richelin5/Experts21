# Knowledge folder: accounting-reviewer (Samuel Brooks)

The `accounting-reviewer` agent reads this folder before every answer (`.claude/agents/accounting-reviewer.md`).

## What belongs here

- Your three-statement models
- Adjusted EBITDA bridges and QoE-style schedules
- EV bridges you built for comps
- 10-K/10-Q excerpts you used (with accession numbers)

## How to add files

- Markdown, CSV, text or PDF all work. Use descriptive names with a date, e.g. `2026-11-asc-comps.md`.
- Put a one-line note at the top of each file: what it is, its as-of date and its source.
- Never put API keys, passwords or confidential employer or client material here; this folder is committed to GitHub.

## How the agent uses it

Reference only. The agent compares your current work with what is here, cites it, and flags recurring mistakes. It still follows the sparring-partner rule in `CLAUDE.md`: it critiques work you built and never hands you a finished model. The agent does not edit this folder; you maintain it.
