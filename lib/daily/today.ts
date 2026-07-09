/** App calendar day for Daily Drop. Override with DAILY_TIMEZONE if needed. */
export const DAILY_TIMEZONE =
  process.env.DAILY_TIMEZONE?.trim() || "Africa/Nairobi";

/** YYYY-MM-DD for "today" in the app timezone (not UTC). */
export function todayDateString(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DAILY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
