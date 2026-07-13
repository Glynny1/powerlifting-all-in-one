/** Immutable array helpers used throughout routine editing. */

export function moveItem<T>(arr: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (index < 0 || index >= arr.length || target < 0 || target >= arr.length) {
    return arr;
  }
  const next = arr.slice();
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

export function replaceAt<T>(arr: T[], index: number, item: T): T[] {
  if (index < 0 || index >= arr.length) return arr;
  const next = arr.slice();
  next[index] = item;
  return next;
}

export function removeAt<T>(arr: T[], index: number): T[] {
  if (index < 0 || index >= arr.length) return arr;
  const next = arr.slice();
  next.splice(index, 1);
  return next;
}

export function insertAt<T>(arr: T[], index: number, item: T): T[] {
  const next = arr.slice();
  next.splice(Math.max(0, Math.min(index, arr.length)), 0, item);
  return next;
}
