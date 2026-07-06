import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { countAvailableVolunteers } from "@/lib/counsel/availability";
import { z } from "zod";

const IntakeSchema = z.object({
  anonymous_token: z.string().uuid(),
  intake_note: z.string().min(5).max(500),
});

const AvailabilitySchema = z.object({
  available_for_counseling: z.boolean(),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role, available_for_counseling")
    .eq("id", user.id)
    .single();

  if (!profile || !["counselor", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await admin
    .from("counseling_sessions")
    .select("*")
    .in("status", ["pending", "active"])
    .order("risk_flag", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // ponytail: risk_flag sort — non-none first (self_harm/harm_to_others before none alphabetically works)
  const sessions = (data ?? []).sort((a, b) => {
    const aRisk = a.risk_flag !== "none" ? 0 : 1;
    const bRisk = b.risk_flag !== "none" ? 0 : 1;
    if (aRisk !== bRisk) return aRisk - bRisk;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return NextResponse.json({
    sessions,
    available_for_counseling: profile.available_for_counseling,
  });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = AvailabilitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["counselor", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await admin
    .from("profiles")
    .update({ available_for_counseling: parsed.data.available_for_counseling })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ available_for_counseling: parsed.data.available_for_counseling });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = IntakeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const admin = createAdminClient();
  const volunteersAvailable = (await countAvailableVolunteers(admin)) > 0;

  const { data, error } = await admin
    .from("counseling_sessions")
    .insert({
      anonymous_token: parsed.data.anonymous_token,
      intake_note: parsed.data.intake_note,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ session: data, volunteers_available: volunteersAvailable }, { status: 201 });
}
