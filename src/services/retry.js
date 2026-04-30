import { FETCH_TIMEOUT_MS, RETRY_MAX, RETRY_BACKOFF_MS } from '../utils/constants.js';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchWithRetry(url, options = {}) {
  let lastError;

  for (let attempt = 0; attempt <= RETRY_MAX; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    // Allow caller to pass their own signal for cancellation (query change)
    const callerSignal = options.signal;
    if (callerSignal?.aborted) {
      clearTimeout(timer);
      throw new DOMException('Aborted by caller', 'AbortError');
    }

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      clearTimeout(timer);

      // If the caller's signal fired, stop retrying
      if (callerSignal?.aborted) throw err;

      lastError = err;
      if (attempt < RETRY_MAX) {
        await sleep(RETRY_BACKOFF_MS * Math.pow(2, attempt));
      }
    }
  }

  throw lastError;
}
