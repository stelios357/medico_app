export default {
  slug: 'nihss',
  name: 'NIH Stroke Scale (NIHSS)',
  specialty: 'neurology',
  description: 'Quantifies neurological deficit severity after acute stroke to guide triage, thrombolysis eligibility, and prognosis. Score 0–42.',
  references: [
    'Brott T, et al. Measurements of acute cerebral infarction: a clinical examination scale. Stroke. 1989;20(7):864–870.',
    'Adams HP, et al. Baseline NIH Stroke Scale score strongly predicts outcome after stroke. Neurology. 1999;53(1):126–131.',
  ],
  inputs: [
    {
      id: 'loc',
      label: '1a. Level of Consciousness',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — Alert, keenly responsive' },
        { value: 1, label: '1 — Not alert; arousable by minor stimulation' },
        { value: 2, label: '2 — Not alert; requires repeated or painful stimulation' },
        { value: 3, label: '3 — Responds only with reflex or totally unresponsive' },
      ],
    },
    {
      id: 'locQuestions',
      label: '1b. LOC Questions (month / age)',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — Answers both correctly' },
        { value: 1, label: '1 — Answers one correctly' },
        { value: 2, label: '2 — Answers neither correctly (or intubated/aphasic)' },
      ],
    },
    {
      id: 'locCommands',
      label: '1c. LOC Commands (open/close eyes, grip)',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — Performs both tasks' },
        { value: 1, label: '1 — Performs one task' },
        { value: 2, label: '2 — Performs neither task' },
      ],
    },
    {
      id: 'gaze',
      label: '2. Best Gaze',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — Normal' },
        { value: 1, label: '1 — Partial gaze palsy' },
        { value: 2, label: '2 — Forced deviation or total gaze paresis' },
      ],
    },
    {
      id: 'visual',
      label: '3. Visual Fields',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — No visual loss' },
        { value: 1, label: '1 — Partial hemianopia' },
        { value: 2, label: '2 — Complete hemianopia' },
        { value: 3, label: '3 — Bilateral hemianopia (blind)' },
      ],
    },
    {
      id: 'facial',
      label: '4. Facial Palsy',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — Normal symmetrical movements' },
        { value: 1, label: '1 — Minor paralysis (asymmetry on smiling)' },
        { value: 2, label: '2 — Partial paralysis (lower face)' },
        { value: 3, label: '3 — Complete paralysis (upper and lower face)' },
      ],
    },
    {
      id: 'motorArmLeft',
      label: '5a. Motor — Left Arm (hold 90° seated / 45° supine × 10 s)',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — No drift; holds 10 s' },
        { value: 1, label: '1 — Drift; arm drifts but does not hit bed' },
        { value: 2, label: '2 — Some effort against gravity; falls before 10 s' },
        { value: 3, label: '3 — No effort against gravity; arm falls immediately' },
        { value: 4, label: '4 — No movement' },
        { value: 9, label: 'UN — Untestable (amputation / joint fusion)' },
      ],
    },
    {
      id: 'motorArmRight',
      label: '5b. Motor — Right Arm',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — No drift; holds 10 s' },
        { value: 1, label: '1 — Drift; arm drifts but does not hit bed' },
        { value: 2, label: '2 — Some effort against gravity; falls before 10 s' },
        { value: 3, label: '3 — No effort against gravity; arm falls immediately' },
        { value: 4, label: '4 — No movement' },
        { value: 9, label: 'UN — Untestable (amputation / joint fusion)' },
      ],
    },
    {
      id: 'motorLegLeft',
      label: '6a. Motor — Left Leg (hold 30° supine × 5 s)',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — No drift; holds 5 s' },
        { value: 1, label: '1 — Drift; leg drifts before 5 s, does not hit bed' },
        { value: 2, label: '2 — Some effort against gravity; falls before 5 s' },
        { value: 3, label: '3 — No effort against gravity; falls immediately' },
        { value: 4, label: '4 — No movement' },
        { value: 9, label: 'UN — Untestable (amputation / joint fusion)' },
      ],
    },
    {
      id: 'motorLegRight',
      label: '6b. Motor — Right Leg',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — No drift; holds 5 s' },
        { value: 1, label: '1 — Drift; leg drifts before 5 s, does not hit bed' },
        { value: 2, label: '2 — Some effort against gravity; falls before 5 s' },
        { value: 3, label: '3 — No effort against gravity; falls immediately' },
        { value: 4, label: '4 — No movement' },
        { value: 9, label: 'UN — Untestable (amputation / joint fusion)' },
      ],
    },
    {
      id: 'ataxia',
      label: '7. Limb Ataxia',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — Absent' },
        { value: 1, label: '1 — Present in one limb' },
        { value: 2, label: '2 — Present in two or more limbs' },
      ],
    },
    {
      id: 'sensory',
      label: '8. Sensory',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — Normal; no sensory loss' },
        { value: 1, label: '1 — Mild-to-moderate sensory loss' },
        { value: 2, label: '2 — Severe or total sensory loss' },
      ],
    },
    {
      id: 'language',
      label: '9. Best Language',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — No aphasia; normal' },
        { value: 1, label: '1 — Mild-to-moderate aphasia' },
        { value: 2, label: '2 — Severe aphasia; fragmentary expression' },
        { value: 3, label: '3 — Mute, global aphasia' },
      ],
    },
    {
      id: 'dysarthria',
      label: '10. Dysarthria',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — Normal articulation' },
        { value: 1, label: '1 — Mild-to-moderate; slurred but understandable' },
        { value: 2, label: '2 — Severe; unintelligible or mute' },
        { value: 9, label: 'UN — Untestable (intubated or other barrier)' },
      ],
    },
    {
      id: 'extinction',
      label: '11. Extinction and Inattention',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: '0 — No abnormality' },
        { value: 1, label: '1 — Inattention or extinction in one modality' },
        { value: 2, label: '2 — Profound hemi-inattention or extinction in ≥2 modalities' },
      ],
    },
  ],
  calculate(inputs) {
    const keys = [
      'loc', 'locQuestions', 'locCommands', 'gaze', 'visual', 'facial',
      'motorArmLeft', 'motorArmRight', 'motorLegLeft', 'motorLegRight',
      'ataxia', 'sensory', 'language', 'dysarthria', 'extinction',
    ];
    // UN items (value 9) are excluded from the total per NIHSS convention
    const score = keys.reduce((sum, k) => {
      const v = inputs[k];
      return sum + (v === 9 ? 0 : v);
    }, 0);

    let interpretation, risk;
    if (score === 0) {
      interpretation = 'NIHSS 0 — No stroke symptoms detected';
      risk = 'low';
    } else if (score <= 4) {
      interpretation = `NIHSS ${score} — Minor stroke; most patients ambulate and do not require inpatient admission per some protocols`;
      risk = 'low';
    } else if (score <= 15) {
      interpretation = `NIHSS ${score} — Moderate stroke; assess thrombolysis / thrombectomy eligibility; neurology consult`;
      risk = 'moderate';
    } else if (score <= 20) {
      interpretation = `NIHSS ${score} — Moderate-to-severe stroke; urgent neurovascular imaging; thrombectomy window assessment`;
      risk = 'high';
    } else {
      interpretation = `NIHSS ${score} — Severe stroke; high mortality and disability risk; intensive care, goals-of-care discussion`;
      risk = 'high';
    }

    return { result: score, unit: '/ 42', interpretation, risk };
  },
};
