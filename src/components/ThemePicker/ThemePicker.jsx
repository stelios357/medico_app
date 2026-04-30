import { useTheme } from '../../hooks/useTheme.js';

const THEME_META = [
  { id: 'default',       label: 'Default',       color: '#0A9E88', density: 'comfortable' },
  { id: 'paediatrics',   label: 'Paediatrics',   color: '#0F9B8E', density: 'comfortable' },
  { id: 'critical-care', label: 'Critical Care', color: '#C47D0E', density: 'compact'     },
  { id: 'emergency',     label: 'Emergency',     color: '#C0392B', density: 'compact'     },
  { id: 'general',       label: 'General',       color: '#2E5F8A', density: 'comfortable' },
  { id: 'night',         label: 'Night Shift',   color: '#6B9E7A', density: 'dark'        },
];

export default function ThemePicker() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-picker" role="radiogroup" aria-label="App theme">
      <p className="theme-picker-label">Appearance</p>
      <div className="theme-picker-grid">
        {THEME_META.map(t => {
          const active = theme === t.id;
          return (
            <button
              key={t.id}
              role="radio"
              aria-checked={active}
              className={`theme-swatch${active ? ' active' : ''}`}
              onClick={() => setTheme(t.id)}
              title={t.label}
              aria-label={`${t.label} theme`}
            >
              <span
                className="theme-swatch-dot"
                style={{ background: t.color }}
              >
                {active && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              <span className="theme-swatch-name">{t.label}</span>
              <span className="theme-swatch-density">{t.density}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
