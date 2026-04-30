import { useState } from 'react';

const EMPTY = { population: '', intervention: '', comparator: '', outcome: [] };

export function usePico() {
  const [pico, setPicoState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pausemd_pico') || 'null') || null;
    } catch { return null; }
  });

  function setPico(next) {
    if (next) {
      localStorage.setItem('pausemd_pico', JSON.stringify(next));
    } else {
      localStorage.removeItem('pausemd_pico');
    }
    setPicoState(next);
  }

  function clearPico() {
    setPico(null);
  }

  function scoreTopic(topic) {
    if (!pico) return 50;
    const fields = [
      { text: pico.population, weight: 3 },
      { text: pico.intervention, weight: 3 },
      { text: pico.comparator, weight: 1 },
      { text: Array.isArray(pico.outcome) ? pico.outcome.join(' ') : pico.outcome, weight: 2 },
    ];
    const searchText = (topic.title + ' ' + (topic.tags || []).join(' ')).toLowerCase();
    let score = 0;
    let maxScore = 0;
    for (const { text, weight } of fields) {
      if (!text) continue;
      maxScore += weight * 10;
      const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const matched = words.filter(w => searchText.includes(w)).length;
      score += (matched / Math.max(words.length, 1)) * weight * 10;
    }
    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 50;
  }

  return { pico, setPico, clearPico, scoreTopic, hasPico: !!pico };
}
