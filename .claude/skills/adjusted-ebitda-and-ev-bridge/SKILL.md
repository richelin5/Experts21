---
name: adjusted-ebitda-and-ev-bridge
description: Reviews adjusted EBITDA and quality of earnings in healthcare services (provider compensation normalization, de novo losses, pro forma acquisitions, PRF and ERC removal, cash-to-accrual proof, contractual allowances) and the enterprise value bridge (diluted shares, debt, preferred, noncontrolling interests, leases, cash), enforcing that EV and EBITDA are on the same basis. Use on any model, comps sheet, LBO, DCF output or CIM financial page.
---

# Adjusted EBITDA and EV bridge

Reference: `docs/04-valuation-methods.md` section 0.

## EV bridge checks

```
Diluted equity value (treasury-stock method for options/RSUs; if-converted for converts)
+ total debt (incl. current portion and finance leases) + preferred + noncontrolling interests
+ operating lease liabilities ONLY if EBITDA is on an EBITDAR basis
− cash (net of trapped or restricted cash) − non-operating assets whose income is excluded from EBITDA
= enterprise value
```

- **Consistency principle:** if EV includes NCI, EBITDA must be 100% consolidated. NCI is large for ASC and JV operators with physician syndication. If equity-method investments are added to value, their income must be excluded from EBITDA.
- Basic vs. diluted shares; share count as of the latest cover page.
- Pre- vs. post-ASC 842 EBITDA mixed across peers.
- Net debt sign errors; cash counted twice.

## Adjusted EBITDA checks (healthcare QoE)

For each add-back, ask: **is it real, is it non-recurring, will a buyer's QoE accept it, and is it cash?**

| Add-back | What to test |
|---|---|
| Provider/physician comp normalization | Post-close comp model at market rates (MGMA-type benchmarks); does the add-back assume physicians accept a pay cut they have not agreed to? Often the largest swing item. |
| Owner perks, related-party rent | Is the rent marked to market? Does the real estate stay with the seller? |
| One-time legal, recruiting, transaction costs | Do they recur every year under another name? |
| De novo losses | Ramp curve evidence by cohort; are mature sites actually profitable? |
| Pro forma acquisitions | Closed in the period? Is the acquired EBITDA supported by its own QoE? |
| Pro forma rate increases | Signed payer contracts only. |
| PRF / ERC / COVID relief | Must be removed from EBITDA. |
| Contractual allowances, bad debt, cut-off | Cash-to-accrual proof; DSO trend; reserve true-ups. |
| Stock-based compensation | A real cost unless the buyer will not replace it. |

## Red flags to rate Major or above

- Add-backs above about 20–25% of reported EBITDA (lenders cap them; see `debt-capacity-and-credit`).
- Adjusted EBITDA growing while cash flow from operations is flat.
- "Run-rate" EBITDA used as LTM.
- EBITDA definitions differing between the target and its comps (asymmetric scrubbing).

Point at the line and say what evidence would support it. Do not rebuild her EBITDA bridge.
