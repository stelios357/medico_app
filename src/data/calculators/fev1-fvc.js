// GOLD 2023 spirometry classification
export default {
  slug: 'fev1-fvc',
  name: 'FEV₁/FVC Ratio — Spirometry Interpretation',
  specialty: 'pulmonology',
  description: 'Interprets spirometry results using the GOLD classification. Identifies obstructive vs. potentially restrictive patterns and grades obstruction severity by FEV₁ % predicted.',
  references: [
    'Global Initiative for Chronic Obstructive Lung Disease (GOLD). 2023 Report. goldcopd.org.',
    'Pellegrino R, et al. Interpretative strategies for lung function tests. Eur Respir J. 2005;26(5):948–968.',
  ],
  inputs: [
    { id: 'fev1',      label: 'FEV₁ (measured)',           type: 'number', unit: 'L',   min: 0.1, max: 10,  required: true },
    { id: 'fvc',       label: 'FVC (measured)',             type: 'number', unit: 'L',   min: 0.1, max: 12,  required: true },
    { id: 'fev1Pct',   label: 'FEV₁ % Predicted',          type: 'number', unit: '%',   min: 1,   max: 150, required: true },
  ],
  calculate({ fev1, fvc, fev1Pct }) {
    if (fvc === 0) return null;
    const ratio = fev1 / fvc;
    const ratioRounded = Math.round(ratio * 1000) / 10; // as percentage, 1 dp

    let interpretation, risk;
    if (ratio < 0.70) {
      // Obstructive pattern — classify by FEV1% predicted (GOLD severity)
      let grade, gradeDetail;
      if (fev1Pct >= 80) {
        grade = 'GOLD 1 — Mild obstruction';
        gradeDetail = 'Typically symptomatic; spirometry essential for diagnosis; lifestyle and bronchodilator therapy';
        risk = 'low';
      } else if (fev1Pct >= 50) {
        grade = 'GOLD 2 — Moderate obstruction';
        gradeDetail = 'Increasing breathlessness; regular bronchodilator therapy; assess for ICS if frequent exacerbations';
        risk = 'moderate';
      } else if (fev1Pct >= 30) {
        grade = 'GOLD 3 — Severe obstruction';
        gradeDetail = 'Further worsening; exacerbations impact quality of life; pulmonology referral indicated';
        risk = 'high';
      } else {
        grade = 'GOLD 4 — Very severe obstruction';
        gradeDetail = 'Chronic respiratory failure possible; lung volume reduction or transplant evaluation as appropriate';
        risk = 'high';
      }
      interpretation = `FEV₁/FVC ${ratioRounded}% (<70%) — Obstructive pattern confirmed. ${grade} (FEV₁ ${Math.round(fev1Pct)}% predicted). ${gradeDetail}.`;
    } else {
      // No obstruction
      risk = 'low';
      if (fev1Pct < 80) {
        interpretation = `FEV₁/FVC ${ratioRounded}% (≥70%) — No obstructive pattern. Reduced FEV₁ (${Math.round(fev1Pct)}% predicted) with normal ratio may suggest a restrictive pattern — full PFT with lung volumes (TLC, RV) required to confirm restriction.`;
        risk = 'moderate';
      } else {
        interpretation = `FEV₁/FVC ${ratioRounded}% (≥70%) — Normal spirometry; no obstructive or likely restrictive pattern identified. Consider alternative diagnosis if symptomatic.`;
      }
    }

    return { result: ratioRounded, unit: '%', interpretation, risk };
  },
};
