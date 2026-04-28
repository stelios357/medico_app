// Thin wrapper around window.gtag — safe to call before GA4 loads or in SSR
export function trackEvent(name, params = {}) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}
