// Champion HR, et al. A revision of the Trauma Score. J Trauma. 1989;29(5):623–629.
function codeGcs(gcs) {
  if (gcs >= 13) return 4;
  if (gcs >= 9)  return 3;
  if (gcs >= 6)  return 2;
  if (gcs >= 4)  return 1;
  return 0;
}

function codeSbp(sbp) {
  if (sbp > 89)  return 4;
  if (sbp >= 76) return 3;
  if (sbp >= 50) return 2;
  if (sbp >= 1)  return 1;
  return 0;
}

function codeRr(rr) {
  if (rr >= 10 && rr <= 29) return 4;
  if (rr > 29)              return 3;
  if (rr >= 6)              return 2;
  if (rr >= 1)              return 1;
  return 0;
}

export default {
  slug: 'revised-trauma-score',
  name: 'Revised Trauma Score (RTS)',
  specialty: 'emergency',
  description: 'Physiological triage tool combining Glasgow Coma Scale, systolic blood pressure, and respiratory rate to predict trauma survival. Range 0–7.84.',
  references: [
    'Champion HR, et al. A revision of the Trauma Score. J Trauma. 1989;29(5):623–629.',
    'American College of Surgeons Committee on Trauma. Advanced Trauma Life Support. 10th ed. 2018.',
  ],
  inputs: [
    { id: 'gcs', label: 'Glasgow Coma Scale (GCS)', type: 'number', min: 3,  max: 15,  required: true },
    { id: 'sbp', label: 'Systolic Blood Pressure',  type: 'number', unit: 'mmHg', min: 0, max: 300, required: true },
    { id: 'rr',  label: 'Respiratory Rate',          type: 'number', unit: 'breaths/min', min: 0, max: 80, required: true },
  ],
  calculate({ gcs, sbp, rr }) {
    const gcsCoded = codeGcs(gcs);
    const sbpCoded = codeSbp(sbp);
    const rrCoded  = codeRr(rr);

    const rts = 0.9368 * gcsCoded + 0.7326 * sbpCoded + 0.2908 * rrCoded;
    const rounded = Math.round(rts * 100) / 100;

    const breakdown = [
      { label: `GCS ${gcs} → coded ${gcsCoded}`,   points: gcsCoded },
      { label: `SBP ${sbp} mmHg → coded ${sbpCoded}`, points: sbpCoded },
      { label: `RR ${rr} → coded ${rrCoded}`,       points: rrCoded },
    ];

    let interpretation, risk;
    if (rounded >= 7.0) {
      interpretation = `RTS ${rounded}/7.84 — Minor physiological derangement; estimated survival >95%`;
      risk = 'low';
    } else if (rounded >= 4.0) {
      interpretation = `RTS ${rounded}/7.84 — Moderate derangement; urgent resuscitation; estimated survival 50–95%`;
      risk = 'moderate';
    } else {
      interpretation = `RTS ${rounded}/7.84 — Severe derangement; immediate life-saving intervention; estimated survival <50%`;
      risk = 'high';
    }

    return { result: rounded, unit: '/ 7.84', interpretation, risk, breakdown };
  },
};
