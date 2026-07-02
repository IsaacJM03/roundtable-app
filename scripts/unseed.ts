/**
 * Remove all seed data inserted by scripts/seed.ts
 *
 * Usage: npm run unseed
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/database.types";
import { SEED, SEED_DAILY_DATE } from "./seed-ids";

function loadEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy from .env."
    );
  }
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function unseed() {
  const supabase = loadEnv();
  console.log("🧹 Removing Roundtable seed data...\n");

  const postIds = Object.values(SEED.posts);
  const prayerIds = Object.values(SEED.prayers);
  const momentIds = Object.values(SEED.moments);
  const counselIds = Object.values(SEED.counseling);

  // Children first (cascades handle some, but reactions are polymorphic)
  await supabase.from("reactions").delete().in("target_id", [...postIds, ...prayerIds]);
  await supabase.from("moment_reactions").delete().in("moment_id", momentIds);
  await supabase.from("messages").delete().in("session_id", counselIds);
  await supabase.from("replies").delete().in("post_id", postIds);

  const tables: { name: string; column: string; ids: string[] }[] = [
    { name: "honest_hours", column: "id", ids: Object.values(SEED.honest) },
    { name: "god_moments", column: "id", ids: momentIds },
    { name: "daily_drops", column: "id", ids: [SEED.dailyDrop] },
    { name: "counseling_sessions", column: "id", ids: counselIds },
    { name: "prayer_requests", column: "id", ids: prayerIds },
    { name: "posts", column: "id", ids: postIds },
  ];

  for (const { name, column, ids } of tables) {
    const { error, count } = await supabase.from(name).delete({ count: "exact" }).in(column, ids);
    if (error) throw error;
    console.log(`  ✓ ${name} (${count ?? 0} deleted)`);
  }

  // Belt-and-suspenders: anything tagged [SEED] in titles
  await supabase.from("posts").delete().like("title", "[SEED]%");
  await supabase.from("prayer_requests").delete().like("title", "[SEED]%");
  await supabase.from("daily_drops").delete().eq("drop_date", SEED_DAILY_DATE);

  console.log("\n✅ Seed data removed.");
}

unseed().catch((err) => {
  console.error("\n❌ Unseed failed:", err.message ?? err);
  process.exit(1);
});
