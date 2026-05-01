export default {
  slug: 'aa-gradient',
  name: 'Alveolar-Arterial (A-a) Gradient',
  specialty: 'pulmonology',
  description: 'Calculates the alveolar-arterial oxygen gradient from ABG values to assess the degree of intrapulmonary shunt, V/Q mismatch, or diffusion impairment.',
  references: [
    'Malley WJ. Clinical Blood Gases: Assessment and Intervention. 2nd ed. Saunders; 2005.',
    'Stauffer JL. Pulmonary Diseases & Disorders. In: Tierney LM, et al. Current Medical Diagnosis & Treatment. McGraw-Hill; 2006.',
  ],
  inputs: [
    {
      id: 'fio2',
      label: 'FiO₂ (fraction of inspired oxygen)',
      type: 'select',
      required: true,
      default: 0,
      options: [
        { value: 0,    label: 'Room air — 21% (0.21)' },
        { value: 0.28, label: '2 L/min nasal cannula — ~28%' },
        { value: 0.36, label: '4 L/min nasal cannula — ~36%' },
        { value: 0.44, label: '6 L/min nasal cannula — ~44%' },
        { value: 0.60, label: 'Simple face mask — ~60%' },
        { value: 1.0,  label: '100% non-rebreather mask' },
      ],
    },
    { id: 'paco2', label: 'PaCO₂ (arterial)', type: 'number', unit: 'mmHg', min: 10, max: 100, required: true },
    { id: 'pao2',  label: 'PaO₂ (arterial)',  type: 'number', unit: 'mmHg', min: 20, max: 600, required: true },
    { id: 'age',   label: 'Age',               type: 'number', unit: 'years', min: 1, max: 120, required: true },
  ],
  calculate({ fio2, paco2, pao2, age }) {
    // fio2 select: value 0 means room air (0.21); other values are the actual fraction
    const fi = fio2 === 0 ? 0.21 : fio2;
    // Alveolar gas equation at sea level (Patm 760, PH2O 47, RQ 0.8)
    const pAO2 = fi * 713 - paco2 / 0.8;
    const gradient = pAO2 - pao2;
    const rounded = Math.round(gradient * 10) / 10;

    // Normal A-a gradient (room air): (age / 4) + 4 mmHg (range 2.5–16 in adults)
    const normalGradient = Math.round(age / 4 + 4);

    let interpretation, risk;
    if (gradient <= normalGradient) {
      interpretation = `A-a gradient ${rounded} mmHg (expected ≤${normalGradient} mmHg for age ${age}) — Normal; hypoxemia, if present, is due to hypoventilation rather than a gas-exchange defect`;
      risk = 'low';
    } else if (gradient < 25) {
      interpretation = `A-a gradient ${rounded} mmHg (expected ≤${normalGradient} mmHg) — Mildly elevated; early V/Q mismatch possible; correlate clinically`;
      risk = 'moderate';
    } else {
      interpretation = `A-a gradient ${rounded} mmHg (expected ≤${normalGradient} mmHg) — Significantly elevated; consider V/Q mismatch (PE, COPD, pneumonia), intracardiac or intrapulmonary shunt, or diffusion impairment (ILD)`;
      risk = 'high';
    }

    return { result: rounded, unit: 'mmHg', interpretation, risk };
  },
};
