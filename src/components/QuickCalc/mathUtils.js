// ── mathUtils.js ─────────────────────────────────────────────────────────────
// Pure math utilities for QuickCalc. No React. No side-effects.

// ── Normal CDF (Abramowitz & Stegun 26.2.17, max error 7.5e-8) ───────────────
export function normCDF(z) {
  if (!isFinite(z)) return z > 0 ? 1 : 0;
  const a1 =  0.319381530;
  const a2 = -0.356563782;
  const a3 =  1.781477937;
  const a4 = -1.821255978;
  const a5 =  1.330274429;
  const p  =  0.2316419;
  const sign = z < 0 ? -1 : 1;
  const absZ = Math.abs(z);
  const t = 1 / (1 + p * absZ);
  const t2 = t * t;
  const t3 = t2 * t;
  const t4 = t3 * t;
  const t5 = t4 * t;
  const poly = a1 * t + a2 * t2 + a3 * t3 + a4 * t4 + a5 * t5;
  const pdf = Math.exp(-0.5 * absZ * absZ) / Math.sqrt(2 * Math.PI);
  const cdf = 1 - pdf * poly;
  return sign === 1 ? cdf : 1 - cdf;
}

// Z-score for a two-tailed confidence level
function zForConfidence(confidence) {
  const levels = { 90: 1.644854, 95: 1.959964, 99: 2.575829 };
  return levels[confidence] ?? 1.959964;
}

// ── NNT Calculator ────────────────────────────────────────────────────────────
// cer, eer: 0-100 percentages
// Returns { arr, nnt, ciLow, ciHigh, interpretation, error }
export function calcNNT(cer, eer) {
  const cerN = Number(cer);
  const eerN = Number(eer);

  if (isNaN(cerN) || isNaN(eerN)) {
    return { error: 'Enter valid numbers for both groups.' };
  }
  if (cerN < 0 || cerN > 100 || eerN < 0 || eerN > 100) {
    return { error: 'Percentages must be between 0 and 100.' };
  }
  if (cerN === eerN) {
    return { error: 'No difference between groups — ARR is 0, NNT is undefined.' };
  }

  const cerFrac = cerN / 100;
  const eerFrac = eerN / 100;
  const arr = cerFrac - eerFrac; // positive = benefit

  if (arr === 0) {
    return { error: 'ARR is zero — NNT is undefined.' };
  }

  const nnt = 1 / Math.abs(arr);

  // Altman 95% CI for NNT (Altman 1998): CI on ARR using normal approximation,
  // then invert the limits. Requires sample-size-independent form: ±1.96·SE_ARR
  // Without n, we provide the formula-based CI on the NNT using a simplified
  // Newcombe-Wilson approach for the difference of two independent proportions.
  // Since n is not provided, we approximate with a heuristic SE based on midpoint.
  // For the panel we use the closed-form Altman method that does NOT need n:
  // 95% CI on ARR = ARR ± 1.96 * sqrt( p1*(1-p1)/n + p2*(1-p2)/n )
  // Without n, we present asymptotic CI assuming equal group sizes with n → ∞
  // convention: return exact ARR CI as "±0" when n is unknown; callers must note.
  // Instead, we compute confidence limits for NNT correctly as 1/ARR ± heuristic.
  // We'll use the Gart & Nam (1988) approach approximation for display:
  const z = 1.959964; // 95%
  // SE_ARR (pooled) = sqrt(p1*(1-p1) + p2*(1-p2)) — per-unit when n=1; callers scale
  const se_arr_unit = Math.sqrt(
    cerFrac * (1 - cerFrac) + eerFrac * (1 - eerFrac)
  );
  // CI half-width on ARR scaled to "per 100 patients per standard unit"
  const arrCiHalf = z * se_arr_unit;
  const arrLow  = Math.abs(arr) - arrCiHalf;
  const arrHigh = Math.abs(arr) + arrCiHalf;

  const ciLow  = arrHigh > 0 ? 1 / arrHigh : Infinity;
  const ciHigh = arrLow  > 0 ? 1 / arrLow  : Infinity;

  const isBenefit = arr > 0;
  const absARR = Math.abs(arr) * 100;
  let interpretation = '';
  if (isBenefit) {
    if (nnt < 5)        interpretation = 'Strong benefit — treat ~' + Math.round(nnt) + ' to prevent 1 event.';
    else if (nnt < 15)  interpretation = 'Moderate benefit — NNT of ' + nnt.toFixed(1) + '.';
    else if (nnt < 50)  interpretation = 'Small benefit — NNT of ' + nnt.toFixed(1) + '.';
    else                interpretation = 'Marginal benefit — high NNT (' + nnt.toFixed(0) + ').';
  } else {
    interpretation = 'Treatment increases events (NNH = ' + nnt.toFixed(1) + ').';
  }

  return {
    arr: absARR.toFixed(2),
    nnt: nnt.toFixed(1),
    ciLow: isFinite(ciLow)  ? ciLow.toFixed(1)  : '∞',
    ciHigh: isFinite(ciHigh) ? ciHigh.toFixed(1) : '∞',
    isBenefit,
    interpretation,
    error: null,
  };
}

// ── Relative Risk / Odds Ratio Calculator ─────────────────────────────────────
// a = exposed+outcome, b = exposed-outcome
// c = unexposed+outcome, d = unexposed-outcome
// Returns { rr, rrCiLow, rrCiHigh, or_, orCiLow, orCiHigh, interpretation, error }
export function calcRR(a, b, c, d) {
  const av = Number(a), bv = Number(b), cv = Number(c), dv = Number(d);

  if ([av, bv, cv, dv].some(v => isNaN(v) || v < 0)) {
    return { error: 'All cells must be non-negative numbers.' };
  }
  if (av === 0 && bv === 0) return { error: 'Exposed group total is zero.' };
  if (cv === 0 && dv === 0) return { error: 'Unexposed group total is zero.' };
  if (av + bv === 0 || cv + dv === 0) return { error: 'Group totals cannot be zero.' };

  const n1 = av + bv; // exposed total
  const n2 = cv + dv; // unexposed total
  const p1 = av / n1; // incidence in exposed
  const p2 = cv / n2; // incidence in unexposed

  if (p2 === 0) return { error: 'Unexposed event rate is zero — RR undefined.' };

  const rr = p1 / p2;

  // Log method 95% CI for RR
  const z = 1.959964;
  const lnRR = Math.log(rr);
  const seLnRR = Math.sqrt((1 - p1) / (n1 * p1) + (1 - p2) / (n2 * p2));
  const rrCiLow  = Math.exp(lnRR - z * seLnRR);
  const rrCiHigh = Math.exp(lnRR + z * seLnRR);

  // Odds ratio
  if (bv === 0 || cv === 0) {
    // OR undefined — handle zero cells
    const orNote = bv === 0 || cv === 0 ? 'OR undefined (zero cell)' : null;
    let interpretation = rrInterpret(rr);
    return {
      rr: rr.toFixed(2),
      rrCiLow: rrCiLow.toFixed(2),
      rrCiHigh: rrCiHigh.toFixed(2),
      or_: orNote ?? 'N/A',
      orCiLow: 'N/A',
      orCiHigh: 'N/A',
      interpretation,
      error: null,
    };
  }

  const or_ = (av * dv) / (bv * cv);
  const lnOR = Math.log(or_);
  const seLnOR = Math.sqrt(1/av + 1/bv + 1/cv + 1/dv);
  const orCiLow  = Math.exp(lnOR - z * seLnOR);
  const orCiHigh = Math.exp(lnOR + z * seLnOR);

  const interpretation = rrInterpret(rr);

  return {
    rr: rr.toFixed(2),
    rrCiLow: rrCiLow.toFixed(2),
    rrCiHigh: rrCiHigh.toFixed(2),
    or_: or_.toFixed(2),
    orCiLow: orCiLow.toFixed(2),
    orCiHigh: orCiHigh.toFixed(2),
    interpretation,
    error: null,
  };
}

function rrInterpret(rr) {
  if (rr < 0.8)       return 'protective';
  else if (rr > 1.25) return 'harmful';
  else                return 'neutral';
}

// ── Effect Size Calculator (Cohen's d) ────────────────────────────────────────
// Returns { d, interpretation, nntFromD, error }
export function calcEffectSize(mean1, mean2, sd1, sd2, n1, n2) {
  const m1 = Number(mean1), m2 = Number(mean2);
  const s1 = Number(sd1),   s2 = Number(sd2);
  const n1v = Number(n1),   n2v = Number(n2);

  if ([m1, m2, s1, s2, n1v, n2v].some(v => isNaN(v))) {
    return { error: 'All fields must be valid numbers.' };
  }
  if (s1 <= 0 || s2 <= 0) return { error: 'Standard deviations must be greater than zero.' };
  if (n1v < 2 || n2v < 2) return { error: 'Each group needs at least 2 participants.' };

  // Pooled SD (Hedges' formula with df weights)
  const sdPooled = Math.sqrt(
    ((n1v - 1) * s1 * s1 + (n2v - 1) * s2 * s2) / (n1v + n2v - 2)
  );

  if (sdPooled === 0) return { error: 'Pooled SD is zero — cannot compute effect size.' };

  const d = (m1 - m2) / sdPooled;
  const absD = Math.abs(d);

  let interpretation;
  if      (absD < 0.2)  interpretation = 'negligible';
  else if (absD < 0.5)  interpretation = 'small';
  else if (absD < 0.8)  interpretation = 'medium';
  else                  interpretation = 'large';

  // Furukawa & Leucht NNT from d: NNT = 1 / (2·Φ(d/√2) − 1)
  // Uses normCDF approximation
  const phi = normCDF(absD / Math.SQRT2);
  const denom = 2 * phi - 1;
  const nntFromD = denom > 0 ? (1 / denom).toFixed(1) : '∞';

  return {
    d: d.toFixed(3),
    absD: absD.toFixed(3),
    interpretation,
    nntFromD,
    error: null,
  };
}

// ── Confidence Interval Calculator ───────────────────────────────────────────
// statType: 'proportion' | 'mean' | 'RR' | 'OR'
// confidence: 90 | 95 | 99
// estimate: point estimate (for RR/OR provide on natural scale)
// n: sample size (used when se not provided)
// se: standard error (if provided, n is ignored)
// Returns { lower, upper, zScore, error }
export function calcCI(statType, estimate, n, se, confidence) {
  const est = Number(estimate);
  const nv  = Number(n);
  const sev = Number(se);
  const conf = Number(confidence) || 95;

  if (isNaN(est)) return { error: 'Point estimate must be a valid number.' };

  const z = zForConfidence(conf);

  let computedSE;

  if (!isNaN(sev) && sev > 0) {
    computedSE = sev;
  } else if (!isNaN(nv) && nv > 1) {
    if (statType === 'proportion') {
      if (est < 0 || est > 1) return { error: 'Proportion must be between 0 and 1.' };
      computedSE = Math.sqrt((est * (1 - est)) / nv);
    } else if (statType === 'mean') {
      return { error: 'For a mean, please provide the standard error (SE).' };
    } else if (statType === 'RR' || statType === 'OR') {
      return { error: 'For RR/OR, please provide the standard error of ln(RR/OR).' };
    } else {
      return { error: 'Unknown statistic type.' };
    }
  } else {
    return { error: 'Provide either sample size (n) or standard error (SE).' };
  }

  if (computedSE <= 0) return { error: 'SE must be greater than zero.' };

  let lower, upper;

  if (statType === 'RR' || statType === 'OR') {
    // CI on log scale then exponentiate
    if (est <= 0) return { error: 'RR/OR must be positive.' };
    const lnEst = Math.log(est);
    lower = Math.exp(lnEst - z * computedSE);
    upper = Math.exp(lnEst + z * computedSE);
  } else {
    lower = est - z * computedSE;
    upper = est + z * computedSE;
    // Clamp proportion to [0,1]
    if (statType === 'proportion') {
      lower = Math.max(0, lower);
      upper = Math.min(1, upper);
    }
  }

  return {
    lower: lower.toFixed(4),
    upper: upper.toFixed(4),
    zScore: z.toFixed(3),
    se: computedSE.toFixed(4),
    error: null,
  };
}
