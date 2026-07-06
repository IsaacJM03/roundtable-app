"use client";

import { useEffect, useState, useRef, use, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Users, Heart, X, AlertTriangle, PhoneForwarded } from "lucide-react";
import { getAnonToken } from "@/lib/anonymous";
import type { Message, SessionStatus, RiskFlag } from "@/lib/types";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { SystemMessage } from "@/components/counsel/SystemMessage";
import { VoiceNoteRecorder } from "@/components/counsel/VoiceNoteRecorder";
import { CounselDisclaimer } from "@/components/counsel/CounselDisclaimer";

const easeOut = [0.23, 1, 0.32, 1] as const;
const DISCLAIMER_KEY = "rt_counsel_disclaimer_seen";

function volunteersAvailableForRoom(roomId: string): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(`rt_counsel_avail_${roomId}`) === "true";
}

function ChatBubble({
  message,
  isOwn,
  isTeam,
}: {
  message: Message;
  isOwn: boolean;
  isTeam: boolean;
}) {
  if (message.sender_role === "system") {
    return <SystemMessage>{message.content}</SystemMessage>;
  }

  const own =
    isTeam ? message.sender_role === "counselor" : message.sender_role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: easeOut }}
      className={`flex ${own ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          own
            ? "bg-rose-500/20 border border-rose-500/25 text-rose-100 rounded-br-md"
            : "glass border border-white/12 text-white/85 rounded-bl-md"
        }`}
      >
        {!own && (
          <p className="text-xs text-white/40 mb-1">
            {message.sender_role === "counselor" ? "Peer supporter" : "You"}
          </p>
        )}
        {message.audio_url ? (
          <audio controls src={message.audio_url} className="w-full max-w-xs" />
        ) : (
          message.content
        )}
      </div>
    </motion.div>
  );
}

export default function ChatRoomPage({ params }: { params: Promise<{ room: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 size={24} className="text-white/30 animate-spin" />
        </div>
      }
    >
      <ChatRoomInner params={params} />
    </Suspense>
  );
}

function ChatRoomInner({ params }: { params: Promise<{ room: string }> }) {
  const { room } = use(params);
  const searchParams = useSearchParams();
  const isTeam = searchParams.get("team") === "1";

  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<SessionStatus>("pending");
  const [riskFlag, setRiskFlag] = useState<RiskFlag>("none");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [volunteersAvailable, setVolunteersAvailable] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const anonToken = getAnonToken();

  const poll = useCallback(async () => {
    const tokenParam = isTeam ? "" : `?token=${anonToken}`;
    const res = await fetch(`/api/counsel/${room}${tokenParam}`);
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const json = await res.json();
    setStatus(json.status);
    setMessages(json.messages ?? []);
    setRiskFlag(json.risk_flag ?? "none");
    setLoading(false);
  }, [room, anonToken, isTeam]);

  useEffect(() => {
    setVolunteersAvailable(volunteersAvailableForRoom(room));
    if (!isTeam && typeof window !== "undefined" && !localStorage.getItem(DISCLAIMER_KEY)) {
      setShowDisclaimer(true);
    }
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [poll, room, isTeam]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending || status !== "active") return;
    setSending(true);
    setError("");
    try {
      const body: Record<string, string> = { content: input };
      if (!isTeam && anonToken) body.anonymous_token = anonToken;
      const res = await fetch(`/api/counsel/${room}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to send");
      setMessages((prev) => [...prev, json.message]);
      setInput("");
      poll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    }
    setSending(false);
  }

  async function closeSession() {
    const body: Record<string, string> = { action: "close" };
    if (!isTeam && anonToken) body.anonymous_token = anonToken;
    await fetch(`/api/counsel/${room}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setStatus("closed");
  }

  async function escalate() {
    await fetch(`/api/counsel/${room}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "escalate" }),
    });
  }

  function dismissDisclaimer() {
    localStorage.setItem(DISCLAIMER_KEY, "1");
    setShowDisclaimer(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={24} className="text-white/30 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col" style={{ height: "calc(100vh - 3.5rem)" }}>
      <AnimatedBackground />
      {showDisclaimer && <CounselDisclaimer onDismiss={dismissDisclaimer} modal />}

      <div className="glass border-b border-white/8 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              status === "active"
                ? "bg-green-400 animate-pulse"
                : status === "pending"
                  ? "bg-amber-400 animate-pulse"
                  : "bg-white/20"
            }`}
          />
          <span className="text-sm font-medium text-white/80">
            {status === "pending"
              ? "Waiting for a supporter…"
              : status === "active"
                ? "Connected"
                : "Session ended"}
          </span>
          {riskFlag !== "none" && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Priority
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isTeam && status === "active" && (
            <button
              onClick={escalate}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-amber-300 hover:bg-amber-500/10 transition-colors press-scale"
            >
              <PhoneForwarded size={13} />
              Escalate
            </button>
          )}
          {status !== "closed" && (
            <button
              onClick={closeSession}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-white/30 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-150 press-scale"
            >
              <X size={13} />
              End session
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {status === "pending" && (
          <SystemMessage>
            {volunteersAvailable
              ? "A volunteer is online. They'll join when they're ready."
              : "No volunteers are online right now. You've been added to the queue — check back or try again later."}
          </SystemMessage>
        )}

        {riskFlag !== "none" && status !== "closed" && (
          <div className="flex items-start gap-2 text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>This session has been flagged for priority support.</span>
          </div>
        )}

        {messages.length === 0 && status === "active" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
            <Heart size={20} className="mx-auto mb-2 text-rose-300/60" />
            <p className="text-white/40 text-sm">Your supporter is here. Say hello.</p>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} isOwn={msg.sender_role === "user"} isTeam={isTeam} />
          ))}
        </AnimatePresence>

        {status === "closed" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
            <p className="text-white/30 text-sm">This session has ended.</p>
            <p className="text-white/20 text-xs mt-1">You are seen. You are loved. — Rom 8:38-39</p>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {status === "active" && (
        <>
          <CounselDisclaimer onDismiss={() => {}} banner />
          <form onSubmit={send} className="glass border-t border-white/8 px-4 py-3 flex gap-2 shrink-0 items-end">
            <VoiceNoteRecorder
              roomId={room}
              anonymousToken={isTeam ? undefined : anonToken ?? undefined}
              disabled={sending}
              onSent={() => poll()}
            />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              disabled={sending}
              className="flex-1 px-4 py-2.5 rounded-xl glass border border-white/8 focus:border-rose-500/30 bg-transparent text-white placeholder-white/25 outline-none text-sm transition-colors duration-150"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/25 text-rose-300 hover:bg-rose-500/35 disabled:opacity-40 transition-all duration-150 press-scale"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
        </>
      )}

      {error && <p className="text-center text-xs text-rose-400 py-2">{error}</p>}
    </div>
  );
}
