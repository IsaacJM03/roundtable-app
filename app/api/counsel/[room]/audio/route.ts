import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB cap for ~90s webm

export async function POST(req: NextRequest, { params }: { params: Promise<{ room: string }> }) {
  const { room } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();

  const form = await req.formData();
  const file = form.get("audio");
  const anonToken = form.get("anonymous_token") as string | null;

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing audio" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Audio too large (max 90s)" }, { status: 400 });
  }

  const { data: session } = await admin
    .from("counseling_sessions")
    .select("id, status, anonymous_token")
    .eq("room_id", room)
    .single();

  if (!session || session.status !== "active") {
    return NextResponse.json({ error: "Session not active" }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await admin.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  const isCounselor = profile && ["counselor", "admin"].includes(profile.role);
  const isOwner = anonToken && session.anonymous_token === anonToken;
  if (!isCounselor && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const path = `${session.id}/${Date.now()}.webm`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from("counsel-audio")
    .upload(path, buffer, { contentType: "audio/webm", upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: signed } = await admin.storage.from("counsel-audio").createSignedUrl(path, 60 * 60 * 24 * 7);

  const sender_role = isCounselor ? "counselor" : "user";
  const { data: msg, error } = await admin
    .from("messages")
    .insert({
      session_id: session.id,
      content: "[Voice note]",
      sender_role,
      audio_url: signed?.signedUrl ?? path,
      audio_duration_seconds: null,
    })
    .select("id, content, sender_role, created_at, audio_url, audio_duration_seconds")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: msg }, { status: 201 });
}
