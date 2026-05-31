import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const PostSchema = z.object({
  title: z.string().min(3).max(200),
  body: z.string().min(10).max(5000),
  category: z.enum(["general", "faith", "prayer", "life", "bible", "other"]),
  anonymous_token: z.string().uuid().optional(),
});

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("posts")
    .select("*, profiles(display_name, role)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  type PostCategory = "general" | "faith" | "prayer" | "life" | "bible" | "other";
  const validCategories: PostCategory[] = ["general", "faith", "prayer", "life", "bible", "other"];
  if (category && category !== "all" && validCategories.includes(category as PostCategory)) {
    query = query.eq("category", category as PostCategory);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ posts: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase.from("posts").insert({
    title: parsed.data.title,
    body: parsed.data.body,
    category: parsed.data.category,
    anonymous_token: parsed.data.anonymous_token ?? null,
    author_id: user?.id ?? null,
    status: "active",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data }, { status: 201 });
}
