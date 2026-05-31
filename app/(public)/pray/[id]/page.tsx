"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Clock } from "lucide-react";
import Link from "next/link";
import type { PrayerRequest, PrayerUpdate } from "@/lib/types";
import { PrayerStatusBadge } from "@/components/shared/Badge";
import { TimeAgo } from "@/components/shared/TimeAgo";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";

const easeOut = [0.23, 1, 0.32, 1] as const;

export default function PrayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [prayer, setPrayer] = useState<PrayerRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/prayers`)
      .then((r) => r.json())
      .then((d) => {
        const found = (d.prayers as PrayerRequest[]).find((p) => p.id === id);
        setPrayer(found ?? null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="shimmer h-6 w-32 rounded mb-4" />
        <div className="shimmer h-8 w-3/4 rounded mb-3" />
        <div className="shimmer h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (!prayer) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-white/40">This prayer request could not be found.</p>
        <Link href="/pray" className="mt-4 inline-block text-violet-300 hover:text-violet-200 text-sm">
          ← Back to prayer wall
        </Link>
      </div>
    );
  }

  const updates: PrayerUpdate[] = prayer.prayer_updates ?? [];

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: easeOut }}>
          <Link href="/pray" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 mb-6 transition-colors duration-150 press-scale">
            <ArrowLeft size={14} />
            Back to prayer wall
          </Link>

          {/* Prayer request */}
          <div className="p-5 rounded-2xl glass border border-white/10 mb-6">
            <div className="flex items-center justify-between mb-4">
              <PrayerStatusBadge status={prayer.status} />
              <TimeAgo date={prayer.created_at} className="text-xs text-white/30" />
            </div>
            <h1 className="text-xl font-bold text-white mb-3">{prayer.title}</h1>
            <p className="text-sm text-white/65 leading-relaxed whitespace-pre-wrap">{prayer.body}</p>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/8">
              <Heart size={13} className="text-violet-400" />
              <span className="text-xs text-white/40">
                {updates.length > 0 ? `${updates.length} update${updates.length > 1 ? "s" : ""} from the prayer team` : "Our team is praying for you"}
              </span>
            </div>
          </div>

          {/* Prayer updates timeline */}
          {updates.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Prayer updates</h2>
              <div className="relative flex flex-col gap-4 pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-violet-500/20">
                {updates.map((update, i) => (
                  <motion.div
                    key={update.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.06, ease: easeOut }}
                    className="relative"
                  >
                    <div className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full bg-violet-500/50 border-2 border-violet-400" />
                    <div className="p-3 rounded-xl glass border border-white/8">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-violet-300">
                          {update.profiles?.display_name ?? "Prayer team"}
                        </span>
                        <Clock size={11} className="text-white/25" />
                        <TimeAgo date={update.created_at} className="text-xs text-white/25" />
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed">{update.note}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Encouragement */}
          <div className="p-4 rounded-2xl bg-violet-500/8 border border-violet-500/15 text-center">
            <Heart size={18} className="mx-auto mb-2 text-violet-400" />
            <p className="text-sm text-violet-200/70">
              &ldquo;The prayer of a righteous person is powerful and effective.&rdquo;
            </p>
            <p className="text-xs text-white/25 mt-1">James 5:16</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
