// NCEP ATP III 2001 Framingham Point Score for 10-Year CVD Risk
// Reference values: Wilson PWF, et al. Prediction of coronary heart disease using risk factor categories. Circulation. 1998;97(18):1837–1847.

function getAgeCat(age) {
  if (age < 35) return 0;
  if (age < 40) return 1;
  if (age < 45) return 2;
  if (age < 50) return 3;
  if (age < 55) return 4;
  if (age < 60) return 5;
  if (age < 65) return 6;
  if (age < 70) return 7;
  if (age < 75) return 8;
  return 9;
}

function getCholIdx(chol) {
  if (chol < 160) return 0;
  if (chol < 200) return 1;
  if (chol < 240) return 2;
  if (chol < 280) return 3;
  return 4;
}

function getSbpCat(sbp) {
  if (sbp < 120) return 0;
  if (sbp < 130) return 1;
  if (sbp < 140) return 2;
  if (sbp < 160) return 3;
  return 4;
}

// Male lookup tables
const maleAgePoints   = [-9, -4, 0, 3, 6, 8, 10, 11, 12, 13];
const maleCholTable   = [
  [0, 4, 7, 9, 11],
  [0, 3, 5, 6,  8],
  [0, 2, 3, 4,  5],
  [0, 1, 1, 2,  3],
  [0, 0, 0, 1,  1],
];
const maleSmokeTable  = [8, 5, 3, 1, 1];
const maleSbpUntreated = [0, 0, 1, 1, 2];
const maleSbpTreated   = [0, 1, 2, 2, 3];

// Female lookup tables
const femaleAgePoints   = [-7, -3, 0, 3, 6, 8, 10, 12, 14, 16];
const femaleCholTable   = [
  [0,  4,  8, 11, 13],
  [0,  3,  6,  8, 10],
  [0,  2,  4,  5,  7],
  [0,  1,  2,  3,  4],
  [0,  1,  1,  2,  2],
];
const femaleSmokeTable  = [9, 7, 4, 2, 1];
const femaleSbpUntreated = [0, 1, 2, 3, 4];
const femaleSbpTreated   = [0, 3, 4, 5, 6];

function getHdlPoints(hdl) {
  if (hdl >= 60) return -1;
  if (hdl >= 50) return 0;
  if (hdl >= 40) return 1;
  return 2;
}

function getRiskPercent(score, isFemale) {
  if (!isFemale) {
    if (score <= 0)  return '<1';
    if (score <= 4)  return 1;
    if (score === 5) return 2;
    if (score === 6) return 2;
    if (score === 7) return 3;
    if (score === 8) return 4;
    if (score === 9) return 5;
    if (score === 10) return 6;
    if (score === 11) return 8;
    if (score === 12) return 10;
    if (score === 13) return 12;
    if (score === 14) return 16;
    if (score === 15) return 20;
    if (score === 16) return 25;
    return '≥30';
  } else {
    if (score <= 8)  return '<1';
    if (score <= 12) return 1;
    if (score === 13) return 2;
    if (score === 14) return 2;
    if (score === 15) return 3;
    if (score === 16) return 4;
    if (score === 17) return 5;
    if (score === 18) return 6;
    if (score === 19) return 8;
    if (score === 20) return 11;
    if (score === 21) return 14;
    if (score === 22) return 17;
    if (score === 23) return 22;
    if (score === 24) return 27;
    return '≥30';
  }
}

export default {
  slug: 'framingham-cvd',
  name: 'Framingham 10-Year CVD Risk',
  specialty: 'cardiology',
  description: 'Estimates 10-year risk of a cardiovascular event (MI or coronary death) using the NCEP ATP III Framingham point score for primary prevention risk stratification.',
  references: [
    'Wilson PWF, et al. Prediction of coronary heart disease using risk factor categories. Circulation. 1998;97(18):1837–1847.',
    'Expert Panel on Detection, Evaluation, and Treatment of High Blood Cholesterol in Adults. Third Report of the NCEP Expert Panel (ATP III). JAMA. 2001;285(19):2486–2497.',
  ],
  inputs: [
    {
      id: 'sex',
      label: 'Sex',
      type: 'select',
      required: true,
      options: [
        { value: 0, label: 'Male' },
        { value: 1, label: 'Female' },
      ],
    },
    { id: 'age',       label: 'Age',                    type: 'number', unit: 'years', min: 20, max: 79, required: true },
    { id: 'totalChol', label: 'Total Cholesterol',       type: 'number', unit: 'mg/dL', min: 100, max: 400, required: true },
    { id: 'hdl',       label: 'HDL Cholesterol',         type: 'number', unit: 'mg/dL', min: 20,  max: 120, required: true },
    { id: 'sbp',       label: 'Systolic Blood Pressure', type: 'number', unit: 'mmHg',  min: 90,  max: 200, required: true },
    { id: 'bpTreated', label: 'On blood pressure treatment',                            type: 'checkbox' },
    { id: 'smoker',    label: 'Current smoker',                                         type: 'checkbox' },
  ],
  calculate({ sex, age, totalChol, hdl, sbp, bpTreated, smoker }) {
    const isFemale = sex === 1;
    const ageCat   = getAgeCat(age);
    const cholGrp  = Math.floor(ageCat / 2); // 0-4: 20-39, 40-49, 50-59, 60-69, 70-79
    const cholIdx  = getCholIdx(totalChol);
    const sbpCat   = getSbpCat(sbp);

    const agePoints  = isFemale ? femaleAgePoints[ageCat]              : maleAgePoints[ageCat];
    const cholPoints = isFemale ? femaleCholTable[cholGrp][cholIdx]    : maleCholTable[cholGrp][cholIdx];
    const hdlPoints  = getHdlPoints(hdl);
    const smokePoints = smoker
      ? (isFemale ? femaleSmokeTable[cholGrp] : maleSmokeTable[cholGrp])
      : 0;
    const sbpPoints  = bpTreated
      ? (isFemale ? femaleSbpTreated[sbpCat]   : maleSbpTreated[sbpCat])
      : (isFemale ? femaleSbpUntreated[sbpCat] : maleSbpUntreated[sbpCat]);

    const total = agePoints + cholPoints + hdlPoints + smokePoints + sbpPoints;
    const riskPct = getRiskPercent(total, isFemale);

    let risk, category;
    const riskNum = typeof riskPct === 'string' ? (riskPct === '<1' ? 0 : 30) : riskPct;
    if (riskNum < 10) {
      risk = 'low';
      category = 'Low risk — lifestyle modification; reassess in 5 years';
    } else if (riskNum < 20) {
      risk = 'moderate';
      category = 'Intermediate risk — intensify lifestyle modification; consider statin therapy';
    } else {
      risk = 'high';
      category = 'High risk — aggressive risk factor reduction; statin therapy indicated';
    }

    const riskDisplay = typeof riskPct === 'string' ? riskPct : `${riskPct}`;
    const interpretation = `Point score ${total} → ${riskDisplay}% estimated 10-year CVD risk — ${category}`;

    return { result: riskDisplay, unit: '%', interpretation, risk };
  },
};
