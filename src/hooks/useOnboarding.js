import { useState } from 'react';

export function useOnboarding() {
  const [done, setDone] = useState(() => !!localStorage.getItem('pausemd_onboarded'));

  function complete(specialties) {
    localStorage.setItem('pausemd_specialties', JSON.stringify(specialties));
    localStorage.setItem('pausemd_onboarded', 'true');
    setDone(true);
  }

  function getSpecialties() {
    try {
      return JSON.parse(localStorage.getItem('pausemd_specialties') || '[]');
    } catch {
      return [];
    }
  }

  return { onboarded: done, complete, getSpecialties };
}
