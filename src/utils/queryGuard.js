/**
 * createQueryScope — lightweight stale-response protection.
 *
 * Usage in hooks:
 *   const scope = createQueryScope();
 *   const guarded = scope.guard(async () => await openFDA.search(q));
 *   guarded.then(result => { if (result !== STALE) setState(result); });
 *
 * Why:
 *   Services are stateless — they can't know which call is "latest".
 *   The scope tracks a monotonic counter. Each call captures its id at
 *   call time. If a newer call has started by the time a response
 *   arrives, the result is discarded before it can reach React state.
 */

export const STALE = Symbol('STALE');

export function createQueryScope() {
  let currentId = 0;

  return {
    /**
     * Wraps an async function. Returns STALE if a newer call has started
     * by the time the wrapped function resolves.
     */
    guard(asyncFn) {
      const capturedId = ++currentId;
      return asyncFn().then(result => {
        if (capturedId !== currentId) return STALE;
        return result;
      });
    },

    /** Increment the counter without an associated call — cancels all pending. */
    invalidate() {
      currentId++;
    },
  };
}
