/**
 * Calculator engine — validates inputs and runs a calculator config's calculate function.
 *
 * Returns { result, interpretation, risk? } on success, or null if inputs are
 * incomplete or out of range. Never throws to the caller.
 */
export function runCalculator(config, inputValues) {
  if (!config || typeof config.calculate !== 'function') return null;

  // Validate and coerce every declared input
  const coerced = {};
  for (const input of config.inputs) {
    const raw = inputValues?.[input.id];

    if (raw === '' || raw === null || raw === undefined) return null;

    if (input.type === 'number') {
      const n = Number(raw);
      if (!isFinite(n)) return null;
      if (input.min !== undefined && n < input.min) return null;
      if (input.max !== undefined && n > input.max) return null;
      coerced[input.id] = n;
    } else if (input.type === 'select') {
      const n = Number(raw);
      if (!isFinite(n)) return null;
      coerced[input.id] = n;
    } else if (input.type === 'checkbox') {
      // Checkboxes contribute 0 or 1 (or their option point value) to scoring
      coerced[input.id] = raw ? 1 : 0;
    } else {
      coerced[input.id] = raw;
    }
  }

  try {
    const result = config.calculate(coerced);
    if (!result || result.result === null || result.result === undefined) return null;
    return result;
  } catch {
    return null;
  }
}
