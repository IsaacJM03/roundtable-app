"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Clock, Send } from "lucide-react";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { getOrCreateAnonToken } from "@/lib/anonymous";
import type { HonestHour } from "@/lib/types";

const ease = [0.23, 1, 0.32, 1] as const;
const MAX_BODY = 400;

function useCountdown(expiresAt: string) {
  const getLeft = () => Math.max(0, new Date(expiresAt).getTime() - Date.now());
  const [ms, setMs] = useState(getLeft);

  useEffect(() => {
    const id = setInterval(() => setMs(getLeft()), 60000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt]);

  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}h left`;
  if (mins > 0) return `${mins}m left`;
  return "Expiring…";
}

function HonestCard({ post, index, onReact }: { post: HonestHour; index: number; onReact: (id: string) => void }) {
  const countdown = useCountdown(post.expires_at);
  const isExpiring = new Date(post.expires_at).getTime() - Date.now() < 3 * 3600000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease }}
      className="flex flex-col gap-3 p-5 rounded-2xl glass border border-white/8"
    >
      <p className="text-[15px] text-white/80 leading-relaxed">{post.body}</p>

      {post.team_note && (
        <div className="flex gap-3 pt-1">
          <div className="mt-1 shrink-0 w-px h-auto rounded-full bg-gradient-to-b from-violet-400/40 to-transparent" />
          <p className="text-xs text-violet-200/60 leading-relaxed italic">{post.team_note}</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-1">
        <span className={`flex items-center gap-1 text-[11px] font-medium ${isExpiring ? "text-amber-400/60" : "text-white/20"}`}>
          <Clock size={10} />
          {countdown}
        </span>
        <button
          onClick={() => onReact(post.id)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-white/30 hover:text-rose-300 border border-transparent hover:border-rose-500/20 hover:bg-rose-500/8 transition-all duration-150 press-scale"
        >
          <Flame size={12} />
          <span className="font-medium tabular-nums">{post.reaction_count}</span>
        </button>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl glass border border-white/8">
      <div className="shimmer h-4 w-full rounded" />
      <div className="shimmer h-4 w-3/4 rounded" />
      <div className="flex justify-between pt-1">
        <div className="shimmer h-3 w-16 rounded" />
        <div className="shimmer h-5 w-12 rounded-full" />
      </div>
    </div>
  );
}

export default function HonestPage() {
  const [posts, setPosts] = useState<HonestHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const remaining = MAX_BODY - body.length;

  const load = useCallback(() => {
    fetch("/api/honest")
      .then((r) => r.json())
      .then((d) => { setPosts(d.posts ?? []); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (body.trim().length < 10) { setError("Say a bit more."); return; }
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/honest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: body.trim(), anonymous_token: getOrCreateAnonToken() }),
    });

    if (res.ok) {
      setBody("");
      load();
    } else {
      const d = await res.json();
      setError(d.error?.fieldErrors?.body?.[0] ?? "Something went wrong.");
    }
    setSubmitting(false);
  };

  const react = async (id: string) => {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, reaction_count: p.reaction_count + 1 } : p));
    await fetch(`/api/honest/${id}/react`, { method: "POST" });
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="max-w-2xl mx-auto px-4 py-8">

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-white tracking-tight">Honest Hours</h1>
          <p className="text-xs text-white/30 mt-1 tracking-wide uppercase font-medium">
            Anonymous · Disappears in 24h · Team sees everything
          </p>
        </motion.div>

        {/* Post form — inline at top */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.07, ease }}
          onSubmit={submit}
          className="mb-8 flex flex-col gap-3 p-5 rounded-2xl glass border border-white/8"
        >
          <textarea
            value={body}
            onChange={(e) => { setBody(e.target.value.slice(0, MAX_BODY)); setError(""); }}
            placeholder="Be honest. What's really going on? This disappears in 24 hours and the team will pray for you…"
            rows={3}
            className="w-full bg-transparent text-white/80 placeholder-white/25 text-sm leading-relaxed outline-none resize-none"
          />
          <div className="flex items-center justify-between gap-3">
            {error
              ? <p className="text-xs text-rose-400">{error}</p>
              : <p className="text-[11px] text-white/20">The team sees this and will pray for you.</p>
            }
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[10px] tabular-nums ${remaining < 60 ? "text-amber-400/70" : "text-white/20"}`}>
                {remaining}
              </span>
              <button
                type="submit"
                disabled={submitting || body.trim().length < 10}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/8 border border-white/10 text-white/60 text-xs hover:bg-white/12 hover:text-white/80 transition-all duration-150 press-scale disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={11} />
                {submitting ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        </motion.form>

        {/* Feed */}
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : posts.length === 0
                ? (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="py-14 text-center"
                  >
                    <Flame size={28} className="mx-auto mb-3 text-white/15" />
                    <p className="text-white/35 text-sm">Nothing shared yet today.</p>
                    <p className="text-xs text-white/20 mt-1">Be the first to be honest.</p>
                  </motion.div>
                )
                : posts.map((p, i) => (
                  <HonestCard key={p.id} post={p} index={i} onReact={react} />
                ))
            }
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
