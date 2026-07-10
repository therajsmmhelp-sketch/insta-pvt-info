"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { SearchHistoryItem } from "@/types/instagram";

const STORAGE_KEY = "ig-lookup:recent-searches";
const MAX_ITEMS = 12;

export function useSearchHistory() {
  const [history, setHistory, isHydrated] = useLocalStorage<SearchHistoryItem[]>(
    STORAGE_KEY,
    []
  );

  const addSearch = useCallback(
    (item: SearchHistoryItem) => {
      setHistory((prev) => {
        const withoutDuplicate = prev.filter(
          (h) => h.username.toLowerCase() !== item.username.toLowerCase()
        );
        return [item, ...withoutDuplicate].slice(0, MAX_ITEMS);
      });
    },
    [setHistory]
  );

  const removeSearch = useCallback(
    (username: string) => {
      setHistory((prev) =>
        prev.filter((h) => h.username.toLowerCase() !== username.toLowerCase())
      );
    },
    [setHistory]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  return { history, addSearch, removeSearch, clearHistory, isHydrated };
}
