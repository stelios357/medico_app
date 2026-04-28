import { useState, useCallback } from 'react';
import { getBroselowBand, ageToWeight } from './drugsData.js';

// Max pediatric weight on the visual scale (kg)
const SCALE_MAX = 40;

export default function WeightInput({ weight, onChange, compact = false }) {
  const [ageMonths, setAgeMonths] = useState(null);
  const [showAge, setShowAge] = useState(false);

  const band = getBroselowBand(weight);

  function step(delta) {
    const next = Math.max(0.5, Math.round((weight + delta) * 2) / 2);
    onChange(Math.min(next, 80));
  }

  function handleWeightChange(e) {
    const v = parseFloat(e.target.value);
    if (!isNaN(v) && v > 0) onChange(Math.min(v, 80));
  }

  const handleAgeSlider = useCallback((e) => {
    const months = parseInt(e.target.value, 10);
    setAgeMonths(months);
    const estimated = ageToWeight(months);
    onChange(estimated);
  }, [onChange]);

  const scalePercent = Math.min((weight / SCALE_MAX) * 100, 100);

  if (compact) {
    return (
      <div className="weight-panel" style={{ marginBottom: 0 }}>
        <div className="weight-panel-label">Patient Weight</div>
        <div className="weight-input-row">
          <div className="weight-stepper">
            <button className="weight-step-btn" onClick={() => step(-0.5)} aria-label="Decrease weight">−</button>
            <input
              type="number"
              className="weight-number-input"
              value={weight}
              onChange={handleWeightChange}
              min="0.5" max="80" step="0.5"
              aria-label="Patient weight in kg"
            />
            <span className="weight-unit">kg</span>
            <button className="weight-step-btn" onClick={() => step(0.5)} aria-label="Increase weight">+</button>
          </div>
        </div>
        <div className="broselow-band" style={{ borderColor: band.color + '66', background: band.color + '18' }}>
          <div className="broselow-color-bar" style={{ background: band.color, border: band.border ? '1px solid #888' : 'none' }} />
          <div className="broselow-info">
            <div className="broselow-label">Broselow Band</div>
            <div className="broselow-color-name" style={{ color: band.color === '#ECF0F1' ? '#555' : band.color }}>
              {band.name}
            </div>
            <div className="broselow-range">{band.range}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="weight-panel">
      <div className="weight-panel-label">Patient Weight</div>

      <div className="weight-input-row">
        <div className="weight-stepper">
          <button className="weight-step-btn" onClick={() => step(-0.5)} aria-label="Decrease by 0.5 kg">−</button>
          <input
            type="number"
            className="weight-number-input"
            value={weight}
            onChange={handleWeightChange}
            min="0.5" max="80" step="0.5"
            aria-label="Patient weight in kg"
          />
          <span className="weight-unit">kg</span>
          <button className="weight-step-btn" onClick={() => step(0.5)} aria-label="Increase by 0.5 kg">+</button>
        </div>
      </div>

      {/* Age estimator toggle */}
      <div className="age-estimator">
        <div className="age-estimator-label">
          <button
            onClick={() => setShowAge(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--teal)', fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: 0 }}
          >
            {showAge ? '▾' : '▸'} Age Estimator (optional)
          </button>
        </div>

        {showAge && (
          <div>
            <div className="age-slider-row">
              <span className="age-slider-label">0 m</span>
              <input
                type="range"
                className="age-slider"
                min="0" max="216" step="1"
                value={ageMonths ?? 0}
                onChange={handleAgeSlider}
                aria-label="Patient age in months"
              />
              <span className="age-slider-label">18 y</span>
            </div>
            {ageMonths !== null && (
              <div className="age-estimate-text">
                Age: {ageMonths < 12 ? `${ageMonths} months` : `${(ageMonths / 12).toFixed(1)} years`}
                &nbsp;→ Est. weight: ~{ageToWeight(ageMonths)} kg (APLS)
              </div>
            )}
          </div>
        )}
      </div>

      {/* Broselow band */}
      <div className="broselow-band" style={{ borderColor: band.color + '66', background: band.color + '18' }}>
        <div className="broselow-color-bar" style={{ background: band.color, border: band.border ? '1px solid #888' : 'none' }} />
        <div className="broselow-info">
          <div className="broselow-label">Broselow Band</div>
          <div className="broselow-color-name" style={{ color: band.color === '#ECF0F1' ? '#555' : band.color }}>
            ████ {band.name}
          </div>
          <div className="broselow-range">{band.range}</div>
        </div>
      </div>

      {/* Weight scale */}
      <div>
        <div className="weight-scale">
          <div
            className="weight-scale-marker"
            style={{ left: `${scalePercent}%` }}
            aria-hidden="true"
          />
        </div>
        <div className="weight-scale-labels">
          <span>0</span>
          <span>10</span>
          <span>20</span>
          <span>30</span>
          <span>40+ kg</span>
        </div>
      </div>
    </div>
  );
}
