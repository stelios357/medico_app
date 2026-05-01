export default {
  slug: 'qsofa',
  name: 'qSOFA Score',
  specialty: 'emergency',
  description: 'Rapid bedside screening for sepsis in patients outside the ICU. Two or more criteria indicate higher risk of adverse outcomes.',
  references: [
    'Seymour CW, et al. Assessment of Clinical Criteria for Sepsis: For the Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3). JAMA. 2016;315(8):762–774.',
    'Singer M, et al. The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3). JAMA. 2016;315(8):801–810.',
  ],
  inputs: [
    { id: 'altered_mentation', label: 'Altered mentation (GCS < 15 or new confusion)',       type: 'checkbox' },
    { id: 'resp_rate',         label: 'Respiratory rate ≥ 22 breaths/min',                   type: 'checkbox' },
    { id: 'sbp_low',           label: 'Systolic blood pressure ≤ 100 mmHg',                  type: 'checkbox' },
  ],
  calculate({ altered_mentation, resp_rate, sbp_low }) {
    const score = altered_mentation + resp_rate + sbp_low;
    let interpretation, risk;
    if (score < 2) {
      interpretation = `Score ${score} — Low risk; routine monitoring; reassess if clinical concern`;
      risk = 'low';
    } else {
      interpretation = `Score ${score} — Higher risk of sepsis-related adverse outcomes; assess for organ dysfunction (full SOFA score), blood cultures, early antibiotics`;
      risk = 'high';
    }
    return { result: score, unit: 'points', interpretation, risk };
  },
};
