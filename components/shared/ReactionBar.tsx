"use client";

import { useState, useEffect, useCallback } from "react";
import { getOrCreateAnonToken } from "@/lib/anonymous";
import type { ReactionCounts, ReactionType } from "@/lib/types";

interface ReactionBarProps {
  targetType: "post" | "prayer" | "moment";
  targetId: string;
  /** For moments: pass pre-loaded counts from the page to avoid extra fetch */
  initialCounts?: ReactionCounts;
  initialMine?: ReactionType[];
}

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "praying",   emoji: "🙏", label: "Praying" },
  { type: "felt_this", emoji: "💜", label: "Felt this" },
  { type: "amen",      emoji: "✝️",  label: "Amen" },
];

export function ReactionBar({
  targetType,
  targetId,
  initialCounts,
  initialMine,
}: ReactionBarProps) {
  const [counts, setCounts] = useState<ReactionCounts>(
    initialCounts ?? { praying: 0, amen: 0, felt_this: 0 }
  );
  const [mine, setMine] = useState<Set<ReactionType>>(new Set(initialMine ?? []));
  const [ready, setReady] = useState(!!initialCounts);

  const load = useCallback(async () => {
    const token = getOrCreateAnonToken();
    const apiPath = targetType === "moment"
      ? `/api/moments/${targetId}/react?anon_token=${token}`
      : `/api/reactions?target_type=${targetType === "post" ? "post" : "prayer"}&target_id=${targetId}&anon_token=${token}`;

    try {
      const res = await fetch(apiPath);
      const d = await res.json();
      setCounts(d.counts ?? { praying: 0, amen: 0, felt_this: 0 });
      setMine(new Set((d.mine ?? []) as ReactionType[]));
    } finally {
      setReady(true);
    }
  }, [targetType, targetId]);

  useEffect(() => {
    if (!initialCounts) load();
  }, [load, initialCounts]);

  const toggle = async (type: ReactionType) => {
    const token = getOrCreateAnonToken();
    const isActive = mine.has(type);

    // Optimistic
    const newMine = new Set(mine);
    isActive ? newMine.delete(type) : newMine.add(type);
    setMine(newMine);
    setCounts((prev) => ({ ...prev, [type]: Math.max(0, prev[type] + (isActive ? -1 : 1)) }));

    const apiPath = targetType === "moment"
      ? `/api/moments/${targetId}/react`
      : `/api/reactions`;

    const body = targetType === "moment"
      ? { reaction_type: type, anon_token: token }
      : { target_type: targetType === "post" ? "post" : "prayer", target_id: targetId, reaction_type: type, anon_token: token };

    await fetch(apiPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  };

  if (!ready) return null;

  const total = counts.praying + counts.amen + counts.felt_this;
  const hasAny = total > 0 || mine.size > 0;

  return (
    <div className="flex items-center gap-1">
      {REACTIONS.map(({ type, emoji, label }) => {
        const count = counts[type];
        const active = mine.has(type);
        if (!hasAny && !active && count === 0) {
          // Show all buttons when nothing has been reacted to yet
        }
        return (
          <button
            key={type}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(type); }}
            title={label}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all duration-150 press-scale select-none ${
              active
                ? "bg-white/12 text-white border border-white/20"
                : "text-white/30 hover:text-white/55 border border-transparent hover:border-white/10"
            }`}
          >
            <span className="text-[13px] leading-none">{emoji}</span>
            {count > 0 && <span className="font-medium tabular-nums">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
