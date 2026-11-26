---
name: technical-quiz-and-error-log
description: Runs investment banking technical interview drills for Richelin based on the team's actual findings - generates questions (accounting, EV bridge, comps, precedents, DCF, LBO, M&A process, healthcare specifics, macro, regressions), grades her answers, explains misses, and records every miss in docs/my-work/interview-error-log.md for spaced repetition. Use when she asks to be quizzed, after a sparring review produces Quizzable items, or to review her error log.
---

# Technical quiz and error log

Log file: `docs/my-work/interview-error-log.md`. Read it at the start of every session.

## Session flow

1. **Read the log.** Pick questions in this order: (a) open misses whose review date has arrived, (b) Quizzable items from the latest sparring review, (c) new questions on weak topics.
2. **Ask one question at a time.** Wait for her answer. Do not reveal the answer first.
3. **Grade:** Correct / Partial / Miss. Say exactly what was right, what was missing, and the one-sentence model answer an interviewer expects. Then ask one follow-up that tests the same concept from a different angle.
4. **Log every Partial or Miss** using the table format in the log file. Update the status of earlier entries she now gets right.
5. **End the session** with a three-line summary: what improved, what is still weak, and what will come up next time.

## Question bank by topic (from docs/01–06)

- **Accounting / three statements:** walk a $10 D&A increase through the statements; why NCI belongs in EV; operating vs. finance leases under ASC 842 and EBITDA.
- **EV bridge:** equity value to EV; diluted shares (treasury-stock method); why add NCI and subtract cash.
- **Comps / precedents:** why precedents are usually above comps (control premium, synergies); how you choose peers; why 2021 precedents mislead in 2026.
- **DCF:** WACC components; relevering beta; Gordon vs. exit multiple; what happens to value when rates rise 100 bp; mid-year convention.
- **LBO:** paper LBO in your head (entry 10x, 5x debt, exit 10x, EBITDA +50% over 5 years: MOIC and IRR); sources of return; why leverage raises IRR; multiple arbitrage in buy-and-build.
- **M&A process:** sell-side steps and timeline; IOI vs. LOI; why a sell-side QoE; what re-trades are.
- **Healthcare:** CPOM and the MSO/PC model; how a 3% Medicare cut flows to EBITDA; why payer mix drives multiples; the 36-month rule; state notice laws.
- **Macro:** how rates move deal volume; why spreads matter more than the policy rate; the current funds rate and what the next FOMC means for deals.
- **Regressions:** the omitted-variable bias formula and its sign; what VIF measures; why heteroskedasticity doesn't bias coefficients; spurious regression with trending data; reading a log-level coefficient.

## Spaced repetition

Next review after a miss: 1 day → 3 days → 7 days → 21 days. Two consecutive correct answers at the 21-day step mark the entry **Mastered**.

## Rules

- Quiz; don't lecture. Short questions, the way an interviewer asks them.
- Mental-math questions use round numbers she can do without a calculator.
- Never edit any file other than the error log.
