import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { ReactionCounts } from "@/lib/types";

const ReactSchema = z.object({
  reaction_type: z.enum(["praying", "amen", "felt_this"]),
  anon_token: z.string().uuid(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const anon_token = searchParams.get("anon_token");

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("moment_reactions")
    .select("reaction_type, anon_token")
    .eq("moment_id", id);

  const counts: ReactionCounts = { praying: 0, amen: 0, felt_this: 0 };
  const mine: string[] = [];

  for (const row of rows ?? []) {
    const rt = row.reaction_type as keyof ReactionCounts;
    if (rt in counts) counts[rt]++;
    if (anon_token && row.anon_token === anon_token) mine.push(row.reaction_type);
  }

  return NextResponse.json({ counts, mine });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const parsed = ReactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { reaction_type, anon_token } = parsed.data;
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("moment_reactions")
    .select("id")
    .eq("moment_id", id)
    .eq("reaction_type", reaction_type)
    .eq("anon_token", anon_token)
    .maybeSingle();

  if (existing) {
    await supabase.from("moment_reactions").delete().eq("id", existing.id);
    return NextResponse.json({ action: "removed" });
  }

  await supabase.from("moment_reactions").insert({ moment_id: id, reaction_type, anon_token });
  return NextResponse.json({ action: "added" }, { status: 201 });
}
