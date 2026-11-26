---
name: lbo-review
description: Reviews leveraged buyout analyses and sponsor ability-to-pay for healthcare services - sources and uses, debt sizing, returns attribution (multiple, EBITDA growth, deleveraging), buy-and-build multiple arbitrage and add-on math, exit assumptions, integration costs, and cross-checks against comps and precedents. Use on any LBO, paper LBO, returns analysis or sponsor bid range Richelin built.
---

# LBO review

Reference: `docs/04-valuation-methods.md` section 4; financing conditions in `docs/05-macro-rates-and-deal-activity.md`.

## Identities to check her model against

```
Sources = debt + sponsor equity + rollover        Uses = purchase EV + fees (~2–4%) + cash to balance sheet
MOIC = (Exit multiple / Entry multiple) × (Exit EBITDA / Entry EBITDA) × [(Exit EV − Net debt_exit) / Exit EV] ÷ (Equity_entry / Entry EV)
IRR ≈ MOIC^(1/years) − 1
Interest coverage = EBITDA / cash interest     Max leverage at coverage c and all-in rate r = 1 / (c·r)
```

Use the attribution identity to decompose **her** returns into multiple expansion, EBITDA growth and deleveraging. If most of the return comes from multiple expansion, that is a finding.

## Indicative 2026 middle-market healthcare parameters (verify with lenders)

Leverage of 4.0–6.0x for quality platforms; unitranche at SOFR + ~450–575 bps (SOFR ≈ 3.9%); equity of 45–60% of the capital structure; target 20–25% gross IRR and 2.5–3.0x MOIC over 4–6 years.

## Checklist

1. **Exit ≤ entry multiple** in the base case. Multiple expansion is upside, and needs a stated reason (scale, mix, de-risking).
2. **Floating rate:** SOFR forward curve, not spot only; hedging cost; a SOFR ± 100 bp sensitivity.
3. **Coverage and FCF:** at 6x and a 9.5% all-in rate, interest is 57% of EBITDA (1.75x coverage) before capex and tax. Is FCF positive in years 1–2?
4. **Add-on math:** acquired EBITDA comes with a purchase price funded by debt or equity; add-on multiples rise as competition rises; delayed-draw capacity exists.
5. **Integration costs and dis-synergies:** credentialing delays, payer contract re-papering, provider attrition.
6. **Adjusted EBITDA ≠ cash:** add-backs are capped by lenders. See `adjusted-ebitda-and-ev-bridge`.
7. **Mechanics:** interest on average balances (circularity handled), cash sweep and revolver logic, fees amortized, rollover equity included in ownership.
8. **Cross-check:** the implied entry price vs. comps and precedents. The LBO sets a floor or ceiling for financial buyers, not a strategic buyer's value.

## Questions to ask her

- "What is your IRR if exit equals entry and SOFR is 100 bp higher?"
- "How much of your MOIC is multiple arbitrage? Would an LP believe it?"
- "At your leverage, what is EBITDA / (interest + capex) in year 1?"
