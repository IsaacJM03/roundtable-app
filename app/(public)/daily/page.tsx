import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { ArrowRight, BookOpen } from "lucide-react";
import type { DailyDrop } from "@/lib/types";

export const revalidate = 3600;

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

async function getToday(): Promise<{ drop: DailyDrop | null; recent: DailyDrop[] }> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("daily_drops")
    .select("*")
    .lte("drop_date", today)
    .order("drop_date", { ascending: false })
    .limit(8);

  if (!data || data.length === 0) return { drop: null, recent: [] };
  const [drop, ...recent] = data;
  return { drop: drop as DailyDrop, recent: recent as DailyDrop[] };
}

export default async function DailyPage() {
  const { drop, recent } = await getToday();

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-white/25 uppercase mb-1">Daily Drop</p>
          <h1 className="text-2xl font-bold text-white/90 tracking-tight">
            {drop ? formatDate(drop.drop_date) : "Today"}
          </h1>
        </div>

        {drop ? (
          <div className="flex flex-col gap-8">
            {/* Verse */}
            <div className="relative p-7 rounded-2xl glass border border-white/8 overflow-hidden">
              {/* Decorative BookOpen watermark */}
              <div className="pointer-events-none absolute -top-4 -right-4 text-amber-400/5">
                <BookOpen size={140} strokeWidth={1} />
              </div>

              <div className="relative z-10 flex flex-col gap-5">
                {/* Reference */}
                <span className="text-xs font-semibold text-amber-400/70 tracking-widest uppercase">
                  {drop.verse_ref}
                </span>

                {/* Verse text */}
                <blockquote className="text-xl sm:text-2xl font-medium text-white/90 leading-relaxed">
                  &ldquo;{drop.verse_text}&rdquo;
                </blockquote>

                {/* Divider */}
                <div className="w-8 h-px bg-white/15" />

                {/* Reflection */}
                <p className="text-[15px] text-white/60 leading-relaxed">
                  {drop.reflection}
                </p>

                {/* Question */}
                <div className="flex gap-3 pt-1">
                  <div className="mt-1 w-px shrink-0 h-auto rounded-full bg-gradient-to-b from-violet-400/50 to-transparent" />
                  <p className="text-sm text-white/45 leading-relaxed italic">
                    {drop.question}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA nudge */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/pray/new"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-violet-500/20 text-violet-300/80 text-sm hover:border-violet-500/35 hover:text-violet-200 transition-all duration-150 press-scale"
              >
                Share a prayer request
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/discuss/new"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-white/8 text-white/40 text-sm hover:border-white/15 hover:text-white/65 transition-all duration-150 press-scale"
              >
                Discuss this verse
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center glass border border-white/8 rounded-2xl">
            <BookOpen size={32} className="mx-auto mb-4 text-white/20" />
            <p className="text-white/40 mb-1">No drop today yet.</p>
            <p className="text-xs text-white/25">Check back soon — the team is preparing one.</p>
          </div>
        )}

        {/* Archive */}
        {recent.length > 0 && (
          <div className="mt-14">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-white/20 uppercase mb-4">Past drops</p>
            <div className="flex flex-col gap-2">
              {recent.map((r) => (
                <Link
                  key={r.id}
                  href={`/daily/${r.drop_date}`}
                  className="group flex items-center justify-between px-4 py-3 rounded-xl glass border border-white/6 hover:border-white/12 transition-all duration-150 press-scale"
                >
                  <div>
                    <p className="text-xs text-white/55 group-hover:text-white/80 transition-colors duration-150">
                      {formatDate(r.drop_date)}
                    </p>
                    <p className="text-[11px] text-white/30 mt-0.5">{r.verse_ref}</p>
                  </div>
                  <ArrowRight size={13} className="text-white/20 group-hover:text-white/45 group-hover:translate-x-0.5 transition-all duration-150" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
