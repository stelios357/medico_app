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

// Session 11
import framinghamCvd    from './calculators/framingham-cvd.js';
import fena             from './calculators/fena.js';
import nihss            from './calculators/nihss.js';
import gestationalAge   from './calculators/gestational-age.js';
import bishopScore      from './calculators/bishop-score.js';
import aaGradient       from './calculators/aa-gradient.js';
import ibw              from './calculators/ibw.js';
import bsa              from './calculators/bsa.js';
import revisedTrauma    from './calculators/revised-trauma-score.js';
import fev1Fvc          from './calculators/fev1-fvc.js';

export const calculatorRegistry = [
  // Cardiology
  chadsvasc,
  heartScore,
  framinghamCvd,
  // General
  bmi,
  bsa,
  ibw,
  map,
  // Nephrology
  egfr,
  creatinineClear,
  fena,
  // Neurology
  gcs,
  nihss,
  // Emergency
  curb65,
  qsofa,
  revisedTrauma,
  // DVT / PE
  wellsDvt,
  wellsPe,
  // OB/GYN
  gestationalAge,
  bishopScore,
  // Pulmonology
  aaGradient,
  fev1Fvc,
];

export function getCalculatorBySlug(slug) {
  return calculatorRegistry.find(c => c.slug === slug) ?? null;
}
