export default {
  slug: 'bmi',
  name: 'Body Mass Index (BMI)',
  specialty: 'general',
  description: 'Calculates BMI from weight and height as a screening tool for body fat and weight categories.',
  references: [
    'WHO. Obesity and overweight fact sheet. 2021.',
    'NHLBI. Clinical guidelines on identification, evaluation, and treatment of overweight and obesity in adults. 1998.',
  ],
  inputs: [
    { id: 'weight', label: 'Weight', type: 'number', unit: 'kg', min: 1, max: 300 },
    { id: 'height', label: 'Height', type: 'number', unit: 'cm', min: 50, max: 250 },
  ],
  calculate({ weight, height }) {
    const hm = height / 100;
    const bmi = weight / (hm * hm);
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
