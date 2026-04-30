import { TTL_DRUG } from '../utils/constants.js';

const store = new Map();
const PRUNE_INTERVAL = 50;
let writeCount = 0;

function pruneExpired() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.expiresAt) store.delete(key);
  }
}

export function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function cacheSet(key, value, ttl = TTL_DRUG) {
  store.set(key, { value, expiresAt: Date.now() + ttl });
  if (++writeCount % PRUNE_INTERVAL === 0) {
    pruneExpired();
  }
}

export function cacheDelete(key) {
  store.delete(key);
}

export function cacheClear() {
  store.clear();
}
