import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const ReplySchema = z.object({
  post_id: z.string().uuid(),
  body: z.string().min(1).max(3000),
  anonymous_token: z.string().uuid().optional(),
});

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const post_id = searchParams.get("post_id");
  if (!post_id) return NextResponse.json({ error: "post_id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("replies")
    .select("*, profiles(display_name, role)")
    .eq("post_id", post_id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ replies: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = ReplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase.from("replies").insert({
    post_id: parsed.data.post_id,
    body: parsed.data.body,
    anonymous_token: parsed.data.anonymous_token ?? null,
    author_id: user?.id ?? null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reply: data }, { status: 201 });
}
