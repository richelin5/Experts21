---
name: debt-capacity-and-credit
description: Credit lens on healthcare services deals - debt sizing to interest coverage and FCF, unitranche and syndicated loan pricing, SOFR forward-curve sensitivity, covenant headroom, caps on EBITDA add-backs, delayed-draw term loans for add-ons, and what lenders will and won't fund (Medicaid-heavy, labor-heavy, reimbursement-exposed assets). Use when reviewing an LBO capital structure, a financing assumption, or a claim about how much a sponsor can borrow.
---

# Debt capacity and credit

Reference: `docs/05-macro-rates-and-deal-activity.md` section 2.2; `docs/04-valuation-methods.md` section 4.

## Sizing logic to test her structure against

```
Max leverage (x EBITDA) = 1 / (minimum coverage × all-in rate)
All-in rate = SOFR (forward) + spread (+ OID amortization)
```

| SOFR | Spread | All-in | Max leverage at 2.0x coverage |
|---|---|---|---|
| 0.25% (2021) | 5.50% | 5.75% | 8.7x (lenders capped at ~6–7x) |
| 4.0% (2026) | 5.25% | 9.25% | 5.4x |
| 5.3% (2023 peak) | 6.00% | 11.3% | 4.4x |

## Checklist

1. **Leverage vs. asset quality:** quality commercial-pay platforms run about 4.0–6.0x; Medicaid-heavy, labor-heavy or rate-exposed assets get lower leverage and wider spreads.
2. **Pricing:** unitranche around SOFR + 450–575 bps in 2026; direct-lending gross yields of roughly 9–10%. Is her rate current, and does it cite a source?
3. **Coverage and FCF/debt** in years 1–3 under her own projections, including capex and taxes.
4. **Covenants:** the leverage definition (add-back caps, often 20–25% of EBITDA; pro forma credit for acquisitions), headroom against her downside case, and whether the facility is covenant-lite.
5. **Add-on financing:** delayed-draw term loan size and ticking fees; incremental (accordion) capacity.
6. **Rate sensitivity:** SOFR ± 100 bp, and a hedge or no-hedge assumption.
7. **Reimbursement shock:** apply her own downside rate cut (see `reimbursement-to-ebitda`) and check whether covenants still hold.
8. **Maturity and refinancing risk** inside her hold period.

Ask the lender's question: "What EBITDA decline breaks the covenant, and how likely is it given this payer mix?"
