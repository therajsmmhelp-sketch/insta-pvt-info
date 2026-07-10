"use client";

import { motion } from "framer-motion";

export function LoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full glass-panel rounded-2xl p-6 mt-8"
    >
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full skeleton shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-1/3 rounded skeleton" />
          <div className="h-4 w-1/2 rounded skeleton" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl skeleton" />
        ))}
      </div>
      <div className="space-y-2 mt-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-4 rounded skeleton"
            style={{ width: `${85 - i * 10}%` }}
          />
        ))}
      </div>
    </motion.div>
  );
}
