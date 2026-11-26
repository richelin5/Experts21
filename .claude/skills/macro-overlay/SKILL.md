---
name: macro-overlay
description: Translates macro conditions into deal numbers and advice - current rates, SOFR forward curve, Treasury yields, high-yield spreads, VIX, financial conditions and lending standards into WACC, debt capacity, launch timing, buyer mix (strategic vs. sponsor rate sensitivity) and structure (earn-outs, rollover, seller notes). Use when reviewing any valuation, LBO, timing recommendation or market-outlook claim that depends on rates or the economy.
---

# Macro overlay

Reference: `docs/05-macro-rates-and-deal-activity.md` (transmission channels, current snapshot, academic evidence).

## The overlay checklist

1. **Current data as of the valuation date:** `DGS10`, `SOFR` plus the CME Term SOFR forward curve, `BAMLH0A0HYM2`, `VIXCLS`, `NFCI`, `DRTSCILM`, and the latest FOMC statement. The snapshot in `docs/05` is from November 2026: the funds rate was 3.75–4.00%, the next FOMC was Dec 8–9, 2026, and two October dissents favored a hike. Refresh it before relying on it.
2. **WACC:** r_f, ERP (state the source, e.g., Damodaran's implied ERP) and size premium updated.
3. **LBO capacity:** current lender terms, with sensitivities of SOFR ± 100 bp and leverage ± 0.5x.
4. **Labor:** wage inputs against BLS `CES6562000003` and OEWS local wages.
5. **Reimbursement:** latest CMS final rules and state Medicaid actions (hand off to `reimbursement-to-ebitda`).
6. **Timing view:** is the financing window open (tight spreads, low VIX, easing standards) or closing?
7. **Recommendation:** launch timing, buyer mix (strategics are less rate-sensitive than sponsors), and structure that bridges the bid-ask gap.

## Mechanisms she should be able to explain

- **Discount rate:** EV/EBITDA ≈ (FCF/EBITDA) / (WACC − g). With 60% conversion and g = 3%, WACC of 9%, 10% and 11% gives 10.0x, 8.6x and 7.5x.
- **Financing:** max leverage = 1 / (coverage × rate). Less debt means more equity per dollar of EV, so at a fixed IRR the sponsor's maximum price falls.
- **Spreads lead launches** by one to two quarters (Harford 2005); credit conditions drive buyout leverage and pricing (Axelson, Jenkinson, Strömberg and Weisbach 2013).
- **Healthcare twist:** demand is fairly acyclical, but administered prices lag wage inflation, so labor and reimbursement usually matter more than GDP.

## Common errors to flag

- A stale rate, or spot SOFR used for a 5-year floating-rate structure.
- Claiming that "rates fell, so multiples will rise" while ignoring spreads, equity valuations and policy risk.
- A macro regression with trending series (hand off to `regression-auditor` and `finance-regression-diagnostics`).
