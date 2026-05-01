export default {
  slug: 'mean-arterial-pressure',
  name: 'Mean Arterial Pressure (MAP)',
  specialty: 'cardiology',
  description: 'Estimates MAP from systolic and diastolic blood pressure. MAP < 65 mmHg is associated with end-organ hypoperfusion.',
  references: [
    'Magder S. The meaning of blood pressure. Crit Care. 2018;22(1):257.',
  ],
  inputs: [
    { id: 'systolic', label: 'Systolic BP', type: 'number', unit: 'mmHg', min: 40, max: 300 },
    { id: 'diastolic', label: 'Diastolic BP', type: 'number', unit: 'mmHg', min: 20, max: 200 },
  ],
  calculate({ systolic, diastolic }) {
    if (diastolic >= systolic) return null;
    const map = Math.round(diastolic + (systolic - diastolic) / 3);
    let interpretation, risk;
    if (map < 65) {
      interpretation = 'Low MAP — risk of end-organ hypoperfusion; assess urgently';
      risk = 'high';
    } else if (map <= 100) {
      interpretation = 'Normal MAP';
      risk = 'low';
    } else {
      interpretation = 'Elevated MAP — consistent with hypertension';
      risk = 'moderate';
    }
    return { result: map, unit: 'mmHg', interpretation, risk };
  },
};
