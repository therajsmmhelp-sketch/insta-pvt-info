"use client";

import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return <div className="w-10 h-10 rounded-xl glass-panel" />;
  }

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center hover:border-fuchsia-500/40 transition-colors"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      {theme === "dark" ? (
        <Sun className="w-4.5 h-4.5 text-amber-400" />
      ) : (
        <Moon className="w-4.5 h-4.5 text-indigo-400" />
      )}
    </motion.button>
  );
}
