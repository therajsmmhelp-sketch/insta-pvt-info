"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  UserCircle,
  Image as ImageIcon,
  Briefcase,
  Braces,
  Terminal,
  Timer,
  Database,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { ApiUserResponse } from "@/types/instagram";
import { Tabs, type TabItem } from "./tabs";
import { OverviewCard } from "./overview-card";
import { CategoryTab } from "./category-tab";
import { DeveloperPanel } from "./developer-panel";
import { JsonTree } from "./json-tree";
import { categorizeTopLevelFields } from "@/lib/categorize";
import { formatBytes, formatDuration, cn } from "@/lib/utils";

interface ResultDisplayProps {
  result: ApiUserResponse;
  username: string;
}

const TABS: TabItem[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "profile", label: "Profile", icon: UserCircle },
  { id: "media", label: "Media", icon: ImageIcon },
  { id: "business", label: "Business", icon: Briefcase },
  { id: "raw", label: "Raw JSON", icon: Braces },
  { id: "developer", label: "Developer", icon: Terminal },
];

export function ResultDisplay({ result, username }: ResultDisplayProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const categories = useMemo(
    () => categorizeTopLevelFields(result.data),
    [result.data]
  );

  const isSuccess = result.success && result.data !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full mt-8 space-y-4"
    >
      {/* Response summary bar */}
      <div className="glass-panel rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          {isSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400" />
          )}
          <span className={cn("font-semibold", isSuccess ? "text-emerald-400" : "text-rose-400")}>
            {result.meta.status} {result.meta.statusText}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Timer className="w-4 h-4" />
          {formatDuration(result.meta.responseTimeMs)}
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Database className="w-4 h-4" />
          {formatBytes(result.meta.sizeBytes)}
        </div>
        <div className="flex-1" />
        <span className="text-xs text-slate-500 font-mono">@{username}</span>
      </div>

      {!isSuccess ? (
        <div className="glass-panel rounded-2xl p-8 text-center">
          <XCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <p className="text-lg font-semibold text-rose-400 mb-1">Lookup failed</p>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {result.error ?? "The API did not return any data for this username."}
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-4 sm:p-6">
          <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
          <div className="mt-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
              >
                {activeTab === "overview" && <OverviewCard data={result.data!} />}
                {activeTab === "profile" && (
                  <CategoryTab
                    data={categories.profile}
                    rootLabel="profile"
                    emptyLabel="No profile-related fields were detected in this response."
                  />
                )}
                {activeTab === "media" && (
                  <CategoryTab
                    data={categories.media}
                    rootLabel="media"
                    emptyLabel="No media-related fields were detected in this response."
                  />
                )}
                {activeTab === "business" && (
                  <CategoryTab
                    data={categories.business}
                    rootLabel="business"
                    emptyLabel="No business-related fields were detected in this response."
                  />
                )}
                {activeTab === "raw" && (
                  <JsonTree
                    data={result.data!}
                    rootLabel="response"
                    filename={`instagram-${username}-raw.json`}
                  />
                )}
                {activeTab === "developer" && (
                  <DeveloperPanel meta={result.meta} username={username} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  );
}
