export function makeFallback(source, err) {
  const isTimeout = err?.name === 'AbortError';
  const isNetwork = err instanceof TypeError;

  let message = 'Service temporarily unavailable. Please try again.';
  if (isTimeout) message = 'Request timed out. Please check your connection and try again.';
  else if (isNetwork) message = 'Network error. Please check your connection.';

  return {
    error: true,
    code: isTimeout ? 'TIMEOUT' : isNetwork ? 'NETWORK_ERROR' : 'API_UNAVAILABLE',
    message,
    source,
  };
}

export function isFallback(result) {
  return result && result.error === true;
}
