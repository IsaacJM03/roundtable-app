"use client";

import { motion, useMotionTemplate } from "framer-motion";
import { useMouse } from "./MouseProvider";

export function CursorGlow() {
  const { smoothX, smoothY } = useMouse();

  const bg = useMotionTemplate`radial-gradient(550px circle at ${smoothX}px ${smoothY}px, oklch(0.6 0.22 300 / 7%), transparent 65%)`;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-10 hidden lg:block"
      style={{ background: bg }}
      aria-hidden
    />
  );
}
