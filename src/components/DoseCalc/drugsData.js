// All dose calculations as pure data / pure functions.
// For simple linear dose: { dosePerKg, unit, maxDose, minDose?, concentration?, concentrationLabel }
// For non-linear: { calcFn: (weight) => { displayRule, displayDose, volume, volumeLabel, concentrationLabel, atMax, unit } }

export const DRUGS = [
  // ─── RESUS ───────────────────────────────────────────────────────────────────
  {
    id: 'adrenaline_arrest',
    name: 'Adrenaline',
    indication: 'Cardiac Arrest IV/IO',
    category: 'resus',
    dosePerKg: 0.01, unit: 'mg', maxDose: 1,
    concentration: 0.1,
    concentrationLabel: '1:10,000 (0.1 mg/mL)',
    notes: 'Repeat every 3–5 min. May give via ETT at 0.1 mg/kg.',
    source: 'PALS 2020 / IAP',
  },
  {
    id: 'adrenaline_anaphylaxis',
    name: 'Adrenaline',
    indication: 'Anaphylaxis IM',
    category: 'resus',
    dosePerKg: 0.01, unit: 'mg', maxDose: 0.5,
    concentration: 1,
    concentrationLabel: '1:1000 (1 mg/mL) IM',
    notes: 'Mid-anterolateral thigh. Repeat after 5–15 min if needed.',
    source: 'PALS 2020 / IAP',
  },
  {
    id: 'atropine',
    name: 'Atropine',
    indication: 'Bradycardia / Pre-RSI',
    category: 'resus',
    dosePerKg: 0.02, unit: 'mg', maxDose: 0.5, minDose: 0.1,
    concentration: 0.6,
    concentrationLabel: '0.6 mg/mL',
    notes: 'Minimum dose 0.1 mg to avoid paradoxical bradycardia.',
    source: 'PALS 2020',
  },
  {
    id: 'adenosine_1',
    name: 'Adenosine',
    indication: 'SVT — 1st dose',
    category: 'resus',
    dosePerKg: 0.1, unit: 'mg', maxDose: 6,
    concentration: 3,
    concentrationLabel: '3 mg/mL',
    notes: 'Rapid IV push at most proximal site. Flush immediately with 5–10 mL NS.',
    source: 'PALS 2020',
  },
  {
    id: 'adenosine_2',
    name: 'Adenosine',
    indication: 'SVT — 2nd dose',
    category: 'resus',
    dosePerKg: 0.2, unit: 'mg', maxDose: 12,
    concentration: 3,
    concentrationLabel: '3 mg/mL',
    notes: 'If 1st dose fails after 1–2 min.',
    source: 'PALS 2020',
  },
  {
    id: 'amiodarone',
    name: 'Amiodarone',
    indication: 'VF / Pulseless VT',
    category: 'resus',
    dosePerKg: 5, unit: 'mg', maxDose: 300,
    concentration: 50,
    concentrationLabel: '50 mg/mL (undiluted)',
    notes: 'IV bolus during CPR pause. May repeat up to 2 additional doses.',
    source: 'PALS 2020',
  },
  {
    id: 'sodium_bicarb',
    name: 'Sodium Bicarbonate',
    indication: 'Metabolic Acidosis / Hyperkalemia',
    category: 'resus',
    dosePerKg: 1, unit: 'mEq', maxDose: 50,
    concentration: 1,
    concentrationLabel: '8.4% (1 mEq/mL)',
    notes: 'Slow IV push. Neonates: dilute 1:1 with sterile water (use 4.2%).',
    source: 'IAP',
  },
  {
    id: 'calcium_gluconate',
    name: 'Calcium Gluconate 10%',
    indication: 'Hypocalcemia / Hyperkalemia',
    category: 'resus',
    calcFn: (w) => {
      const vol = Math.min(w * 0.5, 20);
      return {
        displayRule: '0.5 mL/kg (max 20 mL)',
        displayDose: `${vol.toFixed(1)} mL`,
        volume: vol,
        volumeLabel: `${vol.toFixed(1)} mL`,
        concentrationLabel: '10% solution IV (slow, over 5–10 min)',
        atMax: vol >= 20,
        unit: 'mL',
      };
    },
    notes: 'MUST have cardiac monitoring. Extravasation causes severe tissue necrosis.',
    source: 'IAP',
  },
  {
    id: 'defib_1',
    name: 'Defibrillation',
    indication: '1st shock (VF/pVT)',
    category: 'resus',
    dosePerKg: 2, unit: 'J', maxDose: 200,
    notes: 'Unsynchronized. Continue CPR immediately after.',
    source: 'PALS 2020',
  },
  {
    id: 'defib_2',
    name: 'Defibrillation',
    indication: '2nd+ shock',
    category: 'resus',
    dosePerKg: 4, unit: 'J', maxDose: 360,
    notes: 'Unsynchronized.',
    source: 'PALS 2020',
  },
  {
    id: 'cardioversion',
    name: 'Cardioversion',
    indication: 'SVT with haemodynamic compromise',
    category: 'resus',
    dosePerKg: 1, unit: 'J', maxDose: 50,
    notes: 'Synchronized mode. Sedation if time allows.',
    source: 'PALS 2020',
  },

  // ─── SEIZURE ─────────────────────────────────────────────────────────────────
  {
    id: 'diazepam_iv',
    name: 'Diazepam',
    indication: 'Status Epilepticus IV',
    category: 'seizure',
    dosePerKg: 0.3, unit: 'mg', maxDose: 10,
    concentration: 5,
    concentrationLabel: '5 mg/mL IV (slow)',
    notes: 'Slow IV over 2–3 min. Watch for respiratory depression.',
    source: 'IAP STG 2022 Ch.040',
  },
  {
    id: 'diazepam_pr',
    name: 'Diazepam',
    indication: 'Status Epilepticus PR',
    category: 'seizure',
    dosePerKg: 0.5, unit: 'mg', maxDose: 10,
    concentrationLabel: '5 mg/2.5 mL rectal tube',
    notes: 'Rectal route when no IV access.',
    source: 'IAP STG 2022 Ch.040',
  },
  {
    id: 'lorazepam',
    name: 'Lorazepam',
    indication: 'Status Epilepticus IV',
    category: 'seizure',
    dosePerKg: 0.1, unit: 'mg', maxDose: 4,
    concentration: 4,
    concentrationLabel: '4 mg/mL',
    notes: 'First-line IV benzodiazepine. Longer duration than diazepam (12–24 hr).',
    source: 'IAP / PALS 2020',
  },
  {
    id: 'midazolam_iv',
    name: 'Midazolam',
    indication: 'Status Epilepticus IV',
    category: 'seizure',
    dosePerKg: 0.15, unit: 'mg', maxDose: 10,
    concentration: 5,
    concentrationLabel: '5 mg/mL',
    notes: 'Rapid onset. Monitor for apnoea.',
    source: 'IAP',
  },
  {
    id: 'midazolam_in',
    name: 'Midazolam',
    indication: 'Seizure — Intranasal/Buccal',
    category: 'seizure',
    dosePerKg: 0.2, unit: 'mg', maxDose: 10,
    concentration: 5,
    concentrationLabel: '5 mg/mL (IN/buccal)',
    notes: 'Split dose equally between both nostrils if IN route.',
    source: 'IAP',
  },
  {
    id: 'phenobarb',
    name: 'Phenobarbital',
    indication: 'Status Epilepticus (2nd line)',
    category: 'seizure',
    dosePerKg: 20, unit: 'mg', maxDose: 1000,
    concentration: 200,
    concentrationLabel: '200 mg/mL — DILUTE before use',
    notes: 'Infuse at max 1 mg/kg/min. Minimum infusion time = weight in minutes. Monitor BP and breathing.',
    source: 'IAP',
    warning: 'Dilute before use. Max rate 1 mg/kg/min.',
  },
  {
    id: 'phenytoin',
    name: 'Phenytoin',
    indication: 'Status Epilepticus (2nd line)',
    category: 'seizure',
    dosePerKg: 20, unit: 'mg', maxDose: 1000,
    concentration: 50,
    concentrationLabel: '50 mg/mL in Normal Saline ONLY',
    notes: 'Rate ≤1 mg/kg/min (max 50 mg/min). ECG monitoring mandatory. Do NOT use dextrose.',
    source: 'IAP',
    warning: 'NS only — precipitates in dextrose. ECG mandatory.',
  },
  {
    id: 'levetiracetam',
    name: 'Levetiracetam',
    indication: 'Status Epilepticus (2nd line)',
    category: 'seizure',
    dosePerKg: 60, unit: 'mg', maxDose: 4500,
    concentration: 100,
    concentrationLabel: '100 mg/mL (dilute in NS)',
    notes: 'Infuse over 15 min. Better safety profile than phenytoin. Increasingly preferred.',
    source: 'IAP',
  },

  // ─── RSI ─────────────────────────────────────────────────────────────────────
  {
    id: 'atropine_rsi',
    name: 'Atropine',
    indication: 'Pre-RSI (<10 yr / bradycardia)',
    category: 'rsi',
    dosePerKg: 0.02, unit: 'mg', minDose: 0.1, maxDose: 0.5,
    concentration: 0.6,
    concentrationLabel: '0.6 mg/mL',
    notes: 'Give 3 min before succinylcholine in children <10 yr to prevent bradycardia.',
    source: 'PALS 2020',
  },
  {
    id: 'ketamine_rsi',
    name: 'Ketamine',
    indication: 'RSI Induction',
    category: 'rsi',
    dosePerKg: 2, unit: 'mg', maxDose: 200,
    concentration: 50,
    concentrationLabel: '50 mg/mL (500 mg/10 mL)',
    notes: 'Preferred for haemodynamically unstable or asthmatic patients. Maintains airway reflexes.',
    source: 'PALS 2020',
  },
  {
    id: 'succinylcholine',
    name: 'Succinylcholine',
    indication: 'RSI — Paralysis',
    category: 'rsi',
    calcFn: (w) => {
      const dose = w < 10 ? w * 2 : w * 1.5;
      const capped = Math.min(dose, 150);
      return {
        displayRule: w < 10 ? '2 mg/kg (<10 kg)' : '1.5 mg/kg (≥10 kg)',
        displayDose: `${capped.toFixed(1)} mg`,
        volume: capped / 50,
        volumeLabel: `${(capped / 50).toFixed(1)} mL`,
        concentrationLabel: '50 mg/mL',
        atMax: capped >= 150,
        unit: 'mg',
      };
    },
    notes: 'Contraindicated: hyperkalemia, rhabdomyolysis, burns >24 hr, muscular dystrophy.',
    source: 'PALS 2020',
    warning: 'Check contraindications before use.',
  },
  {
    id: 'rocuronium',
    name: 'Rocuronium',
    indication: 'RSI — Paralysis',
    category: 'rsi',
    dosePerKg: 1.2, unit: 'mg', maxDose: 100,
    concentration: 10,
    concentrationLabel: '10 mg/mL',
    notes: 'RSI dose. Reversal: Sugammadex 16 mg/kg IV.',
    source: 'PALS 2020',
  },
  {
    id: 'fentanyl_rsi',
    name: 'Fentanyl',
    indication: 'RSI Induction (opioid blunting)',
    category: 'rsi',
    dosePerKg: 2, unit: 'mcg', maxDose: 100,
    concentration: 50,
    concentrationLabel: '50 mcg/mL',
    notes: 'Blunts haemodynamic response to intubation.',
    source: 'PALS 2020',
  },

  // ─── SEDATION / ANALGESIA ────────────────────────────────────────────────────
  {
    id: 'morphine',
    name: 'Morphine',
    indication: 'Pain / Sedation',
    category: 'sedation',
    dosePerKg: 0.1, unit: 'mg', maxDose: 10,
    concentration: 1,
    concentrationLabel: '1 mg/mL (diluted)',
    notes: 'Titrate to effect. May repeat every 2–4 hr.',
    source: 'IAP',
  },
  {
    id: 'fentanyl_sed',
    name: 'Fentanyl',
    indication: 'Procedural Sedation / Analgesia',
    category: 'sedation',
    dosePerKg: 1.5, unit: 'mcg', maxDose: 100,
    concentration: 50,
    concentrationLabel: '50 mcg/mL',
    notes: 'Rapid onset (1–2 min). Short duration (30–60 min).',
    source: 'IAP',
  },
  {
    id: 'ketamine_sed',
    name: 'Ketamine',
    indication: 'Procedural Sedation',
    category: 'sedation',
    dosePerKg: 1.5, unit: 'mg', maxDose: 150,
    concentration: 50,
    concentrationLabel: '50 mg/mL',
    notes: 'Dissociative sedation. Give glycopyrrolate 0.01 mg/kg IV to reduce secretions.',
    source: 'IAP',
  },
  {
    id: 'midazolam_sed',
    name: 'Midazolam',
    indication: 'Procedural Sedation',
    category: 'sedation',
    dosePerKg: 0.1, unit: 'mg', maxDose: 10,
    concentration: 5,
    concentrationLabel: '5 mg/mL',
    notes: 'Combine with fentanyl/ketamine for deeper sedation.',
    source: 'IAP',
  },
  {
    id: 'naloxone',
    name: 'Naloxone',
    indication: 'Opioid Reversal',
    category: 'sedation',
    dosePerKg: 0.01, unit: 'mg', maxDose: 2,
    concentration: 0.4,
    concentrationLabel: '0.4 mg/mL',
    notes: 'May need repeat dosing (shorter half-life than most opioids). Watch for re-narcotisation.',
    source: 'IAP',
  },

  // ─── FLUIDS ──────────────────────────────────────────────────────────────────
  {
    id: 'fluid_bolus_10',
    name: 'IV Fluid Bolus',
    indication: 'Sepsis / Shock (10 mL/kg)',
    category: 'fluids',
    calcFn: (w) => ({
      displayRule: '10 mL/kg',
      displayDose: `${(w * 10).toFixed(0)} mL`,
      volume: w * 10,
      volumeLabel: `${(w * 10).toFixed(0)} mL NS or RL`,
      concentrationLabel: 'NS / Ringer\'s Lactate',
      atMax: false,
      unit: 'mL',
      notes: 'Over 15–30 min. Reassess after each bolus.',
    }),
    notes: 'Over 15–30 min. Reassess after each bolus. Max 3 boluses (30 mL/kg) then reassess.',
    source: 'IAP',
  },
  {
    id: 'fluid_bolus_20',
    name: 'IV Fluid Bolus',
    indication: 'Shock (20 mL/kg)',
    category: 'fluids',
    calcFn: (w) => ({
      displayRule: '20 mL/kg',
      displayDose: `${(w * 20).toFixed(0)} mL`,
      volume: w * 20,
      volumeLabel: `${(w * 20).toFixed(0)} mL NS or RL`,
      concentrationLabel: 'NS / Ringer\'s Lactate',
      atMax: false,
      unit: 'mL',
    }),
    notes: 'Standard resus bolus. Max 3 boluses (60 mL/kg total) then reassess.',
    source: 'IAP',
  },
  {
    id: 'dextrose',
    name: 'Dextrose 10%',
    indication: 'Hypoglycaemia',
    category: 'fluids',
    calcFn: (w) => ({
      displayRule: '2 mL/kg D10W',
      displayDose: `${(w * 2).toFixed(0)} mL`,
      volume: w * 2,
      volumeLabel: `${(w * 2).toFixed(0)} mL D10W IV push`,
      concentrationLabel: 'D10W (mix 2 mL D50 + 8 mL NS = D10)',
      atMax: false,
      unit: 'mL',
    }),
    notes: 'Target glucose >3 mmol/L. Check BG 15 min after. Prep: mix 2 mL D50 + 8 mL NS = 10 mL D10.',
    source: 'IAP',
  },
  {
    id: 'maintenance',
    name: 'IV Maintenance Fluids',
    indication: 'Holliday-Segar Rate',
    category: 'fluids',
    calcFn: (w) => {
      let rate;
      if (w <= 10) rate = w * 4;
      else if (w <= 20) rate = 40 + (w - 10) * 2;
      else rate = 60 + (w - 20) * 1;
      return {
        displayRule: 'Holliday-Segar',
        displayDose: `${rate.toFixed(0)} mL/hr`,
        volume: rate,
        volumeLabel: `${rate.toFixed(0)} mL/hr`,
        concentrationLabel: 'NS/DNS per clinical need',
        atMax: false,
        unit: 'mL/hr',
        extraNote: `Daily: ${(rate * 24).toFixed(0)} mL/day`,
      };
    },
    notes: 'Adjust for clinical status. Daily = hourly × 24.',
    source: 'Holliday-Segar',
  },
];

// ─── CALC HELPER ────────────────────────────────────────────────────────────────
export function calcDrug(drug, weight) {
  if (!weight || weight <= 0) return null;

  if (drug.calcFn) {
    const result = drug.calcFn(weight);
    return {
      ...result,
      name: drug.name,
      indication: drug.indication,
      id: drug.id,
      notes: result.notes ?? drug.notes,
      warning: drug.warning,
      source: drug.source,
    };
  }

  const raw = drug.dosePerKg * weight;
  const totalDose = Math.max(
    drug.minDose ?? 0,
    Math.min(raw, drug.maxDose)
  );
  const atMax = totalDose >= drug.maxDose;
  const nearMax = !atMax && totalDose >= drug.maxDose * 0.8;
  const volume = drug.concentration ? totalDose / drug.concentration : null;

  return {
    displayRule: `${drug.dosePerKg} ${drug.unit}/kg${drug.minDose ? ` (min ${drug.minDose} ${drug.unit})` : ''} (max ${drug.maxDose} ${drug.unit})`,
    displayDose: `${totalDose.toFixed(totalDose < 1 ? 2 : 1)} ${drug.unit}`,
    totalDose,
    volume,
    volumeLabel: volume != null ? `${volume.toFixed(volume < 1 ? 2 : 1)} mL` : null,
    concentrationLabel: drug.concentrationLabel,
    atMax,
    nearMax,
    unit: drug.unit,
    name: drug.name,
    indication: drug.indication,
    id: drug.id,
    notes: drug.notes,
    warning: drug.warning,
    source: drug.source,
  };
}

// ─── EQUIPMENT CALC ──────────────────────────────────────────────────────────────
export function getEquipment(weight, ageYearsOverride = null) {
  const age = ageYearsOverride ?? Math.max(0, weight / 2 - 4);

  const ett_uncuffed = age < 1
    ? (weight < 3 ? 2.5 : weight < 4 ? 3.0 : 3.5)
    : +(age / 4 + 4).toFixed(1);

  const ett_cuffed = age < 1 ? null : +(age / 4 + 3.5).toFixed(1);
  const ett_depth = +(ett_uncuffed * 3).toFixed(1);

  const blade = age < 0.5 ? 'Miller 0–1'
    : age < 2 ? 'Miller 1'
    : age < 8 ? 'Macintosh 2'
    : 'Macintosh 2–3';

  const lma = weight < 5 ? '1'
    : weight < 10 ? '1.5'
    : weight < 20 ? '2'
    : weight < 30 ? '2.5'
    : weight < 50 ? '3' : '4';

  const suction = Math.round(ett_uncuffed * 2);

  const ng = weight < 1 ? '5 Fr'
    : weight < 5 ? '6 Fr'
    : weight < 15 ? '8 Fr'
    : weight < 30 ? '10 Fr' : '12 Fr';

  const iv_cannula = weight < 2 ? '24G'
    : weight < 10 ? '22–24G'
    : weight < 30 ? '20–22G' : '18–20G';

  const paddle = weight < 10 ? 'Paediatric (4.5 cm)' : 'Adult (8 cm)';
  const cpr_depth = weight < 10 ? '4 cm' : weight < 30 ? '5 cm' : '5–6 cm';

  return { ett_uncuffed, ett_cuffed, ett_depth, blade, lma, suction, ng, iv_cannula, paddle, cpr_depth, estimatedAge: age };
}

// ─── NORMAL VALUES ───────────────────────────────────────────────────────────────
export function getNormalValues(weight) {
  const ageYears = Math.max(0, weight / 2 - 4);

  let hrMin, hrMax, rrMin, rrMax, sbpMin;

  if (ageYears < 0.1) {
    hrMin = 100; hrMax = 180; rrMin = 40; rrMax = 60; sbpMin = 60;
  } else if (ageYears < 1) {
    hrMin = 100; hrMax = 160; rrMin = 30; rrMax = 50; sbpMin = 70;
  } else if (ageYears < 3) {
    hrMin = 90; hrMax = 150; rrMin = 20; rrMax = 40; sbpMin = 70 + 2 * ageYears;
  } else if (ageYears < 6) {
    hrMin = 80; hrMax = 140; rrMin = 20; rrMax = 35; sbpMin = 70 + 2 * ageYears;
  } else if (ageYears < 12) {
    hrMin = 70; hrMax = 120; rrMin = 15; rrMax = 30; sbpMin = 70 + 2 * ageYears;
  } else {
    hrMin = 60; hrMax = 100; rrMin = 12; rrMax = 20; sbpMin = 90;
  }

  return {
    hr: { min: hrMin, max: hrMax },
    rr: { min: rrMin, max: rrMax },
    sbpMin: Math.round(sbpMin),
    spo2: '>94%',
    estimatedAge: ageYears < 1
      ? `~${Math.round(ageYears * 12)} months`
      : `~${ageYears.toFixed(1)} yr`,
  };
}

// ─── BROSELOW ────────────────────────────────────────────────────────────────────
export function getBroselowBand(weight) {
  if (weight < 3)  return { color: '#C0C0C0', name: 'GREY',   range: '<3 kg' };
  if (weight <= 5) return { color: '#C0C0C0', name: 'GREY',   range: '3–5 kg' };
  if (weight <= 7) return { color: '#FFB6C1', name: 'PINK',   range: '6–7 kg' };
  if (weight <= 9) return { color: '#FF6B6B', name: 'RED',    range: '8–9 kg' };
  if (weight <= 11) return { color: '#9B59B6', name: 'PURPLE', range: '10–11 kg' };
  if (weight <= 14) return { color: '#F1C40F', name: 'YELLOW', range: '12–14 kg' };
  if (weight <= 18) return { color: '#B0B0B0', name: 'WHITE',  range: '15–18 kg', border: true };
  if (weight <= 22) return { color: '#3498DB', name: 'BLUE',   range: '19–22 kg' };
  if (weight <= 29) return { color: '#E67E22', name: 'ORANGE', range: '23–29 kg' };
  if (weight <= 36) return { color: '#27AE60', name: 'GREEN',  range: '30–36 kg' };
  return { color: '#6B7A8D', name: 'ADULT', range: '>36 kg' };
}

// APLS weight estimation from age
export function ageToWeight(ageMonths) {
  if (ageMonths < 12) return +(ageMonths * 0.6 + 3).toFixed(1);
  const ageYears = ageMonths / 12;
  return +(2 * (ageYears + 4)).toFixed(1);
}
