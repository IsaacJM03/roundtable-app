"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Heart, Users, LayoutDashboard, Menu, X, BookOpen, Sparkles, Flame } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const primaryLinks = [
  { href: "/daily",   label: "Daily",          icon: BookOpen },
  { href: "/discuss", label: "Discuss",         icon: MessageCircle },
  { href: "/pray",    label: "Pray",            icon: Heart },
  { href: "/counsel", label: "Talk to Someone", icon: Users },
];

const secondaryLinks = [
  { href: "/moments", label: "Moments", icon: Sparkles },
  { href: "/honest",  label: "Honest Hours", icon: Flame },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-white/8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <svg
              width="26" height="26" viewBox="0 0 28 28" fill="none"
              className="transition-transform duration-300 group-hover:scale-105"
              aria-hidden
            >
              {/* Center — the table */}
              <circle cx="14" cy="14" r="3.2" fill="rgb(251 191 36)" opacity="0.95" />
              {/* Six seats */}
              <circle cx="14"   cy="3.5"  r="2.1" fill="rgb(251 191 36)" opacity="0.45" />
              <circle cx="22.6" cy="8.5"  r="2.1" fill="rgb(251 191 36)" opacity="0.45" />
              <circle cx="22.6" cy="19.5" r="2.1" fill="rgb(251 191 36)" opacity="0.45" />
              <circle cx="14"   cy="24.5" r="2.1" fill="rgb(251 191 36)" opacity="0.45" />
              <circle cx="5.4"  cy="19.5" r="2.1" fill="rgb(251 191 36)" opacity="0.45" />
              <circle cx="5.4"  cy="8.5"  r="2.1" fill="rgb(251 191 36)" opacity="0.45" />
            </svg>
            <span className="font-bold text-sm tracking-tight text-white/90 group-hover:text-white transition-colors duration-150">
              Roundtable
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-0.5">
            {primaryLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 press-scale",
                    active ? "text-white" : "text-white/50 hover:text-white/80"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg bg-white/8"
                      transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                    />
                  )}
                  <Icon size={14} className="relative z-10" />
                  <span className="relative z-10">{label}</span>
                </Link>
              );
            })}
            {/* Separator */}
            <span className="w-px h-4 bg-white/10 mx-1.5" />
            {secondaryLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 press-scale",
                    active ? "text-white" : "text-white/40 hover:text-white/70"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg bg-white/8"
                      transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                    />
                  )}
                  <Icon size={13} className="relative z-10" />
                  <span className="relative z-10">{label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors duration-150 press-scale"
            >
              <LayoutDashboard size={13} />
              <span>Team</span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="sm:hidden p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/8 transition-colors duration-150 press-scale"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="fixed top-14 inset-x-0 z-40 glass border-b border-white/8 px-3 py-3 flex flex-col gap-0.5 sm:hidden"
          >
            <p className="px-3 pt-1 pb-2 text-[10px] font-semibold tracking-[0.15em] text-white/25 uppercase">
              Community
            </p>
            {primaryLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150",
                    active ? "bg-white/10 text-white" : "text-white/55 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon size={15} className={active ? "text-amber-300" : ""} />
                  {label}
                </Link>
              );
            })}
            <div className="mx-3 my-1 h-px bg-white/6" />
            <p className="px-3 pt-1 pb-1 text-[10px] font-semibold tracking-[0.15em] text-white/25 uppercase">
              Explore
            </p>
            {secondaryLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150",
                    active ? "bg-white/10 text-white" : "text-white/45 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon size={15} className={active ? "text-amber-300" : ""} />
                  {label}
                </Link>
              );
            })}
            <div className="mx-3 my-1 h-px bg-white/6" />
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors duration-150"
            >
              <LayoutDashboard size={15} />
              Team Dashboard
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-14" />
    </>
  );
}
