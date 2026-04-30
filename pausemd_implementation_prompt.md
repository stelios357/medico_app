# PauseMD — Feature Implementation Prompt
## Claude Code System Prompt (drop this into your session)

---

## CONTEXT & MISSION

You are implementing a set of new features for **PauseMD** ("Your Pocket SR"), a medical systematic-review reference app at `https://medico-app-one.vercel.app/`. The features are inspired by a competitor app (VIKI-P / vigkki.com), whose compiled Flutter app is available as `vigkki.wasm` in the project root. Your job is to implement features that are **functionally equivalent** in utility but **visually and architecturally native** to PauseMD's existing style — not a copy.

You will never ship placeholder UI. Every component must be fully functional with real interaction logic, real state management, and real data flow.

---

## PHASE 0 — RECONNAISSANCE (do this first, every time)

Before writing a single line of feature code, complete ALL of the following steps in order.

### 0A. Inspect the WASM for behavioral reference

```bash
# Install wasm tools if not present
npm install -g wasm-decompile 2>/dev/null || true
which wasm2wat || apt-get install -y wabt 2>/dev/null || true

# Export readable symbol names from the WASM
wasm2wat vigkki.wasm -o vigkki.wat 2>/dev/null || \
  node -e "
    const fs = require('fs');
    const buf = fs.readFileSync('vigkki.wasm');
    // Extract all printable strings >= 4 chars (function names, screen names, labels)
    const strings = [];
    let cur = '';
    for (let i = 0; i < buf.length; i++) {
      const c = buf[i];
      if (c >= 32 && c < 127) { cur += String.fromCharCode(c); }
      else { if (cur.length >= 4) strings.push(cur); cur = ''; }
    }
    fs.writeFileSync('vigkki_strings.txt', strings.join('\n'));
    console.log('Extracted', strings.length, 'strings');
  "

# Read the strings file to understand screen names, labels, copy
head -200 vigkki_strings.txt 2>/dev/null || true
```

From this extraction, catalog:
- Screen/route names → understand the navigation model
- Button labels and UI copy → understand micro-UX decisions
- Calculator field names → understand input/output schemas for each calculator
- Score names and thresholds → understand the scoring logic

**Do not copy any UI copy verbatim.** Use the string extraction to understand *what* each feature does, then write PauseMD-native copy from scratch.

### 0B. Map the existing codebase

```bash
# Understand project structure
ls -la
cat package.json
find . -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \
  | grep -v node_modules | grep -v .next | grep -v dist | sort

# Read the routing/navigation
find . -name "_app*" -o -name "app.tsx" -o -name "App.tsx" \
  -o -name "router*" -o -name "routes*" | grep -v node_modules | head -20
cat $(find . -name "pages" -type d | head -1)/../pages/_app.tsx 2>/dev/null || \
cat $(find . -name "app" -type d | grep -v node_modules | head -1)/layout.tsx 2>/dev/null || true

# Read the design tokens / theme
find . -name "globals.css" -o -name "theme*" -o -name "tokens*" \
  | grep -v node_modules | xargs cat 2>/dev/null | head -150

# Understand existing components
find . -path "*/components/*" -name "*.tsx" | grep -v node_modules | head -30
```

From this, document:
- **Framework**: Next.js / Vite / CRA? App Router or Pages Router?
- **CSS approach**: Tailwind / CSS Modules / styled-components / plain CSS?
- **State management**: Zustand / Redux / Context / Jotai?
- **Component conventions**: how are existing components structured, named, exported?
- **Existing color palette**: exact CSS variables or Tailwind classes in use
- **Existing typography**: font families, weight/size system
- **Existing spacing scale**: gap/padding values used throughout

**You must match ALL of the above exactly.** Do not introduce new CSS conventions, a new state library, or new component patterns. Extend what exists.

### 0C. Read every existing component that the new features will touch

For each feature below, identify the 2-3 existing files most likely to be modified (layout wrappers, routing files, shared hooks). Read them fully before writing.

```bash
# Example — before implementing the floating panel:
cat $(find . -name "layout*" | grep -v node_modules | head -1)
cat $(find . -name "_document*" | grep -v node_modules | head -1)
```

---

## PHASE 1 — FLOATING QUICK-CALC PANEL

**VIKI-P source**: `GlobalFloatingCalculator`  
**PauseMD identity**: A persistent floating panel for evidence-based calculations — NNT, NNH, Relative Risk, ARR, effect size. This is NOT a drug dosing tool.

### Spec

**Trigger**: A circular FAB (floating action button), bottom-right, `z-index: 9999`, persists across ALL routes.  
**Open state**: Panel slides up (300ms ease-out) from the FAB position, width `min(360px, 92vw)`, max-height `70vh`, scrollable.  
**Close**: Tap FAB again, tap backdrop, press Escape.  
**Persistence**: Last-used calculator tab is remembered in `localStorage`.

### Calculators to implement (all 5 required)

#### 1. NNT / NNH Calculator
```
Inputs:
  - Control event rate (CER): number input, 0–100, labeled "Control group events (%)"
  - Experimental event rate (EER): number input, 0–100, labeled "Treatment group events (%)"
  - Type toggle: "Benefit (NNT)" | "Harm (NNH)"

Outputs (live, update on every keystroke):
  - ARR = |CER - EER| / 100
  - NNT = 1 / ARR  (rounded to 1 decimal)
  - Interpretation string: e.g. "Treat X patients to prevent 1 event"
  - 95% CI for NNT (use Altman method: 1/CI_ARR)

Validation:
  - Show error if EER >= CER when calculating NNT benefit
  - Show "No benefit detected" if ARR = 0
```

#### 2. Relative Risk Calculator
```
Inputs (2x2 table format):
  - a: exposed with outcome
  - b: exposed without outcome
  - c: unexposed with outcome
  - d: unexposed without outcome

Outputs:
  - RR = (a/(a+b)) / (c/(c+d)), rounded to 2 dp
  - RR 95% CI (log method)
  - OR = (a*d)/(b*c), rounded to 2 dp
  - OR 95% CI
  - Color-coded interpretation: RR<1 (teal = protective), RR>1 (amber = harmful), RR=1 (gray)
```

#### 3. Effect Size (Cohen's d / NNT from d)
```
Inputs:
  - Mean 1, Mean 2
  - SD 1, SD 2 (or pooled SD toggle)
  - Sample sizes n1, n2

Outputs:
  - Cohen's d (pooled SD formula)
  - Verbal interpretation: negligible (<0.2) / small (0.2–0.5) / medium (0.5–0.8) / large (>0.8)
  - Approximate NNT from d (Furukawa conversion: NNT ≈ 1 / (2 * Φ(d/√2) - 1))
```

#### 4. Confidence Interval Builder
```
Inputs:
  - Statistic type: proportion / mean / RR / OR
  - Point estimate
  - n (sample size) or SE
  - Confidence level: 90 / 95 / 99

Output:
  - CI lower bound, upper bound
  - Visual bar showing estimate + CI on a number line
```

#### 5. GRADE Evidence Downgrader
```
A checklist, not a calculator. 5 domains, each with 3 states:
  - Risk of bias: Not serious / Serious / Very serious
  - Inconsistency: Not serious / Serious / Very serious
  - Indirectness: Not serious / Serious / Very serious
  - Imprecision: Not serious / Serious / Very serious
  - Publication bias: Undetected / Suspected / Strongly suspected

Starting quality: set by user (RCT = High, Observational = Low)
Output: Final GRADE level (High / Moderate / Low / Very Low) with color badge
  - Each "Serious" downgrades by 1 level
  - Each "Very serious" downgrades by 2 levels
```

### Implementation instructions

```
File to create: components/QuickCalc/QuickCalcPanel.tsx
File to create: components/QuickCalc/calculators/NNTCalc.tsx
File to create: components/QuickCalc/calculators/RRCalc.tsx
File to create: components/QuickCalc/calculators/EffectSizeCalc.tsx
File to create: components/QuickCalc/calculators/CICalc.tsx
File to create: components/QuickCalc/calculators/GRADECalc.tsx
File to create: hooks/useQuickCalc.ts

Mount point: Add <QuickCalcPanel /> to the root layout ONCE, outside any route wrapper.

FAB design:
  - Circle, 52px diameter
  - Use existing primary color from the app's theme
  - Icon: a small sigma (Σ) or calculator glyph — NOT a plus sign
  - On hover: scale(1.08), transition 150ms
  - On open: rotate 45° or morph to X icon

Panel tabs: use the SAME tab component already in the codebase for consistency.
  Label each tab with a 2-letter abbreviation: NNT · RR · ES · CI · GR

All math must be computed client-side in pure TypeScript functions.
Export each formula function separately so they can be unit tested:
  export function calcNNT(cer: number, eer: number): NNTResult
  export function calcRR(a:number,b:number,c:number,d:number): RRResult
  etc.

Write jest unit tests for each formula function.
```

---

## PHASE 2 — PER-TOPIC MULTI-LENS TABS

**VIKI-P source**: `DashboardTab`, `ReferenceTab`, `MonographsAndScoresTab`, `CalculatorTab`  
**PauseMD identity**: Every topic/drug/intervention page has 4 content lenses — the same information organized four ways for different clinical moments.

### Tab structure

Each topic detail page renders these 4 tabs, in this order:

```
[Summary] [Evidence] [Clinical tools] [References]
```

**Tab: Summary**
- 3–5 bullet "bottom lines" — what the evidence says in plain clinical language
- Evidence level badge (GRADE: High / Moderate / Low / Very Low) with color
- Last updated date
- Quick stats row: No. of studies · No. of participants · Follow-up duration
- A "Clinical bottom line" blockquote in larger text

**Tab: Evidence**
- List of included studies, each as a collapsible row:
  - Study name, year, design (RCT/Cohort/etc.), n, JADAD score
  - Expand to show: PICO, primary outcome, key result, risk of bias domains
- "Add to comparison" checkbox on each study → triggers a sticky comparison drawer at bottom
- Filter bar: by study design, year range, outcome type
- Sort: by year / by quality / by effect size

**Tab: Clinical tools**
- Context-sensitive — shows only tools relevant to this topic
- Each tool is an inline card (not a modal):
  - Dosing calculator if the topic is a drug
  - Risk scoring tool if the topic is a condition
  - Monitoring checklist if the topic is a procedure
  - NNT quick-read pulled from the best available RCT
- "Open in Quick Calc" button → opens the FAB panel at the relevant calculator

**Tab: References**
- Formatted citation list (Vancouver style by default, toggle to APA)
- Each citation: title, authors, journal, year, DOI link, PubMed ID
- "Copy citation" button per entry
- "Export all" → copies all citations in selected format

### Implementation instructions

```
Inspect how the existing topic/drug detail page is structured.
Do NOT create a new tab component from scratch unless absolutely none exists.

If using Tailwind:
  - Tabs underline style: border-b-2 on active, matching existing accent color
  - Tab content: min-height so the page doesn't jump height on tab switch

State:
  - Active tab stored in URL query param: ?tab=evidence
  - This makes tabs deep-linkable and shareable
  - On mount, read ?tab from URL; default to "summary"

Comparison drawer (Evidence tab):
  - Position: fixed bottom-0 left-0 right-0
  - Height: 200px when open
  - Shows selected studies side-by-side as a table
  - "Compare" button only appears when 2+ studies selected
  - Dismiss: X button or deselect all studies

Data shape — define this TypeScript interface and use it everywhere:
  interface Topic {
    id: string
    title: string
    slug: string
    gradeLevel: 'high' | 'moderate' | 'low' | 'very-low'
    lastUpdated: string
    bottomLines: string[]
    quickStats: { studies: number; participants: number; followupMonths: number }
    clinicalBottomLine: string
    studies: Study[]
    tools: ClinicalTool[]
    references: Reference[]
  }

  interface Study {
    id: string
    name: string
    year: number
    design: 'RCT' | 'cohort' | 'case-control' | 'cross-sectional' | 'meta-analysis'
    n: number
    jadad: number   // 0–5
    pico: { population: string; intervention: string; comparator: string; outcome: string }
    primaryOutcome: string
    keyResult: string
    robDomains: { domain: string; judgment: 'low' | 'some-concerns' | 'high' }[]
  }

Seed 3–5 real topics with real study data (use published Cochrane reviews or landmark RCTs).
Do not use Lorem Ipsum anywhere.
```

---

## PHASE 3 — STRUCTURED STUDY MONOGRAPH CARD

**VIKI-P source**: `DrugMonographViewer`  
**PauseMD identity**: A standardized card anatomy for every study — the "monograph" format that makes any study scannable in 30 seconds.

### Card anatomy (fixed order, every study)

```
┌─────────────────────────────────────────────────┐
│ [Design badge]  [GRADE badge]  [Year]    [Bookmark icon]
│                                                  │
│ Title (18px, medium weight)                      │
│ Authors · Journal · DOI                          │
├─────────────────────────────────────────────────┤
│ ▼ PICO                               [collapse]  │
│   Population: ...                                │
│   Intervention: ...                              │
│   Comparator: ...                                │
│   Outcome: ...                                   │
├─────────────────────────────────────────────────┤
│ ▼ Key findings                                   │
│   Primary outcome: [result + CI + p-value]       │
│   Secondary outcomes: [list]                     │
│   NNT/NNH: [value] (if applicable)              │
├─────────────────────────────────────────────────┤
│ ▼ Clinical takeaway                              │
│   [1-2 sentences, bold, actionable language]     │
├─────────────────────────────────────────────────┤
│ ▼ Limitations                                    │
│   [bullet list]                                  │
├─────────────────────────────────────────────────┤
│ ▼ Risk of bias                                   │
│   [traffic-light grid: domain × judgment]        │
├─────────────────────────────────────────────────┤
│ [Open in PubMed ↗]  [Copy citation]  [Share]    │
└─────────────────────────────────────────────────┘
```

### Risk of bias traffic-light grid

```
Domains (rows): Random sequence generation · Allocation concealment ·
  Blinding of participants · Blinding of outcome assessment ·
  Incomplete outcome data · Selective reporting · Other

Judgments (columns per domain): Low risk (green) · Some concerns (amber) · High risk (red)

Render as an SVG or CSS grid table — NOT a third-party library.
Each cell is a colored circle (12px), clickable to show tooltip with the reviewer's rationale.
```

### Implementation instructions

```
File: components/StudyMonograph/StudyMonograph.tsx
File: components/StudyMonograph/RoBGrid.tsx
File: components/StudyMonograph/PIcoBlock.tsx

The card must handle 3 display contexts:
  1. Full page view (standalone study page)
  2. Expanded row inside the Evidence tab (modal or inline expand)
  3. Search result card (summary only — show title, design badge, GRADE, clinical takeaway)
     Use a `variant` prop: variant="full" | "expanded" | "compact"

Collapse state:
  - All sections collapsed by default in "expanded" variant
  - All sections expanded in "full" variant
  - Store expand state in component-local state (not URL, not global store)

Bookmark:
  - Bookmarked studies stored in localStorage as Set<studyId>
  - Use a useBookmarks() hook — read/write/toggle
  - Bookmarked studies appear in a "/saved" route (create this route)

Typography within the card:
  - Match the existing body font exactly
  - Clinical takeaway section: slightly larger (1.05em), use the app's existing blockquote or 
    callout styling if one exists
  - Do NOT introduce a new font
```

---

## PHASE 4 — EVIDENCE PATHWAY WALKTHROUGH

**VIKI-P source**: `NrpProtocolScreen`, `DKAToolScreen`, `DKACalculator`  
**PauseMD identity**: A step-through "how to apply this evidence at the bedside" reader. Clinical decision support, not a protocol copy.

### Interaction model

```
A topic can have an associated Pathway (optional).
The pathway is a linear sequence of 4–8 steps.
Each step has:
  - A short title (e.g. "Confirm the diagnosis")
  - A clinical question (e.g. "Does the patient meet diagnostic criteria?")
  - Evidence citation(s) from the topic's study list
  - A decision node (Yes/No or a value input)
  - The next step or terminal outcome

Navigation:
  - "Previous" / "Next" buttons
  - Step indicator: dots or numbered pills (1 of 6)
  - "Restart" button at any point
  - Progress saved in sessionStorage (not localStorage — intentionally ephemeral)

Terminal outcomes:
  - Shown as a distinct card style (green border = proceed, amber = caution, red = escalate)
  - Each outcome links back to the relevant Evidence tab entry
```

### Pathway data schema

```typescript
interface Pathway {
  id: string
  topicId: string
  title: string
  disclaimer: string   // e.g. "This pathway reflects evidence as of [date]. Always use clinical judgment."
  steps: PathwayStep[]
}

interface PathwayStep {
  id: string
  title: string
  question: string
  body?: string            // optional supporting text, markdown
  citations: string[]      // Study IDs from the topic's study list
  input?: {
    type: 'yesno' | 'number' | 'select'
    label: string
    options?: string[]     // for 'select'
    unit?: string          // for 'number'
    min?: number
    max?: number
  }
  branches: {
    condition: string      // e.g. "yes" | "no" | ">7" | "option_a"
    nextStepId: string | 'outcome_proceed' | 'outcome_caution' | 'outcome_escalate'
    outcomeMessage?: string
  }[]
}
```

### Entry point

```
On each topic detail page, below the 4-lens tabs, show a "Clinical pathway" card 
IF a pathway exists for this topic.

The card shows:
  - Pathway title
  - Step count ("6 steps")
  - A "Walk through pathway →" button

Clicking opens the pathway in a fullscreen overlay (not a new route).
Overlay: z-index 1000, white background, animated slide-up.
```

### Implementation instructions

```
File: components/Pathway/PathwayViewer.tsx
File: components/Pathway/PathwayStep.tsx
File: components/Pathway/PathwayOutcome.tsx
File: hooks/usePathway.ts

Seed at least 2 complete pathways with real clinical content.
Example topics:
  1. "Empiric antibiotic selection in community-acquired pneumonia" (5 steps)
  2. "Fluid resuscitation in pediatric sepsis" (6 steps)

Each step must have at least 1 real citation linked to a study in the topic's study list.
The disclaimer must appear on step 1 only, below the question, in muted text (not a modal).

Animation:
  - Steps animate in from the right (translateX 40px → 0, opacity 0 → 1, 200ms)
  - Back navigation: animate from the left
  - Use CSS transitions, not a library
```

---

## PHASE 5 — PICO QUESTION BUILDER

**VIKI-P source**: `QuestionnaireScreen`  
**PauseMD identity**: A structured 4-field form that defines a clinical question before browsing, then filters all content to match it.

### UI

```
A persistent banner appears on the home/search screen when no PICO is set:
  "Define your clinical question to get personalized results →"

Clicking opens a 4-step form (one field per screen, not all at once):

  Step 1 — Population
    Label: "Who is your patient?"
    Input: text, with autocomplete suggestions from topic tags
    Placeholder: "e.g. adults with type 2 diabetes, BMI >30"

  Step 2 — Intervention
    Label: "What are you considering doing?"
    Input: text + tag chips for common interventions
    Placeholder: "e.g. GLP-1 agonist, bariatric surgery"

  Step 3 — Comparator
    Label: "Compared to what?"
    Input: text
    Options: "No treatment" | "Standard of care" | "Another intervention (specify)"

  Step 4 — Outcome
    Label: "What outcome matters most?"
    Multi-select chips from: Mortality · Hospitalization · QoL · 
      Symptom relief · Adverse events · Cost · Other (text input)

Final screen — review:
  Shows the assembled PICO question as a sentence:
    "In [P], does [I] compared to [C] improve [O]?"
  Two buttons: "Search with this question" | "Edit"
```

### Behavior after submission

```
- PICO stored in Zustand (or existing state manager) as global state
- All topic list views filter/sort by relevance to PICO
- A persistent PICO chip appears in the header:
  "P: adults T2D · I: GLP-1 ·  C: standard care · O: mortality  [×]"
  Clicking × clears the PICO and restores unfiltered view
- Relevance scoring (client-side):
  Score each topic by: exact keyword matches in P, I, C, O fields
  Sort topic list by score descending when PICO is active
```

### Implementation instructions

```
File: components/PICOBuilder/PICOBuilder.tsx
File: components/PICOBuilder/PICOStepForm.tsx
File: components/PICOBuilder/PICOChip.tsx
File: store/picoStore.ts (or equivalent for existing state manager)

The 4-step form must be keyboard-navigable:
  Enter advances to next step
  Escape closes the form (with confirmation if any field is filled)
  Tab cycles through fields within a step

Autocomplete suggestions come from a static JSON file of common clinical terms.
Create: data/clinicalTerms.json with at least 50 terms across P, I, C, O categories.
```

---

## PHASE 6 — ONBOARDING + DISCLAIMER FLOW

**VIKI-P source**: `DisclaimerDialog`, `InstallGuideDialog`  
**PauseMD identity**: First-run experience that sets up the app for the user's specialty and confirms they understand the evidence-tool nature of the app.

### Flow (3 screens, shown once, stored in localStorage)

```
Screen 1 — Welcome
  Headline: "Evidence at your fingertips"
  Subtext: "PauseMD summarizes systematic reviews so you can pause, check, and decide."
  Button: "Get started →"

Screen 2 — Specialty selection
  Headline: "What's your primary specialty?"
  Grid of specialty cards (tap to select, multi-select allowed):
    General practice · Paediatrics · Emergency medicine · Internal medicine ·
    Cardiology · Infectious disease · Psychiatry · Surgery · Obstetrics · Other
  Each card has a small icon (SVG, not emoji) and label.
  Subtext: "This helps us surface the most relevant evidence first."
  Button: "Continue →" (disabled until at least 1 selected)

Screen 3 — Disclaimer
  Headline: "A note on using this app"
  Body (plain language, not legalese):
    "PauseMD presents summaries of published systematic reviews and meta-analyses.
     It does not provide clinical diagnosis or personalized treatment advice.
     Always apply your clinical judgment and consult primary sources before making
     decisions. Evidence quality ratings are based on the GRADE framework."
  Checkbox: "I understand this is a reference tool, not a clinical decision-making system"
  Button: "Start exploring →" (disabled until checkbox checked)
```

### Implementation instructions

```
File: components/Onboarding/OnboardingFlow.tsx
File: components/Onboarding/SpecialtyPicker.tsx
File: components/Onboarding/DisclaimerScreen.tsx
File: hooks/useOnboarding.ts

localStorage keys:
  pausemd_onboarded: "true" | undefined
  pausemd_specialties: JSON string array of selected specialty slugs

On app load:
  Check pausemd_onboarded. If not set, render OnboardingFlow as a fullscreen overlay.
  Onboarding overlay must be above everything including the FAB (z-index: 10000).

Specialty preference is used to sort the topic list and eventually to personalize 
  the floating Quick Calc (pre-select calculators most relevant to the specialty).

Screen transitions: slide left (200ms ease-out), matching the Pathway animation.
A progress indicator (1 of 3 dots) appears at the bottom of each screen.
```

---

## PHASE 7 — INTERACTIVE FOREST PLOT VIEWER

**VIKI-P source**: `GrowthChartDialog`  
**PauseMD identity**: A modal that renders a simplified forest plot for any meta-analysis study — the visual language of systematic review.

### Spec

```
Trigger: A "Forest plot" button appears on any study card where design = 'meta-analysis'.
Opens as a modal (not a new route) with a backdrop.

The forest plot renders as an SVG:

  Layout:
    Left column (200px): study name + year
    Middle column (flexible): horizontal line = CI, square = point estimate (sized by weight)
    Right column (80px): RR/OR [95% CI]
    Bottom row: diamond = pooled estimate

  Colors:
    Lines/squares: existing app accent color
    Diamond (pooled): slightly darker shade of accent
    Vertical null line (RR=1 or MD=0): dashed, muted gray
    Studies favoring intervention: no color difference (avoid implying direction by color)

  Interaction:
    Hover a study row → tooltip with full citation + outcome details
    Click a study → opens the StudyMonograph card in the same modal (push navigation)
    "Back to forest plot" link in the monograph view

  Axis:
    Auto-scaling: compute min/max from all CI bounds, add 10% padding
    Labeled: "Favors [intervention]" on left, "Favors [control]" on right
    Tick marks at: 0.25 / 0.5 / 1.0 / 2.0 / 4.0 (for ratio outcomes)
              or at natural breakpoints (for continuous outcomes)

  Heterogeneity stats below the plot:
    I² = xx%  ·  τ² = x.xx  ·  p(heterogeneity) = x.xx
```

### Data schema

```typescript
interface ForestPlotData {
  outcome: string
  scale: 'ratio' | 'continuous'   // ratio = RR/OR, continuous = MD/SMD
  nullValue: number                // 1 for ratio, 0 for continuous
  studies: ForestStudy[]
  pooled: {
    estimate: number
    ciLow: number
    ciHigh: number
    model: 'fixed' | 'random'
  }
  heterogeneity: {
    iSquared: number    // 0–100
    tauSquared: number
    pValue: number
  }
}

interface ForestStudy {
  id: string
  label: string       // "Smith 2021"
  estimate: number
  ciLow: number
  ciHigh: number
  weight: number      // 0–100 (percentage weight in meta-analysis)
  n: number
}
```

### Implementation instructions

```
File: components/ForestPlot/ForestPlotModal.tsx
File: components/ForestPlot/ForestPlotSVG.tsx  (pure SVG, no D3)

Render the SVG entirely in React with computed coordinates.
Do NOT use D3, recharts, or any charting library — this is a medical visualization
with specific layout conventions that generic chart libs don't handle well.

SVG dimensions: viewBox="0 0 700 [dynamic height based on study count]"
Row height: 32px per study, plus 20px header + 40px pooled row + 60px axis

The forest plot must be print-friendly:
  Add a "Download SVG" button that triggers a blob download of the SVG element.
  Add a "Print" button that opens a minimal print layout with just the plot + citation.

Seed at least 1 meta-analysis study with complete ForestPlotData for testing.
```

---

## PHASE 8 — SPECIALTY-TUNED THEMES

**VIKI-P source**: `ThemeSelectionDialog`  
**PauseMD identity**: A theme system with specialty presets that shift accent color and reading density, using the app's existing CSS variable system.

### Themes to implement

```
1. Default        — existing app appearance (baseline)
2. Paediatrics    — accent: warm teal (#0F9B8E), density: comfortable
3. Critical care  — accent: deep amber (#C47D0E), density: compact (smaller font, tighter spacing)
4. Emergency      — accent: coral red (#C0392B), density: compact
5. General        — accent: slate blue (#2E5F8A), density: comfortable
6. Night shift    — dark background, low contrast, accent: muted sage green
```

### CSS variable contract

```css
/* These variables must exist in :root and be switched by theme class on <html> */
--color-accent          /* primary interactive color */
--color-accent-light    /* hover/background tint */
--color-accent-text     /* text on accent backgrounds */
--density-spacing-sm    /* 8px default → 6px compact */
--density-spacing-md    /* 16px default → 12px compact */
--density-font-body     /* 16px default → 14px compact */
--density-line-height   /* 1.6 default → 1.45 compact */
```

### Theme persistence

```
Stored in localStorage: pausemd_theme = 'paediatrics' | 'critical-care' | ...
Applied on app load before first paint (read in _document.tsx or root layout)
to avoid flash of wrong theme.
```

### Theme picker UI

```
Accessible from: Settings screen (or a gear icon in the header)
Display: a row of 6 colored circles + label, radio-button semantics
Active theme: larger circle + checkmark
No full-screen dialog needed — inline settings section is sufficient.
```

### Implementation instructions

```
File: styles/themes.css     (CSS variable definitions for each theme class)
File: components/ThemePicker/ThemePicker.tsx
File: hooks/useTheme.ts

In useTheme:
  - Read from localStorage on init
  - Apply theme by setting document.documentElement.className += ` theme-[name]`
  - Remove previous theme class on switch

The Night Shift theme must also set:
  prefers-color-scheme: dark styles (or just add a .theme-night class that overrides
  all background/text variables to dark values)

Do not implement themes by duplicating CSS — use the variable contract above.
Every existing component in the app must respect these variables.
Walk through 5–10 existing components and confirm each uses the variable,
not a hardcoded color. Fix any hardcoded colors you find.
```

---

## CROSS-CUTTING REQUIREMENTS

These apply to every phase above.

### Accessibility

```
Every new interactive element must have:
  - aria-label or aria-labelledby
  - Keyboard navigation (Tab, Enter, Escape, Arrow keys where appropriate)
  - Focus ring visible in all themes (use outline, not box-shadow, for max browser support)
  - Minimum touch target 44×44px on all tap targets

The forest plot SVG must have:
  - role="img" with aria-label
  - A visually-hidden data table fallback containing the same numeric data
```

### Performance

```
Each new feature must be code-split:
  - QuickCalcPanel: dynamic import, loaded only when FAB is first clicked
  - ForestPlotSVG: dynamic import, loaded only when forest plot is triggered
  - OnboardingFlow: dynamic import, loaded only if not yet onboarded

No new dependencies may be added without justification.
Before adding any npm package, try the plain TypeScript/React solution first.
The only new dependency that may be added without question: nothing.
Every library must be justified with a comment: // DEPENDENCY: [name] — reason
```

### Testing

```
For every utility function (all calculator math, PICO relevance scoring, 
theme application, GRADE downgrader):
  Write jest unit tests covering:
    - Normal inputs
    - Edge cases (0, negative, very large numbers)
    - Invalid inputs (NaN, null, undefined)

For every new component:
  Write at least 1 React Testing Library test covering the primary user interaction.

Run the existing test suite after each phase. Fix any regressions before proceeding.
```

### No regressions

```
After each phase, verify:
  1. `npm run build` passes with no errors
  2. `npm run lint` passes (or existing lint command)
  3. All existing routes still render correctly
  4. The existing topic/drug list still loads and filters
  5. No console errors in the browser on any existing page
```

---

## EXECUTION ORDER

Complete phases in this order. Do not begin a phase until the previous one passes `npm run build` cleanly.

```
Phase 0 — Reconnaissance        (required gate — do not skip)
Phase 6 — Onboarding            (first-run experience, no dependencies)
Phase 8 — Themes                (foundational — all other phases inherit theme)
Phase 1 — Floating Quick Calc   (highest UX impact, standalone)
Phase 2 — Multi-lens Tabs       (page structure, needed before monograph)
Phase 3 — Study Monograph       (depends on Phase 2 tab structure)
Phase 5 — PICO Builder          (search/filter infrastructure)
Phase 4 — Evidence Pathway      (depends on Phase 3 study data)
Phase 7 — Forest Plot           (depends on Phase 3 study schema)
```

---

## STYLE PRESERVATION RULES

These are absolute constraints. Violating them makes the implementation wrong regardless of whether it works.

```
1. Font family: use whatever font the app currently uses. Do not introduce a new one.

2. Border radius: inspect existing cards and buttons. Use the same radius everywhere.
   If the app uses 8px, use 8px. If it uses 4px, use 4px. Do not mix.

3. Shadow: if the existing app uses no shadows, use no shadows. 
   If it uses a single shadow style, replicate it exactly.

4. Animation timing: inspect any existing animations/transitions. 
   Use the same duration and easing for all new animations.
   If none exist, use: 200ms ease-out as the default.

5. Icon system: inspect what icon library the app uses (Heroicons / Lucide / Phosphor / custom SVG).
   Use the same library for all new icons. Do not mix icon styles.

6. Button variants: the app has existing button styles (primary, secondary, ghost, destructive).
   Use these variants for all new buttons. Do not create new button styles.

7. Spacing scale: if using Tailwind, use only existing Tailwind spacing values.
   If using custom CSS, match the spacing rhythm (4px / 8px / 16px / 24px / etc.) 
   found in the existing stylesheets.

8. Color: never hardcode a hex value for any interactive element.
   Use CSS variables or Tailwind theme tokens exclusively.
   Hardcoded colors are only acceptable inside SVG data visualizations 
   where CSS variables may not propagate reliably.
```

---

## DELIVERABLE CHECKLIST

Before marking the implementation complete, verify every item:

- [ ] `npm run build` exits 0
- [ ] All 5 Quick Calc calculators produce correct results (test against known values)
- [ ] All 4 topic tabs are functional and deep-linkable via ?tab=
- [ ] Study monograph renders correctly in all 3 variants (full / expanded / compact)
- [ ] Evidence pathway completes a full walk-through with branching logic
- [ ] PICO builder stores state, filters topics, and shows the persistent chip
- [ ] Onboarding shows on first load, never again after completion
- [ ] All 6 themes switch without page reload, persist across refresh
- [ ] Forest plot SVG downloads correctly via the Download SVG button
- [ ] Keyboard navigation works for: FAB open/close, tab switching, pathway steps, PICO form
- [ ] No hardcoded colors in any component (except SVG data elements)
- [ ] No console errors on any route
- [ ] Existing functionality unchanged
