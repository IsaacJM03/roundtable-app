"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Plus, Sparkles } from "lucide-react";
import type { PrayerRequest } from "@/lib/types";
import { PrayerStatusBadge } from "@/components/shared/Badge";
import { TimeAgo } from "@/components/shared/TimeAgo";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { ReactionBar } from "@/components/shared/ReactionBar";

const easeOut = [0.23, 1, 0.32, 1] as const;
type Filter = "all" | "answered";

const statusAccent: Record<string, string> = {
  active:  "from-violet-400/50",
  updated: "from-amber-400/50",
  answered:"from-green-400/50",
  closed:  "from-white/12",
};

function PrayerCard({ prayer, index }: { prayer: PrayerRequest; index: number }) {
  const updateCount = prayer.prayer_updates?.length ?? 0;
  const accent = statusAccent[prayer.status] ?? "from-white/12";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: easeOut }}
    >
      <Link
        href={`/pray/${prayer.id}`}
        className="group relative flex flex-col gap-2.5 p-4 sm:p-5 rounded-2xl glass border border-white/8 hover:border-violet-500/18 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-200 press-scale overflow-hidden"
      >
        <span className={`pointer-events-none absolute left-0 top-0 bottom-0 w-[2.5px] rounded-l-2xl bg-gradient-to-b ${accent} to-transparent`} />

        {prayer.status === "answered" && (
          <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/15 text-green-300 border border-green-500/25 flex items-center gap-1">
            <Sparkles size={10} />
            Answered
          </span>
        )}

        <div className="flex items-center justify-between gap-2">
          <PrayerStatusBadge status={prayer.status} />
          <TimeAgo date={prayer.created_at} className="text-[11px] text-white/25" />
        </div>

        <div className="min-w-0">
          <h3 className="font-semibold text-[15px] text-white/90 group-hover:text-white transition-colors duration-150 line-clamp-2 leading-snug">
            {prayer.title}
          </h3>
          {prayer.testimony ? (
            <p className="text-[13px] text-green-300/70 line-clamp-2 leading-relaxed mt-1 italic">
              &ldquo;{prayer.testimony}&rdquo;
            </p>
          ) : prayer.body ? (
            <p className="text-[13px] text-white/40 line-clamp-2 leading-relaxed mt-1">{prayer.body}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
          {updateCount > 0 ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <Heart size={11} className="text-violet-400 fill-violet-400 shrink-0" />
              <span className="text-[11px] text-violet-300/65 truncate">
                {updateCount} {updateCount === 1 ? "update" : "updates"} from the team
              </span>
            </div>
          ) : <div />}
          <ReactionBar targetType="prayer" targetId={prayer.id} />
        </div>
      </Link>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl glass border border-white/8">
      <div className="flex gap-2">
        <div className="shimmer h-5 w-16 rounded-full" />
        <div className="ml-auto shimmer h-4 w-12 rounded" />
      </div>
      <div className="shimmer h-5 w-3/4 rounded" />
      <div className="shimmer h-4 w-full rounded" />
    </div>
  );
}

export default function PrayPage() {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    fetch("/api/prayers")
      .then((r) => r.json())
      .then((d) => { setPrayers(d.prayers ?? []); setLoading(false); });
  }, []);

  const visible =
    filter === "answered" ? prayers.filter((p) => p.status === "answered") : prayers;

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Prayer Wall</h1>
            <p className="text-xs text-white/30 mt-1 tracking-wide uppercase font-medium">
              Shared needs · Real prayer · Community
            </p>
          </div>
          <Link
            href="/pray/new"
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-violet-500/15 border border-violet-500/25 text-violet-300/90 text-sm font-medium hover:bg-violet-500/25 hover:border-violet-500/40 transition-all duration-150 press-scale shrink-0"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Request prayer</span>
            <span className="sm:hidden">Pray</span>
          </Link>
        </motion.div>

        <div className="flex gap-2 mb-6">
          {(["all", "answered"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors press-scale ${
                filter === f
                  ? "bg-violet-500/20 text-violet-200 border border-violet-500/30"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {f === "all" ? "All" : "Answered"}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: easeOut }}
          className="mb-8 flex items-start gap-4 px-1"
        >
          <div className="mt-1 shrink-0 w-px h-9 rounded-full bg-gradient-to-b from-violet-400/40 to-transparent" />
          <p className="text-sm text-white/35 leading-relaxed">
            Our team reads every request and prays for you. Post anonymously — we&apos;ll walk with you as God moves.
          </p>
        </motion.div>

        <div className="flex flex-col gap-3">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : visible.length === 0
              ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
                  <Heart size={32} className="mx-auto mb-3 text-white/20" />
                  <p className="text-white/40 text-sm">
                    {filter === "answered" ? "No answered prayers yet." : "No prayer requests yet."}
                  </p>
                  <Link href="/pray/new" className="mt-3 inline-block text-sm text-violet-300 hover:text-violet-200">
                    Share one →
                  </Link>
                </motion.div>
              )
              : visible.map((p, i) => <PrayerCard key={p.id} prayer={p} index={i} />)
          }
        </div>
      </div>
    </div>
  );
}
