"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { BackgroundDecor } from "@/components/background-decor";
import { Header } from "@/components/header";
import { SearchBox } from "@/components/search-box";
import { RecentSearches } from "@/components/recent-searches";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ResultDisplay } from "@/components/result-display";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { fetchInstagramUser, resolveOverviewFields } from "@/lib/api";
import type { ApiUserResponse } from "@/types/instagram";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ApiUserResponse | null>(null);
  const [activeUsername, setActiveUsername] = useState<string | null>(null);
  const { history, addSearch, removeSearch, clearHistory } = useSearchHistory();

  const handleSearch = useCallback(
    async (username: string) => {
      setIsLoading(true);
      setResult(null);
      setActiveUsername(username);

      try {
        const response = await fetchInstagramUser(username);
        setResult(response);

        const overviewFields = resolveOverviewFields(response.data);
        const avatarUrl = overviewFields.find(
          (f) => f.key === "profilePicHD" || f.key === "profilePic"
        )?.value;
        const fullName = overviewFields.find((f) => f.key === "fullName")?.value;

        addSearch({
          username,
          timestamp: Date.now(),
          success: response.success,
          avatarUrl: typeof avatarUrl === "string" ? avatarUrl : null,
          fullName: typeof fullName === "string" ? fullName : null,
        });

        if (response.success) {
          toast.success(`Loaded @${username}`, {
            description: `Responded in ${response.meta.responseTimeMs}ms`,
          });
        } else {
          toast.error(`Couldn't find @${username}`, {
            description: response.error ?? "Unknown error",
          });
        }
      } catch (err) {
        toast.error("Network error", {
          description: err instanceof Error ? err.message : "Failed to reach the server",
        });
        addSearch({ username, timestamp: Date.now(), success: false });
      } finally {
        setIsLoading(false);
      }
    },
    [addSearch]
  );

  return (
    <main className="relative min-h-screen">
      <BackgroundDecor />
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Header />

        <section className="pt-8 sm:pt-14 pb-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel text-xs text-fuchsia-300 mb-5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Powered by a secure server-side API proxy
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4"
          >
             Private  {" "}
            <span className="bg-clip-text text-transparent bg-ig-gradient">
              Instagram
            </span>{" "}
            
              Account
           {" "}
            Viewer
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 max-w-xl mx-auto mb-8"
          >
            Enter a public username to instantly explore followers, bio, media stats,
            business info, and every other field the API returns — automatically.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="max-w-xl mx-auto"
          >
            <SearchBox onSearch={handleSearch} isLoading={isLoading} />
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <RecentSearches
              history={history}
              onSelect={handleSearch}
              onRemove={removeSearch}
              onClear={clearHistory}
            />
          </div>
        </section>

        <AnimatePresence mode="wait">
          {isLoading && <LoadingSkeleton key="loading" />}
          {!isLoading && result && activeUsername && (
            <ResultDisplay key="result" result={result} username={activeUsername} />
          )}
        </AnimatePresence>

        <footer className="text-center text-xs text-slate-600 py-12 mt-8">
          Instagram User Lookup Pro — for lawful, public-data lookups only. Not
          affiliated with Instagram or Meta.
        </footer>
      </div>
    </main>
  );
}
