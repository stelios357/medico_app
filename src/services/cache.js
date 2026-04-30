import { TTL_DRUG } from '../utils/constants.js';

const store = new Map();

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
}

export function cacheDelete(key) {
  store.delete(key);
}

export function cacheClear() {
  store.clear();
}
