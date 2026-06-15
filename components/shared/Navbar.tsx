"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="fixed top-14 inset-x-0 z-40 glass border-b border-white/8 p-4 flex flex-col gap-1 sm:hidden"
        >
          {[...primaryLinks, ...secondaryLinks].map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150",
                  active ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors duration-150"
          >
            <LayoutDashboard size={16} />
            Team Dashboard
          </Link>
        </motion.div>
      )}

      {/* Spacer */}
      <div className="h-14" />
    </>
  );
}
