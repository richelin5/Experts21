# 06 — How to Audit a Regression Used in Financial Analysis

> Context file for the expert-agent team. Last researched: 2026-11-26.
> Typical regressions in an M&A context: (a) **comps regression** — EV/EBITDA on growth, margin, size, payer mix across peers; (b) **macro regression** — deal count or median multiple on rates, spreads, VIX over time; (c) **beta estimation** — stock returns on market returns; (d) **operating driver models** — revenue on visits, providers, locations.
> The auditor's question is always: *would a reasonable decision change if this regression were wrong?*

## 1. Audit workflow (do these in order)

1. **Purpose & claim** — What decision depends on it? Is the claim predictive (forecast) or causal ("a 100 bp rate hike *reduces* deal count by X%")? Causal claims need far more than OLS.
2. **Data audit** — source, vintage (ALFRED for revised macro data), frequency alignment, survivorship (comps set only includes companies that still exist), units, outliers, missing values, look-ahead (using data not available at the time).
3. **Specification** — functional form, variables, lags, sample period.
4. **Diagnostics** — multicollinearity, heteroskedasticity, autocorrelation, stationarity, influential observations, normality (for small-sample inference).
5. **Robustness** — alternative specifications, subsamples, out-of-sample tests.
6. **Interpretation** — economic magnitude, confidence intervals, not just significance stars.

## 2. Specification

**Questions to ask**
- Does economic theory justify each regressor and the expected sign? (E.g., EV/EBITDA should rise with expected growth and fall with WACC; see Gordon model in `05-macro-rates-and-deal-activity.md`.)
- **Functional form:** multiples are bounded below and right-skewed → consider log(EV/EBITDA) or EBITDA/EV (earnings yield). Size effects are usually log-linear (use log revenue). Deal counts are **count data** → Poisson / negative binomial or log(1 + count).
- **Nonlinearity / interactions:** e.g., the effect of growth on multiples may depend on margin. Use **Ramsey RESET** to test for missing nonlinear terms; inspect residual-vs-fitted plots.
- **Lags:** macro variables affect launched deals with 1–2 quarter lags and closed deals with 2–4 quarter lags. Unjustified contemporaneous regressors invite reverse causality.
- **Overfitting:** comps regressions often have n = 8–15 and k = 3–5. Rule of thumb: ≥10–15 observations per regressor. Report adjusted R², AIC/BIC, and leave-one-out prediction error.
- **Structural breaks:** 2008, 2020 (COVID), 2022 (rate shock), policy changes (OBBBA). Use Chow tests or dummies; check coefficient stability with rolling windows.

## 3. Multicollinearity

**Symptoms:** high R² but few significant coefficients; coefficients with wrong signs or that flip when one variable is added/removed; huge standard errors.

**Diagnostics**
- Correlation matrix (pairwise only — misses multi-variable collinearity).
- **Variance Inflation Factor:** `VIF_j = 1 / (1 − R²_j)` where R²_j is from regressing x_j on the other regressors. VIF > 5 is a warning, > 10 is serious.
- **Condition number** of the scaled design matrix: > 30 indicates problematic collinearity.

**Typical culprits in finance:** 2Y and 10Y Treasury yields together; fed funds and SOFR; revenue and EBITDA (size) in a comps regression; HY spreads and VIX.

**Remedies:** drop or combine variables (use the 10Y and the slope `T10Y2Y` instead of two levels), principal components, ridge regression for prediction, or accept it if only the joint prediction matters. Note: multicollinearity **does not bias** OLS coefficients; it inflates their variance and makes individual coefficients uninterpretable.

## 4. Heteroskedasticity

**Why it matters:** OLS coefficients stay unbiased, but standard errors are wrong → t-stats and confidence intervals are misleading. Common in cross-sections of firms (small companies have noisier multiples) and in financial time series (volatility clustering).

**Diagnostics:** residuals-vs-fitted plot (funnel shape); **Breusch–Pagan** test; **White** test (also captures some misspecification).

**Remedies:** heteroskedasticity-robust standard errors (**HC1/HC3**; HC3 for small samples); weighted least squares if the variance structure is known (e.g., weight by size); log-transform the dependent variable; for time series, GARCH-type modeling if volatility itself matters.

## 5. Omitted-variable bias (OVB)

If the true model is `y = β0 + β1·x1 + β2·x2 + u` but you estimate `y = b0 + b1·x1 + e`, then

```
E[b1] = β1 + β2 · δ,   where δ = Cov(x1, x2) / Var(x1)
```

Bias exists when the omitted variable both **affects y** (β2 ≠ 0) and is **correlated with an included regressor** (δ ≠ 0). The sign of the bias = sign(β2) × sign(δ).

**Classic M&A examples**
- Regress healthcare deal count on the fed funds rate and omit equity valuations / credit spreads → rates proxy for overall risk appetite; the "rate effect" is biased.
- Regress EV/EBITDA on growth and omit **payer mix** → commercially-reimbursed businesses grow faster *and* get higher multiples, so the growth coefficient is overstated.
- Regress multiples on size and omit **subsector** → hospitals are large and cheap; the size coefficient is biased downward. Fix with subsector fixed effects.

**Diagnostics/remedies:** theory-driven checklist of omitted drivers; add controls and see if the coefficient of interest moves materially (coefficient stability, à la Oster 2019); fixed effects (subsector, year); instrumental variables or natural experiments for causal claims; RESET as a weak signal.

## 6. Other checks auditors must not skip

| Issue | Test | Remedy |
|---|---|---|
| **Autocorrelation** (time series) | Durbin–Watson (≈2 is fine), Breusch–Godfrey, residual ACF | Newey–West (HAC) standard errors; add lags; model dynamics |
| **Non-stationarity / spurious regression** | ADF, KPSS on each series; Engle–Granger / Johansen for cointegration | Difference the data, use growth rates or changes, or an error-correction model. Two trending series (e.g., deal value and nominal GDP) will show "significant" relationships by construction |
| **Influential observations** | Leverage (hat values), Cook's distance, DFBETAs | Investigate (data error? unique company?); report with/without; robust regression |
| **Endogeneity / simultaneity** | Economic reasoning; Hausman test with an instrument | IV/2SLS, lagged regressors, event studies |
| **Measurement error in x** | Know the data (adjusted EBITDA vs. reported) | Biases coefficients toward zero (attenuation); use better measures or IV |
| **Look-ahead & data-snooping** | Check vintages; count specifications tried | Real-time data (ALFRED); hold-out samples; adjust for multiple testing |
| **Non-normal residuals** (small n) | Jarque–Bera, Q–Q plot | Bootstrap confidence intervals |
| **Out-of-sample performance** | Rolling-origin or leave-one-out validation; compare to naive benchmark (last value, mean) | Prefer the simpler model if it predicts as well |

## 7. Python audit template (statsmodels)

```python
import numpy as np, pandas as pd, statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor, reset_ramsey
from statsmodels.stats.diagnostic import het_breuschpagan, het_white, acorr_breusch_godfrey
from statsmodels.stats.stattools import durbin_watson, jarque_bera
from statsmodels.tsa.stattools import adfuller

def audit(y, X, time_series=False, hac_lags=4):
    Xc = sm.add_constant(X)
    m = sm.OLS(y, Xc).fit()
    out = {"n": int(m.nobs), "k": X.shape[1], "adj_R2": m.rsquared_adj, "AIC": m.aic}
    out["VIF"] = {c: variance_inflation_factor(Xc.values, i) for i, c in enumerate(Xc.columns) if c != "const"}
    out["cond_number"] = np.linalg.cond((X - X.mean()) / X.std())
    out["BP_pvalue"] = het_breuschpagan(m.resid, Xc)[1]
    out["White_pvalue"] = het_white(m.resid, Xc)[1]
    out["RESET_pvalue"] = float(reset_ramsey(m, degree=3).pvalue)
    out["JB_pvalue"] = jarque_bera(m.resid)[1]
    infl = m.get_influence()
    out["max_cooks_d"] = float(infl.cooks_distance[0].max())
    if time_series:
        out["DW"] = durbin_watson(m.resid)
        out["BG_pvalue"] = acorr_breusch_godfrey(m, nlags=hac_lags)[1]
        out["ADF_pvalues"] = {c: adfuller(X[c].dropna())[1] for c in X.columns} | {"y": adfuller(y.dropna())[1]}
        robust = m.get_robustcov_results(cov_type="HAC", maxlags=hac_lags)
    else:
        robust = m.get_robustcov_results(cov_type="HC3")
    return m, robust, out
```

Interpretation thresholds to report: VIF > 5/10; condition number > 30; BP/White p < 0.05 → use robust SEs; RESET p < 0.05 → misspecification; ADF p > 0.05 → likely unit root (do not regress levels on levels without cointegration); DW far from 2 → autocorrelation; Cook's D > 4/n → influential point.

## 8. Audit report template (what an agent should deliver)

1. **Model purpose and claim** (predictive vs. causal).
2. **Data provenance** (sources, IDs, vintages, sample, transformations).
3. **Specification review** (theory, signs, functional form, lags, breaks).
4. **Diagnostics table** (each test, statistic, p-value, verdict).
5. **Robustness** (alternative specs, subsamples, out-of-sample error vs. naive benchmark).
6. **Findings ranked by severity** — *fatal* (spurious regression, look-ahead, OVB that flips the conclusion), *material* (wrong SEs, influential outliers driving results), *minor* (presentation).
7. **Recommendation:** use as is / use with corrections / do not use — and what decision changes.

## Sources

- Wooldridge, J. M., *Introductory Econometrics: A Modern Approach* (OVB formula, heteroskedasticity, time-series chapters).
- Stock, J. H., & Watson, M. W., *Introduction to Econometrics*.
- Granger, C. W. J., & Newbold, P. (1974). Spurious regressions in econometrics. *Journal of Econometrics*, 2(2).
- White, H. (1980). A heteroskedasticity-consistent covariance matrix estimator. *Econometrica*, 48(4).
- Newey, W. K., & West, K. D. (1987). A simple, positive semi-definite, heteroskedasticity and autocorrelation consistent covariance matrix. *Econometrica*, 55(3).
- Ramsey, J. B. (1969). Tests for specification errors in classical linear least-squares regression analysis. *JRSS B*, 31(2).
- Oster, E. (2019). Unobservable selection and coefficient stability. *Journal of Business & Economic Statistics*, 37(2).
- [statsmodels documentation — regression diagnostics](https://www.statsmodels.org/stable/diagnostic.html)
