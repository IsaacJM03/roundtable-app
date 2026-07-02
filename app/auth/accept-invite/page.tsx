"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { UserPlus, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";

const easeOut = [0.23, 1, 0.32, 1] as const;

type InviteCredentials =
  | { mode: "token_hash"; tokenHash: string; type: EmailOtpType }
  | { mode: "code"; code: string }
  | { mode: "none" };

function parseHashError(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const code = params.get("error_code");
  if (code === "otp_expired") {
    return "This invite link has expired or was already used. Ask an admin to send a new invite.";
  }
  const description = params.get("error_description");
  if (description) {
    return decodeURIComponent(description.replace(/\+/g, " "));
  }
  return null;
}

function resolveInviteCredentials(searchParams: URLSearchParams): InviteCredentials {
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  if (tokenHash && type) {
    return { mode: "token_hash", tokenHash, type };
  }

  const code = searchParams.get("code");
  if (code) {
    return { mode: "code", code };
  }

  // Prefetch-safe pattern: email links here with the real verify URL embedded
  const confirmationUrl = searchParams.get("confirmation_url");
  if (confirmationUrl) {
    try {
      const url = new URL(confirmationUrl);
      const token = url.searchParams.get("token");
      const confirmType = url.searchParams.get("type") as EmailOtpType | null;
      if (token && confirmType) {
        return { mode: "token_hash", tokenHash: token, type: confirmType };
      }
    } catch {
      // invalid confirmation_url
    }
  }

  return { mode: "none" };
}

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const credentials = resolveInviteCredentials(searchParams);

  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hashError = parseHashError();
  const canAccept =
    credentials.mode !== "none" || hasSession;

  useEffect(() => {
    const hashErr = parseHashError();
    if (hashErr) {
      setError(hashErr);
      setChecking(false);
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setHasSession(true);
      }
      setChecking(false);
    });
  }, []);

  async function acceptInvite() {
    setLoading(true);
    setError("");

    const supabase = createClient();

    if (hasSession) {
      router.push("/auth/set-password");
      router.refresh();
      return;
    }

    if (credentials.mode === "token_hash") {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        type: credentials.type,
        token_hash: credentials.tokenHash,
      });
      if (verifyError) {
        setError(formatAuthError(verifyError.message));
        setLoading(false);
        return;
      }
    } else if (credentials.mode === "code") {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
        credentials.code
      );
      if (exchangeError) {
        setError(formatAuthError(exchangeError.message));
        setLoading(false);
        return;
      }
    } else {
      setError("This invite link is incomplete or invalid. Ask an admin to send a new invite.");
      setLoading(false);
      return;
    }

    router.push("/auth/set-password");
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
          <UserPlus size={18} className="text-amber-300" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">You&apos;re invited</h1>
          <p className="text-xs text-white/40">Join the Roundtable team dashboard</p>
        </div>
      </div>

      {checking ? (
        <div className="flex items-center gap-2 text-sm text-white/40">
          <Loader2 size={15} className="animate-spin" /> Loading invite…
        </div>
      ) : !canAccept ? (
        <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 leading-relaxed">
          {error ||
            "This invite link is incomplete or invalid. Ask an admin to send a new invite."}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-white/50 leading-relaxed">
            {hasSession
              ? "Your invitation was accepted. Continue to set your password."
              : "You've been invited to join the team. Click below to accept your invitation and set your password."}
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 leading-relaxed"
            >
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <button
            type="button"
            onClick={acceptInvite}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold disabled:opacity-50 transition-all duration-150 press-scale"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
            {loading ? "Accepting…" : "Accept invitation & set password"}
          </button>
        </div>
      )}
    </motion.div>
  );
}

function formatAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("expired") || lower.includes("invalid")) {
    return "This invite link has expired or was already used. Ask an admin to send a new invite.";
  }
  return message;
}

export default function AcceptInvitePage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <AnimatedBackground />
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-sm text-white/40">
            <Loader2 size={15} className="animate-spin" /> Loading invite…
          </div>
        }
      >
        <AcceptInviteForm />
      </Suspense>
    </div>
  );
}
