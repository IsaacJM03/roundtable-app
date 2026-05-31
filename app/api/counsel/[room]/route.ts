import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const MessageSchema = z.object({
  content: z.string().min(1).max(2000),
  anonymous_token: z.string().uuid().optional(),
});

const AcceptSchema = z.object({
  action: z.literal("accept"),
});

const CloseSchema = z.object({
  action: z.literal("close"),
  anonymous_token: z.string().uuid().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ room: string }> }) {
  const { room } = await params;
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const anonToken = searchParams.get("token");

  const { data: session, error } = await supabase
    .from("counseling_sessions")
    .select("id, status, anonymous_token")
    .eq("room_id", room)
    .single();

  if (error || !session) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  const isTeam = profile && ["counselor", "admin"].includes(profile.role);
  const isOwner = anonToken && session.anonymous_token === anonToken;

  if (!isTeam && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, sender_role, created_at")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true });

  return NextResponse.json({
    status: session.status,
    messages: messages ?? [],
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ room: string }> }) {
  const { room } = await params;
  const body = await req.json();
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("counseling_sessions")
    .select("id, status, anonymous_token, counselor_id")
    .eq("room_id", room)
    .single();

  if (!session) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (session.status === "closed") return NextResponse.json({ error: "Room is closed" }, { status: 410 });

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role, id").eq("id", user.id).single()
    : { data: null };

  const isCounselor = profile && ["counselor", "admin"].includes(profile.role);
  const isOwner = body.anonymous_token && session.anonymous_token === body.anonymous_token;

  // Handle accept/close actions
  if (body.action === "accept" && isCounselor) {
    const { error } = await supabase
      .from("counseling_sessions")
      .update({ status: "active", counselor_id: user!.id })
      .eq("id", session.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "close" && (isCounselor || isOwner)) {
    const { error } = await supabase
      .from("counseling_sessions")
      .update({ status: "closed", closed_at: new Date().toISOString() })
      .eq("id", session.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Send message
  const parsed = MessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (!isCounselor && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sender_role = isCounselor ? "counselor" : "user";

  const { data: msg, error } = await supabase.from("messages").insert({
    session_id: session.id,
    content: parsed.data.content,
    sender_role,
  }).select("id, content, sender_role, created_at").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: msg }, { status: 201 });
}
