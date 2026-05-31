"use client";

import { motion, useTransform } from "framer-motion";
import { useMouse } from "./MouseProvider";

export function AnimatedBackground() {
  const { smoothX, smoothY } = useMouse();

  // Each orb is at a different depth — further = less movement
  const vx = useTransform(smoothX, [0, 1440], [-55, 55]);
  const vy = useTransform(smoothY, [0, 900],  [-40, 40]);

  const ax = useTransform(smoothX, [0, 1440], [70, -70]);
  const ay = useTransform(smoothY, [0, 900],  [50, -50]);

  const rx = useTransform(smoothX, [0, 1440], [-22, 22]);
  const ry = useTransform(smoothY, [0, 900],  [-16, 16]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* Violet — deep layer */}
      <motion.div
        className="orb absolute -top-40 -left-40 w-[600px] h-[600px]"
        style={{ background: "oklch(0.6 0.22 300 / 15%)", x: vx, y: vy }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Amber — mid layer */}
      <motion.div
        className="orb absolute -bottom-60 -right-40 w-[700px] h-[700px]"
        style={{ background: "oklch(0.78 0.18 60 / 12%)", x: ax, y: ay }}
        animate={{ scale: [1, 1.09, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      {/* Rose — shallow layer, snappier */}
      <motion.div
        className="orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px]"
        style={{ background: "oklch(0.65 0.24 15 / 7%)", x: rx, y: ry }}
        animate={{ scale: [1, 1.13, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
    </div>
  );
}
