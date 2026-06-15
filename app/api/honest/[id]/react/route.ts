import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Simple increment — no per-user tracking for honest hours reactions
  const { data: current } = await supabase
    .from("honest_hours")
    .select("reaction_count")
    .eq("id", id)
    .single();

  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await supabase
    .from("honest_hours")
    .update({ reaction_count: current.reaction_count + 1 })
    .eq("id", id);

  return NextResponse.json({ reaction_count: current.reaction_count + 1 });
}
