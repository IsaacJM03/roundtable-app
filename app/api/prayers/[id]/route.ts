import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const TestimonySchema = z.object({
  anonymous_token: z.string().uuid(),
  testimony: z.string().min(20).max(2000),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const parsed = TestimonySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: prayer } = await admin
    .from("prayer_requests")
    .select("id, anonymous_token, testimony")
    .eq("id", id)
    .single();

  if (!prayer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (prayer.anonymous_token !== parsed.data.anonymous_token) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (prayer.testimony) {
    return NextResponse.json({ error: "Testimony already submitted" }, { status: 409 });
  }

  const now = new Date().toISOString();
  const { data, error } = await admin
    .from("prayer_requests")
    .update({
      testimony: parsed.data.testimony,
      testimony_at: now,
      status: "answered",
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ prayer: data });
}
