"use client";

import { motion } from "framer-motion";
import { Clock, Trash2, X, CheckCircle2, XCircle } from "lucide-react";
import type { SearchHistoryItem } from "@/types/instagram";
import { cn } from "@/lib/utils";

interface RecentSearchesProps {
  history: SearchHistoryItem[];
  onSelect: (username: string) => void;
  onRemove: (username: string) => void;
  onClear: () => void;
}

export function RecentSearches({
  history,
  onSelect,
  onRemove,
  onClear,
}: RecentSearchesProps) {
  if (history.length === 0) return null;

  return (
    <div className="w-full mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
          <Clock className="w-4 h-4" />
          Recent Searches
        </div>
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-400 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((item, idx) => (
          <motion.div
            key={item.username}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.03 }}
            className={cn(
              "group flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full text-sm glass-panel hover:border-fuchsia-500/40 transition-colors cursor-pointer"
            )}
            onClick={() => onSelect(item.username)}
          >
            {item.success ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            )}
            <span className="font-medium">@{item.username}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item.username);
              }}
              className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-opacity"
              aria-label={`Remove ${item.username} from history`}
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
