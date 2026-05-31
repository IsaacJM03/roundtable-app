"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  animate,
} from "framer-motion";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  spotRadius?: number;
}

export function TiltCard({
  children,
  className = "",
  maxTilt = 7,
  spotRadius = 180,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hoverProgress = useMotionValue(0);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [maxTilt, -maxTilt]), {
    stiffness: 450,
    damping: 32,
  });
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-maxTilt, maxTilt]), {
    stiffness: 450,
    damping: 32,
  });

  const spotX = useMotionValue(200);
  const spotY = useMotionValue(200);

  const spotBg = useMotionTemplate`radial-gradient(${String(spotRadius)}px circle at ${spotX}px ${spotY}px, oklch(1 0 0 / 7%), transparent 70%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
    spotX.set(e.clientX - rect.left);
    spotY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = () => animate(hoverProgress, 1, { duration: 0.18 });
  const handleMouseLeave = () => {
    animate(hoverProgress, 0, { duration: 0.28 });
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Spotlight overlay — rides on top of card content */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] z-20 mix-blend-plus-lighter"
        style={{ background: spotBg, opacity: hoverProgress }}
      />
      {children}
    </motion.div>
  );
}
