import { cn } from "@/lib/utils";

const variants = {
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  violet: "bg-violet-500/15 text-violet-300 border-violet-500/20",
  rose: "bg-rose-500/15 text-rose-300 border-rose-500/20",
  teal: "bg-teal-500/15 text-teal-300 border-teal-500/20",
  green: "bg-green-500/15 text-green-300 border-green-500/20",
  default: "bg-white/8 text-white/60 border-white/10",
} as const;

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}

export function StatusBadge({ children, variant = "default", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

const categoryColors: Record<string, keyof typeof variants> = {
  faith: "amber",
  prayer: "violet",
  life: "rose",
  bible: "teal",
  general: "default",
  off_topic: "default",
  other: "default",
};

export function CategoryBadge({ category }: { category: string }) {
  const label = category === "off_topic" ? "off-topic" : category;
  return (
    <StatusBadge variant={categoryColors[category] ?? "default"}>
      {label}
    </StatusBadge>
  );
}

const prayerStatusColors: Record<string, keyof typeof variants> = {
  active: "violet",
  updated: "amber",
  answered: "green",
  closed: "default",
};

export function PrayerStatusBadge({ status }: { status: string }) {
  return (
    <StatusBadge variant={prayerStatusColors[status] ?? "default"}>
      {status === "answered" ? "✓ Answered" : status}
    </StatusBadge>
  );
}
