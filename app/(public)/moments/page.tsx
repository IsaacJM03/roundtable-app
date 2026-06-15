"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Plus } from "lucide-react";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { ReactionBar } from "@/components/shared/ReactionBar";
import { TimeAgo } from "@/components/shared/TimeAgo";
import type { GodMoment } from "@/lib/types";

const ease = [0.23, 1, 0.32, 1] as const;

function MomentCard({ moment, index }: { moment: GodMoment; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease }}
      className="flex flex-col gap-3 p-5 rounded-2xl glass border border-white/8 hover:border-white/14 transition-colors duration-200"
    >
      <p className="text-[15px] text-white/80 leading-relaxed">{moment.body}</p>
      <div className="flex items-center justify-between gap-2 pt-1">
        <TimeAgo date={moment.created_at} className="text-xs text-white/25" />
        <ReactionBar targetType="moment" targetId={moment.id} />
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl glass border border-white/8">
      <div className="shimmer h-4 w-full rounded" />
      <div className="shimmer h-4 w-4/5 rounded" />
      <div className="shimmer h-4 w-2/3 rounded" />
      <div className="flex justify-between pt-1">
        <div className="shimmer h-3 w-14 rounded" />
        <div className="shimmer h-6 w-28 rounded-full" />
      </div>
    </div>
  );
}

export default function MomentsPage() {
  const [moments, setMoments] = useState<GodMoment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/moments")
      .then((r) => r.json())
      .then((d) => { setMoments(d.moments ?? []); setLoading(false); });
  }, []);

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="max-w-2xl mx-auto px-4 py-8">

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">God Moments</h1>
            <p className="text-xs text-white/30 mt-1 tracking-wide uppercase font-medium">
              Real stories · No comments · Just truth
            </p>
          </div>
          <Link
            href="/moments/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-300/90 text-sm font-medium hover:bg-amber-500/25 hover:border-amber-500/40 transition-all duration-150 press-scale"
          >
            <Plus size={14} />
            Share one
          </Link>
        </motion.div>

        {/* Context note */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.07, ease }}
          className="mb-7 flex items-start gap-3 px-1"
        >
          <div className="mt-1 shrink-0 w-px h-9 rounded-full bg-gradient-to-b from-amber-400/35 to-transparent" />
          <p className="text-sm text-white/35 leading-relaxed">
            2-3 sentences about something God did. No names, no comments — just the story.
          </p>
        </motion.div>

        <div className="flex flex-col gap-3">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : moments.length === 0
              ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
                  <Sparkles size={28} className="mx-auto mb-3 text-white/20" />
                  <p className="text-white/40 text-sm">No moments yet.</p>
                  <Link href="/moments/new" className="mt-3 inline-block text-sm text-amber-300 hover:text-amber-200">
                    Share the first one →
                  </Link>
                </motion.div>
              )
              : moments.map((m, i) => <MomentCard key={m.id} moment={m} index={i} />)
          }
        </div>
      </div>
    </div>
  );
}
