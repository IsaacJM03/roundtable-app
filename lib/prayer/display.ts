/** Auto-filled when the poster leaves the optional body blank (DB requires >= 10 chars). */
export const PRAYER_BODY_PLACEHOLDER = "Shared without additional details.";

export function prayerBodyForDisplay(body: string | null | undefined): string | null {
  if (!body?.trim() || body.trim() === PRAYER_BODY_PLACEHOLDER) return null;
  return body;
}
