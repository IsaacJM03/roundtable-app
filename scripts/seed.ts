/**
 * Insert demo data into Supabase. Safe to re-run (upserts where possible).
 *
 * Usage: npm run seed
 * Cleanup: npm run unseed  (or run scripts/unseed.sql in Supabase SQL editor)
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

async function seed() {
  const supabase = loadEnv();
  console.log("🌱 Seeding Roundtable demo data...\n");

  // ── Posts & replies ──────────────────────────────────────────────────────
  const { error: postsErr } = await supabase.from("posts").upsert(
    [
      {
        id: SEED.posts.faith,
        title: "[SEED] How do I trust God when life feels uncertain?",
        body: "I've been going through a season where nothing seems clear. I want to believe God has a plan, but some days doubt wins. Has anyone else felt this way? How did you hold on?",
        category: "faith",
        anonymous_token: SEED.anonToken,
        status: "active",
        reply_count: 2,
      },
      {
        id: SEED.posts.prayer,
        title: "[SEED] Praying for a friend going through divorce",
        body: "A close friend is separating from their spouse after years of marriage. I don't know what to say or how to support them. Any wisdom from those who've walked alongside someone in this?",
        category: "prayer",
        anonymous_token: SEED.anonToken2,
        status: "active",
        reply_count: 0,
      },
    ],
    { onConflict: "id" }
  );
  if (postsErr) throw postsErr;
  console.log("  ✓ posts (2)");

  const { error: repliesErr } = await supabase.from("replies").upsert(
    [
      {
        id: SEED.replies.faith1,
        post_id: SEED.posts.faith,
        body: "Psalm 46:10 helped me — be still and know. Sometimes trust looks like showing up even when you don't feel it.",
        anonymous_token: SEED.anonToken2,
      },
      {
        id: SEED.replies.faith2,
        post_id: SEED.posts.faith,
        body: "You're not alone. Uncertainty doesn't mean God left — it often means He's teaching us to lean harder.",
        anonymous_token: SEED.anonToken,
      },
    ],
    { onConflict: "id" }
  );
  if (repliesErr) throw repliesErr;
  console.log("  ✓ replies (2)");

  // ── Reactions on posts ───────────────────────────────────────────────────
  await supabase.from("reactions").delete().eq("target_id", SEED.posts.faith);
  const { error: reactionsErr } = await supabase.from("reactions").insert([
    {
      target_type: "post",
      target_id: SEED.posts.faith,
      reaction_type: "praying",
      anon_token: SEED.anonToken,
    },
    {
      target_type: "post",
      target_id: SEED.posts.faith,
      reaction_type: "felt_this",
      anon_token: SEED.anonToken2,
    },
  ]);
  if (reactionsErr) throw reactionsErr;
  console.log("  ✓ reactions (2)");

  // ── Prayer requests ──────────────────────────────────────────────────────
  const { error: prayersErr } = await supabase.from("prayer_requests").upsert(
    [
      {
        id: SEED.prayers.public,
        title: "[SEED] Healing for my mother",
        body: "My mom was diagnosed last month and we're waiting on more tests. Would appreciate prayers for peace and wisdom for the doctors.",
        status: "active",
        anonymous_token: SEED.anonToken,
        is_private: false,
      },
      {
        id: SEED.prayers.private,
        title: "[SEED] Struggling with anxiety (private)",
        body: "I've been having panic attacks at work. Please pray I can find help and not carry this alone.",
        status: "active",
        anonymous_token: SEED.anonToken2,
        is_private: true,
      },
    ],
    { onConflict: "id" }
  );
  if (prayersErr) throw prayersErr;
  console.log("  ✓ prayer_requests (2)");

  await supabase.from("reactions").delete().eq("target_id", SEED.prayers.public);
  const { error: prayerReactErr } = await supabase.from("reactions").insert({
    target_type: "prayer",
    target_id: SEED.prayers.public,
    reaction_type: "praying",
    anon_token: SEED.anonToken2,
  });
  if (prayerReactErr) throw prayerReactErr;
  console.log("  ✓ prayer reactions (1)");

  // ── Counseling sessions ──────────────────────────────────────────────────
  const { error: counselErr } = await supabase.from("counseling_sessions").upsert(
    [
      {
        id: SEED.counseling.pending,
        room_id: "cccccccc-cccc-4ccc-8ccc-cccccccccc99",
        status: "pending",
        anonymous_token: SEED.anonToken,
        intake_note: "[SEED] Feeling overwhelmed at work and home. Would like someone to talk to.",
      },
      {
        id: SEED.counseling.active,
        room_id: "cccccccc-cccc-4ccc-8ccc-cccccccccc98",
        status: "active",
        anonymous_token: SEED.anonToken2,
        intake_note: "[SEED] Grieving a recent loss. Looking for a listening ear.",
      },
    ],
    { onConflict: "id" }
  );
  if (counselErr) throw counselErr;
  console.log("  ✓ counseling_sessions (2)");

  await supabase.from("messages").delete().eq("session_id", SEED.counseling.active);
  const { error: msgErr } = await supabase.from("messages").insert([
    {
      id: SEED.messages.user2,
      session_id: SEED.counseling.active,
      content: "[SEED] Thank you for being here. I don't really know where to start.",
      sender_role: "user",
    },
    {
      id: SEED.messages.counselor2,
      session_id: SEED.counseling.active,
      content: "Take your time. There's no rush — I'm glad you reached out.",
      sender_role: "counselor",
    },
  ]);
  if (msgErr) throw msgErr;
  console.log("  ✓ messages (2)");

  // ── Daily drop (far-future date so it won't clash with real content) ─────
  const { error: dailyErr } = await supabase.from("daily_drops").upsert(
    {
      id: SEED.dailyDrop,
      drop_date: SEED_DAILY_DATE,
      verse_ref: "Philippians 4:6-7",
      verse_text:
        "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
      reflection:
        "[SEED] This verse reminds us that peace isn't the absence of trouble — it's God's presence in the middle of it. Bring what's heavy today; He can hold it.",
      question: "What would it look like to bring one worry to God today?",
    },
    { onConflict: "id" }
  );
  if (dailyErr) throw dailyErr;
  console.log(`  ✓ daily_drops (1) — view at /daily/${SEED_DAILY_DATE}`);

  // ── God moments ────────────────────────────────────────────────────────────
  const { error: momentsErr } = await supabase.from("god_moments").upsert(
    [
      {
        id: SEED.moments.one,
        body: "[SEED] A stranger paid for my groceries when my card declined. Small moment, but I felt seen by God that day.",
        anonymous_token: SEED.anonToken,
        status: "active",
      },
      {
        id: SEED.moments.two,
        body: "[SEED] My toddler prayed for our neighbor without prompting. Reminded me faith can be simple and beautiful.",
        anonymous_token: SEED.anonToken2,
        status: "active",
      },
    ],
    { onConflict: "id" }
  );
  if (momentsErr) throw momentsErr;
  console.log("  ✓ god_moments (2)");

  await supabase.from("moment_reactions").delete().eq("moment_id", SEED.moments.one);
  const { error: momentReactErr } = await supabase.from("moment_reactions").insert({
    moment_id: SEED.moments.one,
    reaction_type: "amen",
    anon_token: SEED.anonToken2,
  });
  if (momentReactErr) throw momentReactErr;
  console.log("  ✓ moment_reactions (1)");

  // ── Honest hours (expires in 7 days) ───────────────────────────────────────
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { error: honestErr } = await supabase.from("honest_hours").upsert(
    [
      {
        id: SEED.honest.one,
        body: "[SEED] Some days I show up to church and feel nothing. I miss when faith felt easy.",
        anonymous_token: SEED.anonToken,
        expires_at: expiresAt,
        reaction_count: 3,
        status: "active",
      },
      {
        id: SEED.honest.two,
        body: "[SEED] I'm tired of pretending I'm fine. Grateful this space exists.",
        anonymous_token: SEED.anonToken2,
        expires_at: expiresAt,
        reaction_count: 1,
        status: "active",
      },
    ],
    { onConflict: "id" }
  );
  if (honestErr) throw honestErr;
  console.log("  ✓ honest_hours (2)");

  console.log("\n✅ Seed complete!");
  console.log("\nTo remove all seed data:");
  console.log("  npm run unseed");
  console.log("  — or run scripts/unseed.sql in the Supabase SQL editor\n");
  console.log("Quick links (local dev):");
  console.log("  /discuss");
  console.log(`  /daily/${SEED_DAILY_DATE}`);
  console.log("  /pray");
  console.log("  /moments");
  console.log("  /honest");
  console.log("  /dashboard (team login required)");
}

seed().catch((err) => {
  console.error("\n❌ Seed failed:", err.message ?? err);
  process.exit(1);
});
