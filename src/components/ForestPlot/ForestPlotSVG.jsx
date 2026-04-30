import { useRef, useImperativeHandle, forwardRef, useMemo } from 'react';

/* ── layout constants ── */
const SVG_WIDTH      = 700;
const ROW_H          = 32;
const HEADER_H       = 20;
const POOLED_H       = 40;
const AXIS_H         = 60;
const COL_LEFT_END   = 200;  /* label column */
const COL_MID_START  = 200;
const COL_MID_END    = 550;
const COL_RIGHT_START= 560;

const MID_W = COL_MID_END - COL_MID_START;   /* 350px for the plot area */

/* ratio scale ticks */
const RATIO_TICKS = [0.25, 0.5, 1.0, 2.0, 4.0];

/* map weight → square half-size (4–16px range) */
function weightToSize(weight, weights) {
  const max = Math.max(...weights, 1);
  const min = Math.min(...weights, 0);
  const norm = (weight - min) / (max - min + 0.001);
  return 4 + norm * 12; /* 4–16 */
}

/* linear interpolation: value → svg x coordinate */
function toX(value, domainMin, domainMax) {
  return COL_MID_START + ((value - domainMin) / (domainMax - domainMin)) * MID_W;
}

function fmt(n, decimals = 2) {
  if (n == null || isNaN(n)) return '—';
  return Number(n).toFixed(decimals);
}

/* ── Diamond (pooled estimate) ── */
function Diamond({ cx, ciLow, ciHigh, y, domainMin, domainMax }) {
  const halfH = 10;
  const x     = toX(cx,    domainMin, domainMax);
  const x0    = toX(ciLow, domainMin, domainMax);
  const x1    = toX(ciHigh,domainMin, domainMax);
  const pts   = [
    `${x},${y - halfH}`,
    `${x1},${y}`,
    `${x},${y + halfH}`,
    `${x0},${y}`,
  ].join(' ');
  return (
    <polygon
      points={pts}
      fill="var(--amber)"
      fillOpacity="0.85"
      stroke="var(--amber)"
      strokeWidth="1"
    />
  );
}

/* ── Main component (forwardRef so parent can get SVG element) ── */
const ForestPlotSVG = forwardRef(function ForestPlotSVG(
  { data, onStudyClick, downloadRef },
  ref
) {
  const svgRef = useRef(null);

  /* expose SVG DOM node via ref / downloadRef */
  useImperativeHandle(ref, () => svgRef.current);
  useImperativeHandle(downloadRef, () => svgRef.current);

  const studies   = data?.studies  ?? [];
  const pooled    = data?.pooled;
  const hetero    = data?.heterogeneity;
  const isRatio   = (data?.scale ?? 'ratio') === 'ratio';
  const nullValue = data?.nullValue ?? (isRatio ? 1 : 0);

  /* ── domain calculation ── */
  const { domainMin, domainMax, nullX } = useMemo(() => {
    const allVals = [
      ...studies.map(s => s.ciLow),
      ...studies.map(s => s.ciHigh),
      ...(pooled ? [pooled.ciLow, pooled.ciHigh] : []),
      nullValue,
    ].filter(v => v != null && isFinite(v));

    if (allVals.length === 0) return { domainMin: 0, domainMax: 2, nullX: COL_MID_START + MID_W / 2 };

    let dMin = Math.min(...allVals);
    let dMax = Math.max(...allVals);

    if (isRatio) {
      /* log-scale appearance: prefer including standard ticks */
      dMin = Math.min(dMin, 0.25);
      dMax = Math.max(dMax, 4.0);
    }

    /* 10% padding */
    const pad = (dMax - dMin) * 0.1;
    dMin -= pad;
    dMax += pad;

    /* ensure nullValue is visible */
    dMin = Math.min(dMin, nullValue);
    dMax = Math.max(dMax, nullValue);

    return {
      domainMin: dMin,
      domainMax: dMax,
      nullX:     toX(nullValue, dMin, dMax),
    };
  }, [studies, pooled, nullValue, isRatio]);

  const weights = studies.map(s => s.weight ?? 1);

  /* total SVG height */
  const svgHeight = HEADER_H + studies.length * ROW_H + POOLED_H + AXIS_H;

  /* ticks to draw */
  const ticks = isRatio
    ? RATIO_TICKS.filter(t => t >= domainMin && t <= domainMax)
    : [];

  /* y-position helpers */
  const studyRowY = i => HEADER_H + i * ROW_H + ROW_H / 2;
  const pooledY   = HEADER_H + studies.length * ROW_H + POOLED_H / 2;
  const axisY     = HEADER_H + studies.length * ROW_H + POOLED_H;

  /* accessible label */
  const ariaLabel = `Forest plot: ${data?.outcome ?? 'outcome'}. ${studies.length} studies. Pooled estimate ${fmt(pooled?.estimate)} (${fmt(pooled?.ciLow)}–${fmt(pooled?.ciHigh)}).`;

  return (
    <>
      {/* ── Visually-hidden accessible table ── */}
      <table className="sr-only" aria-label={`Data table: ${data?.outcome ?? 'Forest plot'}`}>
        <caption>{data?.outcome}</caption>
        <thead>
          <tr>
            <th scope="col">Study</th>
            <th scope="col">Estimate</th>
            <th scope="col">CI Low</th>
            <th scope="col">CI High</th>
            <th scope="col">Weight (%)</th>
            <th scope="col">N</th>
          </tr>
        </thead>
        <tbody>
          {studies.map(s => (
            <tr key={s.id}>
              <td>{s.label}</td>
              <td>{fmt(s.estimate)}</td>
              <td>{fmt(s.ciLow)}</td>
              <td>{fmt(s.ciHigh)}</td>
              <td>{fmt(s.weight, 1)}</td>
              <td>{s.n}</td>
            </tr>
          ))}
          {pooled && (
            <tr>
              <td>Pooled ({pooled.model})</td>
              <td>{fmt(pooled.estimate)}</td>
              <td>{fmt(pooled.ciLow)}</td>
              <td>{fmt(pooled.ciHigh)}</td>
              <td>100</td>
              <td>—</td>
            </tr>
          )}
        </tbody>
        {hetero && (
          <tfoot>
            <tr>
              <td colSpan={6}>
                I² = {hetero.iSquared}% · τ² = {fmt(hetero.tauSquared)} · p = {hetero.pValue}
              </td>
            </tr>
          </tfoot>
        )}
      </table>

      {/* ── SVG forest plot ── */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`}
        width="100%"
        height={svgHeight}
        role="img"
        aria-label={ariaLabel}
        style={{ fontFamily: 'var(--sans)', overflow: 'visible' }}
      >
        <defs>
          <style>{`
            .fp-text       { font-family: inherit; font-size: 11px; fill: var(--text, #1A1F2E); }
            .fp-text-muted { font-family: inherit; font-size: 10px; fill: var(--muted, #6B7A8D); }
            .fp-text-mono  { font-family: var(--mono, monospace); font-size: 10px; fill: var(--text, #1A1F2E); }
            .fp-study-row  { cursor: pointer; }
            .fp-study-row:hover rect.fp-row-bg { fill: rgba(10,158,136,0.06); }
          `}</style>
        </defs>

        {/* Column header */}
        <text x={COL_LEFT_END / 2} y={14} textAnchor="middle" className="fp-text" fontWeight="600">Study</text>
        <text x={(COL_MID_START + COL_MID_END) / 2} y={14} textAnchor="middle" className="fp-text" fontWeight="600">
          {isRatio ? 'RR' : 'MD'} [95% CI]
        </text>
        <text x={(COL_RIGHT_START + SVG_WIDTH) / 2} y={14} textAnchor="middle" className="fp-text" fontWeight="600">
          {isRatio ? 'RR [95% CI]' : 'MD [95% CI]'}
        </text>

        {/* Null line (dashed) */}
        <line
          x1={nullX} y1={HEADER_H}
          x2={nullX} y2={axisY}
          stroke="var(--muted, #6B7A8D)"
          strokeWidth="1"
          strokeDasharray="4 3"
          opacity="0.6"
        />

        {/* Study rows */}
        {studies.map((s, i) => {
          const y    = studyRowY(i);
          const x    = toX(s.estimate, domainMin, domainMax);
          const x0   = toX(s.ciLow,   domainMin, domainMax);
          const x1   = toX(s.ciHigh,  domainMin, domainMax);
          const half = weightToSize(s.weight ?? 1, weights);
          const ciText = `${fmt(s.estimate)} (${fmt(s.ciLow)}–${fmt(s.ciHigh)})`;

          return (
            <g
              key={s.id}
              className="fp-study-row"
              onClick={() => onStudyClick?.(s.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onStudyClick?.(s.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`${s.label}: ${ciText}`}
            >
              {/* hover background */}
              <rect
                className="fp-row-bg"
                x={0}
                y={y - ROW_H / 2}
                width={SVG_WIDTH}
                height={ROW_H}
                fill="transparent"
              />

              {/* Label */}
              <text x={COL_LEFT_END - 6} y={y + 4} textAnchor="end" className="fp-text">
                {s.label}
              </text>

              {/* CI line */}
              <line
                x1={x0} y1={y}
                x2={x1} y2={y}
                stroke="var(--teal, #0A9E88)"
                strokeWidth="1.5"
              />
              {/* CI caps */}
              <line x1={x0} y1={y - 5} x2={x0} y2={y + 5} stroke="var(--teal, #0A9E88)" strokeWidth="1.5" />
              <line x1={x1} y1={y - 5} x2={x1} y2={y + 5} stroke="var(--teal, #0A9E88)" strokeWidth="1.5" />

              {/* Point estimate square */}
              <rect
                x={x - half}
                y={y - half}
                width={half * 2}
                height={half * 2}
                fill="var(--teal, #0A9E88)"
              />

              {/* Right column: numeric result */}
              <text x={COL_RIGHT_START + 4} y={y + 4} className="fp-text-mono">
                {ciText}
              </text>
            </g>
          );
        })}

        {/* Pooled estimate row */}
        {pooled && (
          <g>
            {/* separator line */}
            <line
              x1={COL_MID_START} y1={HEADER_H + studies.length * ROW_H + 2}
              x2={COL_MID_END}   y2={HEADER_H + studies.length * ROW_H + 2}
              stroke="var(--muted, #6B7A8D)"
              strokeWidth="0.75"
            />
            <text x={COL_LEFT_END - 6} y={pooledY + 4} textAnchor="end" className="fp-text" fontWeight="700">
              Pooled ({pooled.model ?? 'Random'})
            </text>
            <Diamond
              cx={pooled.estimate}
              ciLow={pooled.ciLow}
              ciHigh={pooled.ciHigh}
              y={pooledY}
              domainMin={domainMin}
              domainMax={domainMax}
            />
            <text x={COL_RIGHT_START + 4} y={pooledY + 4} className="fp-text-mono" fontWeight="700">
              {`${fmt(pooled.estimate)} (${fmt(pooled.ciLow)}–${fmt(pooled.ciHigh)})`}
            </text>
          </g>
        )}

        {/* Axis line */}
        <line
          x1={COL_MID_START} y1={axisY}
          x2={COL_MID_END}   y2={axisY}
          stroke="var(--muted, #6B7A8D)"
          strokeWidth="1"
        />

        {/* Tick marks + labels */}
        {ticks.map(t => {
          const tx = toX(t, domainMin, domainMax);
          if (tx < COL_MID_START || tx > COL_MID_END) return null;
          return (
            <g key={t}>
              <line x1={tx} y1={axisY} x2={tx} y2={axisY + 5} stroke="var(--muted, #6B7A8D)" strokeWidth="1" />
              <text x={tx} y={axisY + 16} textAnchor="middle" className="fp-text-muted">{t}</text>
            </g>
          );
        })}

        {/* Favors labels */}
        <text
          x={COL_MID_START + 4}
          y={axisY + 32}
          textAnchor="start"
          className="fp-text-muted"
          fontStyle="italic"
        >
          ← Favors intervention
        </text>
        <text
          x={COL_MID_END - 4}
          y={axisY + 32}
          textAnchor="end"
          className="fp-text-muted"
          fontStyle="italic"
        >
          Favors control →
        </text>

        {/* Heterogeneity stats */}
        {hetero && (
          <text
            x={COL_MID_START}
            y={axisY + 52}
            className="fp-text-muted"
          >
            {`I² = ${hetero.iSquared ?? '—'}%  ·  τ² = ${fmt(hetero.tauSquared)}  ·  p = ${hetero.pValue ?? '—'}`}
          </text>
        )}
      </svg>
    </>
  );
});

export default ForestPlotSVG;
