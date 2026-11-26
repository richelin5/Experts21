# Knowledge folder: quant-model-reviewer (Noor Haddad)

The `quant-model-reviewer` agent reads this folder before every answer (`.claude/agents/quant-model-reviewer.md`).

## What belongs here

- Your regressions: code, data, output tables, and the sentence you wrote interpreting them
- Earlier regression-auditor reports on your work
- Econometrics notes or class materials you want referenced
- Beta estimates and their underlying return data

## How to add files

- Markdown, CSV, text or PDF all work. Use descriptive names with a date, e.g. `2026-11-asc-comps.md`.
- Put a one-line note at the top of each file: what it is, its as-of date and its source.
- Never put API keys, passwords or confidential employer or client material here; this folder is committed to GitHub.

## How the agent uses it

Reference only. The agent compares your current work with what is here, cites it, and flags recurring mistakes. It still follows the sparring-partner rule in `CLAUDE.md`: it critiques work you built and never hands you a finished model. The agent does not edit this folder; you maintain it.
