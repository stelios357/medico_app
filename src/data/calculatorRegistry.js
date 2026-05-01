import bmi              from './calculators/bmi.js';
import map              from './calculators/map.js';
import chadsvasc        from './calculators/chadsvasc.js';
import egfr             from './calculators/egfr.js';
import creatinineClear  from './calculators/creatinine-clearance.js';
import gcs              from './calculators/gcs.js';
import curb65           from './calculators/curb65.js';
import wellsDvt         from './calculators/wells-dvt.js';
import wellsPe          from './calculators/wells-pe.js';
import qsofa            from './calculators/qsofa.js';
import heartScore       from './calculators/heart-score.js';

export const calculatorRegistry = [
  chadsvasc,
  heartScore,
  bmi,
  egfr,
  creatinineClear,
  gcs,
  curb65,
  wellsDvt,
  wellsPe,
  qsofa,
  map,
];

export function getCalculatorBySlug(slug) {
  return calculatorRegistry.find(c => c.slug === slug) ?? null;
}
