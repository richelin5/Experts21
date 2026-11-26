---
name: finance-regression-diagnostics
description: Companion to the regression-auditor skill for financial and macro regressions - multicollinearity (VIF, condition number), heteroskedasticity (Breusch-Pagan, White, HC3), autocorrelation (Durbin-Watson, Breusch-Godfrey, Newey-West), non-stationarity and spurious regression (ADF, KPSS, cointegration), influential points, data vintages and look-ahead bias, and out-of-sample checks. Use alongside regression-auditor whenever a regression uses market, macro, deal-count or time-series data (betas, multiples on fundamentals, deal volume on rates and spreads).
---

# Finance regression diagnostics

**This skill adds tests. It never replaces `regression-auditor`.** Run `regression-auditor` first: its stance, the step that pins down the claim, its six checks, its severity ratings and its report template govern the audit. Put the results of these tests inside its report, mostly under check 3 (functional form), check 4 (sample and data) and check 5 (inference). Do not write a separate report.

Source: `docs/06-regression-audit.md` (full explanations, thresholds and a tested Python audit function).

## When each test applies

| Data | Tests to run |
|---|---|
| Cross-section of companies (e.g., EV/EBITDA on growth, margin, size, payer mix) | VIF and condition number; Breusch–Pagan and White; Cook's distance; observations per regressor; subsector fixed effects |
| Time series (deal counts, multiples, rates, spreads) | All of the above, plus ADF/KPSS on every series, cointegration if levels are regressed on levels, Durbin–Watson and Breusch–Godfrey, HAC standard errors, structural breaks (2008, 2020, 2022 rate shock), data vintages |
| Beta estimation | Return frequency and window, thin trading in small caps (Dimson/sum-beta), index choice, standard error of beta, unlever and relever logic (hand off to `dcf-review`) |

## Thresholds to report

- VIF > 5 is a warning and > 10 is serious; condition number > 30. Collinearity inflates variance; it does not bias the coefficients.
- Breusch–Pagan or White p < 0.05: use HC3 robust standard errors (HC3 suits small samples).
- ADF p > 0.05, or KPSS rejecting stationarity: the series probably has a unit root. Regressing levels on levels without cointegration is a **spurious regression**. Rate it Critical if the conclusion rests on it.
- Durbin–Watson far from 2, or Breusch–Godfrey p < 0.05: use Newey–West (HAC) standard errors and reconsider the lag structure.
- Cook's distance > 4/n: report results with and without the point, and investigate it.
- Fewer than 10–15 observations per regressor: overfitting risk. Ask for leave-one-out or rolling-origin out-of-sample error compared with a naive benchmark.
- Deal counts are count data: suggest Poisson or negative binomial models, or log(1 + count).

## Finance-specific traps

- **Look-ahead bias:** revised macro data (GDP, payrolls) used as if it were known at the time. Ask whether ALFRED vintages were used.
- **Mixed deal trackers:** one series stitched from PitchBook and LSEG counts. Hand off to `source-provenance-check`.
- **Rates as a catch-all:** a fed funds coefficient that is really picking up spreads, VIX or equity valuations. Treat as omitted-variable bias; sign it using `regression-auditor` check 2.
- **Trending nominal series:** deal value against nominal GDP or the S&P level. Use growth rates or changes instead.
- **Data mining:** many specifications tried and one reported. Ask how many were run.

## Running the code

If she supplied data and code, you may run `audit()` from `docs/06-regression-audit.md` on **her** specification to verify her diagnostics. Report the statistics; do not re-specify the model for her.
