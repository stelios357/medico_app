/**
 * Frequently prescribed / recognizable drug names (lowercase).
 * "Common" badge when brand or generic matches (Session 7).
 */
export const COMMON_DRUGS = [
  'metformin', 'lisinopril', 'amlodipine', 'atorvastatin', 'levothyroxine',
  'omeprazole', 'metoprolol', 'simvastatin', 'losartan', 'gabapentin',
  'hydrochlorothiazide', 'sertraline', 'fluticasone', 'montelukast', 'furosemide',
  'pantoprazole', 'pravastatin', 'prednisone', 'ibuprofen', 'tramadol',
  'cyclobenzaprine', 'tamsulosin', 'duloxetine', 'meloxicam', 'amoxicillin',
  'azithromycin', 'citalopram', 'clonazepam', 'alprazolam', 'escitalopram',
  'naproxen', 'atenolol', 'carvedilol', 'rosuvastatin', 'insulin', 'glargine',
  'lispro', 'aspart', 'detemir', 'degludec', 'aspirin', 'acetaminophen',
  'warfarin', 'apixaban', 'rivaroxaban', 'dabigatran', 'clopidogrel',
  'ticagrelor', 'prasugrel', 'heparin', 'enoxaparin', 'fondaparinux',
  'albuterol', 'budesonide', 'tiotropium', 'salmeterol', 'formoterol',
  'theophylline', 'prednisolone', 'methylprednisolone', 'hydrocodone',
  'oxycodone', 'morphine', 'fentanyl', 'codeine', 'ranitidine', 'famotidine',
  'sucralfate', 'metoclopramide', 'ondansetron', 'promethazine', 'diazepam',
  'lorazepam', 'temazepam', 'zolpidem', 'eszopiclone', 'trazodone',
  'mirtazapine', 'bupropion', 'venlafaxine', 'aripiprazole', 'quetiapine',
  'olanzapine', 'risperidone', 'haloperidol', 'fluoxetine', 'paroxetine',
  'atomoxetine', 'pregabalin', 'carbamazepine', 'valproate', 'valproic',
  'lamotrigine', 'levetiracetam', 'topiramate', 'phenytoin', 'phenobarbital',
  'methotrexate', 'hydroxychloroquine', 'adalimumab', 'etanercept',
  'infliximab', 'colchicine', 'allopurinol', 'febuxostat', 'finasteride',
  'tadalafil', 'sildenafil', 'solifenacin', 'oxybutynin', 'spironolactone',
  'eplerenone', 'digoxin', 'amiodarone', 'diltiazem', 'verapamil',
  'nifedipine', 'isosorbide', 'nitroglycerin', 'clonidine', 'doxazosin',
  'terazosin', 'dutasteride', 'sumatriptan', 'rizatriptan', 'propranolol',
  'timolol', 'brimonidine', 'latanoprost', 'dorzolamide', 'ketorolac',
  'cephalexin', 'ciprofloxacin', 'levofloxacin', 'trimethoprim',
  'sulfamethoxazole', 'doxycycline', 'minocycline', 'clindamycin',
  'metronidazole', 'nitrofurantoin', 'fosfomycin', 'acyclovir', 'valacyclovir',
  'oseltamivir', 'fluconazole', 'itraconazole', 'ritonavir', 'nirmatrelvir',
  'cefdinir', 'cefuroxime', 'piperacillin', 'meropenem', 'ertapenem',
  'vancomycin', 'linezolid', 'daptomycin', 'rifampin', 'isoniazid',
  'pyrazinamide', 'ethambutol', 'semaglutide', 'empagliflozin', 'dapagliflozin',
  'sitagliptin', 'linagliptin', 'glipizide', 'glyburide', 'pioglitazone',
  'ezetimibe', 'fenofibrate', 'niacin', 'colesevelam', 'cholestyramine',
  'potassium', 'magnesium', 'calcium', 'ferrous', 'cyanocobalamin',
  'folic', 'cholecalciferol', 'alendronate', 'risedronate', 'raloxifene',
  'estradiol', 'medroxyprogesterone', 'norethindrone', 'drospirenone',
  'methylphenidate', 'lisdexamfetamine', 'amphetamine', 'guanfacine',
  'clarithromycin', 'erythromycin', 'hydroxyzine', 'diphenhydramine',
  'cetirizine', 'loratadine', 'fexofenadine', 'pseudoephedrine', 'phenylephrine',
  'benzonatate', 'guaifenesin', 'dextromethorphan', 'polyethylene glycol',
  'bisacodyl', 'lactulose', 'milk of magnesia', 'loperamide',
]

const COMMON_SET = new Set(
  COMMON_DRUGS.map(s => s.toLowerCase().trim()).filter(Boolean),
)

/** True if brand or generic name matches the common-drugs list (token-aware). */
export function isCommonDrug(drug) {
  if (!drug) return false
  const names = [drug.brandName, drug.genericName].filter(Boolean)
  for (const raw of names) {
    const n = raw.toLowerCase().trim()
    if (COMMON_SET.has(n)) return true
    for (const t of n.split(/[\s,/]+/)) {
      if (t && COMMON_SET.has(t)) return true
    }
  }
  return false
}
