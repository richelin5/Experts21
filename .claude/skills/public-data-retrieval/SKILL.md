---
name: public-data-retrieval
description: How to pull, check and cite US public data for healthcare services M&A work - SEC EDGAR (submissions, XBRL companyfacts and frames, full-text search, 10-K, 8-K, DEFM14A fairness-opinion sections), FRED and ALFRED vintages, BLS (CES, QCEW, OEWS, JOLTS, PPI), Census (CBP, SUSB, Economic Census, QSS) with healthcare NAICS codes, and CMS datasets. Use when reviewing how a number was sourced, or when pulling a figure needed to verify Richelin's work.
---

# Public data retrieval

Full reference: `docs/03-public-data-sources.md` (endpoints, series IDs, NAICS table, Python snippets).

## Purpose on a sparring team

Use this skill to **check how she sourced her data** and to pull a figure that **verifies her number**. Do not assemble her dataset or comps set for her.

## Access rules

- **EDGAR:** send a descriptive `User-Agent` with a team contact (never a personal email), make at most 10 requests per second, and zero-pad CIKs to 10 digits.
- **FRED:** needs an API key (`api.stlouisfed.org/fred/series/observations`). Missing values arrive as `"."`.
- **BLS API v2:** POST a list of series IDs; a registration key raises the limits.
- **Census API:** a key is recommended; codes are `NAICS2017` or `NAICS2022` depending on the dataset year.
- Never hard-code keys. If a key is missing, say which one and stop.

## Which source answers which question

| Question | Source |
|---|---|
| Public peer financials (LTM revenue, EBITDA inputs, debt, NCI, leases) | EDGAR XBRL `companyfacts`, cross-checked against the 10-K/10-Q statements |
| What advisors actually used in a public deal (comps, precedents, WACC, terminal value) | DEFM14A / S-4 / SC 14D-9, the "Opinion of Financial Advisor" section |
| Serial acquirers' implied add-on prices | 10-K acquisitions footnote (purchase price, goodwill, number of practices) |
| Risk-free rate, curve slope, spreads, financial conditions | FRED: `DGS10`, `DGS20`, `T10Y2Y`, `SOFR`, `BAMLH0A0HYM2`, `BAMLH0A2HYB`, `NFCI`, `VIXCLS`, `DRTSCILM` |
| Healthcare wage inflation | BLS `CES6562000003`; OEWS wages by metro and occupation |
| Market size and fragmentation | Census CBP and SUSB by NAICS (e.g., 621111 physicians, 621610 home health, 621493 ASCs, 621420 outpatient behavioral) |
| Provider counts, Medicare volume and payments, ownership | CMS NPPES/PECOS, Medicare utilization files, SNF/HHA/hospice ownership data, cost reports (HCRIS) |

## Checks to run on her data

1. Right series, right units (thousands vs. units; percent vs. decimal; seasonally adjusted or not).
2. Right vintage. Backtests need ALFRED real-time data.
3. Fiscal years calendarized; XBRL duplicates removed using the `frame` field.
4. Revenue tag reconciled: `Revenues` vs. `RevenueFromContractWithCustomerExcludingAssessedTax` vs. `HealthCareOrganizationRevenue`.
5. EBITDA built explicitly (operating income + D&A), with the lease and NCI treatment stated. XBRL has no EBITDA tag.
6. Every figure stamped with source, identifier, date retrieved and period. Hand that stamp to `source-provenance-check`.
