"use client";

import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="w-full flex items-center justify-between py-6">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-ig-gradient flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
          <Instagram className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-base sm:text-lg leading-tight">
            Instagram Private Account Viewer 
          </h1>
          <p className="text-xs text-slate-400 leading-tight">
            Every public field, rendered automatically
          </p>
        </div>
      </motion.div>
      <ThemeToggle />
    </header>
  );
}
