import { todayDateString } from "./today";

const assert = (cond: unknown, msg: string) => {
  if (!cond) throw new Error(msg);
};

assert(/^\d{4}-\d{2}-\d{2}$/.test(todayDateString(new Date("2026-07-09T00:30:00Z"))), "Nairobi morning");
assert(todayDateString(new Date("2026-07-08T21:30:00Z")) === "2026-07-09", "UTC evening is next Nairobi day");
assert(todayDateString(new Date("2026-07-08T20:59:00Z")) === "2026-07-08", "before Nairobi midnight");

console.log("lib/daily/today.ts: ok");
