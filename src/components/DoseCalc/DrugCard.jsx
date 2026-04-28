import { useEffect, useRef, useState } from 'react';
import { calcDrug } from './drugsData.js';

// Smoothly interpolates a displayed number over `duration` ms
function useAnimatedNumber(target, duration = 200) {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const fromRef = useRef(target);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const from = fromRef.current;
    const to = target;
    startRef.current = null;

    function tick(ts) {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = from + (to - from) * eased;
      setDisplay(value);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}

function formatNum(val, unit) {
  if (unit === 'J' || unit === 'mL/hr') return val.toFixed(0);
  if (Math.abs(val) < 0.1) return val.toFixed(2);
  if (Math.abs(val) < 1) return val.toFixed(1);
  if (Math.abs(val) < 10) return val.toFixed(1);
  return val.toFixed(0);
}

export default function DrugCard({ drug, weight, compact = false, pinned, onPin }) {
  const result = calcDrug(drug, weight);
  if (!result) return null;

  const { displayDose, displayRule, volumeLabel, concentrationLabel, atMax, nearMax, notes, warning, source, unit } = result;

  // Parse numeric value from displayDose for animation
  const numericDose = parseFloat(displayDose);
  const animatedDose = useAnimatedNumber(isNaN(numericDose) ? 0 : numericDose, 200);
  const numericVol = volumeLabel ? parseFloat(volumeLabel) : null;
  const animatedVol = useAnimatedNumber(numericVol ?? 0, 200);

  const status = atMax ? 'at-max' : nearMax ? 'near-max' : 'safe';

  function handleCopy() {
    const volPart = volumeLabel ? ` (${volumeLabel} of ${concentrationLabel})` : '';
    const text = `${drug.name} [${drug.indication}]: ${displayDose}${volPart} — for ${weight} kg patient`;
    navigator.clipboard?.writeText(text);
  }

  const doseDisplay = isNaN(numericDose)
    ? displayDose
    : `${formatNum(animatedDose, unit)} ${unit}`;

  const volDisplay = numericVol != null && !isNaN(numericVol)
    ? `${formatNum(animatedVol, 'mL')} mL`
    : volumeLabel;

  return (
    <div className={`drug-card status-${status}${compact ? ' compact' : ''}`}>
      <div className="drug-card-header">
        <div>
          <div className="drug-name">{drug.name}</div>
          <div className="drug-indication">{drug.indication}</div>
        </div>
        <div className="drug-card-badges">
          <span className={`drug-cat-badge ${drug.category}`}>{drug.category}</span>
          {onPin && (
            <button
              className={`pin-btn${pinned ? ' pinned' : ''}`}
              onClick={() => onPin(drug.id)}
              title={pinned ? 'Unpin' : 'Pin to top'}
              aria-label={pinned ? 'Unpin drug' : 'Pin drug to top'}
            >
              {pinned ? '📌' : '📌'}
            </button>
          )}
        </div>
      </div>

      <div className="drug-dose-rule">{displayRule}</div>

      {atMax && (
        <div className="drug-at-max-warning">
          ⚠ MAX DOSE REACHED — dose capped at {drug.maxDose ?? result.totalDose} {unit}
        </div>
      )}

      <div className="drug-values-grid">
        <div className="drug-value-box">
          <div className="dvb-label">Total Dose</div>
          <div className="dvb-value">{doseDisplay}</div>
          {atMax && <div className="dvb-sub" style={{ color: 'var(--red)' }}>MAX DOSE</div>}
        </div>
        {volDisplay && (
          <div className="drug-value-box">
            <div className="dvb-label">Volume to Draw</div>
            <div className="dvb-value">{volDisplay}</div>
            {concentrationLabel && <div className="dvb-sub">{concentrationLabel}</div>}
          </div>
        )}
        {!volDisplay && concentrationLabel && (
          <div className="drug-value-box">
            <div className="dvb-label">Preparation</div>
            <div className="dvb-value" style={{ fontSize: '0.85rem' }}>{concentrationLabel}</div>
          </div>
        )}
      </div>

      {warning && (
        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: 'var(--amber)', background: 'rgba(232,144,10,0.08)', border: '1px solid rgba(232,144,10,0.25)', borderRadius: 6, padding: '0.35rem 0.65rem', marginBottom: '0.65rem' }}>
          ⚠ {warning}
        </div>
      )}

      {!compact && (
        <div className="drug-card-footer">
          {notes && <div className="drug-notes">{notes}</div>}
          <div className="drug-card-actions">
            <button className="drug-action-btn" onClick={handleCopy} title="Copy to clipboard">
              📋 Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
