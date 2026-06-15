"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { getOrCreateAnonToken } from "@/lib/anonymous";

const ease = [0.23, 1, 0.32, 1] as const;
const MAX = 500;

export default function NewMomentPage() {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const remaining = MAX - body.length;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (body.trim().length < 20) { setError("A little more detail — at least 20 characters."); return; }
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/moments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: body.trim(), anonymous_token: getOrCreateAnonToken() }),
    });

    if (res.ok) {
      router.push("/moments");
    } else {
      const d = await res.json();
      setError(d.error?.fieldErrors?.body?.[0] ?? "Something went wrong.");
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="max-w-xl mx-auto px-4 py-10">

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="flex items-center gap-3 mb-10"
        >
          <Link href="/moments" className="text-white/40 hover:text-white/70 transition-colors duration-150 press-scale">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Share a God Moment</h1>
            <p className="text-xs text-white/30 mt-0.5">Anonymous · 2-3 sentences · No comments</p>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.07, ease }}
          onSubmit={submit}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <textarea
              value={body}
              onChange={(e) => { setBody(e.target.value.slice(0, MAX)); setError(""); }}
              placeholder="Share something God did recently — in your life, in someone else's, or something you noticed…"
              rows={6}
              required
              className="w-full px-4 py-3.5 rounded-2xl glass border border-white/8 focus:border-amber-500/30 bg-transparent text-white/85 placeholder-white/25 text-[15px] leading-relaxed outline-none transition-colors duration-150 resize-none"
            />
            <div className="flex items-center justify-between px-1">
              {error
                ? <p className="text-xs text-rose-400">{error}</p>
                : <p className="text-xs text-white/20">Keep it short. 2-3 sentences is perfect.</p>
              }
              <span className={`text-[11px] font-medium tabular-nums ${remaining < 60 ? "text-amber-400/70" : "text-white/20"}`}>
                {remaining}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/3 border border-white/6 text-xs text-white/30 leading-relaxed">
            Your story is anonymous. No account, no name, no tracking.
            The team may remove anything inappropriate.
          </div>

          <button
            type="submit"
            disabled={submitting || body.trim().length < 20}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium hover:bg-amber-500/30 transition-all duration-150 press-scale disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles size={15} />
            {submitting ? "Sharing…" : "Share this moment"}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
