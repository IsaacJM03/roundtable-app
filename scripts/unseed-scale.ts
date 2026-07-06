/**
 * Remove scale-test data inserted by scripts/seed-scale.ts
 *
 * Usage: npm run unseed:scale
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/database.types";
import {
  allScaleMomentIds,
  allScalePrayerIds,
  SCALE_TAG,
} from "./scale-seed-ids";

const BATCH = 100;

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

async function deleteInBatches(
  supabase: ReturnType<typeof loadEnv>,
  table: "prayer_requests" | "god_moments" | "reactions" | "moment_reactions" | "prayer_updates",
  column: string,
  ids: string[]
) {
  let total = 0;
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH);
    const { error, count } = await supabase.from(table).delete({ count: "exact" }).in(column, chunk);
    if (error) throw error;
    total += count ?? 0;
  }
  return total;
}

async function unseedScale() {
  const supabase = loadEnv();
  const prayerIds = allScalePrayerIds();
  const momentIds = allScaleMomentIds();

  console.log("🧹 Removing scale-test wall data...\n");

  const reactions = await deleteInBatches(supabase, "reactions", "target_id", prayerIds);
  console.log(`  ✓ reactions on prayers (${reactions})`);

  const prayerUpdates = await deleteInBatches(supabase, "prayer_updates", "prayer_request_id", prayerIds);
  console.log(`  ✓ prayer_updates (${prayerUpdates})`);

  const momentReactions = await deleteInBatches(supabase, "moment_reactions", "moment_id", momentIds);
  console.log(`  ✓ moment_reactions (${momentReactions})`);

  const prayers = await deleteInBatches(supabase, "prayer_requests", "id", prayerIds);
  console.log(`  ✓ prayer_requests (${prayers})`);

  const moments = await deleteInBatches(supabase, "god_moments", "id", momentIds);
  console.log(`  ✓ god_moments (${moments})`);

  // Belt-and-suspenders: anything still tagged [SCALE]
  await supabase.from("prayer_requests").delete().like("title", `${SCALE_TAG}%`);
  await supabase.from("god_moments").delete().like("body", `${SCALE_TAG}%`);

  console.log("\n✅ Scale test data removed.");
}

unseedScale().catch((err) => {
  console.error("\n❌ Scale unseed failed:", err.message ?? err);
  process.exit(1);
});
