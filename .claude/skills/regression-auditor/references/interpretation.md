# Coefficient interpretation rules

Check each interpreted coefficient against the matching rule. Quote the person's sentence and the corrected version when they differ.

## Logs

| Outcome | Regressor | Reading of coefficient b |
|---|---|---|
| level Y | level X | one-unit rise in X goes with a b-unit change in Y |
| log Y | level X | one-unit rise in X goes with roughly 100*b percent change in Y; exactly 100*(exp(b) - 1) percent |
| level Y | log X | 1 percent rise in X goes with a b/100 unit change in Y |
| log Y | log X | elasticity: 1 percent rise in X goes with b percent change in Y |

The "100*b percent" shortcut is only close for small b (roughly |b| < 0.1). At b = 0.30 the exact figure is 35 percent, not 30. Flag any large log coefficient read with the shortcut.

A difference in logs is in **log points**. "0.25 log points" is correct; "25 percent" is an approximation (exactly 28 percent).

## Dummy variables

- The coefficient is a comparison with the **omitted reference category**, never with "everyone else" or "the average." Check that the reference category is stated and that the sentence compares against it.
- In a log-outcome model, a dummy coefficient b means a 100*(exp(b) - 1) percent difference. For negative b the shortcut overstates the drop: b = -0.40 is a 33 percent difference, not 40.
- A full set of dummies plus an intercept is perfectly collinear; if software dropped one, identify which, since that determines the reading.

## Interactions

With `Y = a + b1*X + b2*D + b3*X*D`:

- b1 is the effect of X **when D = 0**, not the "main" or "average" effect of X.
- b2 is the effect of D **when X = 0**. If X = 0 is outside the data (age, years of schooling), b2 alone has no useful reading - suggest centering X.
- The effect of X when D = 1 is b1 + b3; its standard error is not b3's standard error.
- A common error: calling b1 insignificant and concluding "X does not matter," when b1 + b3 is large.

## Polynomials

With `b1*X + b2*X^2`: the marginal effect is b1 + 2*b2*X, so it varies with X and must be reported at stated values. The turning point is at X = -b1 / (2*b2); check whether it falls inside the range of the data before describing a "peak."

## Binary outcomes

- Linear probability model: coefficients are changes in probability, in **percentage points** (b = 0.05 is 5 percentage points, not 5 percent).
- Logit / probit: raw coefficients are not probability changes. Look for marginal effects or odds ratios, and check the text does not read a logit coefficient as a probability.
- An odds ratio of 1.5 means 50 percent higher odds, not 50 percent higher probability.

## Percent vs. percentage points

A move from 10 percent to 12 percent is 2 percentage points and a 20 percent increase. Flag any sentence that uses one where the other is meant.

## Standardized coefficients and "importance"

A larger coefficient does not mean a more important variable unless units are comparable. Comparing a per-year schooling coefficient with a dummy coefficient says nothing about relative importance.

## Ceteris paribus

"Holding other variables constant" only covers the variables in the model. If the sentence implies everything else is held fixed, note what is not.
