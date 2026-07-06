/**
 * Fixed UUID namespace for scale-test data (prayer wall + testimony wall).
 * Delete with: npm run unseed:scale
 */

export const SCALE_COUNT = 1000;
export const SCALE_ANON = "30000000-0000-4000-8000-000000000001";
export const SCALE_TAG = "[SCALE]";

/** Prayers: 10000000-0000-4000-8000-000000000001 … 0000000003e8 */
export function scalePrayerId(n: number): string {
  if (n < 1 || n > SCALE_COUNT) throw new RangeError(`prayer index out of range: ${n}`);
  return `10000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`;
}

/** Moments: 20000000-0000-4000-8000-000000000001 … 0000000003e8 */
export function scaleMomentId(n: number): string {
  if (n < 1 || n > SCALE_COUNT) throw new RangeError(`moment index out of range: ${n}`);
  return `20000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`;
}

export function allScalePrayerIds(): string[] {
  return Array.from({ length: SCALE_COUNT }, (_, i) => scalePrayerId(i + 1));
}

export function allScaleMomentIds(): string[] {
  return Array.from({ length: SCALE_COUNT }, (_, i) => scaleMomentId(i + 1));
}
