import { notFound } from "next/navigation";
import Link from "next/link";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { ArrowLeft, BookOpen } from "lucide-react";
import type { DailyDrop } from "@/lib/types";
import { ensureDropForDate } from "@/lib/daily/ensureDrop";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 86400;

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default async function DailyArchivePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  await ensureDropForDate(date);

  const admin = createAdminClient();
  const { data } = await admin.from("daily_drops").select("*").eq("drop_date", date).single();

  if (!data) notFound();
  const drop = data as DailyDrop;

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="max-w-2xl mx-auto px-4 py-12">

        <div className="flex items-center gap-3 mb-10">
          <Link href="/daily" className="text-white/40 hover:text-white/70 transition-colors duration-150 press-scale">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-white/25 uppercase">Daily Drop</p>
            <h1 className="text-xl font-bold text-white/90 tracking-tight">{formatDate(drop.drop_date)}</h1>
          </div>
        </div>

        <div className="relative p-7 rounded-2xl glass border border-white/8 overflow-hidden">
          <div className="pointer-events-none absolute -top-4 -right-4 text-amber-400/5">
            <BookOpen size={140} strokeWidth={1} />
          </div>
          <div className="relative z-10 flex flex-col gap-5">
            <span className="text-xs font-semibold text-amber-400/70 tracking-widest uppercase">{drop.verse_ref}</span>
            <blockquote className="text-xl sm:text-2xl font-medium text-white/90 leading-relaxed">
              &ldquo;{drop.verse_text}&rdquo;
            </blockquote>
            <div className="w-8 h-px bg-white/15" />
            <p className="text-[15px] text-white/60 leading-relaxed">{drop.reflection}</p>
            <div className="flex gap-3 pt-1">
              <div className="mt-1 w-px shrink-0 rounded-full bg-gradient-to-b from-violet-400/50 to-transparent" />
              <p className="text-sm text-white/45 leading-relaxed italic">{drop.question}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
