# Medical Reference Web App — Claude Code Context Document (v3)

---

## Purpose

Single source of truth for building a Medscape-inspired clinical reference web app.
Give this document to Claude Code at the start of every session.
Read it fully before writing any code.

---

## Project Overview

A free, web-based clinical reference platform for healthcare professionals.
Inspired by Medscape. Intentionally scoped to Phase 1 and Phase 2.

- **Phase 1** — Core reference: drug lookup, disease lookup, interaction checker, habit loop
- **Phase 2** — Calculators: 20 specialty calculators using a generic engine

This is not a demo. It must be resilient, feel polished, and follow a coherent clinical workflow.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Routing | React Router DOM v6 |
| Build Tool | Vite 5 + @vitejs/plugin-react |
| Language | JavaScript + JSX (no TypeScript) |
| Styling | Plain CSS with custom properties — no Tailwind, no CSS-in-JS |
| Analytics | GA4 via gtag.js |
| Backend | None (Phase 1–2) |

No UI component libraries. No CSS frameworks. Dependency-light. Hand-crafted CSS using design tokens.

---

## Non-Negotiable Mental Model

Every feature plugs into this single flow. Nothing exists outside it.

```
User Query
    ↓
Global Search (home page)
    ↓
Grouped Results — Drugs first, Diseases second (staggered, independent)
    ↓
Detail Page (Drug or Disease)
    ↓
Suggested Next Actions — Check interactions / Save / Search related
```

If a feature does not connect to this flow → do not build it yet.

---

## Folder Structure

```
src/
├── assets/
├── components/
│   ├── common/
│   │   ├── SearchBar.jsx
│   │   ├── SearchResults.jsx
│   │   ├── SearchSkeleton.jsx
│   │   ├── SearchRefinements.jsx
│   │   ├── RecentSearches.jsx
│   │   ├── RecentlyViewed.jsx
│   │   ├── SavedItems.jsx
│   │   └── ClinicalDisclaimer.jsx
│   ├── drugs/
│   │   ├── DrugCard.jsx
│   │   ├── DrugHighlights.jsx
│   │   ├── DrugAccordion.jsx
│   │   ├── DrugSkeleton.jsx
│   │   ├── InteractionPanel.jsx
│   │   ├── InteractionForm.jsx
│   │   └── InteractionResults.jsx
│   ├── diseases/
│   │   ├── DiseaseCard.jsx
│   │   ├── DiseaseHighlights.jsx
│   │   ├── DiseaseAccordion.jsx
│   │   └── DiseaseSkeleton.jsx
│   └── calculators/
│       ├── CalcCard.jsx
│       ├── CalcInput.jsx
│       └── CalcResult.jsx
├── pages/
│   ├── Home.jsx
│   ├── DrugDetail.jsx
│   ├── DrugBrowse.jsx
│   ├── DiseaseDetail.jsx
│   ├── DiseaseBrowse.jsx
│   ├── InteractionChecker.jsx
│   ├── Calculators.jsx
│   ├── Calculator.jsx
│   ├── Procedures.jsx
│   └── ProcedureDetail.jsx
├── hooks/
│   ├── useGlobalSearch.js
│   ├── useRecentSearches.js
│   ├── useRecentlyViewed.js
│   ├── useSaved.js
│   └── useCalcHistory.js
├── services/
│   ├── cache.js
│   ├── retry.js
│   ├── fallback.js
│   ├── requestDedup.js
│   ├── openFDA.js
│   ├── rxnorm.js
│   ├── medlineplus.js
│   └── calculators/
│       └── engine.js
├── data/
│   ├── calculatorRegistry.js
│   ├── calcDrugMap.js
│   ├── commonDrugs.js
│   └── procedures.json
├── utils/
│   ├── queryNormalize.js
│   ├── matchScore.js
│   ├── formatDrug.js
│   ├── storage.js
│   ├── flags.js
│   └── constants.js
├── styles/
│   ├── global.css
│   ├── drugs.css
│   ├── diseases.css
│   ├── interactions.css
│   ├── calculators.css
│   └── saved.css
└── App.jsx
```

---

## Routes

```
/                     → Home (global search + habit loop rows)
/drug/:id             → Drug detail
/drugs                → Drug browse (secondary — not in primary nav)
/disease/:id          → Disease detail
/diseases             → Disease browse (secondary — not in primary nav)
/interactions         → Standalone interaction checker
/calculators          → Calculator hub
/calculator/:slug     → Individual calculator
/procedures           → Procedural reference list
/procedure/:slug      → Procedure detail
```

All page components must be wrapped in `React.lazy()` + `Suspense` in `App.jsx`.

---

## External APIs

### 1. OpenFDA
- Base URL: `https://api.fda.gov`
- Auth: None required
- Rate limit: 240 requests/minute unauthenticated
- Key endpoints:
  - Drug search: `GET /drug/label.json?search=brand_name:{query}+generic_name:{query}&limit=10`
  - Drug detail: `GET /drug/label.json?search=id:{id}&limit=1`
- Warning: Responses are deeply nested, inconsistent, and contain HTML in text fields. Normalize aggressively. Never trust field presence. Always use defensive access.

### 2. RxNorm (NIH)
- Base URL: `https://rxnav.nlm.nih.gov/REST`
- Auth: None required
- Key endpoints:
  - Autocomplete: `GET /spellingsuggestions.json?name={query}`
  - RxCUI lookup: `GET /rxcui.json?name={drugName}&search=1`
  - Interactions: `GET /interaction/list.json?rxcuis={rxcui1},{rxcui2}`
- Critical: The interaction endpoint requires RxCUI IDs — not drug name strings. Always resolve drug name → RxCUI first before fetching interactions. Never skip this step.

### 3. MedlinePlus Connect (NLM)
- Base URL: `https://connect.medlineplus.gov/application`
- Auth: None required
- Key endpoint:
  - Search: `GET ?mainSearchCriteria.v.cs=2.16.840.1.113883.6.90&mainSearchCriteria.v.dn={query}&knowledgeResponseType=application/json`
- Note: Search quality is weak. Treat as a secondary source. Always handle empty/poor responses gracefully.

---

## Services Layer — Strict Pipeline

Every API call must follow this chain in order. Never bypass any step.

```
Component / Hook
    ↓
requestDedup.js   — deduplicate in-flight identical requests
    ↓
cache.js          — return cached result if within TTL
    ↓
retry.js          — fetch with timeout + backoff
    ↓
fallback.js       — structured error object if all retries fail
    ↓
formatDrug.js     — normalize to clean contract shape
```

---

### cache.js
- In-memory Map, session-scoped (cleared on page reload — acceptable)
- Cache key: **normalized query string** — not raw input. "Aspirin" and "aspirin " must hit the same entry.
- TTL: 5 minutes for drug/disease data, 10 minutes for interaction data
- On hit: return immediately, no network call

---

### retry.js
- Wraps native `fetch`
- Timeout: 5 seconds via `AbortController`
- Max retries: 2
- Backoff: 300ms on first retry, 600ms on second
- On final failure: throw structured error to be caught by fallback.js
- Note: retry.js has no knowledge of query state. It only handles network-level failure. Query change cancellation is handled separately in `useGlobalSearch.js` via AbortController tied to query change — not here.

---

### fallback.js
- Returns a structured error object — never throws to the component
- Shape: `{ error: true, code: 'API_UNAVAILABLE', message: string, source: 'openFDA' | 'rxnorm' | 'medlineplus' }`
- Components check `result.error` and render graceful fallback UI
- Never show a blank screen. Never show raw error text to the user.

---

### requestDedup.js
- Tracks in-flight requests by cache-key (normalized URL)
- If same key is already in-flight: return the existing promise
- Remove from tracker when promise resolves or rejects
- Prevents duplicate network calls on rapid typing

---

### Stale Response Protection (in useGlobalSearch.js)
Dedup alone is not enough. Responses can still arrive out of order.

Implement a `queryId` counter inside `useGlobalSearch.js`:
- Increment `queryId` on every new query
- Each async call captures the current `queryId` at call time
- When response arrives, compare with current `queryId`
- If they differ: discard the response silently — do not update state
- This prevents older slow responses from overwriting newer fast ones

---

### OpenFDA Rate Limiting
- Track request timestamps in a lightweight array inside `openFDA.js`
- If approaching 240/min: serve from cache aggressively
- Show subtle notice: "Data may be slightly delayed" — never a hard error

---

## Query Handling

### Minimum length
- Do NOT fire any API call if query length < 2 after normalization
- Show no results, no loading state — just the empty search UI

### queryNormalize.js
1. Lowercase + trim
2. Strip stopwords: `["the", "a", "an", "of", "for", "and", "or", "with"]`
3. Apply synonym map (keep to ≤ 10 entries): `{ "bp": "blood pressure", "mi": "myocardial infarction", "dm": "diabetes mellitus", "htn": "hypertension", "afib": "atrial fibrillation" }`
4. Return null if result is empty — caller must not fire API call on null

### Retry on poor results
- If results < 2: retry once with normalized (stopword-stripped) query
- If still 0 results: show recovery UI:
  - "No results for '{original query}'"
  - "Try: '{normalized query}'" as a clickable suggestion

---

## Search System

### useGlobalSearch.js — Staggered Rendering

Do NOT use Promise.all. Fire both APIs in parallel but handle state independently:

```javascript
const [drugResults, setDrugResults] = useState(null);    // null = loading
const [diseaseResults, setDiseaseResults] = useState(null);
const queryIdRef = useRef(0);

const search = useCallback((query) => {
  const currentId = ++queryIdRef.current;
  setDrugResults(null);
  setDiseaseResults(null);

  openFDA.search(query).then(results => {
    if (queryIdRef.current !== currentId) return; // stale — discard
    setDrugResults(results);
  });

  medlineplus.search(query).then(results => {
    if (queryIdRef.current !== currentId) return; // stale — discard
    setDiseaseResults(results);
  });
}, []);
```

Also cancel in-flight fetch requests on query change using AbortController passed into the service calls.

### matchScore.js — Scoring Within Each Group

- Exact match (query === name, case-insensitive): +3
- Starts with query: +2
- Contains query: +1
- Token overlap (any word in query matches any word in name): +1 boost

Sort within each group by score descending. No cross-group ranking. Drugs group always renders first.

### Direct Hit Optimization
- If exactly one result has score 3 (exact match) AND user presses Enter → navigate directly to detail page
- Do not show results list in this case

---

## Data Normalization

### formatDrug.js — Drug Object Contract

Every OpenFDA response must be normalized into this shape. If a field is missing: return `null`, never `undefined`. Components must handle all null fields gracefully.

```javascript
{
  id: string,
  brandName: string | null,
  genericName: string | null,
  drugClass: string | null,          // from pharm_class_epc[0], strip HTML
  isRx: boolean,                     // true if prescription_drug field exists
  hasBlackBoxWarning: boolean,       // true if boxed_warning field exists — do not store text
  indicationShort: string | null,    // first sentence of indications_and_usage[0], max 120 chars, strip HTML
  indications: string | null,        // full indications_and_usage[0], strip HTML
  dosage: string | null,             // dosage_and_administration[0], strip HTML
  contraindications: string | null,  // contraindications[0], strip HTML
  warnings: string | null,           // warnings_and_cautions[0] or warnings[0], strip HTML
  adverseEffects: string | null,     // adverse_reactions[0], strip HTML
  pregnancy: string | null,          // pregnancy[0] or teratogenic_effects[0], strip HTML
  storage: string | null,            // storage_and_handling[0], strip HTML
  manufacturer: string | null        // openfda.manufacturer_name[0]
}
```

### Normalization Rules (apply to all string fields)
- Safe array access: always use `array?.[0] || null` — never assume presence
- Strip HTML: remove all tags, decode HTML entities
- Strip newlines and excessive whitespace: replace `\n`, `\r`, multiple spaces with single space
- Hard truncate for cards: 100 chars + ellipsis
- Hard truncate for highlights: 120 chars + ellipsis
- Never return `undefined` — always `null` as the absent sentinel

---

## Result Cards — Only Reliable Fields

### DrugCard.jsx
Display only these fields:
- Brand name + generic name
- Drug class badge (omit entirely if null)
- Rx / OTC badge
- Black box warning badge (boolean only — badge says "⚠ Black Box" — never display warning text on a card)
- `indicationShort` (omit if null)
- Differentiation signals:
  - "Exact match" badge if score === 3
  - "Common" badge if drug name is in `commonDrugs.js` static list

Do not attempt to parse severity, strength comparisons, or any field requiring unstructured text interpretation.

### DiseaseCard.jsx
Display only:
- Condition name
- Summary truncated to 100 chars (omit if null)
- Specialty tag (omit if not available)
- "Exact match" badge if score === 3

---

## Drug Detail Page

### Layout Order (strict)
1. `ClinicalDisclaimer` — pinned at top, always visible
2. `DrugHighlights` — always visible, never in accordion
3. Action bar — "Check interactions" + "Save"
4. `DrugAccordion` — collapsible sections

### ClinicalDisclaimer
Text: *"For clinical reference only. Does not replace professional judgment or clinical guidelines."*
Styled using `--color-disclaimer-bg` and `--color-disclaimer-border`.

### DrugHighlights — always visible
- Brand + generic name (large heading)
- Drug class badge
- Rx / OTC badge
- Black box warning banner (only renders if `hasBlackBoxWarning === true` — banner text: "This drug carries a Black Box Warning. Review full prescribing information.")
- `indicationShort`

### Action Bar
- "Check interactions" → opens `InteractionPanel` inline below action bar. Does NOT redirect.
- "Save" → calls `useSaved` hook, writes to localStorage

### DrugAccordion sections
All collapsible, all closed by default:
- Indications & Usage
- Dosage & Administration
- Contraindications
- Warnings & Precautions
- Adverse Effects
- Pregnancy & Lactation
- Storage & Handling

If a section's field is null: do not render that accordion item at all.

### Loading + Error States
- `DrugSkeleton` shown while fetching
- Graceful fallback UI if API fails: "Unable to load drug information. Please try again." — no crash, no blank screen.

---

## Interaction Checker

### RxCUI Resolution — Required Before Interaction Fetch
The RxNorm interaction endpoint requires RxCUI IDs. The flow must be:

```
User selects drug name from autocomplete
    ↓
Call GET /rxcui.json?name={drugName}&search=1
    ↓
Store returned rxcui value
    ↓
Repeat for each drug added
    ↓
Call GET /interaction/list.json?rxcuis={rxcui1},{rxcui2}
```

Never skip the RxCUI resolution step. Never pass drug name strings to the interaction endpoint.

### Two Entry Points — Same Service
- **Inline** (`InteractionPanel.jsx`): opens inside drug detail page, pre-populated with current drug
- **Standalone** (`InteractionChecker.jsx` at `/interactions`): for users arriving with multiple drugs in mind

Both share `InteractionForm.jsx` and `InteractionResults.jsx`.

### InteractionForm.jsx
- Drug name input with RxNorm autocomplete: `GET /REST/spellingsuggestions.json?name={query}` debounced 300ms
- Dropdown suggestion list — keyboard navigable (arrow keys + Enter to select)
- User MUST select from autocomplete — free text submission is blocked
- Add/remove drug chips (min 2, max 5)
- Each chip stores both display name and resolved RxCUI

### InteractionResults.jsx
- Table: Drug A × Drug B | Severity badge | Interpretation | Description
- Severity badge colours: Major = `--color-severity-major`, Moderate = `--color-severity-moderate`, Minor = `--color-severity-minor`
- Interpretation line — derived from severity field only, never parsed from description text:
  - `major` → "Avoid combination"
  - `moderate` → "Monitor closely"
  - `minor` → "Generally low risk"
  - Missing or unrecognised severity → "Use clinical judgment"
- No interactions found: *"No known interactions found. Always verify with a pharmacist."*

---

## Disease Detail Page

### Layout Order
1. `ClinicalDisclaimer`
2. `DiseaseHighlights` — always visible
3. Action bar — "Search related drugs" + "Save"
4. `DiseaseAccordion`
5. External link to MedlinePlus

### DiseaseHighlights
- Condition name
- Summary truncated to 150 chars
- Specialty tag (if available)

### Action Bar
- "Search related drugs" → passes disease name as query to drug search. Keyword passthrough only — not structured cross-linking.
- "Save" → `useSaved` hook

### DiseaseAccordion sections
- Causes
- Symptoms
- Diagnosis
- Treatment
- When to See a Doctor

If a section is null or empty: do not render it.

### External link
"Read full reference on MedlinePlus ↗" — opens in new tab.

---

## Habit Loop

All three surfaces appear on the home page only, below the search bar. Each is a horizontal scroll row. A row does not render if it has no entries.

### useRecentSearches.js
- Max 10 entries, deduped (same query moves to top — does not duplicate)
- Displayed as clickable chips — clicking re-runs the search
- Stored in localStorage under key `recent_searches`

### useRecentlyViewed.js
- Max 10 entries, deduped by route
- Shape per entry: `{ name, route, type: 'drug' | 'disease', timestamp }`
- Displayed as clickable cards routing to the page
- Stored under key `recently_viewed`

### useSaved.js
- Save/unsave toggle per item
- Shape per entry: `{ id, name, type: 'drug' | 'disease', route }`
- Persists across sessions
- Stored under key `saved_items`

### storage.js
- Clean localStorage wrapper: `get(key)`, `set(key, value)`, `remove(key)`, `clear(key)`
- All reads in try/catch — JSON parse errors return null, never crash
- All writes in try/catch — quota errors fail silently
- Never let localStorage errors bubble up to the UI

---

## Search Refinements

`SearchRefinements.jsx` renders below search results after data arrives:
- Chips are derived from what results actually came back — not hardcoded
- If drug results exist: "Medications" chip
- If disease results exist: "Conditions" chip
- If both: both chips shown
- Clicking a chip filters visible results to that group only
- Clicking active chip again shows all results

---

## CSS Design Tokens

Add these to your existing CSS variables file:

```css
/* Severity */
--color-severity-major: #d32f2f;
--color-severity-moderate: #f57c00;
--color-severity-minor: #388e3c;

/* Clinical accents */
--color-drug-accent: #1565c0;
--color-disease-accent: #6a1b9a;

/* Disclaimer */
--color-disclaimer-bg: #fff8e1;
--color-disclaimer-border: #f9a825;

/* Badges */
--color-badge-rx: #0d47a1;
--color-badge-otc: #1b5e20;
--color-badge-blackbox: #b71c1c;
--color-badge-exact: #4a148c;
--color-badge-common: #e65100;
```

New CSS files to create: `drugs.css`, `diseases.css`, `interactions.css`, `saved.css`

---

## Performance Rules (All Mandatory)

- `React.lazy()` + `Suspense` on ALL page-level components in `App.jsx`
- `AbortController` in every hook that fires on mount — cancel on unmount AND on query change
- Skeleton loaders on every async component — no blank screens ever
- Request dedup via `requestDedup.js`
- Stale response discard via `queryId` pattern in `useGlobalSearch.js`
- In-memory cache via `cache.js` keyed on normalized query

---

## What NOT to Build (Phase 1 & 2)

- Pill identifier — OpenFDA image data too unreliable
- AI features — Phase 3
- Auth / user accounts — Phase 3
- True relevance ranking — no relevance scores from these APIs
- Structured cross-API linking — no shared IDs between OpenFDA and MedlinePlus
- Backend / server — not needed until Phase 3

---

## Phase 1 Sessions

---

### Session 1 — API Services Layer

Build the entire services foundation before any UI.

**Files to create:**
- `utils/constants.js` — API base URLs, TTL values, rate limit thresholds
- `utils/storage.js` — localStorage wrapper with try/catch
- `utils/queryNormalize.js` — lowercase, trim, stopwords, synonym map
- `utils/formatDrug.js` — OpenFDA response → drug object contract
- `services/cache.js` — in-memory Map, TTL-based, key = normalized query
- `services/retry.js` — fetch wrapper, 5s timeout, 2 retries, backoff
- `services/fallback.js` — structured error objects per API source
- `services/requestDedup.js` — in-flight request tracker
- `services/openFDA.js` — search + detail, uses full pipeline
- `services/rxnorm.js` — autocomplete + RxCUI lookup + interaction fetch
- `services/medlineplus.js` — disease search + detail

**Definition of done:**
- Call each service from browser console — confirm data returned
- Call same function twice rapidly — confirm second call hits cache, no second network request
- Call with invalid query — confirm structured fallback returned, no thrown error
- Throttle network in devtools — confirm 5s timeout fires, 2 retries execute, then fallback returns
- Manually call same URL twice simultaneously — confirm only one network request fires (dedup working)
- Confirm cache key for "Aspirin" and "aspirin " are identical (normalized key)

---

### Session 2 — Global Search with Staggered Rendering

**Files to create:**
- `hooks/useGlobalSearch.js` — staggered fetch, queryId stale protection, query-change AbortController
- `utils/matchScore.js` — exact/prefix/contains/token-overlap scoring
- `components/common/SearchBar.jsx` — debounced 400ms input
- `components/common/SearchResults.jsx` — renders drug group and disease group independently
- `components/common/SearchSkeleton.jsx` — per-group skeleton
- `components/common/SearchRefinements.jsx` — dynamic chips from actual results
- `pages/Home.jsx` — search bar + results only (habit loop rows added in Session 4)

**Definition of done:**
- Search "aspirin" — drug results appear before disease results finish loading
- Search "fevr" — normalized retry fires, results appear
- Search "zzzzz" — recovery UI shows with normalized query suggestion
- Type quickly ("a", "as", "asp", "aspi") — only one network call per settled query (dedup + stale protection working)
- Search exact drug name then press Enter — navigates directly to detail page
- Throttled network — per-group skeletons show, never a blank screen
- Refinement chips appear after results load, clicking filters correctly

---

### Session 3 — Drug Detail Page

**Files to create:**
- `pages/DrugDetail.jsx`
- `components/common/ClinicalDisclaimer.jsx`
- `components/drugs/DrugHighlights.jsx`
- `components/drugs/DrugAccordion.jsx`
- `components/drugs/DrugSkeleton.jsx`
- `styles/drugs.css`

**Definition of done:**
- Load metformin — highlights render, no accordion open by default
- Load warfarin — black box banner appears above highlights
- Load drug with missing fields — missing accordion sections simply absent, no crash
- All accordions expand/collapse independently
- Disclaimer always visible, not scrollable away
- "Check interactions" placeholder present (panel built in Session 5)
- "Save" placeholder present (wired in Session 4)
- API failure → graceful fallback message, no blank screen

---

### Session 4 — Habit Loop

**Files to create:**
- `hooks/useRecentSearches.js`
- `hooks/useRecentlyViewed.js`
- `hooks/useSaved.js`
- `components/common/RecentSearches.jsx`
- `components/common/RecentlyViewed.jsx`
- `components/common/SavedItems.jsx`
- Update `pages/Home.jsx` to render all three rows below search bar
- Wire Save button on `DrugDetail.jsx` to `useSaved`
- Wire recently viewed tracking on `DrugDetail.jsx` mount

**Definition of done:**
- Search 3 different terms — all appear as chips in Recent Searches, most recent first
- Search same term twice — appears once, moves to top (dedup working)
- Visit 3 drug pages — all appear in Recently Viewed row
- Save a drug — appears in Saved row, persists on hard refresh
- Unsave — removes from row immediately
- Corrupt localStorage manually in devtools — app does not crash, affected rows simply don't render
- Rows do not render if empty

---

### Session 5 — Interaction Checker

**Files to create:**
- `components/drugs/InteractionForm.jsx`
- `components/drugs/InteractionPanel.jsx`
- `components/drugs/InteractionResults.jsx`
- `pages/InteractionChecker.jsx`
- Update `DrugDetail.jsx` to open `InteractionPanel` inline on action bar click
- `styles/interactions.css`

**Definition of done:**
- Type "war" — autocomplete suggestions appear
- Select warfarin — RxCUI resolved and stored before any interaction fetch
- Add aspirin — warfarin + aspirin interaction shows: Major badge + "Avoid combination"
- Select two non-interacting drugs — "No known interactions found" state shows
- Severity absent in API response — "Use clinical judgment" shows
- Inline panel on DrugDetail opens and closes without page redirect
- Standalone /interactions page works independently
- Free text submission without selecting from autocomplete is blocked

---

### Session 6 — Disease Detail Pages

**Files to create:**
- `pages/DiseaseDetail.jsx`
- `components/diseases/DiseaseHighlights.jsx`
- `components/diseases/DiseaseAccordion.jsx`
- `components/diseases/DiseaseSkeleton.jsx`
- `styles/diseases.css`
- Wire recently viewed tracking on DiseaseDetail mount
- Wire Save on DiseaseDetail to useSaved

**Definition of done:**
- Load hypertension — highlights render, summary truncated correctly
- Null sections absent from accordion, no empty accordion items
- "Search related drugs" triggers drug search with disease name as query
- MedlinePlus external link opens in new tab
- Save writes to localStorage, appears in Saved row on home
- Skeleton shows on load, fallback on API failure

---

### Session 7 — Differentiation Signals + Browse Pages

**Files to create:**
- `data/commonDrugs.js` — static array of ~200 most commonly prescribed drug names
- Update `DrugCard.jsx` — add Exact match badge, Common badge
- Update `DiseaseCard.jsx` — add Exact match badge
- `pages/DrugBrowse.jsx` at `/drugs` — paginated, filterable by drug class + Rx/OTC
- `pages/DiseaseBrowse.jsx` at `/diseases` — paginated, filterable by specialty

**Definition of done:**
- Search "metformin" — Common badge appears on metformin result
- Search "metformin" exactly — Exact match badge appears
- /drugs paginates via OpenFDA skip/limit
- Filter by drug class works
- Browse pages accessible via "Browse All" link, not in primary nav

---

### Session 8 — Polish + Procedural Cards

**Files to create:**
- `data/procedures.json` — 20–30 common procedures as static JSON (no API calls)
- `pages/Procedures.jsx`
- `pages/ProcedureDetail.jsx`
- Apply `React.lazy()` + `Suspense` to ALL page components in `App.jsx`
- Add `AbortController` to all hooks firing on mount — cancel on unmount and on query change
- Final CSS pass — all components using CSS variables, nothing hardcoded

**Definition of done:**
- Navigate away from a slow search — no "state update on unmounted component" warning in console
- Procedural cards render from static JSON with zero network calls
- All pages lazy-loaded — network tab shows page chunks loaded on route visit
- Lighthouse mobile score recorded as baseline
- No console errors on any core user flow

---

## Phase 2 Sessions

---

### Session 9 — Calculator Engine

**Files to create:**
- `services/calculators/engine.js`
- `data/calculatorRegistry.js`
- `components/calculators/CalcInput.jsx`
- `components/calculators/CalcResult.jsx`
- `pages/Calculator.jsx` — single dynamic page, reads config from registry by slug
- `pages/Calculators.jsx` — hub with specialty tabs: All, Cardiology, Nephrology, Neurology, Emergency, OB/GYN, Pulmonology
- `hooks/useCalcHistory.js` — last 10 calculations in localStorage
- `styles/calculators.css`

**Calculator config contract:**
```javascript
{
  slug: string,
  name: string,
  specialty: 'cardiology' | 'nephrology' | 'neurology' | 'emergency' | 'obgyn' | 'pulmonology' | 'general',
  description: string,
  references: string[],
  inputs: [
    {
      id: string,
      label: string,
      type: 'number' | 'select' | 'checkbox',
      unit?: string,
      min?: number,
      max?: number,
      options?: [{ value: number, label: string }]
    }
  ],
  calculate: (inputs) => ({ result: number | string, interpretation: string, risk?: 'low' | 'moderate' | 'high' })
}
```

**Definition of done:**
- One dummy calculator config renders inputs, computes result, shows interpretation
- Adding a second config file requires zero UI code changes
- Calculator history saves last 10 and shows on hub page under "Recently Used"
- Specialty tabs filter correctly

---

### Session 10 — First 10 Calculators

One config file per calculator. Pure functions. No API calls. Verify each against published reference values before marking done.

1. CHA₂DS₂-VASc Score (stroke risk in AFib)
2. BMI
3. eGFR — CKD-EPI equation
4. Creatinine Clearance — Cockcroft-Gault
5. Glasgow Coma Scale (GCS)
6. CURB-65 (pneumonia severity)
7. Wells Criteria for DVT
8. Wells Criteria for PE
9. qSOFA Score (sepsis screening)
10. HEART Score (chest pain risk stratification)

**Definition of done:**
- Each produces correct output against at least 2 known reference test cases
- Interpretation text is clinically appropriate
- No calculator breaks the engine
- All 10 appear in hub under correct specialty tabs

---

### Session 11 — Next 10 Calculators

11. Framingham 10-Year CVD Risk
12. FENa — Fractional Excretion of Sodium
13. NIHSS Stroke Scale
14. Gestational Age Calculator
15. Bishop Score (cervical ripening)
16. Alveolar-Arterial (A-a) Gradient
17. Ideal Body Weight (IBW)
18. Body Surface Area (BSA) — Mosteller formula
19. Revised Trauma Score
20. FEV1/FVC Ratio Interpretation

**Definition of done:** Same as Session 10. Hub shows all 20 correctly.

---

### Session 12 — Calculator Polish + Heuristic Drug Links

**Files to create:**
- `data/calcDrugMap.js` — static map: calculator slug → array of drug search keywords
  - `chadsvasc` → `["warfarin", "apixaban", "rivaroxaban", "dabigatran"]`
  - `curb65` → `["amoxicillin", "azithromycin", "levofloxacin"]`
  - `qsofa` → `["piperacillin", "vancomycin", "meropenem"]`
- Update `CalcResult.jsx` — show "Suggested drugs" section when result crosses clinical threshold:
  - CHA₂DS₂-VASc ≥ 2: show anticoagulants
  - CURB-65 ≥ 2: show antibiotics
  - qSOFA ≥ 2: show broad-spectrum antibiotics
  - Show nothing for low-risk results
- `@media print` CSS for clean calculator result printing

**Definition of done:**
- High-risk CHA₂DS₂-VASc score surfaces anticoagulant drug cards
- Low-risk score shows nothing
- Print view renders cleanly — no nav, no sidebar, result only
- Drug suggestions do not block calculator release if API is slow (handle independently)

---

## Global Definition of Done — Phase 1 & 2 Complete

- [ ] All 12 sessions individually verified
- [ ] No console errors on any core user flow
- [ ] Graceful fallback on every API failure — no blank screens, no uncaught errors
- [ ] localStorage corruption does not crash the app — tested manually
- [ ] Stale response discard working — rapid query changes do not cause out-of-order renders
- [ ] Request deduplication confirmed — rapid identical queries fire one network request
- [ ] Skeleton loaders present on every async load
- [ ] AbortController cancels in-flight requests on route change — no "state update on unmounted" warnings
- [ ] All page components lazy-loaded
- [ ] Clinical disclaimer present on every drug and interaction page
- [ ] RxCUI resolution step confirmed before every interaction fetch
- [ ] Lighthouse mobile performance score ≥ 70
- [ ] Tested on Chrome, Safari, Firefox

---

## Key Rules — Do Not Violate

1. Never show a blank screen. Always skeleton or fallback.
2. Never throw raw API errors to the user. Always handle in fallback.js.
3. Never accept free text drug names in the interaction checker. Always autocomplete + RxCUI resolution.
4. Never pass drug name strings directly to the RxNorm interaction endpoint. Always resolve RxCUI first.
5. Never use Promise.all for search rendering. Always stagger independently.
6. Always show clinical disclaimer on drug and interaction pages.
7. Cards show only reliable fields. Never parse unstructured text for signals.
8. Cache key is always the normalized query, not the raw input.
9. Stale response protection (queryId pattern) is mandatory in useGlobalSearch.js.
10. Phase 1 has no auth, no backend, no AI. Public APIs + localStorage only.

---