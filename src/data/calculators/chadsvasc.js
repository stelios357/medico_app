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
      options: [
        { value: 0, label: '< 65 years (0 pts)' },
        { value: 1, label: '65–74 years (1 pt)' },
        { value: 2, label: '≥ 75 years (2 pts)' },
      ],
    },
    { id: 'chf',             label: 'Congestive heart failure / LV dysfunction',         type: 'checkbox' },
    { id: 'hypertension',    label: 'Hypertension (treated or untreated)',                type: 'checkbox' },
    { id: 'diabetes',        label: 'Diabetes mellitus',                                  type: 'checkbox' },
    { id: 'stroke_tia',      label: 'Stroke, TIA, or thromboembolism (prior history)',    type: 'checkbox' },
    { id: 'vascular',        label: 'Vascular disease (prior MI, PAD, or aortic plaque)', type: 'checkbox' },
    { id: 'female',          label: 'Female sex',                                         type: 'checkbox' },
  ],
  calculate({ age_cat, chf, hypertension, diabetes, stroke_tia, vascular, female }) {
    const score = age_cat + chf + hypertension + diabetes + (stroke_tia * 2) + vascular + female;
    let interpretation, risk;
    if (score === 0) {
      interpretation = 'Low risk — antithrombotic therapy not recommended';
      risk = 'low';
    } else if (score === 1) {
      interpretation = 'Low-moderate risk — consider anticoagulation; weigh bleeding risk';
      risk = 'moderate';
    } else {
      // Annual stroke risk by score: 2→2.2%, 3→3.2%, 4→4.0%, 5→6.7%, 6→9.8%, 7→9.6%, 8→12.5%, 9→15.2%
      interpretation = `High risk (score ${score}) — oral anticoagulation recommended`;
      risk = 'high';
    }
    return { result: score, unit: 'points', interpretation, risk };
  },
};
