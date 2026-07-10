"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 -mb-1 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0",
              isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab-bg"
                className="absolute inset-0 bg-ig-gradient rounded-lg -z-10"
                transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
              />
            )}
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
