import { useState, useEffect } from 'react';

const THEMES = ['default', 'paediatrics', 'critical-care', 'emergency', 'general', 'night'];

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('pausemd_theme') || 'default';
  });

  useEffect(() => {
    const html = document.documentElement;
    THEMES.forEach(t => html.classList.remove(`theme-${t}`));
    if (theme !== 'default') {
      html.classList.add(`theme-${theme}`);
    }
    localStorage.setItem('pausemd_theme', theme);
  }, [theme]);

  return { theme, setTheme: setThemeState, themes: THEMES };
}
