# Experts21 Research Docs — Middle-Market Healthcare Services M&A

Research context for a team of expert agents that will support a **US middle-market investment banking coverage team advising on healthcare services M&A**. Researched **2026-11-26**. Market data reflects reports published through Q3 2026.

## Index

| # | File | What it covers | Primary agent user |
|---|---|---|---|
| 01 | [01-middle-market-ma-advisory.md](01-middle-market-ma-advisory.md) | Middle-market definitions, coverage model, analyst→MD roles, sell-side and buy-side process, timelines, healthcare-specific regulatory steps (CPOM, state notice laws, HSR, CHOW), fees, key documents | Process / execution agent |
| 02 | [02-healthcare-services-ma-market.md](02-healthcare-services-ma-market.md) | 2026 deal volume and value, subsector heat map with indicative multiples, PE and strategic buyers, policy drivers (OBBBA, site-neutral), outlook | Market intelligence agent |
| 03 | [03-public-data-sources.md](03-public-data-sources.md) | SEC EDGAR APIs and which filings matter (merger proxies!), FRED series IDs and ALFRED vintages, BLS CES/QCEW/OEWS, Census CBP/SUSB/QSS, healthcare NAICS codes, CMS datasets, Python snippets | Data agent |
| 04 | [04-valuation-methods.md](04-valuation-methods.md) | EV bridge, adjusted EBITDA in healthcare, trading comps, precedent transactions, DCF, LBO, common mistakes for each, football field | Valuation agent |
| 05 | [05-macro-rates-and-deal-activity.md](05-macro-rates-and-deal-activity.md) | Current rates snapshot, transmission channels (discount rate, LBO financing capacity, spreads, equity valuations, labor & reimbursement), bid–ask spread, macro overlay checklist, academic evidence | Macro / strategy agent |
| 06 | [06-regression-audit.md](06-regression-audit.md) | Auditing regressions: specification, multicollinearity (VIF), heteroskedasticity (BP/White, HC3), omitted-variable bias formula, autocorrelation, stationarity, influence, look-ahead; Python audit function; report template | Quant / model-review agent |
| — | [expert-roster.md](expert-roster.md) | The 19-agent sparring team (roles, one-line jobs, primary docs) and the 18 shared skills, including reuse of the existing regression auditor | Orchestrator; all agents |
| — | [agent-brains.md](agent-brains.md) | Each agent's model (opus / sonnet / haiku) and why, plus its persona (name, voice, working style) | Richelin; team-builder |
| — | [../knowledge/](../knowledge/) | One knowledge folder per agent, read before every answer | All agents |
| — | [how-to-talk-to-your-experts.md](how-to-talk-to-your-experts.md) | Example prompts for reviews through the orchestrator, single-expert questions, quizzing and the error log | Richelin |
| — | [my-work/interview-error-log.md](my-work/interview-error-log.md) | Interview Coach's log of missed technicals, queued topics and session notes | Interview coach |
| — | [my-work/](my-work/README.md) | Richelin's own work the team must build on: her regression auditor skill (SKILL.md + interpretation and decomposition references) | Quant / model-review agent; orchestrator |

## Ground rules for all agents

1. **Cite every number** with source, date and identifier (FRED series ID, SEC accession number, report name). Note the data vintage.
2. **Indicative ranges are hypotheses.** Multiples in `02` and `04` must be refreshed against PitchBook, Capital IQ, GF Data or internal deal databases before client use.
3. **Never mix deal trackers** in one time series — definitions of "healthcare services", "deal" and "PE vs. strategic" differ.
4. **Translate macro and policy into numbers**: a rate move into WACC and debt capacity; a reimbursement change into revenue and EBITDA by payer.
5. **Keep EV and EBITDA on the same basis** (NCI, leases, pro forma adjustments).
6. **Prefer causal humility**: regressions on macro data are predictive associations unless identification is argued explicitly (see `06`).
7. Treat EDGAR fair-access rules (User-Agent, ≤10 req/s) and API keys as required configuration; never hard-code personal emails or keys.

## Refresh cadence

| Item | Refresh |
|---|---|
| Rates, spreads (`05`) | At every valuation date; after each FOMC (next: Dec 8–9, 2026) |
| Deal volume, multiples, buyers (`02`) | Quarterly, when PitchBook / Bain / PwC / Levin quarterly reports publish |
| Reimbursement policy (`02`, `05`) | When CMS proposed (summer) and final (Nov) rules publish; state budget cycles |
| Data endpoints (`03`) | Semi-annually, or when an API call fails |
| Methods (`04`, `06`) | Stable; review annually |
