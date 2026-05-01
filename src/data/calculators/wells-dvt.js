export default {
  slug: 'wells-dvt',
  name: 'Wells Criteria for DVT',
  specialty: 'emergency',
  description: 'Pre-test probability scoring for deep vein thrombosis to guide D-dimer testing and imaging decisions.',
  references: [
    'Wells PS, et al. Evaluation of D-dimer in the diagnosis of suspected deep-vein thrombosis. N Engl J Med. 2003;349(13):1227–1235.',
    'Oudega R, et al. Accuracy of a diagnostic protocol in suspected deep vein thrombosis in primary care. Br J Gen Pract. 2006;56(530):801–804.',
  ],
  inputs: [
    { id: 'cancer',          label: 'Active cancer (treatment ongoing, within 6 months, or palliative)',           type: 'checkbox' },
    { id: 'paralysis',       label: 'Paralysis, paresis, or recent cast immobilisation of lower extremity',        type: 'checkbox' },
    { id: 'bedridden',       label: 'Bedridden > 3 days or major surgery within 12 weeks requiring anaesthesia',  type: 'checkbox' },
    { id: 'tenderness',      label: 'Localised tenderness along deep venous system',                               type: 'checkbox' },
    { id: 'entire_leg',      label: 'Entire leg swollen',                                                          type: 'checkbox' },
    { id: 'calf_swelling',   label: 'Calf swelling > 3 cm compared with asymptomatic leg',                        type: 'checkbox' },
    { id: 'pitting_oedema',  label: 'Pitting oedema confined to symptomatic leg',                                 type: 'checkbox' },
    { id: 'collateral_veins',label: 'Collateral superficial veins (non-varicose)',                                 type: 'checkbox' },
    { id: 'prior_dvt',       label: 'Previously documented DVT',                                                   type: 'checkbox' },
    { id: 'alt_diagnosis',   label: 'Alternative diagnosis at least as likely as DVT (−2 pts)',                    type: 'checkbox' },
  ],
  calculate({ cancer, paralysis, bedridden, tenderness, entire_leg, calf_swelling, pitting_oedema, collateral_veins, prior_dvt, alt_diagnosis }) {
    const score = cancer + paralysis + bedridden + tenderness + entire_leg + calf_swelling + pitting_oedema + collateral_veins + prior_dvt - (alt_diagnosis * 2);
    let interpretation, risk;
    if (score <= 0) {
      interpretation = `Score ${score} — Low probability (~3%); if D-dimer negative, DVT excluded`;
      risk = 'low';
    } else if (score <= 2) {
      interpretation = `Score ${score} — Moderate probability (~17%); perform D-dimer or proximal compression ultrasound`;
      risk = 'moderate';
    } else {
      interpretation = `Score ${score} — High probability (~75%); perform proximal compression ultrasound; anticoagulate empirically if imaging delayed`;
      risk = 'high';
    }
    return { result: score, unit: 'points', interpretation, risk };
  },
};
