/**
 * Insert ~1000 prayer requests + ~1000 god moments for wall scale testing.
 *
 * Usage:  npm run seed:scale
 * Cleanup: npm run unseed:scale  (or scripts/unseed-scale.sql in Supabase SQL editor)
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/database.types";
import {
  SCALE_ANON,
  SCALE_COUNT,
  SCALE_TAG,
  scaleMomentId,
  scalePrayerId,
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

const PRAYER_TOPICS = [
  "healing for a family member",
  "wisdom for a career decision",
  "peace over anxiety",
  "restoration in a relationship",
  "provision during unemployment",
  "strength for exams",
  "comfort after loss",
  "guidance for parenting",
  "courage to share faith",
  "breakthrough in addiction recovery",
];

const TESTIMONY_SNIPPETS = [
  "God opened a door we never saw coming — the interview went better than we hoped.",
  "After weeks of waiting, the test came back clear. We are grateful beyond words.",
  "A friend reached out the same day I prayed for connection. Felt like a hug from heaven.",
  "I finally slept through the night for the first time in months. Small miracle, huge relief.",
  "The apology I was afraid to ask for was received with grace. Healing is real.",
];

type PrayerRow = {
  id: string;
  title: string;
  body: string;
  status: "active" | "answered";
  anonymous_token: string;
  is_private: boolean;
  created_at: string;
  testimony?: string | null;
  testimony_at?: string | null;
};

const MOMENT_SNIPPETS = [
  "A verse I'd forgotten popped up exactly when I needed it — like God tapped me on the shoulder.",
  "Someone from church showed up at my door with a meal. I hadn't told anyone I was struggling.",
  "I heard my kid praying for a stranger on the news. Faith looks different when it's simple.",
  "Got a text from an old friend the minute I finished praying about loneliness.",
  "The rain stopped right as outdoor service started. The whole room laughed and worshipped louder.",
  "A coworker asked about hope and I had words ready. That never happens for me.",
  "Found cash in a coat pocket the day rent was due. Not a fortune, but exactly enough.",
  "Worship in the car turned my whole commute around. Arrived at work lighter.",
];

function staggeredCreatedAt(index: number, total: number): string {
  // Spread over the last ~90 days, newest = highest index
  const daysAgo = Math.floor(((total - index) / total) * 90);
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(9 + (index % 12), index % 60, 0, 0);
  return d.toISOString();
}

function buildPrayers(includeTestimony: boolean): PrayerRow[] {
  return Array.from({ length: SCALE_COUNT }, (_, i) => {
    const n = i + 1;
    const topic = PRAYER_TOPICS[i % PRAYER_TOPICS.length];
    const answered = n % 10 === 0;
    const privateReq = n % 50 === 0;
    const created = staggeredCreatedAt(n, SCALE_COUNT);

    const row: PrayerRow = {
      id: scalePrayerId(n),
      title: `${SCALE_TAG} Prayer #${n}: ${topic}`,
      body: `${SCALE_TAG} Scale-test request ${n}. Please pray for ${topic}. This record exists to stress-test the prayer wall at volume.`,
      status: answered ? "answered" : "active",
      anonymous_token: SCALE_ANON,
      is_private: privateReq,
      created_at: created,
    };

    if (includeTestimony && answered) {
      row.testimony = `${SCALE_TAG} ${TESTIMONY_SNIPPETS[i % TESTIMONY_SNIPPETS.length]}`;
      row.testimony_at = created;
    }

    return row;
  });
}

function buildMoments() {
  return Array.from({ length: SCALE_COUNT }, (_, i) => {
    const n = i + 1;
    const snippet = MOMENT_SNIPPETS[i % MOMENT_SNIPPETS.length];
    return {
      id: scaleMomentId(n),
      body: `${SCALE_TAG} Moment #${n}: ${snippet} (scale-test testimony for wall perf)`,
      anonymous_token: SCALE_ANON,
      status: "active" as const,
      created_at: staggeredCreatedAt(n, SCALE_COUNT),
    };
  });
}

async function insertBatches(
  label: string,
  table: "prayer_requests" | "god_moments",
  rows: PrayerRow[] | ReturnType<typeof buildMoments>
) {
  const supabase = loadEnv();
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    // ponytail: one upsert helper for two tables; chunk shape matches table at call site
    const { error } = await supabase.from(table).upsert(chunk as never, { onConflict: "id" });
    if (error) throw error;
    process.stdout.write(`\r  ${label}: ${Math.min(i + BATCH, rows.length)} / ${rows.length}`);
  }
  console.log();
}

async function seedScale() {
  console.log(`🌱 Seeding ${SCALE_COUNT} prayers + ${SCALE_COUNT} testimonies (scale test)...\n`);

  const supabase = loadEnv();
  // ponytail: probe once — testimony columns need migration 005
  const { error: probeErr } = await supabase
    .from("prayer_requests")
    .select("testimony")
    .limit(1);
  const includeTestimony = !probeErr;

  const prayers = buildPrayers(includeTestimony);
  const moments = buildMoments();

  if (!includeTestimony) {
    console.log("  (testimony column not found — seeding answered status without testimony text)\n");
  }

  await insertBatches("prayer_requests", "prayer_requests", prayers);
  await insertBatches("god_moments", "god_moments", moments);

  const publicPrayers = prayers.filter((p) => !p.is_private).length;
  const answered = prayers.filter((p) => p.status === "answered").length;

  console.log("\n✅ Scale seed complete!");
  console.log(`   ${SCALE_COUNT} prayer_requests (${publicPrayers} visible on wall, ${answered} answered)`);
  console.log(`   ${SCALE_COUNT} god_moments`);
  console.log("\nRemove anytime:");
  console.log("  npm run unseed:scale");
  console.log("\n⚠️  Walls now paginate (24 per batch, infinite scroll). Re-seed to test at volume.\n");
}

seedScale().catch((err) => {
  console.error("\n❌ Scale seed failed:", err.message ?? err);
  process.exit(1);
});
