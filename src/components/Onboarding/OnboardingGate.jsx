import { useEffect } from 'react';
import { useOnboarding } from '../../hooks/useOnboarding.js';
import OnboardingFlow from './OnboardingFlow.jsx';

const THEME_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export default function OnboardingGate() {
  const { onboarded, complete } = useOnboarding();

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof document === 'undefined' ||
      typeof window.localStorage === 'undefined'
    ) {
      return;
    }

    const savedTheme = window.localStorage.getItem('pausemd_theme');
    if (
      !savedTheme ||
      savedTheme === 'default' ||
      !THEME_ID_PATTERN.test(savedTheme)
    ) {
      return;
    }

    document.documentElement.classList.add(`theme-${savedTheme}`);
  }, []);

  if (onboarded) return null;
  return <OnboardingFlow onComplete={complete} />;
}
