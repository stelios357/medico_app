# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start Vite dev server (default port 5173, or $PORT)
npm run build    # production build → dist/
npm run preview  # serve dist/ locally
```

No test runner or linter is configured. There are no pre-commit hooks.

## Architecture

**Stack:** React 18 + React Router v6 + Vite. No state management library — all state is local useState/useMemo or persisted via custom hooks to localStorage.

### Routing (`src/App.jsx`)

All routes are lazy-loaded with `<Suspense>`. Key distinction:

| Path | Page | Purpose |
|---|---|---|
| `/` | `Home.jsx` | Drug/disease search hub |
| `/calc` | `Calculator.jsx` | Stats calculators (NNT, RR, CI…) |
| `/calculators` | `Calculators.jsx` | Clinical calculator hub |
| `/calculator/:slug` | `ClinicalCalculator.jsx` | Individual clinical calculator |
| `/drug/:id` | `DrugDetail.jsx` | Drug monograph (OpenFDA + RxNorm) |
| `/disease/:id` | `DiseaseDetail.jsx` | Disease detail (MedlinePlus) |

The `/calculators` hub has **no navigation entry point** from Nav or Home — it is currently orphaned. Nav links to `/calc` (stats), not `/calculators` (clinical).

### Clinical Calculator System (`src/data/calculators/`, `src/services/calculators/`)

Configs in `src/data/calculators/*.js` export a plain object:

```js
{
  slug, name, specialty, description, version?,
  inputs: [{ id, label, type, unit?, min?, max?, default?, required?, options? }],
  calculate(coercedValues) → { result, unit, interpretation, risk, breakdown? }
}
```

**Engine** (`src/services/calculators/engine.js` → `runCalculator(config, inputValues)`):
- Returns `null` (silent) on any validation failure — never throws
- `number` inputs: coerced via `Number()`, validated against `min`/`max`
- `select` inputs: coerced via `Number()` — option values **must be numeric**
- `checkbox` inputs: boolean → 0/1
- Any other type: raw value passed through
- All inputs are implicitly required (empty string → null)

**Select `default` field:** `initialInputValues()` in `ClinicalCalculator.jsx` reads `input.default` for selects; use this to pre-set a select without user interaction (e.g. `creatinineUnit` defaults to `0` = mg/dL).

**Creatinine unit toggle pattern:** Both eGFR and creatinine clearance expose a `creatinineUnit` select (0 = mg/dL, 1 = µmol/L). The `creatinine` field has `max: 2700` to cover both ranges. Conversion (`value / 88.4`) happens inside `calculate()`, not in the engine.

**Score breakdown:** `calculate()` can return a `breakdown: [{ label, points }]` array; `CalcResult` renders it as a list showing only non-zero entries (or all entries for HEART Score).

### Theme System (`src/styles/themes.css`, `src/hooks/useTheme.js`)

Themes are CSS classes applied to `<html>`. The default (no class) uses `:root` in `global.css`. Available themes: `theme-paediatrics`, `theme-critical-care`, `theme-emergency`, `theme-general`, `theme-night`.

All colour is expressed through CSS custom properties. The primary accent is always `--teal` (default `#0A9E88`). Use `--teal-dim` (10% opacity fill) and `--teal-mid` (28% opacity border) for tinted backgrounds and borders. Never hardcode hex colours — always use variables.

Key tokens:
- `--bg` / `--bg2` / `--bg3` — background layers (lightest to slightly darker)
- `--text` / `--muted` — primary and secondary text
- `--border` — `rgba(0,0,0,0.09)` hairline
- `--serif` (DM Serif Display) / `--mono` (IBM Plex Mono) / `--sans` (Plus Jakarta Sans)

### Data / API Layer (`src/services/`)

- `openFDA.js` + `rxnorm.js` — drug data; deduplicated via `requestDedup.js`, retried via `retry.js`, cached via `cache.js`
- `medlineplus.js` — disease + health topic data; proxied through Vite dev server at `/api/medlineplus-wsearch` (target: `wsearch.nlm.nih.gov`). **Production requires a reverse-proxy rule for this path.**
- `fallback.js` — static fallback data when APIs are unavailable

### Persistence (all localStorage, no backend)

Custom hooks in `src/hooks/`:
- `useCalcHistory` — recent calculation results
- `useRecentlyViewed` / `useRecentSearches` / `useSaved` / `useBookmarks`
- `useTheme` — persists selected theme class to `<html>`

### CSS conventions

Each major page/feature has its own CSS file in `src/styles/`. Component-level styles use BEM-like prefixes (`cp-` for calculator page, `ci-` for calc input, `cr-` for calc result, `gs-` for global search, etc.). No CSS modules or Tailwind — plain CSS custom properties throughout.

Animation keyframes `fadeUp` and `floaty` are defined in `global.css` and used across the app. The noise texture overlay on `body::before` is a base64 SVG filter — leave it alone.

### QuickCalc FAB

The `Σ` floating button (bottom-right, all pages) opens `QuickCalcPanel` — a separate set of statistical calculators (NNT, RR, Effect Size, CI, GRADE). These are completely independent of the clinical calculator system at `/calculator/:slug`.
