"use client";

import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Copy, Check, Image as ImageIcon, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { JsonValue } from "@/types/instagram";
import {
  cn,
  formatCompactNumber,
  humanizeKey,
  isImageUrl,
  isUrl,
  jsonContainsQuery,
  tryFormatDate,
} from "@/lib/utils";
import { useJsonTreeControls } from "./json-tree-context";

interface JsonNodeProps {
  keyName: string | number | null;
  value: JsonValue;
  depth: number;
  isLast?: boolean;
  path: string;
}

function CopyIconButton({ value, small = false }: { value: unknown; small?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity rounded-md hover:bg-white/10 text-slate-400 hover:text-slate-100",
        small ? "p-1" : "p-1.5"
      )}
      aria-label="Copy value"
      title="Copy value"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

function PrimitiveValue({ value }: { value: JsonValue }) {
  const { onImageClick } = useJsonTreeControls();

  if (value === null) {
    return <span className="json-null italic">null</span>;
  }

  if (typeof value === "boolean") {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border",
          value
            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
            : "bg-rose-500/15 text-rose-400 border-rose-500/30"
        )}
      >
        {value ? "TRUE" : "FALSE"}
      </span>
    );
  }

  if (typeof value === "number") {
    const dateGuess = tryFormatDate(value);
    return (
      <span className="json-number font-mono-tight">
        {new Intl.NumberFormat("en-US").format(value)}
        {Math.abs(value) >= 1000 && (
          <span className="text-slate-500 ml-1.5 text-xs">
            (~{formatCompactNumber(value)})
          </span>
        )}
        {dateGuess && (
          <span className="text-slate-500 ml-1.5 text-xs">· {dateGuess}</span>
        )}
      </span>
    );
  }

  if (typeof value === "string") {
    if (isImageUrl(value)) {
      return (
        <span className="inline-flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onImageClick(value, "Image")}
            className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 underline decoration-dotted underline-offset-4 break-all text-left"
          >
            <ImageIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="break-all">{value}</span>
          </button>
        </span>
      );
    }
    if (isUrl(value)) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 underline decoration-dotted underline-offset-4 break-all"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          <span className="break-all">{value}</span>
        </a>
      );
    }
    const dateGuess = tryFormatDate(value);
    return (
      <span className="json-string break-all">
        &quot;{value}&quot;
        {dateGuess && <span className="text-slate-500 ml-1.5 text-xs">· {dateGuess}</span>}
      </span>
    );
  }

  return null;
}

function JsonNodeInner({ keyName, value, depth, path }: JsonNodeProps) {
  const { expandToken, collapseToken, searchQuery } = useJsonTreeControls();
  const isContainer =
    value !== null && typeof value === "object";
  const isArray = Array.isArray(value);
  const entries: [string | number, JsonValue][] = isContainer
    ? isArray
      ? (value as JsonValue[]).map((v, i) => [i, v])
      : Object.entries(value as Record<string, JsonValue>)
    : [];

  const [expanded, setExpanded] = useState(depth < 1);

  useEffect(() => {
    if (expandToken > 0) setExpanded(true);
  }, [expandToken]);

  useEffect(() => {
    if (collapseToken > 0) setExpanded(depth === 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapseToken]);

  if (searchQuery && !jsonContainsQuery(value, searchQuery) && !humanizeKeyMatches(keyName, searchQuery)) {
    return null;
  }

  const displayKey = keyName === null ? null : isArray ? null : humanizeKey(String(keyName));
  const rawKey = keyName === null ? null : String(keyName);

  if (!isContainer) {
    return (
      <div
        className={cn(
          "group flex items-start gap-2 py-1 pl-2 rounded-md hover:bg-white/5 transition-colors",
        )}
        style={{ marginLeft: depth * 16 }}
      >
        <div className="flex-1 min-w-0 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
          {displayKey !== null && (
            <span className="json-key font-medium shrink-0" title={rawKey ?? undefined}>
              {displayKey}:
            </span>
          )}
          <PrimitiveValue value={value} />
        </div>
        <CopyIconButton value={value} small />
      </div>
    );
  }

  const isEmpty = entries.length === 0;
  const badge = isArray ? `Array(${entries.length})` : `Object{${entries.length}}`;

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full group flex items-center gap-1.5 py-1 pl-2 pr-2 rounded-md hover:bg-white/5 transition-colors text-left"
        style={{ marginLeft: depth * 16 }}
        disabled={isEmpty}
      >
        <ChevronRight
          className={cn(
            "w-3.5 h-3.5 shrink-0 text-slate-500 transition-transform",
            expanded && !isEmpty && "rotate-90",
            isEmpty && "opacity-0"
          )}
        />
        {displayKey !== null ? (
          <span className="json-key font-medium text-sm" title={rawKey ?? undefined}>
            {displayKey}
          </span>
        ) : (
          <span className="text-slate-500 text-sm font-mono">[{keyName}]</span>
        )}
        <span className="text-xs text-slate-500 font-mono">{badge}</span>
        <span className="flex-1" />
        {!isEmpty && <CopyIconButton value={value} small />}
      </button>
      <AnimatePresence initial={false}>
        {expanded && !isEmpty && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="overflow-hidden border-l border-white/5"
            style={{ marginLeft: depth * 16 + 10 }}
          >
            <div className="py-0.5">
              {entries.map(([k, v]) => (
                <JsonNode
                  key={`${path}.${k}`}
                  keyName={k}
                  value={v}
                  depth={depth + 1}
                  path={`${path}.${k}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function humanizeKeyMatches(keyName: string | number | null, query: string) {
  if (keyName === null) return false;
  return String(keyName).toLowerCase().includes(query.toLowerCase());
}

export const JsonNode = memo(JsonNodeInner);
