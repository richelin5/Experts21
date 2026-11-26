# 03 — Pulling and Using Public Data (SEC EDGAR, FRED, BLS, Census, CMS)

> Context file for the expert-agent team. Last researched: 2026-11-26.
> Rule for agents: **always record the source, series ID / accession number, retrieval date and data vintage** next to every number. Public data is free; un-sourced numbers are worthless in a deal context.

## 1. SEC EDGAR

### 1.1 Access rules
- No API key, but **every request must send a descriptive `User-Agent`** (e.g., `"Experts21 research bot admin@yourdomain.com"` — use a team mailbox, not a personal address). Fair-access limit: **≤10 requests/second**. Excess traffic gets IP-blocked.
- CIKs are 10-digit, zero-padded in JSON API paths.

### 1.2 Core endpoints

| Purpose | Endpoint |
|---|---|
| Ticker → CIK map | `https://www.sec.gov/files/company_tickers.json` |
| Filing history for a company | `https://data.sec.gov/submissions/CIK##########.json` |
| All XBRL facts for a company | `https://data.sec.gov/api/xbrl/companyfacts/CIK##########.json` |
| One concept over time | `https://data.sec.gov/api/xbrl/companyconcept/CIK##########/us-gaap/Revenues.json` |
| One concept across all filers for a period ("frames") | `https://data.sec.gov/api/xbrl/frames/us-gaap/Revenues/USD/CY2025.json` (use `CY2025Q3I` for instantaneous balance-sheet items) |
| Full-text search (2001+) | `https://efts.sec.gov/LATEST/search-index?q="physician practice"&forms=8-K` (UI at `https://www.sec.gov/edgar/search/`) |
| Filing documents | `https://www.sec.gov/Archives/edgar/data/<CIK>/<accession-no-dashes>/` |

### 1.3 Which filings matter for M&A work

| Form | Why a banker cares |
|---|---|
| **10-K / 10-Q** | Financials for trading comps; segment data; MD&A (volume, pricing, payer mix, same-store growth); acquisitions footnote (purchase price, goodwill, number of practices acquired — gives **implied add-on multiples** for serial acquirers) |
| **8-K Item 1.01 / 2.01 / 9.01** | Material agreements and completed acquisitions; 9.01 includes target financials and pro formas for significant deals |
| **DEFM14A / PREM14A (merger proxy)** | **The gold mine:** the "Opinion of Financial Advisor" section lists the exact comps, precedent transactions, multiples ranges, DCF WACC and terminal assumptions the advisors used, plus the "Background of the Merger" (process history: how many bidders, price evolution) |
| **S-4** | Same for stock deals |
| **SC TO-T / SC 14D-9** | Tender offers; 14D-9 contains the target banker's analysis |
| **SC 13D / 13G** | Activists and >5% holders |
| **S-1 / 424B** | IPOs of healthcare services companies — detailed KPIs and history of sponsor ownership |
| **Credit agreements (EX-10 exhibits)** | Leverage covenants, EBITDA definitions (add-back caps), pricing grids |

### 1.4 Healthcare XBRL pitfalls
- Revenue tags vary: `Revenues`, `RevenueFromContractWithCustomerExcludingAssessedTax`, `HealthCareOrganizationRevenue`. Pull all candidates and reconcile to the income statement.
- EBITDA is **not** a GAAP tag. Build it: operating income + D&A (from cash-flow statement) ± non-recurring items, and decide explicitly whether rent is in (post-ASC 842 operating leases stay in opex; finance leases do not).
- **Noncontrolling interests** are large for ASC/JV operators (e.g., physician syndication). Use `MinorityInterest` and "net income attributable to NCI"; EV and EBITDA must be on a consistent basis.
- Fiscal-year mismatches: calendarize to LTM/CY using quarterly facts; use the `frame` field to avoid duplicated facts restated in later filings.

### 1.5 Python sketch
```python
import requests, pandas as pd
H = {"User-Agent": "Experts21 research admin@example.com"}
cik = "0000860730"  # HCA Healthcare (verify)
facts = requests.get(f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json", headers=H).json()
rev = pd.DataFrame(facts["facts"]["us-gaap"]["Revenues"]["units"]["USD"])
rev = rev[rev["form"].isin(["10-K", "10-Q"])].drop_duplicates("frame").dropna(subset=["frame"])
```

## 2. FRED (Federal Reserve Bank of St. Louis)

### 2.1 Access
- Free API key: `https://fred.stlouisfed.org/docs/api/api_key.html`.
- Observations: `https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=KEY&file_type=json&observation_start=2015-01-01`
- **ALFRED** (archival FRED) gives **vintages** (`realtime_start`/`realtime_end`). Use it for any backtest or regression of deal activity on macro data, otherwise you introduce **look-ahead bias** from revised data (GDP, payrolls).

### 2.2 Series an M&A team actually uses

| Theme | Series ID | Description |
|---|---|---|
| Policy rate | `FEDFUNDS` (monthly), `DFF` (daily) | Effective federal funds rate |
| Floating base | `SOFR` | Secured Overnight Financing Rate — base rate for leveraged loans/unitranche |
| Treasury curve | `DGS2`, `DGS5`, `DGS10`, `DGS30`, `T10Y2Y`, `T10Y3M` | Risk-free rates for WACC; curve slope as recession signal |
| Credit spreads | `BAMLH0A0HYM2` (HY OAS), `BAMLH0A2HYB` (single-B OAS), `BAMLC0A4CBBB` (BBB OAS) | Best real-time proxy for LBO financing conditions |
| Lending standards | `DRTSCILM` | Senior Loan Officer Survey: net % tightening C&I standards, large/mid firms |
| Financial conditions | `NFCI` | Chicago Fed National Financial Conditions Index |
| Volatility | `VIXCLS` | Equity volatility — closes M&A windows when high |
| Inflation | `CPIAUCSL`, `CPILFESL`, `PCEPI`, `PCEPILFE`, `CPIMEDSL` (CPI medical care) | Deflators; medical inflation vs. headline |
| Activity | `GDPC1`, `UNRATE`, `PAYEMS` | Business cycle |
| Healthcare employment | `CES6562000001` | All employees, health care (thousands) |
| Equity valuation | `SP500` (price only, limited history) | Use with care; prefer index data from a market vendor |

### 2.3 Python sketch
```python
import requests, pandas as pd
def fred(sid, key, start="2010-01-01"):
    r = requests.get("https://api.stlouisfed.org/fred/series/observations",
                     params=dict(series_id=sid, api_key=key, file_type="json", observation_start=start)).json()
    s = pd.DataFrame(r["observations"])[["date", "value"]]
    s["value"] = pd.to_numeric(s["value"], errors="coerce")  # "." = missing
    return s.set_index(pd.to_datetime(s["date"]))["value"].rename(sid)
```

## 3. BLS (Bureau of Labor Statistics)

- API v2: `POST https://api.bls.gov/publicAPI/v2/timeseries/data/` with JSON `{"seriesid": [...], "startyear": "2016", "endyear": "2026", "registrationkey": "KEY"}`. Registered keys allow up to 50 series/request, 20 years, 500 queries/day.
- **CES (establishment survey) series format:** `CES` + supersector/industry code + data type (`01` = all employees, `03` = average hourly earnings of all employees).

| Series | Description |
|---|---|
| `CES6562000001` | Health care, all employees |
| `CES6562100001` | Ambulatory health care services |
| `CES6562200001` | Hospitals |
| `CES6562300001` | Nursing and residential care facilities |
| `CES6562000003` | Health care, average hourly earnings — labor-cost inflation input for margin forecasts |

Other BLS programs:
- **QCEW** — establishments, employment and wages by **county × 6-digit NAICS**; the best source for local market sizing and labor-market tightness for a target's footprint.
- **OEWS** — wages by occupation (e.g., 29-1141 Registered Nurses, 31-1122 Personal care aides, 21-1018 Substance abuse/behavioral counselors) by metro.
- **JOLTS** — openings/quits in health care and social assistance (labor scarcity indicator).
- **ECI** and **PPI** — the PPI has health-industry indexes (e.g., hospitals, physician offices, home health, nursing homes; series begin `PCU62…`) useful as price proxies.

## 4. Census Bureau

- API base: `https://api.census.gov/data/` (free key recommended).
- **County Business Patterns (CBP):** establishments, employment, payroll by NAICS and geography, annual.
  `https://api.census.gov/data/2022/cbp?get=ESTAB,EMP,PAYANN&for=county:*&in=state:12&NAICS2017=621610`
- **Statistics of US Businesses (SUSB):** firms and establishments by **enterprise size** — the standard way to quantify **fragmentation** (the core of any roll-up thesis).
- **Economic Census (2022)** and **Service Annual Survey (SAS):** revenue by NAICS, including revenue by source of payment for some healthcare industries.
- **Quarterly Services Survey (QSS):** quarterly revenue for health care and social assistance — the timeliest Census revenue indicator.
- **ACS / Population Estimates:** demographics (65+ population growth drives post-acute and specialty demand).

### Key healthcare services NAICS codes

| NAICS | Industry |
|---|---|
| 621111 | Offices of physicians (except mental health) |
| 621112 | Offices of physicians, mental health specialists |
| 621210 | Offices of dentists |
| 621330 | Offices of mental health practitioners (except physicians) |
| 621340 | Offices of physical, occupational, speech therapists & audiologists |
| 621420 | Outpatient mental health and substance abuse centers |
| 621492 | Kidney dialysis centers |
| 621493 | Freestanding ambulatory surgical and emergency centers |
| 621511 / 621512 | Medical laboratories / Diagnostic imaging centers |
| 621610 | Home health care services |
| 621910 | Ambulance services |
| 622110 / 622210 / 622310 | General medical & surgical / Psychiatric & substance abuse / Specialty hospitals |
| 623110 | Nursing care facilities (skilled nursing) |
| 623220 | Residential mental health and substance abuse facilities |
| 623312 | Assisted living facilities for the elderly |
| 624120 | Services for the elderly and persons with disabilities (non-medical home care / HCBS) |

Hospice has no single NAICS code (it spans home health, facilities and hospitals) — use CMS data instead.

## 5. CMS and other healthcare-specific public data (high value, often overlooked)

| Dataset | Use |
|---|---|
| NPPES NPI Registry / PECOS | Count providers by specialty and location; build target lists; identify group affiliations |
| Medicare Provider Utilization & Payment (Physician, Outpatient, Home Health, Hospice) | Volumes and Medicare revenue per provider/agency — diligence and sizing |
| Provider of Services (POS) file, Care Compare | Facility lists, ownership, quality star ratings |
| **CMS ownership data (SNF, hospice, home health)** | PE ownership trails; who has already been consolidated |
| HCRIS Medicare Cost Reports | Hospital/SNF/HHA/hospice financials (revenue, costs, payer days) |
| Fee schedules and annual payment rules (PFS, OPPS, HH PPS, Hospice) | Rate forecasts — direct inputs to the projection model |
| KFF, MACPAC | Medicaid enrollment and state policy context |
| Hospital price transparency / Transparency in Coverage files | Commercial rate benchmarking |

## 6. How to use the data in a deal

1. **Market sizing / TAM:** Census (revenue, establishments) × CMS utilization × population growth (ACS).
2. **Fragmentation thesis:** SUSB firm-size distribution + NPI counts → % of providers in groups above N providers.
3. **Labor-cost forecast:** BLS CES average hourly earnings and OEWS by metro → wage inflation assumption in the model.
4. **Reimbursement forecast:** CMS final rules + state Medicaid rate actions → price assumption by payer.
5. **Comps:** EDGAR XBRL → calendarized LTM revenue/EBITDA; market data vendor for share price and share count.
6. **Precedents:** DEFM14A / 8-K / 10-K acquisition footnotes + press releases + PitchBook.
7. **Macro overlay:** FRED rates and spreads → WACC, debt capacity, timing view.

## Sources

- SEC: [EDGAR APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces), [Accessing EDGAR data / fair access](https://www.sec.gov/os/accessing-edgar-data), [Full-text search](https://www.sec.gov/edgar/search/)
- FRED: [API documentation](https://fred.stlouisfed.org/docs/api/fred/), [ALFRED](https://alfred.stlouisfed.org/)
- BLS: [API v2 signatures](https://www.bls.gov/developers/api_signature_v2.htm), [CES](https://www.bls.gov/ces/), [QCEW](https://www.bls.gov/cew/), [OEWS](https://www.bls.gov/oes/)
- Census: [API datasets](https://www.census.gov/data/developers/data-sets.html), [CBP](https://www.census.gov/programs-surveys/cbp.html), [SUSB](https://www.census.gov/programs-surveys/susb.html), [QSS](https://www.census.gov/services/qss/)
- CMS: [data.cms.gov](https://data.cms.gov/), [NPPES](https://npiregistry.cms.hhs.gov/)
- Series IDs and endpoints reflect the documented APIs; verify any series ID on the source site before first production use.
