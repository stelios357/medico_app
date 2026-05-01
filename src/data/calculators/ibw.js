// Devine formula (1974) — validated for height ≥ 152 cm (60 inches)
export default {
  slug: 'ibw',
  name: 'Ideal Body Weight (IBW)',
  specialty: 'general',
  description: 'Calculates ideal body weight using the Devine formula. Used for drug dosing (e.g. aminoglycosides, vancomycin, ventilator tidal volumes) and adjusted body weight in obese patients.',
  references: [
    'Devine BJ. Gentamicin therapy. Drug Intell Clin Pharm. 1974;8:650–655.',
    'Pai MP, Paloucek FP. The origin of the "ideal" body weight equations. Ann Pharmacother. 2000;34(9):1066–1069.',
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
    { id: 'height',        label: 'Height',               type: 'number', unit: 'cm',  min: 100, max: 250, required: true },
    { id: 'actualWeight',  label: 'Actual Body Weight',   type: 'number', unit: 'kg',  min: 20,  max: 400, required: false },
  ],
  calculate({ sex, height, actualWeight }) {
    const isFemale = sex === 1;
    const heightIn = height / 2.54;
    const base = isFemale ? 45.5 : 50.0;
    const ibw = Math.round((base + 2.3 * (heightIn - 60)) * 10) / 10;
    const ibwClamped = Math.max(ibw, base); // Devine is unreliable below 60 in; floor at base

    let notes = [];

    if (height < 152.4) {
      notes.push('Height < 152 cm (60 in): Devine formula not validated; IBW is approximated');
    }

    let abwNote = '';
    if (actualWeight && actualWeight > 0) {
      const pctOver = ((actualWeight - ibwClamped) / ibwClamped) * 100;
      if (pctOver > 30) {
        const abw = Math.round((ibwClamped + 0.4 * (actualWeight - ibwClamped)) * 10) / 10;
        abwNote = `Adjusted Body Weight (ABW) = ${abw} kg — use for aminoglycoside and some other weight-based dosing in obesity`;
        notes.push(abwNote);
      } else if (pctOver > 0) {
        notes.push(`Actual weight is ${Math.round(pctOver)}% above IBW — standard IBW-based dosing applies`);
      } else {
        notes.push('Actual weight is at or below IBW — use actual weight for dosing');
      }
    }

    const sexLabel = isFemale ? 'Female' : 'Male';
    const interpretation = `${sexLabel}, ${Math.round(height)} cm — IBW ${ibwClamped} kg. ${notes.join(' ')}`.trim();
    const risk = 'low';

    return { result: ibwClamped, unit: 'kg', interpretation, risk };
  },
};
