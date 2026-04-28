import { getEquipment } from './drugsData.js';

const ITEMS = [
  { key: 'ett_uncuffed', label: 'ETT (Uncuffed)', note: 'mm ID' },
  { key: 'ett_cuffed',   label: 'ETT (Cuffed)',   note: 'mm ID' },
  { key: 'ett_depth',    label: 'ETT Depth (oral)', note: 'cm at lip' },
  { key: 'blade',        label: 'Laryngoscope',   note: '' },
  { key: 'lma',          label: 'LMA Size',        note: '' },
  { key: 'suction',      label: 'Suction Cath.',   note: 'Fr' },
  { key: 'ng',           label: 'NG Tube',         note: '' },
  { key: 'iv_cannula',   label: 'IV Cannula',      note: '' },
  { key: 'paddle',       label: 'Defib Paddle',    note: '' },
  { key: 'cpr_depth',    label: 'CPR Depth',       note: '' },
];

export default function EquipmentPanel({ weight }) {
  const equip = getEquipment(weight);

  return (
    <div className="equip-panel">
      <div style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: 'var(--teal)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
        Equipment Sizing
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '1rem' }}>
        Est. age: {equip.estimatedAge < 1 ? `~${Math.round(equip.estimatedAge * 12)} months` : `~${equip.estimatedAge.toFixed(1)} yr`}
        &nbsp;(APLS inverse from {weight} kg)
      </div>

      <div className="equip-grid">
        {ITEMS.map(({ key, label, note }) => {
          const val = equip[key];
          if (val == null) return null;
          return (
            <div className="equip-item" key={key}>
              <div className="equip-item-label">{label}</div>
              <div className="equip-item-value">{val}</div>
              {note && <div className="equip-item-note">{note}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
