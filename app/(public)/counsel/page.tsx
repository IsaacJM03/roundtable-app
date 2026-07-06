"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Shield, Heart, ArrowRight, Send } from "lucide-react";
import { getOrCreateAnonToken } from "@/lib/anonymous";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";

const easeOut = [0.23, 1, 0.32, 1] as const;

const steps = [
  { icon: Shield, text: "Fully anonymous — we never know who you are" },
  { icon: Users, text: "A real person will connect with you" },
  { icon: Heart, text: "No judgment. Just listening and support." },
];

export default function CounselPage() {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);

  async function startSession(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim() || note.trim().length < 5) return;
    setLoading(true);
    setError("");
    try {
      const token = getOrCreateAnonToken();
      const res = await fetch("/api/counsel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anonymous_token: token, intake_note: note }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      sessionStorage.setItem(`rt_counsel_avail_${json.session.room_id}`, String(json.volunteers_available));
      router.push(`/counsel/${json.session.room_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <AnimatedBackground />

      <div className="w-full max-w-lg mx-auto px-4 py-8">
        {!started ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 flex items-center justify-center mx-auto mb-5">
              <Users size={24} className="text-rose-300" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-3">
              You don&apos;t have to go through this alone.
            </h1>
            <p className="text-white/50 leading-relaxed mb-8">
              Whatever you&apos;re facing — depression, anxiety, loneliness, grief — a real person is here
              to listen.
            </p>

            {/* Trust signals */}
            <div className="flex flex-col gap-2 mb-8">
              {steps.map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.2 + i * 0.08, ease: easeOut }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl glass border border-white/8"
                >
                  <Icon size={16} className="text-rose-300 shrink-0" />
                  <span className="text-sm text-white/65">{text}</span>
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => setStarted(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 font-semibold text-sm hover:bg-rose-500/30 transition-all duration-150 press-scale mx-auto glow-rose"
            >
              I want to talk to someone
              <ArrowRight size={15} />
            </button>

            <p className="text-xs text-white/20 mt-5">
              Note: Peer supporters are volunteers, not licensed therapists. For emergencies, call your local crisis line.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            <h2 className="text-xl font-bold text-white mb-2">What&apos;s on your heart?</h2>
            <p className="text-sm text-white/45 mb-6">
              This helps the person who connects with you understand how to support you best.
              You can be as open or vague as you want.
            </p>

            <form onSubmit={startSession} className="flex flex-col gap-4">
              <textarea
                required
                minLength={5}
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. I've been struggling with anxiety and don't know where to turn…"
                rows={5}
                autoFocus
                className="w-full px-4 py-3 rounded-xl glass border border-white/8 focus:border-rose-500/40 bg-transparent text-white placeholder-white/25 outline-none transition-colors duration-150 text-sm resize-none"
              />

              {error && (
                <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStarted(false)}
                  className="text-sm text-white/30 hover:text-white/60 transition-colors duration-150 press-scale"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading || note.trim().length < 5}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/80 hover:bg-rose-500 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 press-scale glow-rose"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  {loading ? "Connecting…" : "Connect me"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
