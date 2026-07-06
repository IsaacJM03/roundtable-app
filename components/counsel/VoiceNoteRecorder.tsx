"use client";

import { useRef, useState } from "react";
import { Mic, Square, Loader2 } from "lucide-react";

const MAX_SECONDS = 30 * 60; // 30 minutes

export function VoiceNoteRecorder({
  roomId,
  anonymousToken,
  disabled,
  onSent,
}: {
  roomId: string;
  anonymousToken?: string;
  disabled?: boolean;
  onSent: () => void;
}) {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      await upload(blob);
    };
    mediaRef.current = recorder;
    recorder.start();
    setRecording(true);
    timerRef.current = setTimeout(() => stop(), MAX_SECONDS * 1000);
  }

  function stop() {
    if (timerRef.current) clearTimeout(timerRef.current);
    mediaRef.current?.stop();
    setRecording(false);
  }

  async function upload(blob: Blob) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("audio", blob, "voice.webm");
      if (anonymousToken) form.append("anonymous_token", anonymousToken);
      const res = await fetch(`/api/counsel/${roomId}/audio`, { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      onSent();
    } finally {
      setUploading(false);
    }
  }

  if (uploading) {
    return (
      <button type="button" disabled className="p-2.5 rounded-xl glass border border-white/8 text-white/40">
        <Loader2 size={16} className="animate-spin" />
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={recording ? stop : start}
      className={`p-2.5 rounded-xl border transition-all press-scale ${
        recording
          ? "bg-rose-500/30 border-rose-500/40 text-rose-200"
          : "glass border-white/8 text-white/50 hover:text-white/80"
      }`}
      title={recording ? "Stop recording" : "Record voice note (max 90s)"}
    >
      {recording ? <Square size={16} /> : <Mic size={16} />}
    </button>
  );
}
