import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PRAYER_BODY_PLACEHOLDER } from "@/lib/prayer/display";
import { enforceRateLimit } from "@/lib/rateLimit";
import type { PrayerRequest } from "@/lib/types";
import { z } from "zod";

const PrayerSchema = z.object({
  title: z.string().trim().min(3).max(150),
  body: z.string().trim().min(10).max(3000).optional(),
  anonymous_token: z.string().uuid().optional(),
  contact_email: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v))
    .pipe(z.string().email().optional()),
  is_private: z.boolean().optional().default(false),
});

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "24", 10) || 24));
  const status = searchParams.get("status");
  const offset = (page - 1) * limit;

  let query = supabase
    .from("prayer_requests")
    .select("*, prayer_updates(id, note, created_at, profiles(display_name))")
    .eq("is_private", false)
    .neq("status", "closed")
    .order("created_at", { ascending: false });

  if (status === "answered") query = query.eq("status", "answered");
  else if (status === "ongoing") query = query.in("status", ["active", "updated"]);

  const { data, error } = await query.range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const prayers = (data ?? []) as PrayerRequest[];

  const ids = prayers.map((p) => p.id);
  const counts = new Map<string, number>();
  if (ids.length > 0) {
    const { data: reactions } = await supabase
      .from("reactions")
      .select("target_id")
      .eq("target_type", "prayer")
      .in("target_id", ids);
    for (const r of reactions ?? []) {
      counts.set(r.target_id, (counts.get(r.target_id) ?? 0) + 1);
    }
  }

  const withCounts = prayers.map((p) => ({
    ...p,
    reaction_count: counts.get(p.id) ?? 0,
  }));

  return NextResponse.json({
    prayers: withCounts,
    page,
    limit,
    hasMore: prayers.length === limit,
  });
}

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, "prayers-post");
  if (limited) return limited;

  const body = await req.json();
  const parsed = PrayerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const bodyText =
    parsed.data.body && parsed.data.body.length >= 10
      ? parsed.data.body
      : PRAYER_BODY_PLACEHOLDER;

  const { data, error } = await supabase.from("prayer_requests").insert({
    title: parsed.data.title,
    body: bodyText,
    anonymous_token: parsed.data.anonymous_token ?? null,
    contact_email: parsed.data.contact_email || null,
    is_private: parsed.data.is_private,
    status: "active",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ prayer: data }, { status: 201 });
}
