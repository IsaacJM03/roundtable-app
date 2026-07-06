"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Plus } from "lucide-react";
import type { PrayerRequest } from "@/lib/types";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { ReactionBar } from "@/components/shared/ReactionBar";
import PrayerWall, { type PrayerNote } from "@/components/prayer/PrayerWall";
import { PAGE_SIZE, usePaginatedFeed } from "@/lib/usePaginatedFeed";

const easeOut = [0.23, 1, 0.32, 1] as const;
type Filter = "all" | "answered";

export default function PrayPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const buildUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (filter === "answered") params.set("status", "answered");
      return `/api/prayers?${params}`;
    },
    [filter]
  );

  const extract = useCallback(
    (json: Record<string, unknown>) => (json.prayers as PrayerRequest[]) ?? [],
    []
  );

  const { items: prayers, loading, loadingMore, hasMore, loadMoreRef } = usePaginatedFeed(
    buildUrl,
    extract,
    [filter]
  );

  const notes = useMemo<PrayerNote[]>(
    () =>
      prayers.map((p) => ({
        id: p.id,
        text: p.status === "answered" && p.testimony ? p.testimony : p.title,
        author: "Anonymous",
        href: `/pray/${p.id}`,
      })),
    [prayers]
  );

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="max-w-6xl mx-auto px-4 py-8">
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
          className="mb-6 flex items-start gap-4 px-1"
        >
          <div className="mt-1 shrink-0 w-px h-9 rounded-full bg-gradient-to-b from-violet-400/40 to-transparent" />
          <p className="text-sm text-white/35 leading-relaxed">
            Our team reads every request and prays for you. Post anonymously — we&apos;ll walk with you as God moves.
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
            <Heart size={32} className="mx-auto mb-3 text-white/20" />
            <p className="text-white/40 text-sm">
              {filter === "answered" ? "No answered prayers yet." : "No prayer requests yet."}
            </p>
            <Link href="/pray/new" className="mt-3 inline-block text-sm text-violet-300 hover:text-violet-200">
              Share one →
            </Link>
          </div>
        ) : (
          <>
            <PrayerWall
              notes={notes}
              showHeader={false}
              loadingMore={loadingMore}
              loadMoreRef={hasMore ? loadMoreRef : undefined}
              renderActions={(note) => (
                <ReactionBar targetType="prayer" targetId={note.id} surface="light" />
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
