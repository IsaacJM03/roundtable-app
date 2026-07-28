"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  HeartHandshake,
  MessageCircle,
  Shield,
  Sparkles,
} from "lucide-react";

type Step = "home" | "topics" | "connect";

const ease = [0.23, 1, 0.32, 1] as const;

const TOPICS = [
  { id: "faith", label: "Faith & doubt", href: "/discuss" },
  { id: "mental", label: "Anxiety & loneliness", href: "/counsel" },
  { id: "relate", label: "Relationships", href: "/discuss" },
  { id: "pray", label: "Prayer that feels stuck", href: "/pray" },
  { id: "purpose", label: "Calling & purpose", href: "/discuss" },
] as const;

const slide = {
  enter: (dir: number) => ({ x: dir > 0 ? 56 : -56, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -56 : 56, opacity: 0 }),
};

export default function CanWeTalkPage() {
  const [step, setStep] = useState<Step>("home");
  const [dir, setDir] = useState(1);
  const [picked, setPicked] = useState<string | null>(null);

  function go(next: Step, direction: number) {
    setDir(direction);
    setStep(next);
  }

  return (
    <div className="cwt relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-[#FFF7ED] text-[#1A1410]">
      {/* Warm atmospheric blobs — intentional motion */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-[#FF8918]/25 blur-3xl"
          animate={{ y: [0, 24, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-[#FF9710]/20 blur-3xl"
          animate={{ y: [0, -30, 0], x: [0, -16, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-[#D55200]/12 blur-3xl"
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Soft geometric accents */}
        <div className="absolute right-[12%] top-28 h-16 w-16 rotate-12 rounded-2xl border-2 border-[#FF8918]/25" />
        <div className="absolute bottom-32 left-[8%] h-10 w-10 -rotate-6 rounded-full bg-[#FF8918]/15" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-3xl flex-col px-4 pb-10 pt-8 sm:px-6 sm:pt-12">
        {/* Step dots */}
        <div className="mb-8 flex items-center justify-center gap-2" aria-label="Progress">
          {(["home", "topics", "connect"] as Step[]).map((s) => (
            <button
              key={s}
              type="button"
              aria-label={`Go to ${s}`}
              aria-current={step === s}
              onClick={() =>
                go(s, (["home", "topics", "connect"] as Step[]).indexOf(s) > (["home", "topics", "connect"] as Step[]).indexOf(step) ? 1 : -1)
              }
              className={`h-2.5 rounded-full transition-all duration-200 ${
                step === s ? "w-8 bg-[#FF8918]" : "w-2.5 bg-[#FF8918]/30 hover:bg-[#FF8918]/50"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait" custom={dir}>
          {step === "home" && (
            <motion.section
              key="home"
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease }}
              className="flex flex-1 flex-col items-center text-center"
            >
              <p
                className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#D55200]"
                style={{ fontFamily: "var(--font-cwt-body), sans-serif" }}
              >
                Roundtable
              </p>
              <h1
                className="max-w-xl text-5xl font-bold leading-[1.05] tracking-tight text-[#1A1410] sm:text-6xl"
                style={{ fontFamily: "var(--font-cwt-heading), sans-serif" }}
              >
                Can We Talk?
              </h1>
              <p
                className="mt-4 max-w-md text-lg leading-relaxed text-[#1A1410]/70"
                style={{ fontFamily: "var(--font-cwt-body), sans-serif" }}
              >
                Come as you are. A warm, anonymous space for hard questions, heavy days, and honest faith.
              </p>

              <div className="mt-10 grid w-full max-w-lg gap-4 text-left sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-5 shadow-[0_12px_40px_-12px_rgba(213,82,0,0.25)]">
                  <h2
                    className="text-sm font-bold uppercase tracking-wide text-[#D55200]"
                    style={{ fontFamily: "var(--font-cwt-heading), sans-serif" }}
                  >
                    Why we&apos;re here
                  </h2>
                  <p
                    className="mt-2 text-sm leading-relaxed text-[#1A1410]/65"
                    style={{ fontFamily: "var(--font-cwt-body), sans-serif" }}
                  >
                    No performance. No judgment. Just real conversation with people who care.
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-[0_12px_40px_-12px_rgba(213,82,0,0.25)]">
                  <h2
                    className="text-sm font-bold uppercase tracking-wide text-[#D55200]"
                    style={{ fontFamily: "var(--font-cwt-heading), sans-serif" }}
                  >
                    How it works
                  </h2>
                  <p
                    className="mt-2 text-sm leading-relaxed text-[#1A1410]/65"
                    style={{ fontFamily: "var(--font-cwt-body), sans-serif" }}
                  >
                    Pick what&apos;s on your mind — then talk one-to-one when you need someone now.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => go("topics", 1)}
                className="mt-10 inline-flex items-center gap-2 rounded-2xl bg-[#FF8918] px-7 py-3.5 text-base font-semibold text-[#1A1410] shadow-[0_10px_30px_-8px_rgba(255,137,24,0.55)] transition-transform duration-150 hover:bg-[#FF9710] active:scale-[0.97]"
                style={{ fontFamily: "var(--font-cwt-heading), sans-serif" }}
              >
                Start talking
                <ArrowRight size={18} />
              </button>
            </motion.section>
          )}

          {step === "topics" && (
            <motion.section
              key="topics"
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease }}
              className="flex flex-1 flex-col"
            >
              <button
                type="button"
                onClick={() => go("home", -1)}
                className="mb-4 inline-flex items-center gap-1.5 self-start text-sm font-medium text-[#D55200] hover:text-[#1A1410]"
                style={{ fontFamily: "var(--font-cwt-body), sans-serif" }}
              >
                <ArrowLeft size={16} /> Back
              </button>

              <h1
                className="text-4xl font-bold tracking-tight sm:text-5xl"
                style={{ fontFamily: "var(--font-cwt-heading), sans-serif" }}
              >
                What&apos;s on your mind?
              </h1>
              <p
                className="mt-3 max-w-lg text-base text-[#1A1410]/65"
                style={{ fontFamily: "var(--font-cwt-body), sans-serif" }}
              >
                Pick a thread. Stay anonymous. We listen first.
              </p>

              <ul className="mt-8 flex flex-col gap-3">
                {TOPICS.map((t, i) => (
                  <motion.li
                    key={t.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3, ease }}
                  >
                    <button
                      type="button"
                      onClick={() => setPicked(t.id)}
                      className={`flex w-full items-center justify-between rounded-2xl border-2 bg-white px-5 py-4 text-left shadow-[0_8px_28px_-14px_rgba(213,82,0,0.3)] transition-all duration-150 ${
                        picked === t.id
                          ? "border-[#FF8918] ring-2 ring-[#FF8918]/25"
                          : "border-transparent hover:border-[#FF8918]/40"
                      }`}
                    >
                      <span
                        className="text-base font-semibold text-[#1A1410]"
                        style={{ fontFamily: "var(--font-cwt-heading), sans-serif" }}
                      >
                        {t.label}
                      </span>
                      <Sparkles
                        size={18}
                        className={picked === t.id ? "text-[#FF8918]" : "text-[#FF8918]/35"}
                      />
                    </button>
                  </motion.li>
                ))}
              </ul>

              <button
                type="button"
                disabled={!picked}
                onClick={() => go("connect", 1)}
                className="mt-8 inline-flex items-center justify-center gap-2 self-center rounded-2xl bg-[#FF8918] px-7 py-3.5 text-base font-semibold text-[#1A1410] shadow-[0_10px_30px_-8px_rgba(255,137,24,0.55)] transition-all duration-150 hover:bg-[#FF9710] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                style={{ fontFamily: "var(--font-cwt-heading), sans-serif" }}
              >
                See peer support
                <ArrowRight size={18} />
              </button>
            </motion.section>
          )}

          {step === "connect" && (
            <motion.section
              key="connect"
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease }}
              className="flex flex-1 flex-col items-center text-center"
            >
              <button
                type="button"
                onClick={() => go("topics", -1)}
                className="mb-4 inline-flex items-center gap-1.5 self-start text-sm font-medium text-[#D55200] hover:text-[#1A1410]"
                style={{ fontFamily: "var(--font-cwt-body), sans-serif" }}
              >
                <ArrowLeft size={16} /> Back
              </button>

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF8918]/20">
                <HeartHandshake className="text-[#D55200]" size={28} />
              </div>

              <h1
                className="max-w-lg text-4xl font-bold tracking-tight sm:text-5xl"
                style={{ fontFamily: "var(--font-cwt-heading), sans-serif" }}
              >
                Talk to someone
              </h1>
              <p
                className="mt-3 max-w-md text-base leading-relaxed text-[#1A1410]/65"
                style={{ fontFamily: "var(--font-cwt-body), sans-serif" }}
              >
                Anonymous. Real humans. No judgment. Open a private room when you&apos;re ready —
                someone will sit with your story.
              </p>

              <div className="mt-8 flex w-full max-w-md flex-col gap-3 text-left">
                {[
                  { icon: Shield, text: "Fully anonymous — we never know who you are" },
                  { icon: MessageCircle, text: "A real peer supporter will connect with you" },
                  { icon: HeartHandshake, text: "Listening first. No pressure to perform." },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_8px_28px_-14px_rgba(213,82,0,0.28)]"
                  >
                    <Icon size={18} className="shrink-0 text-[#FF8918]" />
                    <span
                      className="text-sm text-[#1A1410]/75"
                      style={{ fontFamily: "var(--font-cwt-body), sans-serif" }}
                    >
                      {text}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href="/counsel"
                className="mt-10 inline-flex items-center gap-2 rounded-2xl bg-[#FF8918] px-7 py-3.5 text-base font-semibold text-[#1A1410] shadow-[0_10px_30px_-8px_rgba(255,137,24,0.55)] transition-transform duration-150 hover:bg-[#FF9710] active:scale-[0.97]"
                style={{ fontFamily: "var(--font-cwt-heading), sans-serif" }}
              >
                Open a private room
                <ArrowRight size={18} />
              </Link>

              <button
                type="button"
                onClick={() => go("home", -1)}
                className="mt-4 rounded-2xl border-2 border-[#FF8918] bg-white px-6 py-2.5 text-sm font-semibold text-[#D55200] transition-colors duration-150 hover:bg-[#FFF7ED]"
                style={{ fontFamily: "var(--font-cwt-heading), sans-serif" }}
              >
                ← Back to home
              </button>

              <p
                className="mt-6 max-w-sm text-xs text-[#1A1410]/40"
                style={{ fontFamily: "var(--font-cwt-body), sans-serif" }}
              >
                Peer supporters are volunteers, not licensed therapists. For emergencies, call your
                local crisis line.
              </p>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
