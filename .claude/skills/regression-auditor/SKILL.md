---
name: regression-auditor
description: Audits a regression or econometric analysis the way a journal referee would - checks whether the design supports the claim, hunts for omitted variables and bad controls, verifies coefficient interpretation, and reviews sample, inference and wording. Use this whenever someone shares a regression specification, model equation, Stata/R/Python estimation code, a results table, or a draft sentence interpreting a coefficient and wants it checked, reviewed, critiqued, or "sanity-checked" - including Oaxaca-Blinder and other wage gap decompositions, and including casual asks like "does this model make sense?", "is my interpretation right?", or "what would a reviewer say about this?", even if the word "audit" never appears.
---

# Regression Auditor

Review an empirical analysis the way a careful referee would: find what would not survive scrutiny, say how much it matters, and say what would fix it.

## Stance

Act as a referee, not a co-author. The person owns the analysis. The job is to surface gaps so they can close them, which means:

- Audit what is on the page. Do not re-estimate the model, rewrite the paper, or replace their specification with a preferred one unless they ask.
- Explain the reasoning behind each finding, so the person learns the check and can apply it next time without help.
- Be direct about real problems and equally direct when something is fine. An audit that flags everything is as useless as one that flags nothing, because the person cannot tell which findings to act on.

## Step 1: Pin down the claim

Every later check depends on what the analysis is trying to show, so settle this first. Classify the claim as one of:

- **Descriptive** - "group A earns less than group B, on average, among people with the same schooling." Needs a representative sample and correct measurement. Does not need exogeneity.
- **Predictive** - "this model forecasts Y well." Needs out-of-sample performance. Coefficients need no causal reading.
- **Causal** - "X raises Y." Needs a credible reason that X is as good as randomly assigned once controls are in, or a design (experiment, IV, difference-in-differences, RD) that supplies one.
- **Accounting / decomposition** - "this much of the gap is associated with differences in characteristics." Descriptive in nature, though often worded causally.

If the stated claim and the wording disagree (a descriptive design described with causal verbs), that mismatch is usually the most important finding in the audit. Say so first.

## Step 2: Take stock of what you have

A full audit uses four things: the research question, the specification (equation or code), the output, and the data and sample description. People rarely supply all four.

Work with what is there. For anything missing, do not guess: list the check under "Could not check" and say what you would need to see. If the missing piece makes the audit close to meaningless (for example, a results table with no indication of what the outcome variable is), ask one question for the single most important missing item, then proceed.

## Step 3: Run the six checks

Go through all six in order. Skip none silently; if a check turns up nothing, say it passed in one line.

### 1. Does the design support the claim?

For a causal claim, ask what variation in X is identifying the coefficient, and why that variation would be unrelated to other determinants of Y. If the answer is "we added controls," name the most plausible unobserved factor that still differs across values of X. Also consider reverse causality (does Y drive X?) and simultaneity.

For a descriptive or decomposition claim, check that the wording stays descriptive.

### 2. Controls: what is missing, and what should not be there

Two opposite errors live here, and beginners usually know only the first.

**Omitted variables.** Name specific candidates, not "there may be omitted variables." For each, sign the bias where possible: the bias on the coefficient of X has the sign of (effect of the omitted variable on Y) x (correlation of the omitted variable with X). A finding that says "ability is omitted, it raises wages and correlates positively with schooling, so the schooling coefficient is probably overstated" is useful. A finding that says "omitted variable bias is possible" is not.

**Bad controls.** A control can make an estimate worse:

- *Mediator* - a variable on the path from X to Y. Controlling for it removes that channel, so the coefficient becomes the effect of X holding the mediator fixed, not the total effect. Occupation in a wage gap regression is the standard case: if group membership affects which occupations people enter, controlling for occupation hides part of the gap.
- *Collider* - a variable caused by both X and Y (or by their causes). Controlling for it creates a spurious association. Conditioning on being employed, or on being in a selected sample, often works this way.
- *Post-treatment variable* - anything measured after X and affected by it.

Whether a mediator is a "bad" control depends on the question. If the question is "what is the gap among people in the same occupation," occupation belongs. If it is "what is the total gap attributable to group membership," it does not. Report the mismatch between the control set and the stated question rather than declaring a control wrong in the abstract.

### 3. Functional form and interpretation

Check every interpreted coefficient against the rules in `references/interpretation.md`. Read that file whenever the analysis involves logs, dummies in a log model, interactions, polynomials, or a binary outcome - these are where most interpretation errors happen.

Also check: units of each variable, whether the reference category of every categorical variable is stated, and whether a "percent" should be "percentage points."

### 4. Sample and data

- Who is in the sample, and who was dropped? Does N change across columns, and if so are the columns comparing the same people?
- Selection: is the outcome only observed for some people (wages only for workers)?
- Measurement: how was the outcome constructed? Constructed variables (hourly wage = earnings / hours) carry the errors of their parts.
- Survey data: are weights used where the claim is about a population? Is income top-coded?
- Outliers and implausible values: any trimming, and is it reported?

### 5. Inference

- Standard errors: robust to heteroskedasticity? Clustered at the level at which the treatment varies or errors are correlated?
- Significance vs. size: is a "significant" effect economically small, or an "insignificant" one imprecise rather than zero? Absence of significance is not evidence of no effect.
- Many specifications or many outcomes tried: some will be significant by chance.
- R-squared used as evidence the model is "right" or causal: it is neither.

### 6. Wording

Compare the prose to what the design delivers. Flag causal verbs ("leads to," "impact of," "due to," "because of") on descriptive designs, and conclusions broader than the sample.

### Decompositions

If the analysis is an Oaxaca-Blinder or similar decomposition, read `references/decomposition.md` and apply those checks in addition to the six above. Decompositions have their own failure modes that the general checks do not catch.

## Step 4: Rate each finding

- **Critical** - the main conclusion does not follow as stated. Must be fixed or the claim must be narrowed.
- **Major** - the estimate is probably biased or misread in a way that changes magnitude or interpretation. Should be fixed or defended.
- **Minor** - reporting, clarity, or robustness. Worth fixing; does not threaten the result.

Rate by consequence for the conclusion, not by how sophisticated the issue sounds. A wrong reference category reading that reverses a sentence is Critical; an exotic clustering concern with a huge t-statistic is Minor.

## Report structure

Use this template. Keep it tight - the person should be able to act on it in one sitting.

```markdown
# Regression audit: [short name of the analysis]

**Claim being made:** [one sentence] - [descriptive / predictive / causal / decomposition]
**Verdict:** [one or two sentences: does the evidence support the claim as worded?]

## Findings

### Critical
1. **[Short title]**
   - What I see: [quote or point to the exact spec line, coefficient, or sentence]
   - Why it matters: [the mechanism; direction of bias if it can be signed]
   - What would fix it: [a concrete change to the spec, sample, or wording]

### Major
...

### Minor
...

## What holds up
[Brief. Name the things done correctly, so the person knows not to change them.]

## Could not check
[Each check that needed information not provided, and what to send to complete it.]

## If you fix one thing
[The single highest-value change.]
```

Omit a severity heading if it has no findings. Always include "What holds up" and "Could not check" - the first prevents the person from "fixing" correct work, and the second keeps the audit honest about its own limits.

## Example finding

Input: a regression of log hourly wage on a group indicator, years of schooling, potential experience, and 2-digit occupation dummies, with the sentence "the group indicator shows the wage penalty caused by group membership is 8%."

A good finding:

> **Occupation is a mediator, and the sentence claims a total effect** (Major)
> - What I see: occupation dummies are included, and the text reads the coefficient of -0.08 as "the wage penalty caused by group membership."
> - Why it matters: if group membership influences which occupations people end up in, part of the gap runs through occupation. Holding occupation fixed removes that part, so -0.08 is the gap among people in the same occupation, which is likely smaller than the overall gap. It is also an association, not a causal effect: unobserved differences in, for example, school quality remain.
> - What would fix it: report the specification with and without occupation side by side, and reword to "among workers in the same occupation with the same schooling and experience, the group earns about 8 log points less."

Notice what makes it useful: it points at the exact line, explains the mechanism, signs the direction, and offers a change the person can make themselves.
