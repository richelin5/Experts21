---
name: source-provenance-check
description: Checks that every number in Richelin's work carries a source, date, identifier and vintage; that deal trackers with different definitions are not mixed; and that indicative ranges are labeled as hypotheses rather than facts. Use on any market claim, comps or precedents table, pitch page, CIM page or memo that cites figures.
---

# Source provenance check

Ground rules come from `docs/README.md`; the reasons trackers disagree are in `docs/02-healthcare-services-ma-market.md`.

## Checklist

For each number on the page:

1. **Source named:** a report title, filing (form type and accession number), FRED/BLS series ID or database.
2. **Date and period:** when it was retrieved, and the period it covers (LTM to which date? Q3 2026? CY2025?).
3. **Definition stated:** count or value; disclosed value only or estimated; add-ons included or not; "healthcare" vs. "healthcare services"; PE vs. strategic, and whether PE-backed platform add-ons are counted as strategic.
4. **No stitched series:** one time series comes from one tracker. Stitching PitchBook to LSEG, or Bain to PwC, is a Major finding, and Critical if a trend claim depends on it.
5. **Ranges labeled:** multiples from broker marketing pages, or the indicative ranges in `docs/02` and `docs/04`, must say "indicative" and should be refreshed against PitchBook, Capital IQ, GF Data or a deal database before client use.
6. **Stale data flagged:** rates and spreads must be as of the valuation date; precedents need their deal year shown, because 2021 deals came from a different rate regime.
7. **Arithmetic ties:** totals sum, percentages match their bases, and the same figure is identical everywhere it appears.

## Rating

- Unsourced figure behind a headline claim: **Major**.
- Mixed trackers or stale rates behind a conclusion: **Major** or **Critical**.
- Missing retrieval date on a supporting figure: **Minor**.

Do not go and find the sources for her. Say which ones are missing and where she would look (see `public-data-retrieval`).
