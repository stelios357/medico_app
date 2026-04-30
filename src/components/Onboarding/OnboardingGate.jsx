import { useOnboarding } from '../../hooks/useOnboarding.js';
import OnboardingFlow from './OnboardingFlow.jsx';

// Apply saved theme class before render to avoid flash
const savedTheme = localStorage.getItem('pausemd_theme');
if (savedTheme && savedTheme !== 'default') {
  document.documentElement.classList.add(`theme-${savedTheme}`);
}

export default function OnboardingGate() {
  const { onboarded, complete } = useOnboarding();
  if (onboarded) return null;
  return <OnboardingFlow onComplete={complete} />;
}
