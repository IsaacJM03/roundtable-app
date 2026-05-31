"use client";

import { useEffect, useState, useRef, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Users, Heart, X } from "lucide-react";
import { getAnonToken } from "@/lib/anonymous";
import type { Message, SessionStatus } from "@/lib/types";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";

const easeOut = [0.23, 1, 0.32, 1] as const;

function ChatBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: easeOut }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isOwn
            ? "bg-rose-500/20 border border-rose-500/25 text-rose-100 rounded-br-md"
            : "glass border border-white/12 text-white/85 rounded-bl-md"
        }`}
      >
        {!isOwn && (
          <p className="text-xs text-white/40 mb-1">Peer supporter</p>
        )}
        {message.content}
      </div>
    </motion.div>
  );
}

export default function ChatRoomPage({ params }: { params: Promise<{ room: string }> }) {
  const { room } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<SessionStatus>("pending");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const anonToken = getAnonToken();

  // Poll for new messages every 5 seconds (realtime via polling until Supabase is wired)
  useEffect(() => {
    async function poll() {
      if (!anonToken) return;
      const res = await fetch(`/api/counsel/${room}?token=${anonToken}`);
      if (!res.ok) { setLoading(false); return; }
      const json = await res.json();
      setStatus(json.status);
      setMessages(json.messages ?? []);
      setLoading(false);
    }
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [room, anonToken]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending || status !== "active") return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/counsel/${room}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input, anonymous_token: anonToken }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to send");
      setMessages((prev) => [...prev, json.message]);
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    }
    setSending(false);
  }

  async function closeSession() {
    await fetch(`/api/counsel/${room}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "close", anonymous_token: anonToken }),
    });
    setStatus("closed");
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

      {/* Header */}
      <div className="glass border-b border-white/8 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status === "active" ? "bg-green-400 animate-pulse" : status === "pending" ? "bg-amber-400 animate-pulse" : "bg-white/20"}`} />
          <span className="text-sm font-medium text-white/80">
            {status === "pending" ? "Waiting for a supporter…" : status === "active" ? "Connected" : "Session ended"}
          </span>
        </div>
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {status === "pending" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/15 flex items-center justify-center mx-auto mb-4">
              <Users size={20} className="text-rose-300" />
            </div>
            <p className="text-white/60 text-sm font-medium">Connecting you with a peer supporter…</p>
            <p className="text-white/30 text-xs mt-2">Usually within a few minutes. Hang tight.</p>
            <div className="flex justify-center gap-1 mt-4">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-rose-400"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {messages.length === 0 && status === "active" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <Heart size={20} className="mx-auto mb-2 text-rose-300/60" />
            <p className="text-white/40 text-sm">Your supporter is here. Say hello.</p>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_role === "user"}
            />
          ))}
        </AnimatePresence>

        {status === "closed" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6"
          >
            <p className="text-white/30 text-sm">This session has ended.</p>
            <p className="text-white/20 text-xs mt-1">You are seen. You are loved. — Rom 8:38-39</p>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {status === "active" && (
        <form onSubmit={send} className="glass border-t border-white/8 px-4 py-3 flex gap-2 shrink-0">
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
            {sending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </form>
      )}

      {error && (
        <p className="text-center text-xs text-rose-400 py-2">{error}</p>
      )}
    </div>
  );
}
