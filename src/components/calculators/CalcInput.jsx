/**
 * Renders a single calculator input field based on its type:
 *   number  → <input type="number">
 *   select  → <select> with options
 *   checkbox → <input type="checkbox">
 */
export default function CalcInput({ input, value, onChange }) {
  const { id, label, type, unit, min, max, options } = input;

  function handleChange(e) {
    if (type === 'checkbox') {
      onChange(id, e.target.checked);
    } else {
      onChange(id, e.target.value);
    }
  }

  if (type === 'checkbox') {
    return (
      <label className="ci-checkbox-row" htmlFor={`ci-${id}`}>
        <input
          id={`ci-${id}`}
          type="checkbox"
          className="ci-checkbox"
          checked={!!value}
          onChange={handleChange}
        />
        <span className="ci-checkbox-label">{label}</span>
      </label>
    );
  }

  if (type === 'select') {
    return (
      <div className="ci-field">
        <label className="ci-label" htmlFor={`ci-${id}`}>{label}</label>
        <select
          id={`ci-${id}`}
          className="ci-select"
          value={value ?? ''}
          onChange={handleChange}
        >
          <option value="" disabled>Select…</option>
          {(options ?? []).map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  }

  // default: number
  return (
    <div className="ci-field">
      <label className="ci-label" htmlFor={`ci-${id}`}>
        {label}
        {unit && <span className="ci-unit">{unit}</span>}
      </label>
      <input
        id={`ci-${id}`}
        type="number"
        className="ci-input"
        value={value ?? ''}
        min={min}
        max={max}
        step="any"
        placeholder="—"
        onChange={handleChange}
      />
    </div>
  );
}
