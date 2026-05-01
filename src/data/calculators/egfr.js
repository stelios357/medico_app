// CKD-EPI 2021 creatinine equation (race-free)
export default {
  slug: 'egfr-ckd-epi',
  name: 'eGFR — CKD-EPI (2021)',
  specialty: 'nephrology',
  version: 'CKD-EPI 2021 (race-neutral)',
  description: 'Estimates glomerular filtration rate using the 2021 race-free CKD-EPI creatinine equation to stage chronic kidney disease.',
  references: [
    'Inker LA, et al. New Creatinine- and Cystatin C–Based Equations to Estimate GFR without Race. N Engl J Med. 2021;385(19):1737–1749.',
    'KDIGO 2012 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease.',
  ],
  inputs: [
    {
      id: 'creatinineUnit',
      label: 'Creatinine Unit',
      type: 'select',
      default: 0,
      options: [
        { value: 0, label: 'mg/dL' },
        { value: 1, label: 'µmol/L' },
      ],
    },
    { id: 'creatinine', label: 'Serum Creatinine', type: 'number', min: 0.1, max: 2700, required: true },
    { id: 'age',        label: 'Age',              type: 'number', unit: 'years', min: 18, max: 120, required: true },
    {
      id: 'sex',
      label: 'Biological Sex',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: 'Male' },
        { value: 1, label: 'Female' },
      ],
    },
  ],
  calculate({ creatinineUnit, creatinine, age, sex }) {
    const creatMgDl = creatinineUnit === 1 ? creatinine / 88.4 : creatinine;
    if (creatMgDl < 0.1 || creatMgDl > 30) return null;
    const isFemale = sex === 1;
    const kappa = isFemale ? 0.7 : 0.9;
    const alpha = isFemale ? -0.241 : -0.302;
    const ratio = creatMgDl / kappa;
    const egfr =
      142 *
      Math.pow(Math.min(ratio, 1), alpha) *
      Math.pow(Math.max(ratio, 1), -1.200) *
      Math.pow(0.9938, age) *
      (isFemale ? 1.012 : 1);
    const result = Math.round(egfr);
    let interpretation, risk;
    if (egfr >= 90) {
      interpretation = `G1 — Normal or high eGFR (${result} mL/min/1.73m²)`;
      risk = 'low';
    } else if (egfr >= 60) {
      interpretation = `G2 — Mildly decreased (${result} mL/min/1.73m²)`;
      risk = 'low';
    } else if (egfr >= 45) {
      interpretation = `G3a — Mildly to moderately decreased (${result} mL/min/1.73m²)`;
      risk = 'moderate';
    } else if (egfr >= 30) {
      interpretation = `G3b — Moderately to severely decreased (${result} mL/min/1.73m²)`;
      risk = 'moderate';
    } else if (egfr >= 15) {
      interpretation = `G4 — Severely decreased (${result} mL/min/1.73m²) — nephrology referral indicated`;
      risk = 'high';
    } else {
      interpretation = `G5 — Kidney failure (${result} mL/min/1.73m²) — renal replacement therapy evaluation`;
      risk = 'high';
    }
    return { result, unit: 'mL/min/1.73m²', interpretation, risk };
  },
};
