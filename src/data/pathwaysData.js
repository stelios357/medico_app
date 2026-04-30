const pathwaysData = [
  {
    id: "pathway-cap",
    topicId: "topic-cap-antibiotics",
    title: "Empiric Antibiotic Selection in Community-Acquired Pneumonia",
    disclaimer:
      "This pathway is intended as a clinical decision support tool for qualified healthcare professionals. It does not replace individual clinical judgement, local antibiogram data, or institutional guidelines. Always consider patient allergies, renal function, local resistance patterns, and microbiological results when making prescribing decisions.",
    steps: [
      {
        id: "step1",
        title: "Confirm the Diagnosis",
        question: "Does the chest X-ray show new consolidation (lobar, segmental, or patchy infiltrate) consistent with pneumonia?",
        body: "A new radiological infiltrate is required to confirm CAP diagnosis. Absence of consolidation should prompt consideration of alternative diagnoses. Clinical features alone (fever, cough, sputum, crackles) have a positive predictive value of approximately 30% for radiologically confirmed pneumonia.",
        citations: ["study-capnetz"],
        input: {
          type: "yesno",
          label: "New consolidation present on chest X-ray?"
        },
        branches: [
          {
            condition: "yes",
            nextStepId: "step2"
          },
          {
            condition: "no",
            nextStepId: "outcome_caution",
            outcomeMessage: "Consider alternative diagnoses including pulmonary embolism, malignancy, cardiac pulmonary oedema, or viral pneumonitis. If clinical suspicion remains high, consider CT pulmonary angiography or repeat CXR at 24–48 hours. Do not commence empiric antibiotics without radiological or microbiological confirmation."
          }
        ]
      },
      {
        id: "step2",
        title: "Assess Severity Using PSI",
        question: "What is the patient's Pneumonia Severity Index (PSI) class?",
        body: "Calculate PSI score using age, sex, nursing home residence, comorbidities (neoplasm, liver disease, heart failure, cerebrovascular disease, renal disease), examination findings (altered mental status, RR ≥30, SBP <90, temperature <35°C or ≥40°C, HR ≥125), and investigations (pH <7.35, BUN ≥30, Na <130, glucose ≥250, Hct <30%, PaO₂ <60mmHg, pleural effusion). PSI Class I–II: low risk (≤70 points or no risk factors). Class III: intermediate (71–90 points). Class IV–V: high risk (91–130, >130 points).",
        citations: ["study-capnetz"],
        input: {
          type: "select",
          label: "Select PSI class",
          options: ["Class I–II (low risk)", "Class III (moderate risk)", "Class IV–V (high risk)"]
        },
        branches: [
          {
            condition: "Class I–II (low risk)",
            nextStepId: "step3"
          },
          {
            condition: "Class III (moderate risk)",
            nextStepId: "step3"
          },
          {
            condition: "Class IV–V (high risk)",
            nextStepId: "step4"
          }
        ]
      },
      {
        id: "step3",
        title: "Outpatient-Appropriate Treatment",
        question: "Is the patient clinically appropriate for outpatient (community) treatment?",
        body: "Consider outpatient treatment if ALL of the following are met: PSI Class I–III, SpO₂ ≥94% on room air, able to tolerate oral medication, no social concerns preventing self-care, and no clinical deterioration in the ED. Admit if any red flag is present: RR >30, SpO₂ <92%, systolic BP <90mmHg, altered consciousness, bilateral or multilobar infiltrates, or failure to improve after 48 hours of outpatient therapy.",
        citations: ["study-capnetz", "study-postma2015"],
        input: {
          type: "yesno",
          label: "Patient suitable for outpatient management?"
        },
        branches: [
          {
            condition: "yes",
            nextStepId: "step5"
          },
          {
            condition: "no",
            nextStepId: "step4"
          }
        ]
      },
      {
        id: "step4",
        title: "Inpatient Antibiotic Selection",
        question: "Select the most appropriate inpatient antibiotic regimen based on allergy status and severity:",
        body: "For non-ICU inpatients, beta-lactam-based therapy is the preferred empiric approach (Postma 2015). Combination therapy with a macrolide provides additional coverage for atypical organisms and is associated with lower 30-day mortality in severe disease (Waterer 2011). Fluoroquinolones should be reserved for documented penicillin allergy or failure of first-line therapy. For ICU patients, dual therapy is mandatory. Obtain blood cultures and sputum cultures before commencing antibiotics where clinically feasible.",
        citations: ["study-postma2015", "study-waterer2011"],
        input: {
          type: "select",
          label: "Select antibiotic regimen",
          options: [
            "No allergies — β-lactam + macrolide (amoxicillin 1g IV TDS + azithromycin 500mg daily)",
            "Penicillin allergy — respiratory fluoroquinolone (moxifloxacin 400mg daily or levofloxacin 500mg BD)",
            "ICU admission — dual therapy required (piperacillin-tazobactam 4.5g IV TDS + azithromycin 500mg daily)"
          ]
        },
        branches: [
          {
            condition: "No allergies — β-lactam + macrolide (amoxicillin 1g IV TDS + azithromycin 500mg daily)",
            nextStepId: "outcome_proceed",
            outcomeMessage: "Commence amoxicillin 1g IV three times daily plus azithromycin 500mg IV/oral once daily. Review blood and sputum culture results at 48–72 hours and de-escalate to oral amoxicillin 1g TDS if clinically improving. Target total antibiotic duration: 5 days."
          },
          {
            condition: "Penicillin allergy — respiratory fluoroquinolone (moxifloxacin 400mg daily or levofloxacin 500mg BD)",
            nextStepId: "outcome_proceed",
            outcomeMessage: "Commence moxifloxacin 400mg IV/oral once daily (preferred) or levofloxacin 500mg IV/oral twice daily. Counsel patient regarding QTc prolongation risk; obtain baseline ECG. Review at 48–72 hours for step-down to oral therapy. Total duration: 5 days."
          },
          {
            condition: "ICU admission — dual therapy required (piperacillin-tazobactam 4.5g IV TDS + azithromycin 500mg daily)",
            nextStepId: "outcome_proceed",
            outcomeMessage: "Commence piperacillin-tazobactam 4.5g IV three times daily plus azithromycin 500mg IV once daily. Consider addition of oseltamivir if influenza is suspected. Reassess daily for de-escalation opportunity based on culture results and clinical trajectory. Seek infectious diseases review if no improvement at 72 hours."
          }
        ]
      },
      {
        id: "step5",
        title: "Outpatient Antibiotic Regimen",
        question: "Does the patient have comorbidities that increase risk of resistant organisms or treatment failure (diabetes mellitus, COPD, heart failure, immunosuppression, or antibiotics in the previous 3 months)?",
        body: "Patients without comorbidities and no recent antibiotic use are at low risk for drug-resistant Streptococcus pneumoniae and atypical organisms, and can be treated with amoxicillin monotherapy. Those with comorbidities or recent antibiotic exposure require broader empiric coverage. Advise all outpatients to return immediately if symptoms worsen or fail to improve within 48 hours. Provide written safety-netting advice.",
        citations: ["study-postma2015"],
        input: {
          type: "yesno",
          label: "Comorbidities or recent antibiotic use present?"
        },
        branches: [
          {
            condition: "yes",
            nextStepId: "outcome_proceed",
            outcomeMessage: "Amoxicillin-clavulanate 875/125mg orally twice daily PLUS azithromycin 500mg on day 1 then 250mg on days 2–5. Total duration: 5 days. Safety-net: return if no improvement at 48 hours, or immediately if worsening. Follow-up CXR at 6 weeks to confirm resolution (especially in smokers or patients >50 years)."
          },
          {
            condition: "no",
            nextStepId: "outcome_proceed",
            outcomeMessage: "Amoxicillin 1g orally three times daily for 5 days. Safety-net: review in 48 hours (in-person or telephone). Return immediately if symptoms worsen (worsening dyspnoea, SpO₂ <93%, new confusion, or failure to improve by day 3). Follow-up CXR at 6 weeks in patients >50 years or smokers to exclude underlying malignancy."
          }
        ]
      }
    ]
  },

  {
    id: "pathway-paed-sepsis",
    topicId: "topic-fluid-paed-sepsis",
    title: "Fluid Resuscitation in Pediatric Septic Shock",
    disclaimer:
      "This pathway is intended as decision support for trained paediatric clinicians managing children with suspected septic shock in acute care settings. It does not replace senior clinical review, local sepsis protocols, or paediatric intensive care consultation. Drug doses must be verified against local formulary and weight-based dose calculators. Seek immediate PICU consultation for any child with suspected septic shock.",
    steps: [
      {
        id: "step1",
        title: "Recognise Septic Shock",
        question: "Does the child have suspected or confirmed infection PLUS ≥2 SIRS criteria AND at least one sign of poor end-organ perfusion?",
        body: "SIRS criteria in children: (1) Temperature >38.5°C or <36°C; (2) Heart rate >2 SD above normal for age; (3) Respiratory rate >2 SD above normal for age; (4) WBC >12 or <4 ×10⁹/L, or >10% bands. Signs of poor perfusion: prolonged capillary refill time (>2 seconds), mottled or pale skin, altered mental state, reduced urine output (<1ml/kg/hour), or hypotension (a late sign in children). Normal HR and BP by age: neonate (HR 120–160, SBP >60); infant 1–12m (HR 100–160, SBP >70); 1–5y (HR 90–140, SBP >80); 5–12y (HR 70–120, SBP >90); >12y (HR 60–100, SBP >100).",
        citations: ["study-rhoades-ssc"],
        input: {
          type: "yesno",
          label: "Suspected infection + ≥2 SIRS criteria + signs of poor perfusion?"
        },
        branches: [
          {
            condition: "yes",
            nextStepId: "step2"
          },
          {
            condition: "no",
            nextStepId: "outcome_caution",
            outcomeMessage: "Septic shock criteria not currently met. Continue clinical monitoring and reassess every 15–30 minutes. Investigate for alternative causes of physiological compromise (anaphylaxis, cardiac tamponade, tension pneumothorax, DKA, hypovolaemia from other causes). Do not delay treatment if clinical deterioration occurs."
          }
        ]
      },
      {
        id: "step2",
        title: "Establish Vascular Access",
        question: "Has IV or intraosseous (IO) access been achieved within 5 minutes of recognition?",
        body: "Vascular access should be established immediately. Attempt peripheral IV access twice; if unsuccessful within 5 minutes, proceed directly to intraosseous access. IO access is appropriate in any age group and any anatomical site (proximal tibia preferred in children <6 years; distal femur or humeral head in older children). All medications and fluids can be delivered via IO route. Alert the PICU team simultaneously.",
        citations: ["study-rhoades-ssc"],
        input: {
          type: "yesno",
          label: "IV or IO access achieved within 5 minutes?"
        },
        branches: [
          {
            condition: "yes",
            nextStepId: "step3"
          },
          {
            condition: "no",
            nextStepId: "outcome_escalate",
            outcomeMessage: "Escalate immediately: call for senior/paediatric emergency support and attempt intraosseous access now. IO insertion should not be delayed beyond 2 further minutes. Notify PICU and consider urgent central venous access if IO fails. Document time of recognition and all access attempts."
          }
        ]
      },
      {
        id: "step3",
        title: "Initial Fluid Bolus Calculation",
        question: "Enter the child's weight in kilograms to calculate the initial fluid bolus volume:",
        body: "Current evidence (post-FEAST) does not support routine 20ml/kg boluses in all children. Administer 10ml/kg isotonic crystalloid over 15–30 minutes as an initial bolus, with reassessment after each aliquot. Total bolus volume should not exceed 40ml/kg in the first hour without senior review and vasopressor consideration. In children with known cardiac disease, commence at 5ml/kg per aliquot. Obtain blood cultures, blood gas, lactate, and glucose before or immediately after first bolus.",
        citations: ["study-feast", "study-squeeze"],
        input: {
          type: "number",
          label: "Patient weight",
          unit: "kg",
          min: 2,
          max: 60
        },
        branches: [
          {
            condition: "weight_entered",
            nextStepId: "step4"
          }
        ]
      },
      {
        id: "step4",
        title: "Select Initial Resuscitation Fluid",
        question: "Select the initial resuscitation fluid:",
        body: "Isotonic crystalloids (0.9% NaCl or Ringer's lactate) are the recommended first-line fluids for paediatric septic shock resuscitation. Ringer's lactate is preferred where available as it is more physiological and associated with less hyperchloraemic acidosis. Colloids (albumin 4–5%) may be considered in patients with refractory shock after ≥40ml/kg crystalloid, or in neonates and infants where colloid oncotic pressure maintenance is particularly important. Avoid hypotonic fluids (0.45% NaCl, 5% dextrose) for bolus resuscitation.",
        citations: ["study-feast", "study-squeeze", "study-rhoades-ssc"],
        input: {
          type: "select",
          label: "Select resuscitation fluid",
          options: [
            "0.9% NaCl (isotonic saline) — 10ml/kg over 15–30 minutes",
            "Ringer's lactate — 10ml/kg over 15–30 minutes",
            "Colloid: 4.5% albumin — 10ml/kg over 15–30 minutes (refractory shock or neonates)"
          ]
        },
        branches: [
          {
            condition: "0.9% NaCl (isotonic saline) — 10ml/kg over 15–30 minutes",
            nextStepId: "step5"
          },
          {
            condition: "Ringer's lactate — 10ml/kg over 15–30 minutes",
            nextStepId: "step5"
          },
          {
            condition: "Colloid: 4.5% albumin — 10ml/kg over 15–30 minutes (refractory shock or neonates)",
            nextStepId: "step5"
          }
        ]
      },
      {
        id: "step5",
        title: "Assess Response at 15 Minutes",
        question: "After completing the initial 10ml/kg bolus, has perfusion improved? (Heart rate normalised for age, capillary refill <2 seconds, blood pressure adequate for age, improved mental state)",
        body: "Reassess after each fluid bolus using the same clinical parameters used at presentation. Improvement in ANY of the following suggests positive fluid responsiveness: reduction in HR towards age-normal range, capillary refill improving to <2 seconds, improvement in skin colour (mottling resolving), improved conscious level, or MAP reaching target (>50mmHg in infants, >65mmHg in older children). If the child has received >40ml/kg total and perfusion has not improved, vasopressor support is strongly indicated — do not continue to administer large-volume fluids without vasopressor escalation.",
        citations: ["study-squeeze", "study-feast"],
        input: {
          type: "yesno",
          label: "Perfusion improved after initial bolus?"
        },
        branches: [
          {
            condition: "yes",
            nextStepId: "outcome_proceed",
            outcomeMessage: "Clinical response achieved. Continue maintenance fluid at appropriate rate for age and weight. Reassess every 15–30 minutes. Administer empiric broad-spectrum antibiotics within 1 hour of sepsis recognition if not already given. Repeat bolus (10ml/kg) only if perfusion deteriorates again. PICU review recommended for all children requiring bolus resuscitation."
          },
          {
            condition: "no",
            nextStepId: "step6"
          }
        ]
      },
      {
        id: "step6",
        title: "Consider Vasopressor Support",
        question: "Perfusion has not improved despite initial fluid resuscitation. Select vasopressor agent to initiate:",
        body: "Vasopressor initiation is indicated in fluid-refractory septic shock (persisting poor perfusion after ≥20ml/kg isotonic crystalloid). Do not delay vasopressor therapy waiting to complete large-volume fluid resuscitation — early vasopressor use is associated with improved outcomes in the SQUEEZE trial. All vasopressors should be delivered via central venous or IO access where possible. Central line insertion should not delay vasopressor start — peripheral or IO delivery is acceptable initially. Target MAP ≥65 mmHg in children >1 year, or ≥50 mmHg in infants. Concurrent PICU transfer should be arranged urgently.",
        citations: ["study-squeeze", "study-rhoades-ssc"],
        input: {
          type: "select",
          label: "Select vasopressor",
          options: [
            "Noradrenaline (norepinephrine) — first-line for septic shock (0.05–0.3 mcg/kg/min IV/IO)",
            "Adrenaline (epinephrine) — septic shock with suspected cardiac dysfunction (0.05–0.3 mcg/kg/min IV/IO)",
            "Dopamine — if noradrenaline unavailable (5–20 mcg/kg/min IV/IO; note: higher arrhythmia risk)"
          ]
        },
        branches: [
          {
            condition: "Noradrenaline (norepinephrine) — first-line for septic shock (0.05–0.3 mcg/kg/min IV/IO)",
            nextStepId: "outcome_proceed",
            outcomeMessage: "Initiate noradrenaline at 0.05 mcg/kg/min and titrate upward every 5–10 minutes to achieve MAP target (≥65 mmHg in children >1 year; ≥50 mmHg in infants). Arrange urgent PICU transfer. Reassess perfusion within 30 minutes. Continue to administer empiric antibiotics if not yet given — antibiotic administration must not be delayed beyond 1 hour from sepsis recognition."
          },
          {
            condition: "Adrenaline (epinephrine) — septic shock with suspected cardiac dysfunction (0.05–0.3 mcg/kg/min IV/IO)",
            nextStepId: "outcome_proceed",
            outcomeMessage: "Initiate adrenaline at 0.05 mcg/kg/min IV/IO. Titrate to MAP target. Obtain urgent echocardiogram to assess cardiac function and guide ongoing management. Consider PICU consultation for potential adjunctive therapies (milrinone, ECMO if refractory). Reassess within 30 minutes. Do not delay antibiotic administration."
          },
          {
            condition: "Dopamine — if noradrenaline unavailable (5–20 mcg/kg/min IV/IO; note: higher arrhythmia risk)",
            nextStepId: "outcome_proceed",
            outcomeMessage: "Initiate dopamine at 5 mcg/kg/min and titrate to MAP target (≥65 mmHg in children >1 year; ≥50 mmHg in infants). Monitor ECG continuously for arrhythmia. Switch to noradrenaline as soon as it becomes available. Arrange urgent PICU transfer. Reassess perfusion within 30 minutes. Ensure antibiotics are administered within 1 hour of sepsis recognition."
          }
        ]
      }
    ]
  }
];

export default pathwaysData;
