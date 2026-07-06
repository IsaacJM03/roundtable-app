"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Send } from "lucide-react";
import Link from "next/link";
import { getOrCreateAnonToken } from "@/lib/anonymous";
import type { PostCategory } from "@/lib/types";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";

const easeOut = [0.23, 1, 0.32, 1] as const;

const CATEGORIES: { value: PostCategory; label: string; emoji: string }[] = [
  { value: "general", label: "General", emoji: "💬" },
  { value: "faith", label: "Faith", emoji: "✝️" },
  { value: "prayer", label: "Prayer", emoji: "🙏" },
  { value: "life", label: "Life", emoji: "🌱" },
  { value: "bible", label: "Bible", emoji: "📖" },
  { value: "off_topic", label: "Off-topic", emoji: "🗣️" },
  { value: "other", label: "Other", emoji: "💭" },
];

export default function NewDiscussionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<PostCategory>("general");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = getOrCreateAnonToken();
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, category, anonymous_token: token }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      router.push(`/discuss/${json.post.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
        >
          <Link
            href="/discuss"
            className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 mb-6 transition-colors duration-150 press-scale"
          >
            <ArrowLeft size={14} />
            Back to discussions
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Sparkles size={18} className="text-amber-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Ask anything</h1>
              <p className="text-sm text-white/40">No login required. Real people will respond.</p>
            </div>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-5">
            {/* Category picker */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">Topic</label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 press-scale ${
                      category === cat.value
                        ? "bg-amber-500/20 border border-amber-500/40 text-amber-200"
                        : "glass border border-white/8 text-white/50 hover:text-white/80 hover:border-white/20"
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
              {category === "off_topic" && (
                <p className="text-xs text-white/35 mt-2">
                  For non-faith chat — keep it respectful. Politics is not allowed.
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                Your question or topic
              </label>
              <input
                id="title"
                type="text"
                required
                minLength={3}
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full px-4 py-3 rounded-xl glass border border-white/8 focus:border-amber-500/40 bg-transparent text-white placeholder-white/25 outline-none transition-colors duration-150 text-sm"
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs text-white/25">{title.length}/200</span>
              </div>
            </div>

            {/* Body */}
            <div>
              <label htmlFor="body" className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                More context (optional but helpful)
              </label>
              <textarea
                id="body"
                required
                minLength={10}
                maxLength={5000}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share as much or as little as you'd like. You're safe here."
                rows={5}
                className="w-full px-4 py-3 rounded-xl glass border border-white/8 focus:border-amber-500/40 bg-transparent text-white placeholder-white/25 outline-none transition-colors duration-150 text-sm resize-none"
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs text-white/25">{body.length}/5000</span>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5"
              >
                {error}
              </motion.p>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <p className="text-xs text-white/25">Posted anonymously — no account needed.</p>
              <button
                type="submit"
                disabled={loading || title.length < 3 || body.length < 10}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 press-scale glow-amber"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {loading ? "Posting…" : "Post question"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
