import { Link } from 'react-router-dom';
import { useCalcHistory } from '../../hooks/useCalcHistory.js';
import { calculatorRegistry } from '../../data/calculatorRegistry.js';

const PINNED = ['egfr-ckd-epi', 'chadsvasc', 'heart-score'];

const SPECIALTY_SHORT = {
  nephrology:  'Nephro',
  cardiology:  'Cardio',
  emergency:   'Emergency',
  neurology:   'Neuro',
  pulmonology: 'Pulm',
  general:     'General',
};

export default function CalcStrip() {
  const { history } = useCalcHistory();

  const tiles = PINNED.map(slug => ({
    config: calculatorRegistry.find(c => c.slug === slug),
    last:   history.find(h => h.slug === slug) ?? null,
  })).filter(t => t.config);

  return (
    <div className="calc-strip">
      <div className="cs-header">
        <span className="cs-label">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          Clinical Calculators
        </span>
        <Link to="/calculators" className="cs-viewall">
          View all {calculatorRegistry.length}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
        </Link>
      </div>

      <div className="cs-tiles">
        {tiles.map(({ config, last }) => (
          <Link key={config.slug} to={`/calculator/${config.slug}`} className={`cs-tile${last ? ' cs-tile--used' : ''}`}>
            <span className="cs-tile-specialty">
              {SPECIALTY_SHORT[config.specialty] ?? config.specialty}
            </span>
            <span className="cs-tile-name">{config.name}</span>
            <div className="cs-tile-bottom">
              {last ? (
                <span className="cs-tile-result">
                  <span className="cs-tile-val">{last.result}</span>
                  {last.unit && <span className="cs-tile-unit">{last.unit}</span>}
                </span>
              ) : (
                <span className="cs-tile-ready">
                  <span className="cs-ready-dot" aria-hidden="true" />
                  Ready
                </span>
              )}
              <svg className="cs-tile-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
