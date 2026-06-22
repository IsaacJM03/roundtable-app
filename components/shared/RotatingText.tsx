"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const ease = [0.23, 1, 0.32, 1] as const;

interface RotatingTextProps {
  words: string[];
  /** ms each word stays on screen */
  interval?: number;
  /** applied to the visible word (e.g. gradient text classes) */
  className?: string;
}

/**
 * Cycles through words in place. Each swap is masked with a subtle blur
 * (Emil: blur bridges the visual gap so two states read as one), and the
 * widest word reserves the box width so surrounding text never reflows.
 */
export function RotatingText({ words, interval = 2200, className = "" }: RotatingTextProps) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || words.length <= 1) return;
    const id = setInterval(() => setI((p) => (p + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval, reduce]);

  const longest = words.reduce((a, b) => (a.length >= b.length ? a : b), "");

  return (
    <span className="relative inline-grid align-baseline">
      {/* Invisible spacer reserves width of the longest word — no reflow */}
      <span className={`invisible col-start-1 row-start-1 whitespace-nowrap ${className}`} aria-hidden>
        {longest}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[i]}
          initial={{ opacity: 0, y: "0.32em", filter: "blur(6px)" }}
          animate={{ opacity: 1, y: "0em", filter: "blur(0px)" }}
          exit={{ opacity: 0, y: "-0.32em", filter: "blur(6px)" }}
          transition={{ duration: 0.42, ease }}
          className={`col-start-1 row-start-1 justify-self-center whitespace-nowrap ${className}`}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
