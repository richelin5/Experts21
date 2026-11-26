# 04 — Standard Valuation Methods and Their Common Mistakes

> Context file for the expert-agent team. Last researched: 2026-11-26.
> The four methods are triangulated on a **football field** chart. No single method is "the answer": comps and precedents tell you what the market pays, DCF tells you what the cash flows are worth, the LBO tells you what a sponsor *can* pay.

## 0. Foundations that every method depends on

### 0.1 Enterprise value bridge
```
Equity value (diluted shares × price, treasury-stock method for options/RSUs; if-converted for converts)
+ Total debt (incl. current portion, finance leases)
+ Preferred stock
+ Noncontrolling interests (NCI)
+ [Operating lease liabilities — ONLY if EBITDA is EBITDAR-basis]
− Cash and equivalents (net of trapped/restricted cash)
− Non-operating assets (equity investments, if their income is excluded from EBITDA)
= Enterprise value
```
**Consistency principle:** the numerator (EV) and denominator (EBITDA) must include the same claimholders. If EV includes NCI, EBITDA must be 100% consolidated EBITDA. If you add equity-method investments' value, exclude their income.

### 0.2 Adjusted EBITDA in healthcare services
Typical normalization items (the sell-side QoE and buyer QoE will fight over each):
- **Physician/provider compensation normalization** — the "comp model" post-close (e.g., owners move from taking all profits to market comp plus equity). The single biggest swing item in PPM deals.
- Owner perquisites, related-party rent at non-market rates
- One-time legal, transaction, recruiting costs
- **De novo losses** (ramping new sites) — add-back only with proof of a ramp curve
- **Pro forma acquisitions** (run-rate EBITDA of add-ons closed in the period)
- **Pro forma rate changes** (new payer contracts) — high skepticism
- COVID-era relief funds (PRF), ERC credits — must be removed
- Revenue cut-off and **contractual allowances / bad-debt reserve true-ups** — cash-to-accrual proof is essential
- Stock-based compensation — treat as a real cost unless the buyer will not replace it

## 1. Trading comparables ("comps")

**Method:** select publicly traded peers → calculate EV/Revenue, EV/EBITDA (LTM, NTM), P/E, and sector KPIs (EV/bed, EV/center) → apply a range to the target's metrics → adjust for size, growth, margin, payer mix and liquidity.

**Healthcare services peer sets (verify listing status):** hospitals (HCA, THC, UHS, CYH); post-acute (ENSG, PNTG, EHC, SEM, BKD, NHC); home/community (ADUS, OPCH); behavioral (ACHC, LFST); ambulatory/physician (SGRY, USPH, PRVA, DVA, RDNT); labs (DGX, LH); staffing (AMN, CCRN).

### Common mistakes
1. **Poor peer selection** — mixing hospital operators (capex-heavy, ~6–9x) with asset-light physician services; choosing peers by SIC code instead of business model and payer mix.
2. **Mismatched EV and EBITDA bases** — ignoring NCI (ASC operators), mixing pre- and post-ASC 842 EBITDA, forgetting finance leases.
3. **Calendarization errors** — comparing a June FY LTM to December FY figures.
4. **Using stale share counts** or basic instead of diluted shares.
5. **Not scrubbing non-recurring items** from peers' EBITDA while scrubbing the target's (asymmetric adjustments).
6. **Applying public multiples to a $5M EBITDA private company without a size/liquidity discount** — public healthcare services companies are much larger, more diversified and liquid.
7. **Mean vs. median** — small samples (n = 5–8) are skewed by one outlier; show median, quartiles and the full spread.
8. **Ignoring that public multiples embed minority, liquid pricing** — no control premium.

## 2. Precedent transactions

**Method:** identify comparable M&A transactions (ideally same subsector, size, payer mix, within ~3–5 years) → compute EV/LTM EBITDA paid → apply to target. Includes a **control premium** and often **synergies** the acquirer paid away.

**Sources:** merger proxies (DEFM14A), 8-Ks, 10-K acquisition footnotes, press releases, PitchBook, Capital IQ, LSEG, Levin Associates, Irving Levin's Health Care M&A Report, bank internal databases, GF Data (MM private multiples by size band).

### Common mistakes
1. **Stale precedents across rate regimes** — 2021 deals (zero rates, 7x leverage) are not a guide to 2026 pricing. Weight recent deals or show by vintage.
2. **Disclosure bias** — private MM deals rarely disclose values; disclosed values skew to large, public or high-priced deals ("survivorship of the brag").
3. **Unknown EBITDA basis** — was the multiple on reported, adjusted, pro forma-for-synergies or run-rate EBITDA? A "12x" on pro forma adjusted EBITDA can be 16x on reported.
4. **Mixing platform and add-on multiples** — a 6x add-on is not a precedent for a 13x platform, and vice versa.
5. **Ignoring structure** — earn-outs, rollover equity, seller notes and contingent consideration change economic value; headline EV ≠ cash at close.
6. **Including distressed or strategic-synergy deals** without flagging them.
7. **Over-relying on a single mega deal** (e.g., a payer buying a VBC company) to benchmark a regional practice.

## 3. Discounted cash flow (DCF)

**Method:** project unlevered free cash flow (UFCF = EBIT × (1 − t) + D&A − capex − ΔNWC) for 5–10 years → discount at WACC → add terminal value (Gordon growth or exit multiple) → EV → equity value.

```
WACC = E/(D+E) · k_e + D/(D+E) · k_d · (1 − t)
k_e  = r_f + β_L · ERP + size premium (+ company-specific risk premium, used sparingly)
β_L  = β_U · [1 + (1 − t) · D/E]          (Hamada; relever peer unlevered betas at target capital structure)
TV (Gordon) = UFCF_{n+1} / (WACC − g)
```

**Healthcare-specific modeling:** forecast **volume × rate by payer** (e.g., visits × net revenue per visit for commercial, Medicare, Medicaid); explicitly model CMS annual updates and known cuts; model labor as FTEs × wage rate with BLS-based inflation; de novo openings with ramp curves; maintenance vs. growth capex.

### Common mistakes
1. **Terminal value dominates** (often 70–85% of EV) — and is set carelessly. Check implied exit multiple vs. Gordon growth and vice versa; they must be consistent.
2. **Terminal growth ≥ nominal GDP or > WACC-consistent levels.** A long-run g of 2–3.5% nominal is the defensible range; healthcare demand growth does not justify 5% forever.
3. **Inconsistent inflation** — nominal cash flows discounted at a real rate or vice versa.
4. **Wrong risk-free rate** — using a short rate or stale 10-year yield; use the current 10Y or 20Y Treasury (FRED `DGS10`, `DGS20`) on the valuation date.
5. **Beta errors** — not unlevering/relevering; using raw betas for illiquid small caps; using a single peer's beta.
6. **Double-counting risk** — adding a large company-specific premium *and* haircutting cash flows for the same risk.
7. **Hockey-stick projections** — margin expansion and growth both accelerating after a weak history; no reconciliation to the market's capacity (labor supply, referrals).
8. **Working capital ignored** — in healthcare, **days sales outstanding** (DSO) and payer mix shifts change NWC materially; an RCM backlog can be a hidden cash drain.
9. **Mid-year convention omitted** (cash flows arrive through the year, not on December 31).
10. **Tax mistakes** — ignoring state taxes, pass-through (S-corp/LLC) vs. C-corp differences, Section 338(h)(10)/asset-deal step-up value (tax amortization of goodwill over 15 years is often worth 5–10% of price).
11. **Treating policy risk as "noise"** — a known Medicaid rate cut must be in the base case, not a sensitivity.

## 4. Leveraged buyout (LBO) analysis

**Method:** what can a sponsor pay and still hit its return hurdle?
```
Entry EV = Entry multiple × LTM Adj. EBITDA
Sources = Debt (x turns of EBITDA) + Sponsor equity + Rollover equity
Uses    = Purchase EV + fees (≈2–4%) + cash to B/S
Project EBITDA, FCF, debt paydown → Exit EV = Exit multiple × Exit EBITDA
Equity at exit = Exit EV − net debt
IRR, MOIC on sponsor equity
```

**Indicative 2026 middle-market healthcare parameters (verify with lenders):**
- Senior/unitranche leverage: ~4.0–6.0x for quality platforms; lower for Medicaid-heavy or labor-heavy assets.
- Pricing: SOFR + ~450–575 bps unitranche (all-in ~8.5–10% with SOFR ≈ 3.9%); delayed-draw term loans for add-ons.
- Equity contribution: ~45–60% of capital structure.
- Target returns: 20–25% gross IRR, 2.5–3.0x MOIC over 4–6 years.
- **Value creation bridge:** EBITDA growth (organic + add-ons) + **multiple arbitrage** (buy add-ons at 5–8x, consolidated platform exits at 10–14x) + deleveraging.

**Returns attribution identity** (use it to sanity-check any model):
```
MOIC ≈ (Exit multiple / Entry multiple) × (Exit EBITDA / Entry EBITDA) × (Exit EV − Net debt_exit)/(Exit EV) ÷ (Equity_entry / Entry EV)
```

### Common mistakes
1. **Assuming exit multiple > entry multiple** without justification (the base case should be exit = entry or lower; multiple expansion is upside).
2. **Ignoring interest-rate sensitivity** — floating-rate debt; model SOFR forward curve, not today's spot only; hedging costs.
3. **Covenant and coverage blind spots** — at 6x leverage and 9.5% all-in cost, interest is 57% of EBITDA (coverage ≈ 1.75x) before capex and taxes; FCF can be near zero.
4. **Add-on math errors** — counting acquired EBITDA without the purchase price funded by debt/equity, or assuming add-on multiples stay low as competition rises.
5. **Integration costs and dis-synergies** omitted (credentialing delays, payer contract re-papering, provider attrition).
6. **Treating adjusted EBITDA as cash** — add-backs are not cash; lenders cap them (e.g., 20–25% of EBITDA).
7. **Circularity / revolver logic errors** in the model (interest on average balances; cash sweep).
8. **Not cross-checking implied entry valuation against comps/precedents** — the LBO gives a **floor/ceiling for financial buyers**, not the strategic's value.

## 5. Putting it together (football field)

| Method | What it represents | Typical weight in MM healthcare sell-side |
|---|---|---|
| Trading comps (adjusted for size) | Minority, liquid market value | Reference; often shown with a size discount |
| Precedent transactions | Control value actually paid | High (buyers anchor on it) |
| DCF | Intrinsic value under the model | Medium; key for unusual growth profiles |
| LBO | Financial buyer ability to pay | High (sponsors dominate MM buyers) |

**Final sanity checks:** implied EV/EBITDA, EV/revenue, and equity value per provider/location vs. precedents; implied perpetual growth from exit multiple; sensitivity tables (WACC × g; entry × exit multiple; leverage × rate).

## Sources

- Standard corporate finance references: Rosenbaum & Pearl, *Investment Banking: Valuation, LBOs, M&A and IPOs*; Koller, Goedhart & Wessels (McKinsey), *Valuation*; Damodaran, *Investment Valuation* and his online datasets ([pages.stern.nyu.edu/~adamodar](https://pages.stern.nyu.edu/~adamodar/)).
- Market parameters (leverage, pricing): [PitchBook US Private Credit Monitor (July 2026)](https://pitchbook.brightspotcdn.com/ed/67/604bbdc24d58b5dbee280e043942/july-2026-us-private-credit-monitor.pdf); [Mondaq — Credit conditions Q1 2026](https://www.mondaq.com/unitedstates/maprivate-equity/1732012/credit-conditions-the-latest-private-credit-and-debt-market-trends-%7c-q1-2026); [BlackRock — Direct lending in a shifting environment](https://www.blackrock.com/institutions/en-global/institutional-insights/thought-leadership/direct-lending-in-a-shifting-environment).
- Multiples context: [FOCUS — Healthcare EBITDA Multiples 2026](https://focusbankers.com/healthcare-ebitda-multiples/).
