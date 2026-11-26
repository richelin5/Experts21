---
name: dcf-review
description: Reviews discounted cash flow analyses for healthcare services businesses - WACC build (risk-free rate, equity risk premium, size premium), beta unlevering and relevering, volume-times-rate projections by payer, labor cost inflation, working capital and DSO, taxes and asset-deal step-up, mid-year convention, and terminal value (share of EV, Gordon growth vs. exit multiple consistency). Use on any DCF, WACC calculation or intrinsic value range Richelin built.
---

# DCF review

Reference: `docs/04-valuation-methods.md` section 3; rates and WACC inputs in `docs/05-macro-rates-and-deal-activity.md`.

## Formulas to check her work against

```
UFCF = EBIT·(1−t) + D&A − capex − ΔNWC
WACC = E/(D+E)·k_e + D/(D+E)·k_d·(1−t)
k_e  = r_f + β_L·ERP (+ size premium; company-specific premium only with a stated reason)
β_U  = β_L / [1 + (1−t)·D/E]        β_L(target) = β_U·[1 + (1−t)·D/E(target)]
TV_Gordon = UFCF_{n+1} / (WACC − g)        implied exit multiple = TV / EBITDA_n
```

## Checklist

1. **Terminal value share of EV.** If it is above about 75%, the valuation is mostly an assumption. Check her implied exit multiple against comps, and her implied perpetual growth against her exit multiple. The two must agree.
2. **g:** 2–3.5% nominal is defensible, and g must be below WACC. Healthcare demand growth does not justify 5% forever.
3. **Nominal vs. real consistency** between cash flows and the discount rate.
4. **r_f** is the current 10Y or 20Y Treasury (`DGS10`/`DGS20`) on the valuation date, not a stale or short rate.
5. **Beta:** unlevered from peers and relevered at the target's structure; not a raw beta from one peer or an illiquid small cap.
6. **No double-counting of risk:** a large company-specific premium *and* haircut cash flows for the same risk.
7. **Projections:** volume × rate **by payer** (commercial, Medicare, Medicaid); known CMS and Medicaid rate changes are in the base case, not a sensitivity; labor is FTEs × wage, with wage inflation tied to BLS data; de novo ramp curves; maintenance vs. growth capex.
8. **Hockey sticks:** margin expansion and accelerating growth after a weak history, with no operational reason given.
9. **Working capital:** DSO and payer-mix shifts change NWC; an RCM backlog is a hidden cash drain.
10. **Mid-year convention** applied consistently, including in the terminal value.
11. **Tax:** state taxes; pass-through vs. C-corp; Section 338(h)(10) or asset-deal step-up (15-year goodwill amortization is often worth 5–10% of the price).

## Sensitivity she should have built

WACC × g, and WACC × exit multiple. If those tables are missing, ask for them rather than building them for her.

If beta comes from her own regression, invoke `regression-auditor` and `finance-regression-diagnostics`.
