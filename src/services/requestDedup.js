const inFlight = new Map();

export function dedupFetch(key, promiseFn, signal) {
  // Skip deduplication when a signal is provided — each caller needs independent
  // cancellation control; sharing a promise would couple their abort lifecycles.
  if (signal) {
    return promiseFn();
  }

  if (inFlight.has(key)) {
    return inFlight.get(key);
  }

  const promise = promiseFn().finally(() => {
    inFlight.delete(key);
  });

  inFlight.set(key, promise);
  return promise;
}
