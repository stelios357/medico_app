import { usePico } from '../../hooks/usePico.js';

export default function PICOChip() {
  const { pico, clearPico } = usePico();
  if (!pico) return null;

  const parts = [
    pico.population && `P: ${pico.population.slice(0, 22)}${pico.population.length > 22 ? '…' : ''}`,
    pico.intervention && `I: ${pico.intervention.slice(0, 18)}${pico.intervention.length > 18 ? '…' : ''}`,
    pico.comparator && `C: ${pico.comparator.slice(0, 16)}${pico.comparator.length > 16 ? '…' : ''}`,
    Array.isArray(pico.outcome) && pico.outcome.length > 0 && `O: ${pico.outcome.slice(0, 2).join(', ')}`,
  ].filter(Boolean);

  return (
    <span className="pico-chip" title="Active PICO question — click × to clear">
      <span className="pico-chip-text">{parts.join(' · ')}</span>
      <button
        className="pico-chip-clear"
        onClick={clearPico}
        aria-label="Clear PICO question"
        title="Clear PICO filter"
      >
        ×
      </button>
    </span>
  );
}
