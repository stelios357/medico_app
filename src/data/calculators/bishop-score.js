export default {
  slug: 'bishop-score',
  name: 'Bishop Score',
  specialty: 'obgyn',
  description: 'Assesses cervical favorability before labor induction. Higher scores indicate a more favorable cervix and greater likelihood of successful induction.',
  references: [
    'Bishop EH. Pelvic scoring for elective induction. Obstet Gynecol. 1964;24:266–268.',
    'Tenore JL. Methods for cervical ripening and induction of labor. Am Fam Physician. 2003;67(10):2123–2128.',
  ],
  inputs: [
    {
      id: 'dilation',
      label: 'Cervical Dilation',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — Closed (0 cm)' },
        { value: 1, label: '1 — 1–2 cm' },
        { value: 2, label: '2 — 3–4 cm' },
        { value: 3, label: '3 — ≥5 cm' },
      ],
    },
    {
      id: 'effacement',
      label: 'Cervical Effacement',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — 0–30%' },
        { value: 1, label: '1 — 40–50%' },
        { value: 2, label: '2 — 60–70%' },
        { value: 3, label: '3 — ≥80%' },
      ],
    },
    {
      id: 'station',
      label: 'Fetal Station (relative to ischial spines)',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — −3 or higher (floating)' },
        { value: 1, label: '1 — −2' },
        { value: 2, label: '2 — −1 or 0 (engaged)' },
        { value: 3, label: '3 — +1 or +2' },
      ],
    },
    {
      id: 'consistency',
      label: 'Cervical Consistency',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — Firm' },
        { value: 1, label: '1 — Medium' },
        { value: 2, label: '2 — Soft' },
      ],
    },
    {
      id: 'position',
      label: 'Cervical Position',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — Posterior' },
        { value: 1, label: '1 — Mid (intermediate)' },
        { value: 2, label: '2 — Anterior' },
      ],
    },
  ],
  calculate({ dilation, effacement, station, consistency, position }) {
    const components = [
      { label: 'Dilation',     points: dilation },
      { label: 'Effacement',   points: effacement },
      { label: 'Station',      points: station },
      { label: 'Consistency',  points: consistency },
      { label: 'Position',     points: position },
    ];
    const score = components.reduce((s, c) => s + c.points, 0);
    const breakdown = components.filter(c => c.points > 0);

    let interpretation, risk;
    if (score <= 5) {
      interpretation = `Score ${score}/13 — Unfavorable cervix; cervical ripening agent recommended before induction (prostaglandins or mechanical methods)`;
      risk = 'high';
    } else if (score <= 7) {
      interpretation = `Score ${score}/13 — Moderately favorable cervix; induction may proceed with oxytocin or amniotomy; variable success rate`;
      risk = 'moderate';
    } else if (score <= 9) {
      interpretation = `Score ${score}/13 — Favorable cervix; good probability of successful induction; oxytocin or amniotomy appropriate`;
      risk = 'low';
    } else {
      interpretation = `Score ${score}/13 — Very favorable cervix; equivalent to spontaneous labor onset; amniotomy alone may be sufficient`;
      risk = 'low';
    }

    return { result: score, unit: '/ 13', interpretation, risk, breakdown };
  },
};
