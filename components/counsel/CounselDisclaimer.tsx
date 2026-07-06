"use client";

import { Shield } from "lucide-react";

export function CounselDisclaimer({
  onDismiss,
  modal = false,
  banner = false,
}: {
  onDismiss: () => void;
  modal?: boolean;
  banner?: boolean;
}) {
  const text =
    "This is voluntary peer support from trained volunteers — not professional counselling or therapy. For emergencies, contact local crisis services (988 in the US).";

  if (banner) {
    return (
      <div className="shrink-0 px-4 py-2 bg-white/5 border-t border-white/8 text-[11px] text-white/45 text-center leading-relaxed">
        <Shield size={12} className="inline mr-1 -mt-0.5 opacity-60" />
        {text}
      </div>
    );
  }

  if (!modal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
      <div className="w-full max-w-md rounded-2xl glass border border-white/12 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={18} className="text-amber-300" />
          <h2 className="text-lg font-bold text-white">Before you continue</h2>
        </div>
        <p className="text-sm text-white/55 leading-relaxed mb-6">{text}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors press-scale"
        >
          I understand — continue
        </button>
      </div>
    </div>
  );
}
