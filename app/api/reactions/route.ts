import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { ReactionCounts } from "@/lib/types";

const ToggleSchema = z.object({
  target_type: z.enum(["post", "prayer"]),
  target_id: z.string().uuid(),
  reaction_type: z.enum(["praying", "amen", "felt_this"]),
  anon_token: z.string().uuid(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const target_type = searchParams.get("target_type") as "post" | "prayer" | null;
  const target_id = searchParams.get("target_id");
  const anon_token = searchParams.get("anon_token");

  if (!target_type || !target_id) {
    return NextResponse.json({ counts: { praying: 0, amen: 0, felt_this: 0 }, mine: [] });
  }

  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("reactions")
    .select("reaction_type, anon_token")
    .eq("target_type", target_type)
    .eq("target_id", target_id);

  const counts: ReactionCounts = { praying: 0, amen: 0, felt_this: 0 };
  const mine: string[] = [];

  for (const row of rows ?? []) {
    const rt = row.reaction_type as keyof ReactionCounts;
    if (rt in counts) counts[rt]++;
    if (anon_token && row.anon_token === anon_token) mine.push(row.reaction_type);
  }

  return NextResponse.json({ counts, mine });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = ToggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { target_type, target_id, reaction_type, anon_token } = parsed.data;
  const supabase = await createClient();

  // Check if already reacted
  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("target_type", target_type)
    .eq("target_id", target_id)
    .eq("reaction_type", reaction_type)
    .eq("anon_token", anon_token)
    .maybeSingle();

  if (existing) {
    await supabase.from("reactions").delete().eq("id", existing.id);
    return NextResponse.json({ action: "removed" });
  }

  await supabase.from("reactions").insert({ target_type, target_id, reaction_type, anon_token });
  return NextResponse.json({ action: "added" }, { status: 201 });
}
