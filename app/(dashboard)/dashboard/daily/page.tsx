"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Check } from "lucide-react";

export default function DashboardDailyPage() {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    drop_date: today,
    verse_ref: "",
    verse_text: "",
    reflection: "",
    question: "",
  });
  const [saving, setSaving] = useState(false);
  const [loadingVerse, setLoadingVerse] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    const res = await fetch("/api/daily", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      const d = await res.json();
      setError(d.error?.formErrors?.[0] ?? d.error ?? "Failed to save");
    }
    setSaving(false);
  };

  const loadVerse = async () => {
    setLoadingVerse(true);
    setError("");
    try {
      const res = await fetch("/api/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "preview", drop_date: form.drop_date }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed to load verse");
      setForm((f) => ({
        ...f,
        verse_ref: d.verse_ref,
        verse_text: d.verse_text,
        reflection: d.reflection,
        question: d.question,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load verse");
    }
    setLoadingVerse(false);
  };

  const reflectionLeft = 600 - form.reflection.length;
  const questionLeft = 200 - form.question.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-white/40 hover:text-white/70 transition-colors duration-150 press-scale">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Daily Drop</h1>
          <p className="text-xs text-white/30 mt-1 tracking-wide uppercase font-medium">
            Verse auto-fills daily · add your reflection
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-5">
        {/* Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/40 font-medium uppercase tracking-wide">Drop date</label>
          <input
            type="date"
            value={form.drop_date}
            onChange={(e) => setForm({ ...form, drop_date: e.target.value })}
            required
            className="px-3 py-2.5 rounded-xl glass border border-white/8 focus:border-amber-500/30 bg-transparent text-white/80 text-sm outline-none transition-colors duration-150"
          />
        </div>

        {/* Verse ref */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-white/40 font-medium uppercase tracking-wide">Verse reference</label>
            <button
              type="button"
              onClick={loadVerse}
              disabled={loadingVerse}
              className="text-xs text-amber-300/80 hover:text-amber-200 disabled:opacity-40 press-scale"
            >
              {loadingVerse ? "Loading…" : "Load verse from API"}
            </button>
          </div>
          <input
            type="text"
            placeholder="e.g. Psalm 46:10"
            value={form.verse_ref}
            onChange={(e) => setForm({ ...form, verse_ref: e.target.value })}
            required
            className="px-3 py-2.5 rounded-xl glass border border-white/8 focus:border-amber-500/30 bg-transparent text-white/80 placeholder-white/25 text-sm outline-none transition-colors duration-150"
          />
        </div>

        {/* Verse text */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/40 font-medium uppercase tracking-wide">Verse text</label>
          <textarea
            placeholder="The full verse text…"
            value={form.verse_text}
            onChange={(e) => setForm({ ...form, verse_text: e.target.value })}
            required
            rows={3}
            className="px-3 py-2.5 rounded-xl glass border border-white/8 focus:border-amber-500/30 bg-transparent text-white/80 placeholder-white/25 text-sm outline-none transition-colors duration-150 resize-none"
          />
        </div>

        {/* Reflection */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-white/40 font-medium uppercase tracking-wide">Reflection</label>
            <span className={`text-[10px] ${reflectionLeft < 60 ? "text-amber-400/70" : "text-white/25"}`}>
              {reflectionLeft} left
            </span>
          </div>
          <textarea
            placeholder="2-3 sentences connecting this verse to where people are right now…"
            value={form.reflection}
            onChange={(e) => setForm({ ...form, reflection: e.target.value })}
            required
            maxLength={600}
            rows={4}
            className="px-3 py-2.5 rounded-xl glass border border-white/8 focus:border-amber-500/30 bg-transparent text-white/80 placeholder-white/25 text-sm outline-none transition-colors duration-150 resize-none"
          />
        </div>

        {/* Question */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-white/40 font-medium uppercase tracking-wide">Question to sit with</label>
            <span className={`text-[10px] ${questionLeft < 40 ? "text-amber-400/70" : "text-white/25"}`}>
              {questionLeft} left
            </span>
          </div>
          <input
            type="text"
            placeholder="One honest question for the reader to hold today…"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            required
            maxLength={200}
            className="px-3 py-2.5 rounded-xl glass border border-white/8 focus:border-amber-500/30 bg-transparent text-white/80 placeholder-white/25 text-sm outline-none transition-colors duration-150"
          />
        </div>

        {error && <p className="text-xs text-rose-400">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium hover:bg-amber-500/30 transition-all duration-150 press-scale disabled:opacity-50"
          >
            {saved ? <Check size={15} /> : <BookOpen size={15} />}
            {saved ? "Saved!" : saving ? "Saving…" : "Publish drop"}
          </button>
          <Link href="/daily" target="_blank" className="text-xs text-white/30 hover:text-white/60 transition-colors duration-150">
            View live →
          </Link>
        </div>
      </form>
    </div>
  );
}
