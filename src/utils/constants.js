export const OPENFDA_BASE = 'https://api.fda.gov';
export const RXNORM_BASE = 'https://rxnav.nlm.nih.gov/REST';
export const MEDLINEPLUS_BASE = 'https://connect.medlineplus.gov/application';

export const TTL_DRUG = 5 * 60 * 1000;       // 5 minutes
export const TTL_DISEASE = 5 * 60 * 1000;    // 5 minutes
export const TTL_INTERACTION = 10 * 60 * 1000; // 10 minutes

export const RATE_LIMIT_PER_MIN = 240;
export const RATE_LIMIT_WARN_THRESHOLD = 200; // warn before hitting ceiling

export const FETCH_TIMEOUT_MS = 5000;
export const RETRY_MAX = 2;
export const RETRY_BACKOFF_MS = 300; // doubles on each retry
