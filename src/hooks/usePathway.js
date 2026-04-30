import { useState, useCallback } from 'react';

export function usePathway(pathway) {
  const STORAGE_KEY = pathway ? `pausemd_pathway_${pathway.id}` : null;

  const [state, setState] = useState(() => {
    if (!pathway) return null;
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { currentStepId: pathway.steps[0]?.id, history: [], answers: {} };
  });

  function save(next) {
    setState(next);
    if (STORAGE_KEY) {
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    }
  }

  const goTo = useCallback((stepId, answer) => {
    if (!pathway || !state) return;
    save({
      currentStepId: stepId,
      history: [...state.history, state.currentStepId],
      answers: answer !== undefined
        ? { ...state.answers, [state.currentStepId]: answer }
        : state.answers,
    });
  }, [state, pathway]);

  const goBack = useCallback(() => {
    if (!state || state.history.length === 0) return;
    const prev = state.history[state.history.length - 1];
    save({
      currentStepId: prev,
      history: state.history.slice(0, -1),
      answers: state.answers,
    });
  }, [state]);

  const restart = useCallback(() => {
    if (!pathway) return;
    const fresh = { currentStepId: pathway.steps[0]?.id, history: [], answers: {} };
    save(fresh);
    if (STORAGE_KEY) sessionStorage.removeItem(STORAGE_KEY);
  }, [pathway]);

  const currentStep = pathway?.steps.find(s => s.id === state?.currentStepId);
  const stepIndex = pathway?.steps.findIndex(s => s.id === state?.currentStepId) ?? -1;

  return {
    state,
    currentStep,
    stepIndex,
    totalSteps: pathway?.steps.length ?? 0,
    canGoBack: (state?.history?.length ?? 0) > 0,
    goTo,
    goBack,
    restart,
  };
}
