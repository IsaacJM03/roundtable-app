"use client";

/**
 * PrayerWall — a scrollable wall of sticky-note prayer requests with a subtle 3D feel.
 *
 * Drop-in usage:
 *   <PrayerWall notes={[{ id, text, author, count }, ...]} />
 *
 * - Entrance animations use IntersectionObserver (no per-frame scroll work).
 * - Parallax/shadow depth uses ONE rAF-batched scroll handler (the pragmatic,
 *   performant way to read scroll position; skipped entirely for reduced-motion).
 *   ponytail: rAF-throttled scroll for parallax; upgrade path is CSS
 *   scroll-driven animations (animation-timeline: view()) once browser support is safe.
 * - prefers-reduced-motion => plain fade-in, no tilt, no parallax.
 *
 * Single file. No external deps beyond React + Tailwind.
 */

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

export interface PrayerNote {
  id: string;
  text: string;
  author?: string | null;
  count?: number;
  href?: string;
  badge?: string;
  subtext?: string;
}

// useLayoutEffect on the server warns; this component only renders client-side
// (parent pages fetch data in the browser), so alias to the safe one.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const NOTE_COLORS = [
  { bg: "#fef3c7", edge: "#fde68a", ink: "#713f12" }, // soft yellow
  { bg: "#fce7f3", edge: "#fbcfe8", ink: "#831843" }, // pink
  { bg: "#dbeafe", edge: "#bfdbfe", ink: "#1e3a8a" }, // blue
  { bg: "#dcfce7", edge: "#bbf7d0", ink: "#14532d" }, // green
  { bg: "#ede9fe", edge: "#ddd6fe", ink: "#4c1d95" }, // lilac
  { bg: "#ffedd5", edge: "#fed7aa", ink: "#7c2d12" }, // peach
] as const;

export type WallVariant = "prayer" | "testimony";

// Testimonies lean warm/golden to feel like gratitude; prayers use the full spread.
const VARIANT_COLORS: Record<WallVariant, readonly (typeof NOTE_COLORS)[number][]> = {
  prayer: NOTE_COLORS,
  testimony: [NOTE_COLORS[0], NOTE_COLORS[5], NOTE_COLORS[1], NOTE_COLORS[4]],
};

// Deterministic pseudo-random from a string id, so colours/rotation are stable
// across renders (no hydration mismatch, no reshuffle on re-render).
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295; // 0..1
}

const SAMPLE_NOTES: PrayerNote[] = [
  { id: "1", text: "Praying for peace over my exams this week.", author: "Anonymous", count: 12 },
  { id: "2", text: "For my mum's recovery — the surgery is Friday.", author: "Grace", count: 41 },
  { id: "3", text: "Wisdom for a big decision I can't talk about yet.", author: "Anonymous", count: 8 },
  { id: "4", text: "Thankful. God showed up when I least expected it.", author: "J.", count: 27 },
  { id: "5", text: "That my brother finds his way back home.", author: "Anonymous", count: 19 },
  { id: "6", text: "Strength to forgive someone who hurt me.", author: "Sam", count: 33 },
  { id: "7", text: "For everyone feeling alone tonight — you are seen.", author: "Anonymous", count: 58 },
  { id: "8", text: "A job. Anything. I'm running out of time.", author: "Anonymous", count: 22 },
  { id: "9", text: "Rest for tired parents. It's been a long season.", author: "Lena", count: 14 },
  { id: "10", text: "That I'd stop being so hard on myself.", author: "Anonymous", count: 30 },
  { id: "11", text: "Healing for my friend's marriage.", author: "Anonymous", count: 16 },
  { id: "12", text: "Just gratitude. Small mercies everywhere lately.", author: "Theo", count: 25 },
];

function PrayerCard({
  note,
  index,
  variant,
  visible,
  actions,
}: {
  note: PrayerNote;
  index: number;
  variant: WallVariant;
  visible: boolean;
  actions?: ReactNode;
}) {
  const pool = VARIANT_COLORS[variant];
  const r = hash(note.id);
  const color = pool[Math.floor(r * pool.length) % pool.length];
  const rotation = (r * 6 - 3).toFixed(2); // -3deg .. +3deg
  const depth = 0.15 + hash(note.id + "d") * 0.55; // parallax strength 0.15..0.7

  return (
    <li
      data-id={note.id}
      data-visible={visible}
      data-depth={depth}
      className="pw-note"
      style={
        {
          "--pw-rot": `${rotation}deg`,
          "--pw-delay": `${(index % 5) * 45}ms`,
          "--pw-bg": color.bg,
          "--pw-edge": color.edge,
          "--pw-ink": color.ink,
        } as React.CSSProperties
      }
    >
      <NoteInner note={note} variant={variant} actions={actions} />
    </li>
  );
}

function NoteInner({
  note,
  variant,
  actions,
}: {
  note: PrayerNote;
  variant: WallVariant;
  actions?: ReactNode;
}) {
  const isTestimony = variant === "testimony";
  const label = `${isTestimony ? "Testimony" : "Prayer request"}${note.author ? ` from ${note.author}` : ""}`;
  const body = (
    <>
      {note.badge && <span className="pw-badge">{note.badge}</span>}
      {isTestimony && <span className="pw-quote" aria-hidden="true">&ldquo;</span>}
      <p className="pw-text">{note.text}</p>
      {note.subtext && <p className="pw-subtext">&ldquo;{note.subtext}&rdquo;</p>}
      <span className="pw-author">{note.author?.trim() || "Anonymous"}</span>
    </>
  );

  return (
    <div className="pw-note-inner">
      {note.href ? (
        <Link href={note.href} className="pw-note-body" aria-label={label}>
          {body}
        </Link>
      ) : (
        <div className="pw-note-body">{body}</div>
      )}
      {actions && <div className="pw-note-actions">{actions}</div>}
    </div>
  );
}

export default function PrayerWall({
  notes = SAMPLE_NOTES,
  title = "Prayer Wall",
  subtitle = "Take one. Leave one. You are seen.",
  showHeader = true,
  variant = "prayer",
  loadingMore = false,
  loadMoreRef,
  renderActions,
}: {
  notes?: PrayerNote[];
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  variant?: WallVariant;
  loadingMore?: boolean;
  loadMoreRef?: (node: HTMLDivElement | null) => void;
  renderActions?: (note: PrayerNote) => ReactNode;
}) {
  const wallRef = useRef<HTMLElement>(null);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(() => new Set());

  // Reveal notes already in the viewport BEFORE the browser paints, so they
  // appear settled instead of flashing blank then popping in. Only notes below
  // the fold get the scroll-triggered entrance. Runs on each note-count change
  // so newly appended (infinite-scroll) batches below the fold stay animated.
  useIsoLayoutEffect(() => {
    const wall = wallRef.current;
    if (!wall) return;
    const vh = window.innerHeight;
    const initial: string[] = [];
    wall.querySelectorAll<HTMLElement>('.pw-note[data-visible="false"]').forEach((el) => {
      const rect = el.getBoundingClientRect();
      const id = el.dataset.id;
      if (id && rect.top < vh * 0.95) initial.push(id);
    });
    if (initial.length) {
      setVisibleIds((prev) => {
        const next = new Set(prev);
        initial.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [notes.length]);

  // One IntersectionObserver for all not-yet-visible notes — not one per card.
  useEffect(() => {
    const wall = wallRef.current;
    if (!wall) return;

    const io = new IntersectionObserver(
      (entries) => {
        setVisibleIds((prev) => {
          let next: Set<string> | null = null;
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const id = (entry.target as HTMLElement).dataset.id;
            if (!id || prev.has(id)) continue;
            if (!next) next = new Set(prev);
            next.add(id);
            io.unobserve(entry.target);
          }
          return next ?? prev;
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );

    wall.querySelectorAll('.pw-note[data-visible="false"]').forEach((el) => io.observe(el));
    return () => io.disconnect();
    // Re-observe when a new batch is appended; initial in-viewport notes are
    // already revealed by the layout effect above, so they're skipped here.
  }, [notes.length]);

  // Parallax: one rAF-batched scroll handler, viewport-culled, reduced-motion off.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    const wall = wallRef.current;
    if (!wall) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const els = wall.querySelectorAll<HTMLElement>('.pw-note[data-visible="true"]');
      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        const depth = Number(el.dataset.depth ?? 0.3);
        const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        const shift = -progress * depth * 26;
        el.style.setProperty("--pw-parallax", `${shift.toFixed(1)}px`);
        el.style.setProperty("--pw-shadow-y", `${(6 + depth * 14 + progress * 6).toFixed(1)}px`);
      });
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [notes.length]);

  return (
    <section ref={wallRef} className="pw-wall">
      <style>{PW_STYLES}</style>

      {showHeader && (
        <header className="pw-header">
          <h2 className="pw-title">{title}</h2>
          <p className="pw-subtitle">{subtitle}</p>
        </header>
      )}

      <ul className="pw-grid">
        {notes.map((note, i) => (
          <PrayerCard
            key={note.id}
            note={note}
            index={i}
            variant={variant}
            visible={visibleIds.has(note.id)}
            actions={renderActions?.(note)}
          />
        ))}
      </ul>

      {loadMoreRef && <div ref={loadMoreRef} className="h-1" aria-hidden="true" />}
      {loadingMore && (
        <p className="text-center text-xs text-white/30 py-6">Loading more…</p>
      )}
    </section>
  );
}

const PW_STYLES = `
.pw-wall {
  --pw-gap: 1rem;
  position: relative;
  padding: 0.5rem 0 3rem;
  margin: 0 auto;
  perspective: 1200px;
}
.pw-header { text-align: center; margin-bottom: 2.5rem; }
.pw-title {
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #fafafa;
}
.pw-subtitle { margin-top: .5rem; font-size: .95rem; color: rgba(255,255,255,.45); }

/* Masonry via CSS columns — cheap, responsive, no JS layout. */
.pw-grid {
  column-count: 1;
  column-gap: var(--pw-gap);
  list-style: none;
  padding: 0;
  margin: 0;
  transform-style: preserve-3d;
}
@media (min-width: 640px)  { .pw-grid { column-count: 2; } }
@media (min-width: 900px)  { .pw-grid { column-count: 3; } }
@media (min-width: 1200px) { .pw-grid { column-count: 4; } }

.pw-note {
  --pw-parallax: 0px;
  --pw-shadow-y: 12px;
  break-inside: avoid;
  margin-bottom: var(--pw-gap);
  opacity: 0;
  content-visibility: auto;
  contain-intrinsic-size: auto 140px;
  transform:
    translate3d(0, 16px, 0)
    rotateX(4deg)
    rotate(var(--pw-rot));
  transform-origin: center top;
  transition:
    opacity .45s cubic-bezier(.23,1,.32,1),
    transform .5s cubic-bezier(.23,1,.32,1);
  transition-delay: var(--pw-delay);
  will-change: transform, opacity;
}
.pw-note[data-visible="true"] {
  opacity: 1;
  transform:
    translate3d(0, var(--pw-parallax), 0)
    rotateX(0deg) rotateY(0deg)
    rotate(var(--pw-rot));
}

.pw-note-inner {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 1.1rem 1.1rem 0.75rem;
  border-radius: 10px;
  background: var(--pw-bg);
  color: var(--pw-ink);
  box-shadow:
    0 1px 1px rgba(0,0,0,.06),
    0 var(--pw-shadow-y) 24px -8px rgba(0,0,0,.35);
  transition: transform .18s ease, box-shadow .18s ease;
  transform: translateZ(0);
}
/* tactile lift on hover, or when the inner link is keyboard-focused */
.pw-note-inner:hover,
.pw-note-inner:has(.pw-note-body:focus-visible) {
  transform: scale(1.025) translateZ(0);
  box-shadow:
    0 2px 2px rgba(0,0,0,.08),
    0 26px 40px -10px rgba(0,0,0,.45);
}
.pw-note-body {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  text-align: left;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  border-radius: 6px;
  outline: none;
}
.pw-note-body:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--pw-ink) 45%, transparent);
  outline-offset: 3px;
}
.pw-note-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: .7rem;
  padding-top: .5rem;
  border-top: 1px solid color-mix(in srgb, var(--pw-ink) 14%, transparent);
}

.pw-quote {
  display: block;
  margin-bottom: -1.1rem;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 2.6rem;
  line-height: 1;
  font-weight: 700;
  opacity: .35;
}
.pw-text {
  font-size: .95rem;
  line-height: 1.5;
  font-weight: 500;
  word-break: break-word;
}
.pw-badge {
  align-self: flex-start;
  font-size: .62rem;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  padding: .2rem .45rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--pw-ink) 12%, transparent);
  color: color-mix(in srgb, var(--pw-ink) 75%, transparent);
}
.pw-subtext {
  font-size: .82rem;
  line-height: 1.45;
  font-style: italic;
  opacity: .8;
  word-break: break-word;
}
.pw-author { font-size: .72rem; font-weight: 600; opacity: .7; }

/* Accessibility: honour reduced motion — simple fade, no tilt/parallax. */
@media (prefers-reduced-motion: reduce) {
  .pw-note {
    transform: none;
    transition: opacity .4s ease;
    transition-delay: var(--pw-delay);
  }
  .pw-note[data-visible="true"] { transform: none; }
  .pw-note-inner { transition: box-shadow .18s ease; }
  .pw-note-inner:hover,
  .pw-note-inner:has(.pw-note-body:focus-visible) { transform: none; }
}
`;
