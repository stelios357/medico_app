/**
 * Central registry of all clinical calculators.
 * Each entry must conform to the calculator config contract.
 * Adding a new entry here is the only change needed to surface it in the app.
 *
 * Sessions 10 and 11 will populate the full set of 20 calculators.
 */

const bmi = {
  slug: 'bmi',
  name: 'Body Mass Index (BMI)',
  specialty: 'general',
  description: 'Calculates BMI from weight and height as a screening measure for body fat and weight categories.',
  references: [
    'WHO. Obesity and overweight fact sheet. 2021.',
    'NHLBI. Clinical guidelines on identification, evaluation, and treatment of overweight and obesity in adults. 1998.',
  ],
  inputs: [
    { id: 'weight', label: 'Weight', type: 'number', unit: 'kg', min: 1, max: 300 },
    { id: 'height', label: 'Height', type: 'number', unit: 'cm', min: 50, max: 250 },
  ],
  calculate({ weight, height }) {
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    const result = Math.round(bmi * 10) / 10;
    let interpretation, risk;
    if (bmi < 18.5) {
      interpretation = 'Underweight — nutritional assessment recommended';
      risk = 'moderate';
    } else if (bmi < 25) {
      interpretation = 'Normal weight';
      risk = 'low';
    } else if (bmi < 30) {
      interpretation = 'Overweight — lifestyle counselling advised';
      risk = 'moderate';
    } else if (bmi < 35) {
      interpretation = 'Class I obesity';
      risk = 'high';
    } else if (bmi < 40) {
      interpretation = 'Class II obesity';
      risk = 'high';
    } else {
      interpretation = 'Class III (morbid) obesity';
      risk = 'high';
    }
    return { result, unit: 'kg/m²', interpretation, risk };
  },
};

const map = {
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

export const calculatorRegistry = [bmi, map];

export function getCalculatorBySlug(slug) {
  return calculatorRegistry.find(c => c.slug === slug) ?? null;
}
