import { FETCH_TIMEOUT_MS, RETRY_MAX, RETRY_BACKOFF_MS } from '../utils/constants.js';

// Resolves early if signal fires, otherwise resolves after ms
function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    }, { once: true });
  });
}

export async function fetchWithRetry(url, options = {}) {
  const callerSignal = options.signal ?? null;
  let lastError;

  for (let attempt = 0; attempt <= RETRY_MAX; attempt++) {
    // Bail immediately if caller already aborted
    if (callerSignal?.aborted) {
      throw new DOMException('Aborted by caller', 'AbortError');
    }

    // Timeout controller for this attempt
    const timeoutController = new AbortController();
    const timer = setTimeout(() => timeoutController.abort(), FETCH_TIMEOUT_MS);

    // Link caller abort → timeout controller so fetch is cancelled on both
    let callerListener = null;
    if (callerSignal) {
      callerListener = () => timeoutController.abort();
      callerSignal.addEventListener('abort', callerListener, { once: true });
    }

    try {
      const res = await fetch(url, {
        ...options,
        signal: timeoutController.signal,
      });
      clearTimeout(timer);
      callerSignal?.removeEventListener('abort', callerListener);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      clearTimeout(timer);
      callerSignal?.removeEventListener('abort', callerListener);

      // If caller aborted, propagate immediately — do not retry
      if (callerSignal?.aborted) throw err;

      lastError = err;
      if (attempt < RETRY_MAX) {
        // Sleep is also abort-aware: wakes up early if caller signal fires
        await sleep(RETRY_BACKOFF_MS * Math.pow(2, attempt), callerSignal);
      }
    }
  }

  throw lastError;
}
