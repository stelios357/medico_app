// Cockcroft-Gault equation
export default {
  slug: 'creatinine-clearance',
  name: 'Creatinine Clearance (Cockcroft-Gault)',
  specialty: 'nephrology',
  description: 'Estimates creatinine clearance to guide drug dosing in renal impairment using the Cockcroft-Gault equation.',
  references: [
    'Cockcroft DW, Gault MH. Prediction of creatinine clearance from serum creatinine. Nephron. 1976;16(1):31–41.',
    'Levey AS, et al. A more accurate method to estimate glomerular filtration rate from serum creatinine. Ann Intern Med. 1999;130(6):461–470.',
  ],
  inputs: [
    { id: 'age',        label: 'Age',              type: 'number', unit: 'years', min: 18,  max: 120 },
    { id: 'weight',     label: 'Weight',           type: 'number', unit: 'kg',    min: 1,   max: 300 },
    { id: 'creatinine', label: 'Serum Creatinine', type: 'number', unit: 'mg/dL', min: 0.1, max: 30  },
    {
      id: 'sex',
      label: 'Biological Sex',
      type: 'select',
      options: [
        { value: 0, label: 'Male' },
        { value: 1, label: 'Female' },
      ],
    },
  ],
  calculate({ age, weight, creatinine, sex }) {
    const isFemale = sex === 1;
    const crcl = ((140 - age) * weight) / (72 * creatinine) * (isFemale ? 0.85 : 1);
    const result = Math.round(crcl);
    let interpretation, risk;
    if (crcl >= 90) {
      interpretation = 'Normal renal function — standard dosing applies';
      risk = 'low';
    } else if (crcl >= 60) {
      interpretation = 'Mildly reduced — monitor renally-cleared drugs';
      risk = 'low';
    } else if (crcl >= 30) {
      interpretation = 'Moderately reduced — dose adjustment required for many drugs';
      risk = 'moderate';
    } else if (crcl >= 15) {
      interpretation = 'Severely reduced — significant dose reductions required; nephrology input advised';
      risk = 'high';
    } else {
      interpretation = 'Kidney failure — avoid renally-cleared drugs; consider renal replacement therapy';
      risk = 'high';
    }
    return { result, unit: 'mL/min', interpretation, risk };
  },
};
