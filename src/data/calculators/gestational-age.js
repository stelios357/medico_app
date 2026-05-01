export default {
  slug: 'gestational-age',
  name: 'Gestational Age Calculator',
  specialty: 'obgyn',
  description: 'Calculates gestational age from the last menstrual period (LMP) and estimates the due date (EDD = LMP + 280 days, Naegele\'s rule).',
  references: [
    'American College of Obstetricians and Gynecologists. Methods for Estimating the Due Date. Committee Opinion No. 700. Obstet Gynecol. 2017;129(5):e150–e154.',
    'Naegele FC. Lehrbuch der Geburtshilfe. 1830.',
  ],
  inputs: [
    {
      id: 'lmpDays',
      label: 'Days since last menstrual period (LMP)',
      type: 'number',
      unit: 'days',
      min: 1,
      max: 315,
      required: true,
    },
  ],
  calculate({ lmpDays }) {
    const gaWeeks = Math.floor(lmpDays / 7);
    const gaDays  = lmpDays % 7;
    const daysUntilEdd = 280 - lmpDays;

    let trimester, trimesterNote;
    if (lmpDays < 91) {
      trimester = '1st trimester';
      trimesterNote = '— routine dating ultrasound and nuchal translucency screening';
    } else if (lmpDays < 196) {
      trimester = '2nd trimester';
      trimesterNote = '— anatomy scan recommended at 18–22 weeks';
    } else if (gaWeeks < 37) {
      trimester = '3rd trimester (preterm)';
      trimesterNote = gaWeeks < 34
        ? '— risk of significant prematurity; antenatal corticosteroids if delivery anticipated'
        : '— late preterm; monitor closely';
    } else if (gaWeeks < 39) {
      trimester = 'Early term (37–38 weeks)';
      trimesterNote = '— avoid elective delivery before 39 weeks if possible';
    } else if (gaWeeks <= 40) {
      trimester = 'Full term (39–40 weeks)';
      trimesterNote = '';
    } else if (gaWeeks === 41) {
      trimester = 'Late term (41 weeks)';
      trimesterNote = '— induction discussion warranted';
    } else {
      trimester = 'Post-term (≥42 weeks)';
      trimesterNote = '— increased risk of placental insufficiency; induction indicated';
    }

    let eddNote;
    if (daysUntilEdd > 1) {
      eddNote = `EDD in approximately ${daysUntilEdd} days`;
    } else if (daysUntilEdd === 1) {
      eddNote = 'EDD tomorrow';
    } else if (daysUntilEdd === 0) {
      eddNote = 'Today is the estimated due date';
    } else {
      eddNote = `${Math.abs(daysUntilEdd)} day${Math.abs(daysUntilEdd) > 1 ? 's' : ''} past estimated due date`;
    }

    const gaDisplay = `${gaWeeks}w ${gaDays}d`;
    const interpretation = `${gaDisplay} — ${trimester}${trimesterNote ? ' ' + trimesterNote : ''}. ${eddNote}.`;

    let risk;
    if (gaWeeks < 34) risk = 'high';
    else if (gaWeeks < 37 || gaWeeks >= 42) risk = 'moderate';
    else risk = 'low';

    return { result: gaDisplay, unit: '', interpretation, risk };
  },
};
