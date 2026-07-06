"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Send, User, Flag } from "lucide-react";
import Link from "next/link";
import type { Post, Reply } from "@/lib/types";
import { CategoryBadge } from "@/components/shared/Badge";
import { TimeAgo } from "@/components/shared/TimeAgo";
import { getOrCreateAnonToken } from "@/lib/anonymous";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";

const easeOut = [0.23, 1, 0.32, 1] as const;

function ReplyCard({ reply, index }: { reply: Reply; index: number }) {
  const isMember = reply.profiles?.role && reply.profiles.role !== "member";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: easeOut }}
      className="flex gap-3"
    >
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${isMember ? "bg-amber-500/20 text-amber-300" : "bg-white/8 text-white/30"}`}>
        {reply.profiles?.display_name?.[0]?.toUpperCase() ?? <User size={14} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-white/70">
            {reply.profiles?.display_name ?? "Anonymous"}
          </span>
          {isMember && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-medium border border-amber-500/20 capitalize">
              {reply.profiles!.role!.replace("_", " ")}
            </span>
          )}
          <TimeAgo date={reply.created_at} className="text-xs text-white/25 ml-auto" />
        </div>
        <div className="px-3 py-2.5 rounded-xl glass border border-white/8 text-sm text-white/75 leading-relaxed whitespace-pre-wrap">
          {reply.body}
        </div>
      </div>
    </motion.div>
  );
}

export default function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [reporting, setReporting] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  async function reportPost() {
    const reason = window.prompt("Why are you reporting this post? (required)");
    if (!reason || reason.trim().length < 3) return;
    setReporting(true);
    try {
      const token = getOrCreateAnonToken();
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: id, reporter_token: token, reason: reason.trim() }),
      });
      if (!res.ok) throw new Error("Report failed");
      setReportDone(true);
    } catch {
      setError("Could not submit report. Try again.");
    }
    setReporting(false);
  }

  useEffect(() => {
    async function load() {
      const [postRes, repliesRes] = await Promise.all([
        fetch(`/api/posts?page=1`).then((r) => r.json()),
        fetch(`/api/replies?post_id=${id}`).then((r) => r.json()),
      ]);
      const found = (postRes.posts as Post[]).find((p) => p.id === id);
      setPost(found ?? null);
      setReplies(repliesRes.replies ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const token = getOrCreateAnonToken();
      const res = await fetch("/api/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: id, body: replyBody, anonymous_token: token }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setReplies((prev) => [...prev, json.reply]);
      setReplyBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="shimmer h-6 w-32 rounded mb-4" />
        <div className="shimmer h-8 w-3/4 rounded mb-3" />
        <div className="shimmer h-24 w-full rounded-xl mb-6" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="shimmer h-16 w-full rounded-xl mb-3" />
        ))}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-white/40">This discussion could not be found.</p>
        <Link href="/discuss" className="mt-4 inline-block text-amber-300 hover:text-amber-200 text-sm">
          ← Back to discussions
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: easeOut }}>
          <Link href="/discuss" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 mb-6 transition-colors duration-150 press-scale">
            <ArrowLeft size={14} />
            Back to discussions
          </Link>

          {/* Post */}
          <div className="p-5 rounded-2xl glass border border-white/10 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <CategoryBadge category={post.category} />
              <TimeAgo date={post.created_at} className="text-xs text-white/30 ml-auto" />
              <button
                type="button"
                onClick={reportPost}
                disabled={reporting || reportDone}
                className="text-xs text-white/25 hover:text-rose-300 flex items-center gap-1 press-scale disabled:opacity-40"
              >
                <Flag size={12} />
                {reportDone ? "Reported" : "Report"}
              </button>
            </div>
            <h1 className="text-xl font-bold text-white mb-3">{post.title}</h1>
            <p className="text-sm text-white/65 leading-relaxed whitespace-pre-wrap">{post.body}</p>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/8">
              <MessageCircle size={13} className="text-white/30" />
              <span className="text-xs text-white/30">{post.reply_count} {post.reply_count === 1 ? "reply" : "replies"}</span>
              <span className="text-xs text-white/20 ml-auto">
                {post.profiles?.display_name ?? "Anonymous"}
              </span>
            </div>
          </div>

          {/* Replies */}
          <div className="flex flex-col gap-4 mb-8">
            {replies.length === 0 ? (
              <div className="py-8 text-center">
                <MessageCircle size={24} className="mx-auto mb-2 text-white/20" />
                <p className="text-sm text-white/35">No replies yet — be the first to respond.</p>
              </div>
            ) : (
              replies.map((reply, i) => <ReplyCard key={reply.id} reply={reply} index={i} />)
            )}
          </div>

          {/* Reply form */}
          <form onSubmit={submitReply} className="flex flex-col gap-3">
            <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Your response</label>
            <textarea
              required
              minLength={1}
              maxLength={3000}
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Share your thoughts, experience, or encouragement…"
              rows={4}
              className="w-full px-4 py-3 rounded-xl glass border border-white/8 focus:border-violet-500/40 bg-transparent text-white placeholder-white/25 outline-none transition-colors duration-150 text-sm resize-none"
            />

            {error && (
              <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-white/25">Replies are anonymous by default.</p>
              <button
                type="submit"
                disabled={submitting || replyBody.trim().length < 1}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm font-medium hover:bg-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 press-scale"
              >
                {submitting ? (
                  <span className="w-3.5 h-3.5 border-2 border-violet-300/30 border-t-violet-300 rounded-full animate-spin" />
                ) : (
                  <Send size={13} />
                )}
                {submitting ? "Sending…" : "Reply"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
