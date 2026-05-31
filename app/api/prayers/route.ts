import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const PrayerSchema = z.object({
  title: z.string().min(3).max(150),
  body: z.string().min(10).max(3000),
  anonymous_token: z.string().uuid().optional(),
  contact_email: z.string().email().optional().or(z.literal("")),
  is_private: z.boolean().optional().default(false),
});

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  const { data, error } = await supabase
    .from("prayer_requests")
    .select("*, prayer_updates(id, note, created_at, profiles(display_name))")
    .eq("is_private", false)
    .neq("status", "closed")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ prayers: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = PrayerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase.from("prayer_requests").insert({
    title: parsed.data.title,
    body: parsed.data.body,
    anonymous_token: parsed.data.anonymous_token ?? null,
    contact_email: parsed.data.contact_email || null,
    is_private: parsed.data.is_private,
    status: "active",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ prayer: data }, { status: 201 });
}
