"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Plus } from "lucide-react";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { ReactionBar } from "@/components/shared/ReactionBar";
import PrayerWall, { type PrayerNote } from "@/components/prayer/PrayerWall";
import { PAGE_SIZE, usePaginatedFeed } from "@/lib/usePaginatedFeed";
import type { GodMoment } from "@/lib/types";

const ease = [0.23, 1, 0.32, 1] as const;

export default function MomentsPage() {
  const buildUrl = useCallback(
    (page: number) => `/api/moments?page=${page}&limit=${PAGE_SIZE}`,
    []
  );

  const extract = useCallback(
    (json: Record<string, unknown>) => (json.moments as GodMoment[]) ?? [],
    []
  );

  const { items: moments, loading, loadingMore, hasMore, loadMoreRef } = usePaginatedFeed(
    buildUrl,
    extract
  );

  const notes = useMemo<PrayerNote[]>(
    () => moments.map((m) => ({ id: m.id, text: m.body, author: "Anonymous" })),
    [moments]
  );

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="max-w-6xl mx-auto px-4 py-8">

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Testimony Wall</h1>
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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.07, ease }}
          className="mb-6 flex items-start gap-3 px-1"
        >
          <div className="mt-1 shrink-0 w-px h-9 rounded-full bg-gradient-to-b from-amber-400/35 to-transparent" />
          <p className="text-sm text-white/35 leading-relaxed">
            2-3 sentences about something God did. No names, no comments — just the story.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="shimmer h-32 rounded-[10px]" />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="py-16 text-center">
            <Sparkles size={28} className="mx-auto mb-3 text-white/20" />
            <p className="text-white/40 text-sm">No moments yet.</p>
            <Link href="/moments/new" className="mt-3 inline-block text-sm text-amber-300 hover:text-amber-200">
              Share the first one →
            </Link>
          </div>
        ) : (
          <>
            <PrayerWall
              notes={notes}
              showHeader={false}
              variant="testimony"
              loadingMore={loadingMore}
              loadMoreRef={hasMore ? loadMoreRef : undefined}
              renderActions={(note) => (
                <ReactionBar targetType="moment" targetId={note.id} surface="light" />
              )}
            />
            {!hasMore && notes.length > PAGE_SIZE && (
              <p className="text-center text-xs text-white/25 pb-8">You&apos;ve reached the end</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
