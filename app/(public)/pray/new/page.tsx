"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Send, Lock, Globe } from "lucide-react";
import Link from "next/link";
import { getOrCreateAnonToken } from "@/lib/anonymous";
import { PRAYER_BODY_PLACEHOLDER } from "@/lib/prayer/display";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";

const easeOut = [0.23, 1, 0.32, 1] as const;

export default function NewPrayerPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [email, setEmail] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    const trimmedEmail = email.trim();

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email, or leave it blank.");
      setLoading(false);
      return;
    }

    // DB requires body >= 10 chars; when left blank, use a neutral placeholder.
    const effectiveBody =
      trimmedBody.length >= 10
        ? trimmedBody
        : PRAYER_BODY_PLACEHOLDER;

    try {
      const token = getOrCreateAnonToken();
      const res = await fetch("/api/prayers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          body: effectiveBody,
          anonymous_token: token,
          contact_email: trimmedEmail || undefined,
          is_private: isPrivate,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = typeof json.error === "string"
          ? json.error
          : json.error?.fieldErrors
            ? Object.values(json.error.fieldErrors).flat().join(" ")
            : "Something went wrong";
        throw new Error(msg);
      }
      router.push(`/pray/${json.prayer.id}`);
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
          <Link href="/pray" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 mb-6 transition-colors duration-150 press-scale">
            <ArrowLeft size={14} />
            Back to prayer wall
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Heart size={18} className="text-violet-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Share a prayer request</h1>
              <p className="text-sm text-white/40">Our team will pray with you. No account needed.</p>
            </div>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="title" className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                What would you like prayer for?
              </label>
              <input
                id="title"
                type="text"
                required
                minLength={3}
                maxLength={150}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Peace in a difficult season, healing for a family member…"
                className="w-full px-4 py-3 rounded-xl glass border border-white/8 focus:border-violet-500/40 bg-transparent text-white placeholder-white/25 outline-none transition-colors duration-150 text-sm"
              />
            </div>

            <div>
              <label htmlFor="body" className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                Tell us more (optional but helpful)
              </label>
              <textarea
                id="body"
                minLength={10}
                maxLength={3000}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share what's on your heart. You can be as open or private as you need."
                rows={5}
                className="w-full px-4 py-3 rounded-xl glass border border-white/8 focus:border-violet-500/40 bg-transparent text-white placeholder-white/25 outline-none transition-colors duration-150 text-sm resize-none"
              />
            </div>

            {/* Privacy toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl glass border border-white/8">
              <div className="flex items-center gap-2">
                {isPrivate ? <Lock size={15} className="text-amber-300" /> : <Globe size={15} className="text-white/40" />}
                <div>
                  <p className="text-sm font-medium text-white/80">{isPrivate ? "Private request" : "Shared on prayer wall"}</p>
                  <p className="text-xs text-white/40">{isPrivate ? "Only the prayer team sees this" : "Others can see and pray along"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPrivate((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 press-scale ${isPrivate ? "bg-amber-500" : "bg-white/15"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${isPrivate ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>

            {/* Optional email */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                Email for updates <span className="normal-case text-white/25 ml-1"> (optional)</span>
              </label>
              <input
                id="email"
                type="text"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com — so we can update you"
                className="w-full px-4 py-3 rounded-xl glass border border-white/8 focus:border-violet-500/40 bg-transparent text-white placeholder-white/25 outline-none transition-colors duration-150 text-sm"
              />
              <p className="text-xs text-white/25 mt-1">We&apos;ll only use this to share prayer updates. Never shared or sold.</p>
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
                disabled={loading || title.trim().length < 3}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500/80 hover:bg-violet-500 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 press-scale glow-violet"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {loading ? "Submitting…" : "Submit request"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
