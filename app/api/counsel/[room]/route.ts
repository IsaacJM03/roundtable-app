import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { evaluateSessionRisk } from "@/lib/risk/evaluate";
import { crisisResourceMessage } from "@/lib/counsel/crisisResources";
import type { RiskFlag } from "@/lib/riskDetection";
import { z } from "zod";

const MessageSchema = z.object({
  content: z.string().min(1).max(2000),
  anonymous_token: z.string().uuid().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ room: string }> }) {
  const { room } = await params;
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const anonToken = searchParams.get("token");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = createAdminClient();

  const { data: profile } = user
    ? await admin.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  const isTeam = profile && ["counselor", "admin"].includes(profile.role);

  const { data: session, error } = await admin
    .from("counseling_sessions")
    .select("id, status, anonymous_token, risk_flag")
    .eq("room_id", room)
    .single();

  if (error || !session) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const isOwner = anonToken && session.anonymous_token === anonToken;
  if (!isTeam && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: messages } = await admin
    .from("messages")
    .select("id, content, sender_role, created_at, audio_url, audio_duration_seconds")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true });

  return NextResponse.json({
    status: session.status,
    messages: messages ?? [],
    risk_flag: session.risk_flag ?? "none",
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ room: string }> }) {
  const { room } = await params;
  const body = await req.json();
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: session } = await admin
    .from("counseling_sessions")
    .select("id, status, anonymous_token, counselor_id, first_response_at, risk_flag")
    .eq("room_id", room)
    .single();

  if (!session) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (session.status === "closed") return NextResponse.json({ error: "Room is closed" }, { status: 410 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await admin.from("profiles").select("role, id").eq("id", user.id).single()
    : { data: null };

  const isCounselor = profile && ["counselor", "admin"].includes(profile.role);
  const isOwner = body.anonymous_token && session.anonymous_token === body.anonymous_token;

  if (body.action === "accept" && isCounselor) {
    const now = new Date().toISOString();
    const { data: updated, error } = await admin
      .from("counseling_sessions")
      .update({ status: "active", counselor_id: user!.id, accepted_at: now })
      .eq("id", session.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!updated) return NextResponse.json({ error: "Session already accepted" }, { status: 409 });
    await admin.from("session_events").insert({
      session_id: session.id,
      actor_id: user!.id,
      action: "accepted",
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "escalate" && isCounselor) {
    await admin.from("session_events").insert({
      session_id: session.id,
      actor_id: user!.id,
      action: "escalated",
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "close" && (isCounselor || isOwner)) {
    const { error } = await admin
      .from("counseling_sessions")
      .update({ status: "closed", closed_at: new Date().toISOString() })
      .eq("id", session.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (user) {
      await admin.from("session_events").insert({
        session_id: session.id,
        actor_id: user.id,
        action: "closed",
      });
    }
    return NextResponse.json({ ok: true });
  }

  const parsed = MessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (!isCounselor && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sender_role = isCounselor ? "counselor" : "user";

  const { data: msg, error } = await admin
    .from("messages")
    .insert({
      session_id: session.id,
      content: parsed.data.content,
      sender_role,
    })
    .select("id, content, sender_role, created_at, audio_url, audio_duration_seconds")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (sender_role === "counselor" && !session.first_response_at) {
    await admin
      .from("counseling_sessions")
      .update({ first_response_at: new Date().toISOString() })
      .eq("id", session.id);
    if (user) {
      await admin.from("session_events").insert({
        session_id: session.id,
        actor_id: user.id,
        action: "message_sent",
      });
    }
  }

  if (session.risk_flag === "none") {
    const { data: recent } = await admin
      .from("messages")
      .select("content, sender_role")
      .eq("session_id", session.id)
      .order("created_at", { ascending: true })
      .limit(8);

    const evaluation = await evaluateSessionRisk({
      currentMessage: parsed.data.content,
      currentSenderRole: sender_role,
      recentMessages: recent ?? [],
    });

    if (evaluation.risk !== "none") {
      await admin
        .from("counseling_sessions")
        .update({ risk_flag: evaluation.risk })
        .eq("id", session.id);
      await admin.from("messages").insert({
        session_id: session.id,
        content: crisisResourceMessage(evaluation.risk as RiskFlag),
        sender_role: "system",
      });
    }
  }

  return NextResponse.json({ message: msg }, { status: 201 });
}
