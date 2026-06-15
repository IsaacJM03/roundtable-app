"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Heart, Users, ArrowRight } from "lucide-react";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { TiltCard } from "@/components/shared/TiltCard";
import { MagneticButton } from "@/components/shared/MagneticButton";

const ease = [0.23, 1, 0.32, 1] as const;

const entryCards = [
  {
    href: "/discuss",
    icon: MessageCircle,
    label: "Discuss",
    num: "01",
    description:
      "Ask any question about faith, life, or Jesus — no account needed. Real humans answer.",
    accentBorder: "hover:border-amber-500/30",
    accentGlow: "hover:shadow-amber-500/20",
    accentGradient: "from-amber-500/10 to-transparent",
    iconColor: "text-amber-400",
  },
  {
    href: "/pray",
    icon: Heart,
    label: "Pray",
    num: "02",
    description:
      "Share what's heavy on your heart. Our team prays with you and walks with you through it.",
    accentBorder: "hover:border-violet-500/30",
    accentGlow: "hover:shadow-violet-500/20",
    accentGradient: "from-violet-500/10 to-transparent",
    iconColor: "text-violet-400",
  },
  {
    href: "/counsel",
    icon: Users,
    label: "Talk to Someone",
    num: "03",
    description:
      "Struggling? Connect anonymously with a real peer supporter — no account, no judgment.",
    accentBorder: "hover:border-rose-500/30",
    accentGlow: "hover:shadow-rose-500/20",
    accentGradient: "from-rose-500/10 to-transparent",
    iconColor: "text-rose-400",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex flex-col">
      <AnimatedBackground />

      <section className="flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-12 text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="mb-5"
        >
          <MagneticButton>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 text-white/35 text-xs font-medium tracking-wide cursor-default select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70 animate-pulse" />
              No AI. Just people.
            </span>
          </MagneticButton>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.07, ease }}
          className="max-w-2xl text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1]"
        >
          <span className="gradient-text">Ask anything.</span>
          <br />
          <span className="text-white/90">Find community.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14, ease }}
          className="mt-5 max-w-md text-base text-white/40 leading-relaxed"
        >
          A space to be fully honest — about your doubts, pain, and questions. No judgment. Just people who care.
        </motion.p>

        {/* Entry cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.24, ease }}
          className="mt-12 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4"
          style={{ perspective: "1200px" }}
        >
          {entryCards.map((card, i) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3 + i * 0.07, ease }}
              className="h-full"
            >
              <TiltCard className="rounded-2xl h-full" spotRadius={200}>
                <Link
                  href={card.href}
                  className={`group relative flex flex-col p-6 rounded-2xl glass border border-white/8 ${card.accentBorder} hover:shadow-xl ${card.accentGlow} transition-all duration-300 text-left h-full overflow-hidden`}
                >
                  {/* Gradient wash on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-400`} />

                  {/* Watermark icon — no box, just the raw icon huge and ghosted */}
                  <div className={`pointer-events-none absolute -bottom-3 -right-3 ${card.iconColor} opacity-[0.05] group-hover:opacity-[0.09] transition-opacity duration-300`}>
                    <card.icon size={130} strokeWidth={1.2} />
                  </div>

                  <div className="relative z-10 flex flex-col h-full">
                    {/* Number */}
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-white/20 uppercase mb-5">
                      {card.num}
                    </span>

                    {/* Label */}
                    <h2 className="text-2xl font-bold text-white/95 mb-3 leading-tight">
                      {card.label}
                    </h2>

                    {/* Description */}
                    <p className="text-[13px] text-white/45 leading-relaxed flex-1">
                      {card.description}
                    </p>

                    {/* Arrow */}
                    <div className="mt-6 flex justify-end">
                      <ArrowRight
                        size={16}
                        className="text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all duration-200"
                      />
                    </div>
                  </div>
                </Link>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature line — single clean typographic row */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 text-[11px] text-white/25 tracking-widest uppercase font-medium"
        >
          No AI, ever
          <span className="mx-3 text-white/15">·</span>
          Anonymous-first
          <span className="mx-3 text-white/15">·</span>
          Open to anyone
        </motion.p>
      </section>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.75 }}
        className="text-center pb-8 px-4"
      >
        <p className="text-[11px] text-white/15">
          Built to point people to Jesus — one conversation at a time.
        </p>
      </motion.footer>
    </div>
  );
}
