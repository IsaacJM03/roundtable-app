"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Plus, Search, Filter } from "lucide-react";
import type { Post } from "@/lib/types";
import { CategoryBadge } from "@/components/shared/Badge";
import { TimeAgo } from "@/components/shared/TimeAgo";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { ReactionBar } from "@/components/shared/ReactionBar";

const easeOut = [0.23, 1, 0.32, 1] as const;
const CATEGORIES = ["all", "general", "faith", "prayer", "life", "bible", "off_topic", "other"] as const;

const categoryAccent: Record<string, string> = {
  faith:   "from-amber-400/50",
  bible:   "from-amber-400/50",
  prayer:  "from-violet-400/50",
  life:    "from-rose-400/40",
  general: "from-white/18",
  off_topic: "from-slate-400/40",
  other:   "from-white/18",
};

function PostCard({ post, index }: { post: Post; index: number }) {
  const accent = categoryAccent[post.category] ?? "from-white/18";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: easeOut }}
    >
      <Link
        href={`/discuss/${post.id}`}
        className="group relative flex flex-col gap-2.5 p-4 sm:p-5 rounded-2xl glass border border-white/8 hover:border-white/14 hover:shadow-lg hover:shadow-black/20 transition-all duration-200 press-scale overflow-hidden"
      >
        {/* Category accent strip */}
        <span className={`pointer-events-none absolute left-0 top-0 bottom-0 w-[2.5px] rounded-l-2xl bg-gradient-to-b ${accent} to-transparent`} />

        <div className="flex items-center justify-between gap-3">
          <CategoryBadge category={post.category} />
          <TimeAgo date={post.created_at} className="shrink-0 text-[11px] text-white/25" />
        </div>

        <div className="min-w-0">
          <h3 className="font-semibold text-[15px] text-white/90 group-hover:text-white transition-colors duration-150 line-clamp-2 leading-snug">
            {post.title}
          </h3>
          {post.body && (
            <p className="text-[13px] text-white/40 line-clamp-2 leading-relaxed mt-1">{post.body}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
          <div className="flex items-center gap-2 text-[11px] text-white/25 min-w-0">
            <MessageCircle size={11} className="shrink-0" />
            <span className="shrink-0">{post.reply_count} {post.reply_count === 1 ? "reply" : "replies"}</span>
            {post.profiles?.display_name && (
              <>
                <span className="text-white/12 shrink-0">·</span>
                <span className="truncate">{post.profiles.display_name}</span>
              </>
            )}
          </div>
          <ReactionBar targetType="post" targetId={post.id} />
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
      <div className="shimmer h-4 w-2/3 rounded" />
    </div>
  );
}

export default function DiscussPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: "1" });
    if (category !== "all") params.set("category", category);
    const res = await fetch(`/api/posts?${params}`);
    const json = await res.json();
    setPosts(json.posts ?? []);
    setLoading(false);
  }, [category]);

  useEffect(() => { load(); }, [load]);

  const filtered = posts.filter((p) =>
    search ? p.title.toLowerCase().includes(search.toLowerCase()) || p.body.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Discussions</h1>
            <p className="text-xs text-white/30 mt-1 tracking-wide uppercase font-medium">
              Ask anything · Real humans answer
            </p>
          </div>
          <Link
            href="/discuss/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-300/90 text-sm font-medium hover:bg-amber-500/25 hover:border-amber-500/40 transition-all duration-150 press-scale shrink-0"
          >
            <Plus size={14} />
            Ask
          </Link>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06, ease: easeOut }}
          className="relative mb-4"
        >
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            type="text"
            placeholder="Search discussions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl glass border border-white/8 focus:border-white/20 bg-transparent text-white/80 placeholder-white/30 text-sm outline-none transition-colors duration-150"
          />
        </motion.div>

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: easeOut }}
          className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide"
        >
          <Filter size={14} className="text-white/30 shrink-0 mt-1.5" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 press-scale ${
                category === cat
                  ? "bg-white/12 text-white border border-white/20"
                  : "text-white/40 hover:text-white/70 border border-white/8 hover:border-white/15"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Post list */}
        <div className="flex flex-col gap-3">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.length === 0
              ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-16 text-center"
                >
                  <MessageCircle size={32} className="mx-auto mb-3 text-white/20" />
                  <p className="text-white/40 text-sm">No discussions yet.</p>
                  <Link href="/discuss/new" className="mt-3 inline-block text-sm text-amber-300 hover:text-amber-200">
                    Be the first to ask →
                  </Link>
                </motion.div>
              )
              : filtered.map((post, i) => <PostCard key={post.id} post={post} index={i} />)
          }
        </div>
      </div>
    </div>
  );
}
