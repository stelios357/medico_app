/**
 * Maps calculator slugs to drug search keywords and the minimum result score
 * at which drug suggestions should be surfaced.
 *
 * Keys must match calculator slugs exactly.
 * drugs[] values are used as openFDA search keywords — one search per keyword,
 * first result taken.
 * priority — optional map of keyword → sort order (lower = higher priority).
 */
export const calcDrugMap = {
  chadsvasc: {
    threshold: 2,
    label: 'Suggested Anticoagulants',
    drugs: ['apixaban', 'rivaroxaban', 'dabigatran', 'warfarin'],
    priority: { apixaban: 1, rivaroxaban: 2, dabigatran: 3, warfarin: 4 },
  },
  curb65: {
    threshold: 2,
    label: 'Consider clinical evaluation and antibiotics',
    drugs: ['amoxicillin', 'azithromycin', 'levofloxacin'],
  },
  qsofa: {
    threshold: 2,
    label: 'Consider sepsis evaluation and urgent management',
    drugs: ['piperacillin tazobactam', 'vancomycin', 'meropenem'],
  },
};
