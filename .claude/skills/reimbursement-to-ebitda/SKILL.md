---
name: reimbursement-to-ebitda
description: Translates healthcare reimbursement and policy changes into revenue and EBITDA - payer mix times rate change times volume, operating leverage on fixed labor costs, timing of CMS annual rules (PFS, OPPS, HH PPS, hospice), Medicaid exposure under OBBBA, site-neutral proposals, Medicare Advantage rates, No Surprises Act. Use when reviewing projections, a downside case, a CIM's growth story or any claim about how policy affects a healthcare services business.
---

# Reimbursement to EBITDA

Reference: `docs/02-healthcare-services-ma-market.md` section 2; CMS data in `docs/03-public-data-sources.md` section 5.

## The bridge she should be able to show

```
ΔRevenue ≈ Σ_payer [ share_payer × Δrate_payer ] × Revenue  (+ volume response, if any)
ΔEBITDA ≈ ΔRevenue (costs are largely fixed in the short run)
%ΔEBITDA ≈ %ΔRevenue / EBITDA margin
```

Toy illustration (concept only): a 3% Medicare rate cut on a business that is 60% Medicare cuts revenue by about 1.8%. At a 15% margin that is about a 12% EBITDA hit.

## Checklist

1. **Payer mix stated** (commercial / Medicare FFS / Medicare Advantage / Medicaid / self-pay) and sourced. Without it, no reimbursement claim can be checked.
2. **Known rule changes in the base case:** CY2027 final rules (PFS conversion factor, OPPS, HH PPS, hospice), state Medicaid rate actions, and OBBBA (projected Medicaid cut of more than $900B over 10 years). A known cut modeled only as a "downside" is a Major finding.
3. **Exposure by subsector:** behavioral health, HCBS and personal care, maternity and long-term care are Medicaid-heavy; anesthesia, emergency and radiology are exposed to No Surprises Act IDR; value-based care enablers are exposed to MA rates and V28 risk adjustment; HOPD-linked practices are exposed to site-neutral proposals (and ASCs may benefit).
4. **Timing:** proposed rules arrive in the summer and final rules in November, effective January 1. Medicaid follows state fiscal years.
5. **Operating leverage:** a revenue hit with fixed labor; labor cost inflation (BLS `CES6562000003`) running ahead of the rate update compresses margins.
6. **Commercial rate assumptions** backed by signed contracts, not hopes.
7. **Volume offsets:** are they claimed, and are they plausible (do volumes really rise when rates fall)?

Ask her: "Rebuild your EBITDA under the final CY2027 rule and your state's Medicaid budget. What changes?" Do not rebuild it for her.
