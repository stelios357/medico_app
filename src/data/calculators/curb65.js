export default {
  slug: 'curb65',
  name: 'CURB-65 Score',
  specialty: 'pulmonology',
  description: 'Predicts 30-day mortality in community-acquired pneumonia to guide inpatient vs outpatient management.',
  references: [
    'Lim WS, et al. Defining community acquired pneumonia severity on presentation to hospital: an international derivation and validation study. Thorax. 2003;58(5):377–382.',
    'BTS guidelines for the management of community acquired pneumonia in adults. Thorax. 2009;64(Suppl 3):iii1–iii55.',
  ],
  inputs: [
    { id: 'confusion',      label: 'Confusion (new disorientation to person, place, or time)', type: 'checkbox' },
    { id: 'urea',           label: 'Blood urea nitrogen > 19 mg/dL (urea > 7 mmol/L)',         type: 'checkbox' },
    { id: 'resp_rate',      label: 'Respiratory rate ≥ 30 breaths/min',                         type: 'checkbox' },
    { id: 'bp_low',         label: 'Low BP (SBP < 90 mmHg or DBP ≤ 60 mmHg)',                  type: 'checkbox' },
    { id: 'age_65',         label: 'Age ≥ 65 years',                                            type: 'checkbox' },
  ],
  calculate({ confusion, urea, resp_rate, bp_low, age_65 }) {
    const score = confusion + urea + resp_rate + bp_low + age_65;
    let interpretation, risk;
    if (score <= 1) {
      interpretation = `Score ${score} — Low severity (~5% 30-day mortality); outpatient treatment appropriate`;
      risk = 'low';
    } else if (score === 2) {
      interpretation = `Score ${score} — Moderate severity (~12% 30-day mortality); consider inpatient admission`;
      risk = 'moderate';
    } else {
      interpretation = `Score ${score} — High severity (~22–40% 30-day mortality); inpatient admission; consider ICU if score 4–5`;
      risk = 'high';
    }
    return { result: score, unit: 'points', interpretation, risk };
  },
};
