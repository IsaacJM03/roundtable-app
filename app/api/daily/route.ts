import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const DropSchema = z.object({
  drop_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  verse_ref: z.string().min(3).max(50),
  verse_text: z.string().min(10).max(500),
  reflection: z.string().min(20).max(600),
  question: z.string().min(10).max(200),
});

export async function GET() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Try today's drop, fall back to most recent past drop
  const { data: drops } = await supabase
    .from("daily_drops")
    .select("*")
    .lte("drop_date", today)
    .order("drop_date", { ascending: false })
    .limit(8);

  if (!drops || drops.length === 0) {
    return NextResponse.json({ drop: null, recent: [] });
  }

  const [drop, ...recent] = drops;
  return NextResponse.json({ drop, recent });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["prayer_team", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
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
