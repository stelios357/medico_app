import { getNormalValues } from './drugsData.js';

export default function NormalValues({ weight }) {
  const nv = getNormalValues(weight);

  return (
    <div className="normal-vals-panel">
      <div className="normal-vals-header">
        <span>Age-appropriate normal values</span>
        <span className="normal-vals-age">{nv.estimatedAge}</span>
      </div>
      <div className="normal-vals-grid">
        <div className="nv-item">
          <div className="nv-label">HR</div>
          <div className="nv-range">{nv.hr.min}–{nv.hr.max}<br /><span style={{ fontSize: '0.58rem', color: 'var(--muted)' }}>bpm</span></div>
        </div>
        <div className="nv-item">
          <div className="nv-label">RR</div>
          <div className="nv-range">{nv.rr.min}–{nv.rr.max}<br /><span style={{ fontSize: '0.58rem', color: 'var(--muted)' }}>breaths/min</span></div>
        </div>
        <div className="nv-item">
          <div className="nv-label">Min SBP</div>
          <div className="nv-range">{nv.sbpMin}<br /><span style={{ fontSize: '0.58rem', color: 'var(--muted)' }}>mmHg</span></div>
        </div>
        <div className="nv-item">
          <div className="nv-label">SpO₂</div>
          <div className="nv-range">{nv.spo2}</div>
        </div>
      </div>
    </div>
  );
}
