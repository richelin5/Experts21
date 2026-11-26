# Expert Roster — Healthcare Services M&A Sparring Team

> Design for a team of expert agents modeled on a US middle-market investment banking coverage team advising on healthcare services M&A.
> Built on the research in `docs/01`–`06` and Richelin's own work in `docs/my-work/`. Drafted 2026-11-26.

## Purpose and ground rule

This team is a **sparring partner**, not a production desk. Richelin builds the work (models, comps, memos, pitch pages, regressions); the agents **critique and stress-test it**, explain the reasoning behind each finding, and ask the questions an MD or interviewer would ask. They do not hand over finished models she could not rebuild by hand (see `my-work/README.md`).

Every agent follows the same review contract, borrowed from the stance in her regression auditor: **act as a referee, not a co-author**; audit what is on the page; rate findings **Critical / Major / Minor** by their consequence for the conclusion; always state **what holds up** and **what could not be checked**.

## 1. The roster (19 agents)

| # | Group | Agent | One-line job description | Relies most on |
|---|---|---|---|---|
| 1 | Deal leadership | **Managing Director** | Frames the deal question, routes work to the team, and gives the final "would I put this in front of a client?" verdict on whether the story, value range and recommendation hang together. | `01` |
| 2 | Deal leadership | **Vice President** | Runs the review like a deal process: checks that numbers tie across every page and workstream, keeps the issues list, and catches what the specialists missed between their lanes. | `01` |
| 3 | Coverage & market intelligence | **Healthcare Services Coverage Banker** | Tests the subsector thesis (why this asset, why now, who cares) against how specialty, behavioral, post-acute, ambulatory and tech-enabled services really trade. | `02` |
| 4 | Coverage & market intelligence | **Sponsor Coverage Banker** | Pressure-tests the buyer list and bid expectations from the private equity side: platform vs. add-on fit, portfolio overlap, and what a sponsor can actually pay. | `02` |
| 5 | Coverage & market intelligence | **Market Intelligence Analyst** | Checks every market claim (deal volume, multiples, buyer mix) for source, date and definition, and flags when trackers that define "deal" differently are mixed. | `02` |
| 6 | Execution | **Process & Timeline Manager** | Critiques the proposed process (broad vs. targeted auction, preemption, recap) and calendar, including regulatory waiting periods that blow up closing dates. | `01` |
| 7 | Execution | **Deal Documents Reviewer** | Page-turns teasers, CIMs, pitch books, LOI summaries and bid matrices for storyline, internal consistency, unsupported highlights and confidentiality slips. | `01` |
| 8 | Valuation & modeling | **Accounting & Three-Statement Reviewer** | Audits model mechanics and quality of earnings: statement linkages, adjusted-EBITDA add-backs (provider comp, de novos, pro forma), and the EV bridge (NCI, leases, cash). | `04` |
| 9 | Valuation & modeling | **Comps & Precedents Reviewer** | Challenges peer and precedent selection, calendarization, EBITDA basis, deal vintage across rate regimes, platform-vs-add-on mixing, and size discounts. | `04` |
| 10 | Valuation & modeling | **DCF Reviewer** | Tests the WACC build, beta relevering, volume × rate-by-payer projections, working capital, taxes and whether terminal value is defensible and consistent with an exit multiple. | `04` |
| 11 | Valuation & modeling | **LBO Reviewer** | Checks sources and uses, returns attribution, multiple-arbitrage and add-on math, and whether the implied sponsor price is consistent with comps and precedents. | `04` |
| 12 | Financing & credit | **Leveraged Finance / Credit Analyst** | Asks "would a lender fund this?": debt sizing to interest coverage, unitranche pricing, SOFR sensitivity, covenants and caps on EBITDA add-backs. | `05` |
| 13 | Healthcare regulatory & diligence | **Healthcare Regulatory Reviewer** | Flags structure and timing risk: CPOM and MSO/friendly-PC structures, state transaction notice laws, HSR/FTC scrutiny of roll-ups, Medicare CHOW, the home health 36-month rule, Stark/AKS. | `01` |
| 14 | Healthcare regulatory & diligence | **Reimbursement & Payer-Mix Analyst** | Translates policy into numbers: CMS rate updates, OBBBA Medicaid exposure, site-neutral proposals, and payer-mix shifts flowing through revenue to EBITDA. | `02` |
| 15 | Macro & rates | **Macro & Rates Economist** | Tests how rates, credit spreads, equity valuations and labor costs feed into WACC, debt capacity, launch timing, buyer mix and deal structure. | `05` |
| 16 | Data | **Public Data Specialist** | Reviews how data was pulled from SEC EDGAR, FRED/ALFRED, BLS, Census and CMS: right filing or series ID, vintage, units, calendarization, and documented provenance. | `03` |
| 17 | Quant / model review | **Quant Model Reviewer** | Referees every regression and statistical claim using Richelin's regression auditor, adding finance time-series diagnostics where needed. | `06` + `my-work/regression-auditor/` |
| 18 | Red team | **Red Team** | Argues the other side of every recommendation (the buyer's view on a sell-side pitch, the seller's on a buy-side bid, the bear case on any thesis) and runs a pre-mortem. | `02`, `04`, `05` |
| 19 | Coaching | **Interview Coach** | Quizzes Richelin on the technicals behind the team's findings, grades her answers, and keeps a running log of what she gets wrong until it sticks. | `04` (draws on all) |

## 2. Skills

Skills are shared building blocks. Each has one **owner** (the agent accountable for keeping it sharp) and a list of other agents that use it.

### 2.1 The existing skill: `regression-auditor` (reuse as-is)

- **Location:** `docs/my-work/regression-auditor/` (`SKILL.md`, `references/interpretation.md`, `references/decomposition.md`).
- **Rule: do not rewrite, paraphrase or fork it.** Agents load it directly. If it is installed as a project skill, copy the folder **unchanged** to `.claude/skills/regression-auditor/`, as `my-work/README.md` suggests.
- **What it provides:** the referee stance; the "pin down the claim" step (descriptive / predictive / causal / decomposition); six checks (design vs. claim, omitted and bad controls, functional form and interpretation, sample and data, inference, wording); Critical/Major/Minor ratings; the audit report template.
- **Trigger:** any agent that **runs, reviews or interprets a regression** invokes it. The output is a report in its template, not a free-form opinion.

Where the team's work uses regressions, and therefore this skill:

| Agent | Typical regression |
|---|---|
| Quant Model Reviewer (owner) | Any regression Richelin submits |
| Comps & Precedents Reviewer | EV/EBITDA on growth, margin, size, payer mix across peers |
| DCF Reviewer | Beta estimation (stock returns on market returns) |
| Macro & Rates Economist | Deal count or median multiple on rates, spreads, VIX |
| Market Intelligence Analyst | Trend or seasonality claims in deal-volume data |
| Reimbursement & Payer-Mix Analyst | Revenue-driver models (visits, providers, rate per visit) |
| Red Team | When attacking a recommendation that rests on a regression result |

### 2.2 The full skill set

| # | Skill | What it does | Owner | Also used by | Docs basis |
|---|---|---|---|---|---|
| S1 | **`sparring-review`** | The house review contract: audit the user's own work, rate findings Critical/Major/Minor, explain the reasoning, ask the follow-up questions an MD would, list "what holds up" and "could not check", and **never** substitute a finished model. Mirrors the regression auditor's stance and severity scale so all reports read alike. It is a separate skill and does not modify hers. | VP | **All 19 agents** | `my-work/` (stance), `01` |
| S2 | **`regression-auditor`** *(existing, as-is)* | See 2.1. | Quant Model Reviewer | Comps & Precedents, DCF, Macro & Rates, Market Intelligence, Reimbursement & Payer-Mix, Red Team | `my-work/regression-auditor/` |
| S3 | **`finance-regression-diagnostics`** | A companion to S2 for financial and macro data, from `06`: VIF and condition number, Breusch–Pagan/White with HC3, Durbin–Watson/Breusch–Godfrey with Newey–West, ADF/KPSS and cointegration (spurious regression), Cook's distance, ALFRED vintages and look-ahead, out-of-sample tests. Results feed into S2's checks 3–5 and S2's report template. It adds tests and replaces nothing. | Quant Model Reviewer | Macro & Rates, Comps & Precedents, DCF, Market Intelligence | `06` |
| S4 | **`public-data-retrieval`** | How to pull and verify data: EDGAR endpoints and fair-access rules, which filings to use (10-K, 8-K, DEFM14A fairness-opinion sections), XBRL tag pitfalls, FRED/ALFRED series IDs, BLS CES/QCEW/OEWS, Census CBP/SUSB/QSS with NAICS codes, CMS datasets. | Public Data Specialist | Market Intelligence, Macro & Rates, Comps & Precedents, Accounting & Three-Statement, Reimbursement & Payer-Mix, Quant Model Reviewer | `03` |
| S5 | **`source-provenance-check`** | Every number carries source, date, identifier and vintage; deal trackers are never mixed in one series; indicative ranges are labeled as hypotheses. | Public Data Specialist | MD, VP, Market Intelligence, Deal Documents, Coverage Banker, Red Team | `03`, `02` |
| S6 | **`adjusted-ebitda-and-ev-bridge`** | Healthcare QoE add-backs (provider comp normalization, de novo losses, pro forma acquisitions, PRF/ERC removal, cash-to-accrual proof), the EV bridge and the rule that EV and EBITDA must be on the same basis (NCI, leases). | Accounting & Three-Statement | Comps & Precedents, DCF, LBO, Leveraged Finance, Sponsor Coverage, Red Team, Interview Coach | `04` |
| S7 | **`comps-and-precedents-review`** | Peer and precedent selection, calendarization, diluted shares, EBITDA basis, vintage weighting, platform vs. add-on, structure (earn-outs, rollover), size/liquidity discount, median vs. mean. | Comps & Precedents | Coverage Banker, Sponsor Coverage, Market Intelligence, Red Team, Interview Coach | `04`, `02` |
| S8 | **`dcf-review`** | WACC build (r_f from `DGS10`, ERP, size premium), unlevering and relevering beta, volume × rate by payer, NWC/DSO, taxes and step-up, mid-year convention, terminal value share and Gordon-vs-exit-multiple consistency. | DCF Reviewer | Macro & Rates, Accounting & Three-Statement, Red Team, Interview Coach | `04`, `05` |
| S9 | **`lbo-review`** | Sources and uses, returns attribution identity (multiple × EBITDA × leverage), multiple-arbitrage and add-on math, exit ≤ entry base case, integration costs, cross-check against comps and precedents. | LBO Reviewer | Sponsor Coverage, Leveraged Finance, MD, Red Team, Interview Coach | `04` |
| S10 | **`debt-capacity-and-credit`** | Debt sized to coverage (max leverage = 1 / (coverage × all-in rate)), unitranche pricing, SOFR forward-curve sensitivity, covenant headroom, caps on add-backs, delayed-draw facilities for add-ons. | Leveraged Finance | LBO Reviewer, Macro & Rates, Sponsor Coverage | `05`, `04` |
| S11 | **`reimbursement-to-ebitda`** | Builds the bridge from a policy change to EBITDA: payer mix × rate change × volume, operating leverage on fixed labor, and timing of CMS and state Medicaid rules. | Reimbursement & Payer-Mix | Accounting & Three-Statement, DCF, Coverage Banker, Healthcare Regulatory, Red Team | `02`, `03` |
| S12 | **`healthcare-regulatory-checklist`** | CPOM and MSO/PC structures, state transaction-notice laws, HSR and the FTC Healthcare Task Force, CHOW and the 36-month rule, Stark/AKS/False Claims exposure, and each item's effect on the timeline and buyer set. | Healthcare Regulatory | Process & Timeline, VP, Deal Documents, Sponsor Coverage, Red Team | `01`, `02` |
| S13 | **`macro-overlay`** | The `05` checklist: pull current rates and spreads, then translate them into WACC, leverage, launch timing, buyer mix (strategic vs. sponsor rate sensitivity) and structure (earn-outs, rollover, seller notes). | Macro & Rates | Leveraged Finance, DCF, LBO, MD, Market Intelligence | `05` |
| S14 | **`process-and-timeline-design`** | Process phases and durations, auction type trade-offs, calendar built backward from regulatory approvals, IOI/LOI letters, bid comparison matrix. | Process & Timeline | VP, MD, Sponsor Coverage, Healthcare Regulatory | `01` |
| S15 | **`deal-document-review`** | Critique of teasers, CIMs, pitch books and LOI summaries: storyline, investment highlights backed by data, numbers that tie to the model, KPIs disclosed, confidentiality. | Deal Documents | VP, MD, Coverage Banker, Red Team | `01` |
| S16 | **`buyer-universe-mapping`** | Who buys this asset and why: sponsors (platform vs. add-on appetite, portfolio fit, fund size), strategics (payers, health systems, public operators), and ability to pay. | Sponsor Coverage | Coverage Banker, Market Intelligence, Process & Timeline | `02` |
| S17 | **`red-team-counterargument`** | Steelmans the opposite case, runs a pre-mortem ("it's a year later and the deal failed: why?"), names the single assumption that would kill the recommendation, and states the other side's walk-away price. | Red Team | MD, VP | `02`, `04`, `05` |
| S18 | **`technical-quiz-and-error-log`** | Generates interview questions from the team's actual findings (e.g., "walk me through why NCI belongs in EV"), grades the answer, explains the miss, and records it in an error log for spaced repetition. Proposed log location: `docs/my-work/interview-error-log.md`. | Interview Coach | Every reviewing agent tags "quizzable" misses for the coach | `04` + all |

### 2.3 Skills by agent (quick lookup)

| Agent | Skills |
|---|---|
| Managing Director | S1, S5, S9, S13, S14, S15, S17 |
| Vice President | S1 (owner), S5, S12, S14, S15, S17 |
| Healthcare Services Coverage Banker | S1, S5, S7, S11, S15, S16 |
| Sponsor Coverage Banker | S1, S6, S7, S9, S10, S12, S14, S16 (owner) |
| Market Intelligence Analyst | S1, **S2**, S3, S4, S5, S7, S13, S16 |
| Process & Timeline Manager | S1, S12, S14 (owner), S16 |
| Deal Documents Reviewer | S1, S5, S12, S15 (owner) |
| Accounting & Three-Statement Reviewer | S1, S4, S6 (owner), S8, S11 |
| Comps & Precedents Reviewer | S1, **S2**, S3, S4, S6, S7 (owner) |
| DCF Reviewer | S1, **S2**, S3, S6, S8 (owner), S11, S13 |
| LBO Reviewer | S1, S6, S9 (owner), S10, S13 |
| Leveraged Finance / Credit Analyst | S1, S6, S9, S10 (owner), S13 |
| Healthcare Regulatory Reviewer | S1, S11, S12 (owner), S14 |
| Reimbursement & Payer-Mix Analyst | S1, **S2**, S4, S11 (owner) |
| Macro & Rates Economist | S1, **S2**, S3, S4, S8, S10, S13 (owner) |
| Public Data Specialist | S1, S4 (owner), S5 (owner) |
| Quant Model Reviewer | S1, **S2 (owner)**, S3 (owner), S4 |
| Red Team | S1, **S2**, S5, S6, S7, S8, S9, S11, S12, S15, S17 (owner) |
| Interview Coach | S1, S6, S7, S8, S9, S18 (owner) |

## 3. How a sparring session runs

1. **Richelin submits her own work** (a model, comps sheet, CIM page, memo or regression) with the question she wants answered.
2. **The VP triages** it and routes it to the relevant specialists. Anything containing a regression always goes to the Quant Model Reviewer, which runs `regression-auditor`.
3. **Specialists review** under `sparring-review`: findings by severity, the reasoning behind each, what holds up, what could not be checked.
4. **The Red Team** argues the other side of the main recommendation.
5. **The MD** synthesizes a verdict and the single highest-value fix. The MD gives no rewritten model.
6. **The Interview Coach** turns the misses into quiz questions, grades her answers, and updates the error log so recurring gaps resurface until they are fixed.

## 4. Coverage of the brief

| Requested area | Agents |
|---|---|
| Deal leadership (MD, VP) | 1, 2 |
| Coverage and market intelligence | 3, 4, 5 |
| Execution (process and documents) | 6, 7 |
| Valuation and modeling (accounting/three-statement, comps and precedents, DCF, LBO) | 8, 9, 10, 11 |
| Financing and credit | 12 |
| Healthcare regulatory and diligence (CPOM, state notice laws, HSR, reimbursement and payer mix) | 13, 14 |
| Macro and rates | 15 |
| Data (SEC EDGAR, FRED, BLS, Census, CMS) | 16 |
| Quant / model review | 17 |
| Red team | 18 |
| Interview coach | 19 |
