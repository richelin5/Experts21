# Decomposition checks (Oaxaca-Blinder and relatives)

Apply these in addition to the six general checks whenever the analysis splits a mean gap between two groups into an "explained" (endowments, composition) part and an "unexplained" (coefficients, structure) part.

## 1. What the two parts mean - and do not mean

This is where most decomposition papers overreach, so check the wording first.

- **"Unexplained" is not a measure of discrimination.** It is the part of the gap not associated with differences in the *included* characteristics. It absorbs everything unobserved that differs between groups: school quality, field of study, actual (not potential) experience, language proficiency, measurement error. It can overstate or understate discrimination.
- **"Explained" is not "justified" or "free of discrimination."** Differences in endowments can themselves result from unequal treatment before or inside the labor market (access to schooling, sorting into occupations). A decomposition takes endowments as given.
- **Neither part is causal.** The decomposition is an accounting identity on regression coefficients. Sentences like "education causes 30 percent of the gap" claim more than it delivers; "differences in education account for 30 percent of the gap" is the supportable wording.

Flag a finding as Critical when the conclusion rests on reading the unexplained share as discrimination, or the explained share as its absence.

## 2. Reference coefficients (the index number problem)

The split between explained and unexplained depends on which coefficients are used to value characteristics: group A's, group B's, or pooled. Results can differ materially.

- Is the choice stated?
- Is it defended, or are results shown under more than one choice?
- If pooled coefficients are used, does the pooled regression include the group indicator? Leaving it out shifts part of the unexplained gap into the explained part.
- Twofold vs. threefold: a threefold decomposition has a separate interaction term. Check the text does not quietly fold it into one side.

Treat an unstated reference choice as Major: the headline percentage is not interpretable without it.

## 3. Detailed decomposition and the omitted category problem

- Contributions of individual variables to the **explained** part are fine to report.
- Contributions of individual *categorical* variables to the **unexplained** part depend on which category is the omitted base. Change the base and the per-variable numbers change, even though the total does not. If the paper reports these, check whether a normalization (deviation contrasts) was applied or the limitation is acknowledged.
- The intercept difference in the unexplained part is likewise base-dependent; do not let it be read as "pure discrimination."

## 4. Mediators in the control set

Each added control moves gap from "unexplained" to "explained." If the control is itself an outcome of group membership (occupation, industry, hours, job tenure), the explained share grows mechanically. That is not wrong, but it changes the question from "how large is the gap between comparable people" to "how large is the gap between people in the same jobs."

Best practice to look for: a sequence of specifications adding controls in stages (human capital only, then job characteristics), so the reader sees how the split moves. A single kitchen-sink specification with a headline "X percent explained" deserves a Major finding.

## 5. Selection into the wage sample

Wages are observed only for people who work. If employment rates differ between groups, the observed wage gap is for a selected subset and may not match the gap in wage offers. Check whether this is acknowledged, and whether employment rates by group are reported. A selection correction is not required at an introductory level, but silence on the issue is a finding.

## 6. Measurement in survey wage data

- **Constructed hourly wage.** Often annual earnings / (weeks worked x usual weekly hours). Errors in hours or weeks pass into the wage. Some survey years report weeks worked only in intervals, which adds noise.
- **Division bias.** If hours appear in the denominator of the wage *and* as a control, measurement error in hours produces a mechanical negative relationship. Flag any model with constructed hourly wage as outcome and hours as a regressor.
- **Top-coding.** High incomes are censored in public-use files, which compresses gaps at the top.
- **Potential experience.** Age minus schooling minus 6 assumes continuous work after school. It overstates actual experience for anyone with time out of the labor force, and for immigrants it mixes foreign and domestic experience, which the labor market may value differently.
- **Immigrant comparisons.** Years of schooling abroad may not be equivalent; years since arrival and language proficiency are standard controls whose absence is worth noting.
- **Weights.** Population claims from survey samples need the survey weights.
- **Trimming.** Implausible hourly wages (below about $1 or extremely high) are usually trimmed; check the rule is stated.

## 7. Common support

The decomposition asks what group A would earn with group B's characteristics. If some combinations of characteristics exist in one group but hardly at all in the other, that counterfactual is an extrapolation. Look for summary statistics by group; flag characteristics with little overlap.

## 8. Reporting

- Gap in logs: is it called log points, or converted correctly to percent?
- Are standard errors given for the explained and unexplained components, not only for the underlying regressions?
- Do the detailed explained contributions sum to the total explained part?
- Are group means of every characteristic reported, so the reader can see where the endowment differences come from?
- Shares can exceed 100 percent or be negative when the parts have opposite signs; check such cases are explained rather than left as apparent errors.
