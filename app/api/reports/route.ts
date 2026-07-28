import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enforceRateLimit } from "@/lib/rateLimit";
import { z } from "zod";

const REPORT_REASONS = ["spam", "harassment", "off_topic", "other"] as const;

const ReportSchema = z
  .object({
    post_id: z.string().uuid(),
    reporter_token: z.string().uuid(),
    reason: z.union([z.enum(REPORT_REASONS), z.string().min(3).max(500)]),
    note: z.string().max(400).optional(),
  })
  .transform(({ post_id, reporter_token, reason, note }) => {
    const text =
      (REPORT_REASONS as readonly string[]).includes(reason) && note?.trim()
        ? `${reason}: ${note.trim()}`
        : String(reason);
    return { post_id, reporter_token, reason: text };
  });

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, "reports-post");
  if (limited) return limited;

  const body = await req.json();
  const parsed = ReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from("post_reports").insert(parsed.data).select("id").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await admin
    .from("post_reports")
    .select("*, posts(title)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reports: data ?? [] });
}
