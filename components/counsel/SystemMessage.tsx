import { motion } from "framer-motion";

export function SystemMessage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center"
    >
      <div className="max-w-[90%] px-4 py-3 rounded-xl glass border border-white/10 text-center">
        <span className="inline-block text-[10px] uppercase tracking-wider text-white/35 mb-1.5">
          Automated
        </span>
        <p className="text-sm text-white/55 leading-relaxed">{children}</p>
      </div>
    </motion.div>
  );
}
