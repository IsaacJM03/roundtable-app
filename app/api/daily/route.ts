import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDropsThroughDate } from "@/lib/daily/ensureDrop";
import { fetchVerseForDate } from "@/lib/daily/fetchVerse";
import { DEFAULT_QUESTION, DEFAULT_REFLECTION } from "@/lib/daily/passages";
import { todayDateString } from "@/lib/daily/today";
import { z } from "zod";

const DropSchema = z.object({
  drop_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  verse_ref: z.string().min(3).max(50),
  verse_text: z.string().min(10).max(500),
  reflection: z.string().min(20).max(600),
  question: z.string().min(10).max(200),
});

export async function GET() {
  const today = todayDateString();

  try {
    const drops = await getDropsThroughDate(today);
    if (drops.length === 0) {
      return NextResponse.json({ drop: null, recent: [] });
    }
    const [drop, ...recent] = drops;
    return NextResponse.json({ drop, recent });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load daily drop";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Preview verse for a date (dashboard "load verse" button) — does not save. */
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.action === "preview") {
    const dateStr = body.drop_date ?? todayDateString();
    try {
      const verse = await fetchVerseForDate(dateStr);
      return NextResponse.json({
        ...verse,
        reflection: DEFAULT_REFLECTION,
        question: DEFAULT_QUESTION,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verse fetch failed";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["prayer_team", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = DropSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("daily_drops")
    .upsert({ ...parsed.data, author_id: user.id }, { onConflict: "drop_date" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ drop: data }, { status: 201 });
}
