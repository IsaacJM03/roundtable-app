import { createAdminClient } from "@/lib/supabase/admin";
import type { DailyDrop } from "@/lib/types";
import { fetchVerseForDate } from "./fetchVerse";
import { DEFAULT_QUESTION, DEFAULT_REFLECTION } from "./passages";

/**
 * If no drop exists for `dateStr`, fetch a verse from bible-api.com and insert it.
 * Team can overwrite reflection/question later via the dashboard.
 */
export async function ensureDropForDate(dateStr: string): Promise<void> {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("daily_drops")
    .select("id")
    .eq("drop_date", dateStr)
    .maybeSingle();

  if (existing) return;

  const verse = await fetchVerseForDate(dateStr);

  const { error } = await admin.from("daily_drops").insert({
    drop_date: dateStr,
    verse_ref: verse.verse_ref,
    verse_text: verse.verse_text,
    reflection: DEFAULT_REFLECTION,
    question: DEFAULT_QUESTION,
    author_id: null,
  });

  // Race: another request may have inserted first
  if (error && !error.message.includes("duplicate")) {
    throw error;
  }
}

export async function getDropsThroughDate(dateStr: string, limit = 8) {
  await ensureDropForDate(dateStr);

  const admin = createAdminClient();
  const { data } = await admin
    .from("daily_drops")
    .select("*")
    .lte("drop_date", dateStr)
    .order("drop_date", { ascending: false })
    .limit(limit);

  return (data ?? []) as DailyDrop[];
}
