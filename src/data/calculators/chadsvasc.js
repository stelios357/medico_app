export default {
  slug: 'chadsvasc',
  name: 'CHA₂DS₂-VASc Score',
  specialty: 'cardiology',
  description: 'Estimates annual stroke risk in non-valvular atrial fibrillation to guide anticoagulation decisions.',
  references: [
    'Lip GYH, et al. Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation. Chest. 2010;137(2):263–272.',
    'January CT, et al. 2019 AHA/ACC/HRS Focused Update of the 2014 AHA/ACC/HRS Guideline for the Management of Patients With Atrial Fibrillation. J Am Coll Cardiol. 2019;74(1):104–132.',
  ],
  inputs: [
    {
      id: 'age_cat',
      label: 'Age',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '< 65 years (0 pts)' },
        { value: 1, label: '65–74 years (1 pt)' },
        { value: 2, label: '≥ 75 years (2 pts)' },
      ],
    },
    { id: 'chf',          label: 'Congestive heart failure / LV dysfunction',          type: 'checkbox' },
    { id: 'hypertension', label: 'Hypertension (treated or untreated)',                 type: 'checkbox' },
    { id: 'diabetes',     label: 'Diabetes mellitus',                                   type: 'checkbox' },
    { id: 'stroke_tia',   label: 'Stroke, TIA, or thromboembolism (prior history)',     type: 'checkbox' },
    { id: 'vascular',     label: 'Vascular disease (prior MI, PAD, or aortic plaque)', type: 'checkbox' },
    { id: 'female',       label: 'Female sex',                                          type: 'checkbox' },
  ],
  calculate({ age_cat, chf, hypertension, diabetes, stroke_tia, vascular, female }) {
    const components = [
      { label: 'Age category',                    points: age_cat },
      { label: 'CHF / LV dysfunction',             points: chf },
      { label: 'Hypertension',                     points: hypertension },
      { label: 'Diabetes mellitus',                points: diabetes },
      { label: 'Stroke / TIA / thromboembolism',   points: stroke_tia * 2 },
      { label: 'Vascular disease',                 points: vascular },
      { label: 'Female sex',                       points: female },
    ];
    const score = components.reduce((s, c) => s + c.points, 0);
    const breakdown = components.filter(c => c.points > 0);
    let interpretation, risk;
    if (score === 0) {
      interpretation = 'Low risk — antithrombotic therapy not recommended';
      risk = 'low';
    } else if (score === 1) {
      interpretation = 'Low-moderate risk — consider anticoagulation; weigh bleeding risk';
      risk = 'moderate';
    } else {
      interpretation = `High risk (score ${score}) — oral anticoagulation recommended`;
      risk = 'high';
    }
    return { result: score, unit: 'points', interpretation, risk, breakdown };
  },
};
