"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Heart, Users, ArrowRight, Sparkles, Shield, Globe } from "lucide-react";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { TiltCard } from "@/components/shared/TiltCard";
import { MagneticButton } from "@/components/shared/MagneticButton";

const ease = [0.23, 1, 0.32, 1] as const;

const entryCards = [
  {
    href: "/discuss",
    icon: MessageCircle,
    gradient: "from-amber-500/20 to-orange-500/10",
    glow: "hover:shadow-amber-500/25",
    border: "hover:border-amber-500/35",
    iconBg: "bg-amber-500/20 text-amber-300",
    iconGlow: "shadow-amber-500/30",
    label: "Discuss",
    description: "Ask any question about faith, life, Jesus — no account needed. Get real answers from real people.",
    cta: "Start a discussion",
    accentColor: "oklch(0.78 0.18 60 / 30%)",
  },
  {
    href: "/pray",
    icon: Heart,
    gradient: "from-violet-500/20 to-purple-500/10",
    glow: "hover:shadow-violet-500/25",
    border: "hover:border-violet-500/35",
    iconBg: "bg-violet-500/20 text-violet-300",
    iconGlow: "shadow-violet-500/30",
    label: "Pray",
    description: "Share what's on your heart. Our team prays with you and walks with you through it.",
    cta: "Share a request",
    accentColor: "oklch(0.6 0.22 300 / 30%)",
  },
  {
    href: "/counsel",
    icon: Users,
    gradient: "from-rose-500/20 to-pink-500/10",
    glow: "hover:shadow-rose-500/25",
    border: "hover:border-rose-500/35",
    iconBg: "bg-rose-500/20 text-rose-300",
    iconGlow: "shadow-rose-500/30",
    label: "Talk to Someone",
    description: "Struggling with something? Connect with a real peer supporter — anonymously and safely.",
    cta: "Talk privately",
    accentColor: "oklch(0.65 0.24 15 / 30%)",
  },
];

const features = [
  { icon: Sparkles, label: "No AI. Ever.", desc: "Every reply comes from a real human being." },
  { icon: Shield, label: "Anonymous-first", desc: "No account needed. No tracking. Just community." },
  { icon: Globe, label: "Open to anyone", desc: "Regardless of where you are in life or faith." },
];

export default function HomePage() {
  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex flex-col">
      <AnimatedBackground />

      <section className="flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-12 text-center">
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
          className="mb-5"
        >
          <MagneticButton>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium cursor-default select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Real people. Real conversations.
            </span>
          </MagneticButton>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.07, ease }}
          className="max-w-2xl text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1]"
        >
          <span className="gradient-text">Ask anything.</span>
          <br />
          <span className="text-white/90">Find community.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease }}
          className="mt-5 max-w-lg text-base sm:text-lg text-white/50 leading-relaxed"
        >
          A space where you can be fully honest — about your doubts, your pain, your questions.
          No judgment. No AI. Just people who care, and a God who already knows.
        </motion.p>

        {/* Entry cards */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.26, ease }}
          className="mt-12 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4"
          style={{ perspective: "1200px" }}
        >
          {entryCards.map((card, i) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32 + i * 0.07, ease }}
              className="h-full"
            >
              <TiltCard className="rounded-2xl h-full" spotRadius={220}>
                <Link
                  href={card.href}
                  className={`group relative flex flex-col items-start p-5 rounded-2xl glass border border-white/8 ${card.border} hover:shadow-xl ${card.glow} transition-all duration-300 text-left h-full`}
                >
                  {/* Gradient fill on hover */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  <div className="relative z-10 w-full flex flex-col h-full">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center mb-4 shadow-lg ${card.iconGlow} transition-shadow duration-300 group-hover:shadow-xl`}>
                      <card.icon size={20} />
                    </div>

                    <h2 className="text-lg font-bold text-white mb-2">{card.label}</h2>
                    <p className="text-sm text-white/55 leading-relaxed mb-5 flex-1">{card.description}</p>

                    <div className="flex items-center gap-1.5 text-sm font-medium text-white/40 group-hover:text-white/80 transition-colors duration-200">
                      {card.cta}
                      <ArrowRight
                        size={14}
                        className="group-hover:translate-x-1 transition-transform duration-200"
                      />
                    </div>
                  </div>
                </Link>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.62 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          {features.map(({ icon: Icon, label, desc }) => (
            <MagneticButton key={label} strength={0.2}>
              <div
                className="group flex items-center gap-2 px-3 py-2 rounded-full glass border border-white/8 cursor-default hover:border-white/15 transition-colors duration-200"
                title={desc}
              >
                <Icon size={14} className="text-white/40 group-hover:text-white/70 transition-colors duration-150" />
                <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors duration-150">{label}</span>
              </div>
            </MagneticButton>
          ))}
        </motion.div>
      </section>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="text-center pb-8 px-4"
      >
        <p className="text-xs text-white/20">
          Built to point people to Jesus — one conversation at a time.
        </p>
      </motion.footer>
    </div>
  );
}
