// Mosteller formula: BSA (m²) = √(Height(cm) × Weight(kg) / 3600)
export default {
  slug: 'bsa',
  name: 'Body Surface Area (BSA) — Mosteller',
  specialty: 'general',
  description: 'Calculates body surface area using the Mosteller formula. BSA is used for chemotherapy dosing, cardiac index, and other weight-normalized clinical calculations.',
  references: [
    'Mosteller RD. Simplified calculation of body-surface area. N Engl J Med. 1987;317(17):1098.',
    'Verbraecken J, et al. Body surface area in normal-weight, overweight, and obese adults: a comparison study. Metabolism. 2006;55(4):515–524.',
  ],
  inputs: [
    { id: 'height', label: 'Height', type: 'number', unit: 'cm', min: 50,  max: 250, required: true },
    { id: 'weight', label: 'Weight', type: 'number', unit: 'kg', min: 1,   max: 400, required: true },
  ],
  calculate({ height, weight }) {
    const bsa = Math.sqrt((height * weight) / 3600);
    const rounded = Math.round(bsa * 100) / 100;

    let interpretation, risk;
    if (rounded < 1.4) {
      interpretation = `BSA ${rounded} m² — Below typical adult range; verify height/weight and adjust drug doses accordingly`;
      risk = 'moderate';
    } else if (rounded <= 2.2) {
      interpretation = `BSA ${rounded} m² — Within typical adult range (1.4–2.2 m²); standard weight-based dosing applicable`;
      risk = 'low';
    } else {
      interpretation = `BSA ${rounded} m² — Above typical adult range; many chemotherapy protocols cap at 2.0–2.2 m² — verify institutional protocol`;
      risk = 'moderate';
    }

    return { result: rounded, unit: 'm²', interpretation, risk };
  },
};
