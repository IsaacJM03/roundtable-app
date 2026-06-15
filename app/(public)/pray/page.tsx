"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Plus } from "lucide-react";
import type { PrayerRequest } from "@/lib/types";
import { PrayerStatusBadge } from "@/components/shared/Badge";
import { TimeAgo } from "@/components/shared/TimeAgo";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { ReactionBar } from "@/components/shared/ReactionBar";

const easeOut = [0.23, 1, 0.32, 1] as const;

function PrayerCard({ prayer, index }: { prayer: PrayerRequest; index: number }) {
  const updateCount = prayer.prayer_updates?.length ?? 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: easeOut }}
    >
      <Link
        href={`/pray/${prayer.id}`}
        className="group flex flex-col gap-2 p-4 rounded-2xl glass border border-white/8 hover:border-violet-500/20 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-200 press-scale"
      >
        <div className="flex items-center justify-between gap-2">
          <PrayerStatusBadge status={prayer.status} />
          <TimeAgo date={prayer.created_at} className="text-xs text-white/30" />
        </div>

        <h3 className="font-semibold text-white/90 group-hover:text-white transition-colors duration-150 line-clamp-2">
          {prayer.title}
        </h3>
        <p className="text-sm text-white/45 line-clamp-2 leading-relaxed">{prayer.body}</p>

        <div className="flex items-center justify-between gap-2 pt-1">
          {updateCount > 0 ? (
            <div className="flex items-center gap-1.5">
              <Heart size={11} className="text-violet-400 fill-violet-400" />
              <span className="text-xs text-violet-300/70">
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

  useEffect(() => {
    fetch("/api/prayers")
      .then((r) => r.json())
      .then((d) => { setPrayers(d.prayers ?? []); setLoading(false); });
  }, []);

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
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-500/15 border border-violet-500/25 text-violet-300/90 text-sm font-medium hover:bg-violet-500/25 hover:border-violet-500/40 transition-all duration-150 press-scale"
          >
            <Plus size={14} />
            Request prayer
          </Link>
        </motion.div>

        {/* Pull-quote — not an alert */}
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
            : prayers.length === 0
              ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
                  <Heart size={32} className="mx-auto mb-3 text-white/20" />
                  <p className="text-white/40 text-sm">No prayer requests yet.</p>
                  <Link href="/pray/new" className="mt-3 inline-block text-sm text-violet-300 hover:text-violet-200">
                    Share one →
                  </Link>
                </motion.div>
              )
              : prayers.map((p, i) => <PrayerCard key={p.id} prayer={p} index={i} />)
          }
        </div>
      </div>
    </div>
  );
}
