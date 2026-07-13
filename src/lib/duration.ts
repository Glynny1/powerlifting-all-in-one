/**
 * Duration helpers. Estimated durations are stored as human strings
 * (e.g. "2 minutes", "2–3 minutes", "1–2 minutes"). We parse a rough
 * midpoint in minutes to produce a total estimate for a routine.
 */

/** Parse a duration string to an approximate number of minutes (midpoint of ranges). */
export function parseDurationMinutes(value?: string): number {
  if (!value) return 0;
  const numbers = value.match(/\d+(?:\.\d+)?/g);
  if (!numbers || numbers.length === 0) return 0;
  const nums = numbers.map(Number).filter((n) => !Number.isNaN(n));
  if (nums.length === 0) return 0;
  // If a range like "2-3", average the endpoints; otherwise use the value.
  const sum = nums.reduce((a, b) => a + b, 0);
  return sum / nums.length;
}

/** Sum stage estimates into a friendly total like "≈ 11–13 min". */
export function estimateRoutineMinutes(durations: (string | undefined)[]): number {
  return Math.round(durations.reduce((total, d) => total + parseDurationMinutes(d), 0));
}

/** Format seconds as M:SS. */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
