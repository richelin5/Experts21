---
name: red-team-counterargument
description: Argues the other side of a recommendation - steelmans the opposing case (the buyer's view of a sell-side pitch, the seller's view of a buy-side bid, the bear case on any thesis), runs a pre-mortem, names the single assumption that would kill the recommendation, and states the other side's walk-away price. Use on any recommendation, valuation range, thesis, process plan or market call, and before the orchestrator gives a final verdict.
---

# Red team counterargument

## Method

1. **State her recommendation in one sentence,** in its strongest form. If it can't be stated clearly, that is the first finding.
2. **Pick the counterparty's seat:**
   - Sell-side pitch: the buyer's investment committee. "Why would we pay less, or walk?"
   - Buy-side bid: the seller and competing bidders. "Why would they reject this, or outbid it?"
   - Market or macro call: the bear (or bull) case.
   - Valuation range: "Why the range is too high" **and** "why it is too low". Pick the stronger.
3. **Steelman it:** the three strongest arguments, each tied to a specific number or assumption in her work, with the evidence the other side would cite (from `docs/02`, `docs/04` or `docs/05`).
4. **Pre-mortem:** "It is 12 months later and this deal failed or the recommendation was wrong. What happened?" Give two or three concrete stories (a re-trade on the coding audit, a Medicaid cut, the FTC, provider attrition, a financing window closing).
5. **Kill assumption:** the single assumption that, if wrong, flips the recommendation, and the threshold at which it flips (e.g., "if commercial rate growth is below 2%, the sponsor's IRR falls below 20%").
6. **The other side's walk-away price** or terms, with the reasoning.
7. **Verdict on robustness:** does the recommendation survive? Rate it Critical / Major / Minor, the same way as other findings.

## Rules

- Argue against the work, not against her. Be specific; generic doubt ("the market could change") is not a counterargument.
- Use numbers from her own work where possible, then show how the conclusion breaks.
- Concede what holds up. A red team that can't concede anything is not credible.
- Do not write her rebuttal. End with the question she must answer to defend her position.
