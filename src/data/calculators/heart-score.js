export default {
  slug: 'heart-score',
  name: 'HEART Score',
  specialty: 'cardiology',
  description: 'Chest pain risk stratification tool predicting major adverse cardiac events (MACE) to guide admission and early discharge decisions.',
  references: [
    'Six AJ, et al. The HEART score for the assessment of patients with chest pain in the emergency department. Neth Heart J. 2008;16(6):191–196.',
    'Backus BE, et al. A prospective validation of the HEART score for chest pain patients at the emergency department. Int J Cardiol. 2013;168(3):2153–2158.',
  ],
  inputs: [
    {
      id: 'history',
      label: 'History',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — Slightly suspicious (non-specific history)' },
        { value: 1, label: '1 — Moderately suspicious (some typical features)' },
        { value: 2, label: '2 — Highly suspicious (typical crushing/pressure, radiation, diaphoresis)' },
      ],
    },
    {
      id: 'ecg',
      label: 'ECG',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — Normal' },
        { value: 1, label: '1 — Non-specific repolarization disturbance / LBBB / LVH / pacing' },
        { value: 2, label: '2 — Significant ST depression' },
      ],
    },
    {
      id: 'age',
      label: 'Age',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — < 45 years' },
        { value: 1, label: '1 — 45–64 years' },
        { value: 2, label: '2 — ≥ 65 years' },
      ],
    },
    {
      id: 'risk_factors',
      label: 'Risk Factors',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — No known risk factors' },
        { value: 1, label: '1 — 1–2 risk factors (HTN, hypercholesterolaemia, DM, obesity, smoking, family history)' },
        { value: 2, label: '2 — ≥ 3 risk factors OR history of atherosclerotic disease' },
      ],
    },
    {
      id: 'troponin',
      label: 'Troponin',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — ≤ Normal limit' },
        { value: 1, label: '1 — 1–3× normal limit' },
        { value: 2, label: '2 — > 3× normal limit' },
      ],
    },
  ],
  calculate({ history, ecg, age, risk_factors, troponin }) {
    const components = [
      { label: 'History',       points: history },
      { label: 'ECG',           points: ecg },
      { label: 'Age',           points: age },
      { label: 'Risk factors',  points: risk_factors },
      { label: 'Troponin',      points: troponin },
    ];
    const score = components.reduce((s, c) => s + c.points, 0);
    let interpretation, risk;
    if (score <= 3) {
      interpretation = `Score ${score}/10 — Low risk (~1.7% MACE); safe for early discharge with outpatient follow-up`;
      risk = 'low';
    } else if (score <= 6) {
      interpretation = `Score ${score}/10 — Moderate risk (~12% MACE); inpatient observation and serial troponins recommended`;
      risk = 'moderate';
    } else {
      interpretation = `Score ${score}/10 — High risk (~65% MACE); early invasive strategy (cardiology consult, consider angiography)`;
      risk = 'high';
    }
    return { result: score, unit: '/ 10', interpretation, risk, breakdown: components };
  },
};
