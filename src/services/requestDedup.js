const inFlight = new Map();

export function dedupFetch(key, promiseFn) {
  if (inFlight.has(key)) {
    return inFlight.get(key);
  }

  const promise = promiseFn().finally(() => {
    inFlight.delete(key);
  });

  inFlight.set(key, promise);
  return promise;
}
