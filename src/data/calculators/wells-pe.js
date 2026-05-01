// Points are multiplied in calculate() because checkboxes coerce to 0/1
export default {
  slug: 'wells-pe',
  name: 'Wells Criteria for PE',
  specialty: 'emergency',
  description: 'Pre-test probability scoring for pulmonary embolism to guide CT-PA and D-dimer decision-making.',
  references: [
    'Wells PS, et al. Derivation of a simple clinical model to categorize patients probability of pulmonary embolism. Thromb Haemost. 2000;83(3):416–420.',
    'van Belle A, et al. Effectiveness of managing suspected pulmonary embolism using an algorithm combining clinical probability, D-dimer testing, and computed tomography. JAMA. 2006;295(2):172–179.',
  ],
  inputs: [
    { id: 'dvt_signs',      label: 'Clinical signs and symptoms of DVT (+3 pts)',                                               type: 'checkbox' },
    { id: 'pe_likely',      label: 'PE is the #1 diagnosis or equally likely (+3 pts)',                                         type: 'checkbox' },
    { id: 'hr_gt100',       label: 'Heart rate > 100 bpm (+1.5 pts)',                                                           type: 'checkbox' },
    { id: 'immobilisation', label: 'Immobilisation > 3 days or surgery in previous 4 weeks (+1.5 pts)',                         type: 'checkbox' },
    { id: 'prior_dvtpe',    label: 'Previous DVT or PE (+1.5 pts)',                                                             type: 'checkbox' },
    { id: 'haemoptysis',    label: 'Haemoptysis (+1 pt)',                                                                       type: 'checkbox' },
    { id: 'malignancy',     label: 'Active malignancy (treatment within 6 months or palliative) (+1 pt)',                       type: 'checkbox' },
  ],
  calculate({ dvt_signs, pe_likely, hr_gt100, immobilisation, prior_dvtpe, haemoptysis, malignancy }) {
    const score = dvt_signs * 3 + pe_likely * 3 + hr_gt100 * 1.5 + immobilisation * 1.5 + prior_dvtpe * 1.5 + haemoptysis + malignancy;
    const display = score % 1 === 0 ? score : score.toFixed(1);
    let interpretation, risk;
    if (score < 2) {
      interpretation = `Score ${display} — Low probability (~3.6%); if PERC criteria met and D-dimer negative, PE excluded`;
      risk = 'low';
    } else if (score <= 6) {
      interpretation = `Score ${display} — Moderate probability (~20.5%); D-dimer or CT pulmonary angiography indicated`;
      risk = 'moderate';
    } else {
      interpretation = `Score ${display} — High probability (~66.7%); proceed directly to CT-PA; anticoagulate empirically if delay anticipated`;
      risk = 'high';
    }
    return { result: display, unit: 'points', interpretation, risk };
  },
};
