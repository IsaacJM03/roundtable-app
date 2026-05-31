"use client";

import { createContext, useContext, useEffect } from "react";
import { useMotionValue, useSpring, type MotionValue } from "framer-motion";

interface MouseCtx {
  rawX: MotionValue<number>;
  rawY: MotionValue<number>;
  smoothX: MotionValue<number>;
  smoothY: MotionValue<number>;
}

const Ctx = createContext<MouseCtx | null>(null);

export function MouseProvider({ children }: { children: React.ReactNode }) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const smoothX = useSpring(rawX, { damping: 60, stiffness: 350, mass: 0.8 });
  const smoothY = useSpring(rawY, { damping: 60, stiffness: 350, mass: 0.8 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [rawX, rawY]);

  return <Ctx.Provider value={{ rawX, rawY, smoothX, smoothY }}>{children}</Ctx.Provider>;
}

export function useMouse() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMouse must be inside MouseProvider");
  return ctx;
}
