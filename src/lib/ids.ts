/**
 * Stable ID generation. Prefers crypto.randomUUID when available and falls
 * back to a timestamp+random string for older browsers.
 */
export function newId(prefix = 'id'): string {
  const cryptoObj = typeof crypto !== 'undefined' ? crypto : undefined;
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
    return `${prefix}_${cryptoObj.randomUUID()}`;
  }
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}
