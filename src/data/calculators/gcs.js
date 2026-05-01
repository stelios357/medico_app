export default {
  slug: 'gcs',
  name: 'Glasgow Coma Scale (GCS)',
  specialty: 'neurology',
  description: 'Assesses level of consciousness after acute brain injury using eye, verbal, and motor responses.',
  references: [
    'Teasdale G, Jennett B. Assessment of coma and impaired consciousness. A practical scale. Lancet. 1974;2(7872):81–84.',
    'Reith FC, et al. Lack of standardization in the use of the Glasgow Coma Scale. J Neurotrauma. 2016;33(1):89–94.',
  ],
  inputs: [
    {
      id: 'eye',
      label: 'Eye Opening',
      type: 'select',
      required: true,
      options: [
        { value: 1, label: 'E1 — None' },
        { value: 2, label: 'E2 — To pain' },
        { value: 3, label: 'E3 — To voice' },
        { value: 4, label: 'E4 — Spontaneous' },
      ],
    },
    {
      id: 'verbal',
      label: 'Verbal Response',
      type: 'select',
      required: true,
      options: [
        { value: 1, label: 'V1 — None' },
        { value: 2, label: 'V2 — Incomprehensible sounds' },
        { value: 3, label: 'V3 — Inappropriate words' },
        { value: 4, label: 'V4 — Confused' },
        { value: 5, label: 'V5 — Oriented' },
      ],
    },
    {
      id: 'motor',
      label: 'Motor Response',
      type: 'select',
      required: true,
      options: [
        { value: 1, label: 'M1 — None' },
        { value: 2, label: 'M2 — Extension (decerebrate)' },
        { value: 3, label: 'M3 — Flexion (decorticate)' },
        { value: 4, label: 'M4 — Withdrawal' },
        { value: 5, label: 'M5 — Localizes' },
        { value: 6, label: 'M6 — Obeys commands' },
      ],
    },
  ],
  calculate({ eye, verbal, motor }) {
    const score = eye + verbal + motor;
    let interpretation, risk;
    if (score >= 13) {
      interpretation = `GCS ${score}/15 — Mild injury; monitor closely, reassess frequently`;
      risk = 'low';
    } else if (score >= 9) {
      interpretation = `GCS ${score}/15 — Moderate injury; urgent assessment, consider CT head`;
      risk = 'moderate';
    } else {
      interpretation = `GCS ${score}/15 — Severe injury; airway at risk, consider intubation (threshold ≤ 8)`;
      risk = 'high';
    }
    return { result: score, unit: '/ 15', interpretation, risk };
  },
};
