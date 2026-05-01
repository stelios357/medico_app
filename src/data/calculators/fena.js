export default {
  slug: 'fena',
  name: 'FENa — Fractional Excretion of Sodium',
  specialty: 'nephrology',
  description: 'Differentiates pre-renal azotemia from intrinsic renal failure (ATN) in the setting of oliguria and elevated creatinine.',
  references: [
    'Miller TR, et al. Urinary diagnostic indices in acute renal failure: a prospective study. Ann Intern Med. 1978;89(1):47–50.',
    'Espinel CH. The FENa test: use in the differential diagnosis of acute renal failure. JAMA. 1976;236(6):579–581.',
  ],
  inputs: [
    { id: 'uNa',   label: 'Urine Sodium',    type: 'number', unit: 'mEq/L', min: 1,   max: 300, required: true },
    { id: 'sNa',   label: 'Serum Sodium',    type: 'number', unit: 'mEq/L', min: 100, max: 170, required: true },
    { id: 'uCr',   label: 'Urine Creatinine', type: 'number', unit: 'mg/dL', min: 1,  max: 1000, required: true },
    { id: 'sCr',   label: 'Serum Creatinine', type: 'number', unit: 'mg/dL', min: 0.1, max: 30, required: true },
  ],
  calculate({ uNa, sNa, uCr, sCr }) {
    if (sNa === 0 || uCr === 0) return null;
    const fena = (uNa * sCr) / (sNa * uCr) * 100;
    const rounded = Math.round(fena * 100) / 100;

    let interpretation, risk;
    if (fena < 1) {
      interpretation = `FENa ${rounded}% — Pre-renal (tubular sodium avidity intact); consider volume depletion, low-output cardiac failure, or hepatorenal syndrome. Note: FENa may be <1% in contrast nephropathy, myoglobinuria, or early obstruction.`;
      risk = 'low';
    } else if (fena <= 2) {
      interpretation = `FENa ${rounded}% — Indeterminate; correlate with clinical context. Consider diuretic use, which can falsely elevate FENa even in pre-renal states.`;
      risk = 'moderate';
    } else {
      interpretation = `FENa ${rounded}% — Intrinsic renal failure (acute tubular necrosis) or post-renal obstruction; tubular sodium reabsorption impaired.`;
      risk = 'high';
    }

    return { result: rounded, unit: '%', interpretation, risk };
  },
};
