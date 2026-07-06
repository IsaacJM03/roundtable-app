"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Users, Clock, CheckCircle, AlertTriangle, Radio } from "lucide-react";
import type { CounselingSession } from "@/lib/types";
import { TimeAgo } from "@/components/shared/TimeAgo";

const easeOut = [0.23, 1, 0.32, 1] as const;

function waitLabel(session: CounselingSession): string | null {
  if (session.first_response_at) {
    const ms =
      new Date(session.first_response_at).getTime() - new Date(session.created_at).getTime();
    const min = Math.round(ms / 60000);
    return `First response: ${min}m`;
  }
  if (session.accepted_at) {
    return "Accepted, awaiting first message";
  }
  return null;
}

export default function CounselingDashboardPage() {
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetch("/api/counsel")
      .then((r) => r.json())
      .then((d) => {
        setSessions(d.sessions ?? []);
        setAvailable(d.available_for_counseling ?? false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, [load]);

  async function toggleAvailability() {
    const next = !available;
    const res = await fetch("/api/counsel", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available_for_counseling: next }),
    });
    if (res.ok) setAvailable(next);
  }

  async function accept(roomId: string) {
    await fetch(`/api/counsel/${roomId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    });
    window.open(`/counsel/${roomId}?team=1`, "_blank");
    load();
  }

  const pending = sessions.filter((s) => s.status === "pending");
  const active = sessions.filter((s) => s.status === "active");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-white/40 hover:text-white/70 transition-colors duration-150 press-scale">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Counseling Queue</h1>
            <p className="text-sm text-white/40">{pending.length} waiting · {active.length} active</p>
          </div>
        </div>
        <button
          onClick={toggleAvailability}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all press-scale ${
            available
              ? "bg-green-500/15 border-green-500/30 text-green-300"
              : "glass border-white/12 text-white/40"
          }`}
        >
          <Radio size={14} className={available ? "animate-pulse" : ""} />
          {available ? "Available for chats" : "Not available"}
        </button>
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
                    className={`p-4 rounded-2xl glass border flex items-center gap-4 ${
                      session.risk_flag !== "none"
                        ? "border-amber-500/40 bg-amber-500/5"
                        : "border-rose-500/15"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
                      {session.risk_flag !== "none" ? (
                        <AlertTriangle size={18} className="text-amber-300" />
                      ) : (
                        <Users size={18} className="text-rose-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/80 line-clamp-1">
                        {session.intake_note ?? "No intake note provided"}
                      </p>
                      <TimeAgo date={session.created_at} className="text-xs text-white/30 mt-0.5" />
                      {session.risk_flag !== "none" && (
                        <span className="text-[10px] uppercase text-amber-300/80">Priority — {session.risk_flag.replace("_", " ")}</span>
                      )}
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
                      {waitLabel(session) && (
                        <p className="text-[10px] text-white/35 mt-0.5">{waitLabel(session)}</p>
                      )}
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

      <p className="text-xs text-white/20 mt-8 text-center">
        <Link href="/dashboard/counseling/audit" className="hover:text-white/40 underline">
          View session audit log
        </Link>
      </p>
    </div>
  );
}
