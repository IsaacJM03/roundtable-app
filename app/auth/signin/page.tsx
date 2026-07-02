"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";

const easeOut = [0.23, 1, 0.32, 1] as const;

function parseHashError(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const code = params.get("error_code");
  const description = params.get("error_description");
  if (code === "otp_expired") {
    return "Your invite link expired or was already used.";
  }
  if (description) {
    return decodeURIComponent(description.replace(/\+/g, " "));
  }
  return null;
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const queryError = searchParams.get("error");
  const [hashError, setHashError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inviteFailed = queryError === "auth_failed" || !!hashError;

  useEffect(() => {
    setHashError(parseHashError());
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    router.push(redirect);
    router.refresh();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
      className="w-full max-w-sm"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Lock size={18} className="text-amber-300" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Team sign in</h1>
          <p className="text-xs text-white/40">For prayer team, counselors & admins</p>
        </div>
      </div>

      {inviteFailed && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-4 leading-relaxed"
        >
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <span>
            {hashError ??
              "Your invite link expired or was already used. Ask an admin to send a new invite — you don't have a password yet, so signing in won't work until you accept a fresh invite."}
          </span>
        </motion.div>
      )}

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">Email</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@roundtable.com"
              className="w-full pl-9 pr-4 py-3 rounded-xl glass border border-white/8 focus:border-amber-500/40 bg-transparent text-white placeholder-white/25 outline-none text-sm transition-colors duration-150"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl glass border border-white/8 focus:border-amber-500/40 bg-transparent text-white placeholder-white/25 outline-none text-sm transition-colors duration-150"
          />
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

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold disabled:opacity-50 transition-all duration-150 press-scale"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-xs text-white/20 text-center mt-6">
        Public visitors don&apos;t need to sign in. <br />
        Accounts are created by admins only.
      </p>
    </motion.div>
  );
}

export default function SignInPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <AnimatedBackground />
      <Suspense>
        <SignInForm />
      </Suspense>
    </div>
  );
}
