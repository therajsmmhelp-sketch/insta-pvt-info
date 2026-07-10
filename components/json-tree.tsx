"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ChevronsDown,
  ChevronsUp,
  Copy,
  Download,
  Search,
  X,
} from "lucide-react";
import type { JsonValue } from "@/types/instagram";
import { JsonTreeContext } from "./json-tree-context";
import { JsonNode } from "./json-node";
import { ImageModal } from "./image-modal";
import { cn } from "@/lib/utils";

interface JsonTreeProps {
  data: JsonValue;
  rootLabel?: string;
  filename?: string;
  className?: string;
  showToolbar?: boolean;
}

export function JsonTree({
  data,
  rootLabel = "root",
  filename = "instagram-user-data.json",
  className,
  showToolbar = true,
}: JsonTreeProps) {
  const [expandToken, setExpandToken] = useState(0);
  const [collapseToken, setCollapseToken] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalImage, setModalImage] = useState<{ url: string; label: string } | null>(
    null
  );

  const controls = useMemo(
    () => ({
      expandToken,
      collapseToken,
      searchQuery,
      onImageClick: (url: string, label: string) => setModalImage({ url, label }),
    }),
    [expandToken, collapseToken, searchQuery]
  );

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      toast.success("Full JSON copied to clipboard");
    } catch {
      toast.error("Failed to copy JSON");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("JSON file downloaded");
  };

  return (
    <JsonTreeContext.Provider value={controls}>
      <div className={cn("w-full", className)}>
        {showToolbar && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search inside JSON…"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-8 py-2 text-sm outline-none focus-ring focus:border-fuchsia-500/50 placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setExpandToken((t) => t + 1)}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <ChevronsDown className="w-3.5 h-3.5" />
              Expand All
            </button>
            <button
              onClick={() => setCollapseToken((t) => t + 1)}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <ChevronsUp className="w-3.5 h-3.5" />
              Collapse All
            </button>
            <button
              onClick={handleCopyAll}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy JSON
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-fuchsia-500/15 hover:bg-fuchsia-500/25 border border-fuchsia-500/30 text-fuchsia-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
        )}
        <div className="font-mono text-[13px] leading-relaxed rounded-xl border border-white/10 bg-black/20 p-3 max-h-[600px] overflow-auto">
          <JsonNode keyName={null} value={data} depth={0} path={rootLabel} />
        </div>
      </div>
      {modalImage && (
        <ImageModal
          url={modalImage.url}
          label={modalImage.label}
          onClose={() => setModalImage(null)}
        />
      )}
    </JsonTreeContext.Provider>
  );
}
