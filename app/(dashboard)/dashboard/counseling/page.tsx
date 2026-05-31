"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Users, Clock, CheckCircle } from "lucide-react";
import type { CounselingSession } from "@/lib/types";
import { TimeAgo } from "@/components/shared/TimeAgo";

const easeOut = [0.23, 1, 0.32, 1] as const;

export default function CounselingDashboardPage() {
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/counsel")
      .then((r) => r.json())
      .then((d) => { setSessions(d.sessions ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function accept(roomId: string) {
    await fetch(`/api/counsel/${roomId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    });
    window.open(`/counsel/${roomId}?team=1`, "_blank");
    setSessions((prev) => prev.map((s) => s.room_id === roomId ? { ...s, status: "active" } : s));
  }

  const pending = sessions.filter((s) => s.status === "pending");
  const active = sessions.filter((s) => s.status === "active");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-white/40 hover:text-white/70 transition-colors duration-150 press-scale">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Counseling Queue</h1>
          <p className="text-sm text-white/40">{pending.length} waiting · {active.length} active</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shimmer h-24 rounded-2xl" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-16 text-center glass border border-white/8 rounded-2xl">
          <Users size={32} className="mx-auto mb-3 text-white/20" />
          <p className="text-white/40">No sessions right now. Check back soon.</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock size={13} />
                Waiting for support
              </h2>
              <div className="flex flex-col gap-3">
                {pending.map((session, i) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.05, ease: easeOut }}
                    className="p-4 rounded-2xl glass border border-rose-500/15 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
                      <Users size={18} className="text-rose-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/80 line-clamp-1">
                        {session.intake_note ?? "No intake note provided"}
                      </p>
                      <TimeAgo date={session.created_at} className="text-xs text-white/30 mt-0.5" />
                    </div>
                    <button
                      onClick={() => accept(session.room_id)}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 border border-rose-500/25 text-rose-300 text-xs font-medium hover:bg-rose-500/35 transition-all duration-150 press-scale"
                    >
                      <CheckCircle size={13} />
                      Accept
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {active.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Active sessions
              </h2>
              <div className="flex flex-col gap-3">
                {active.map((session, i) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.05, ease: easeOut }}
                    className="p-4 rounded-2xl glass border border-green-500/15 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                      <Users size={18} className="text-green-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/80 line-clamp-1">
                        {session.intake_note ?? "Active session"}
                      </p>
                      <TimeAgo date={session.created_at} className="text-xs text-white/30 mt-0.5" />
                    </div>
                    <a
                      href={`/counsel/${session.room_id}?team=1`}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 px-3 py-2 rounded-xl glass border border-white/12 text-white/60 text-xs font-medium hover:text-white hover:border-white/25 transition-all duration-150 press-scale"
                    >
                      Open chat
                    </a>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
