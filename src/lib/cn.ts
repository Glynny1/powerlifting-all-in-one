/** Tiny classname combiner (avoids a dependency). Falsy values are dropped. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}
