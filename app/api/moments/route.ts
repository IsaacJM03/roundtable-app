import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const MomentSchema = z.object({
  body: z.string().min(20).max(500),
  anonymous_token: z.string().uuid().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("god_moments")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ moments: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = MomentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("god_moments")
    .insert({
      body: parsed.data.body,
      anonymous_token: parsed.data.anonymous_token ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ moment: data }, { status: 201 });
}
