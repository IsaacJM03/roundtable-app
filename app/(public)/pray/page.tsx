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

type Filter = "all" | "ongoing" | "answered";

const TABS: { id: Filter; label: string; shortLabel: string }[] = [
  { id: "all", label: "All", shortLabel: "All" },
  { id: "ongoing", label: "Being prayed for", shortLabel: "Open" },
  { id: "answered", label: "Answered", shortLabel: "Answered" },
];

const EMPTY: Record<Filter, string> = {
  all: "No prayer requests yet.",
  ongoing: "No open requests right now — check back soon.",
  answered: "No answered prayers yet.",
};

const BLURB: Record<Filter, string> = {
  all: "Our team reads every request and prays for you. Post anonymously — we'll walk with you as God moves.",
  ongoing: "These requests are still open — our team is actively praying and may share updates along the way.",
  answered: "Stories of how God moved. Add your own testimony when a request on your heart is answered.",
};

function prayerToNote(p: PrayerRequest): PrayerNote {
  const updateCount = p.prayer_updates?.length ?? 0;
  return {
    id: p.id,
    text: p.title,
    subtext:
      p.status === "answered" && p.testimony
        ? p.testimony
        : updateCount > 0
          ? `${updateCount} team update${updateCount === 1 ? "" : "s"}`
          : undefined,
    badge:
      p.status === "answered"
        ? "Answered"
        : p.status === "updated" || updateCount > 0
          ? "Being prayed for"
          : undefined,
    author: "Anonymous",
    href: `/pray/${p.id}`,
  };
}

export default function PrayPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const buildUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (filter !== "all") params.set("status", filter);
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

  const notes = useMemo(() => prayers.map(prayerToNote), [prayers]);

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

        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors press-scale ${
                filter === tab.id
                  ? "bg-violet-500/20 text-violet-200 border border-violet-500/30"
                  : "text-white/40 hover:text-white/60 border border-transparent"
              }`}
            >
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>
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
          <p className="text-sm text-white/35 leading-relaxed">{BLURB[filter]}</p>
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
            <p className="text-white/40 text-sm">{EMPTY[filter]}</p>
            {filter !== "answered" && (
              <Link href="/pray/new" className="mt-3 inline-block text-sm text-violet-300 hover:text-violet-200">
                Share one →
              </Link>
            )}
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
