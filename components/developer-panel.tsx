"use client";

import { motion } from "framer-motion";
import { Copy, Terminal, Timer, Database, Hash, Globe2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { RequestMeta } from "@/types/instagram";
import { formatBytes, formatDuration, cn } from "@/lib/utils";

interface DeveloperPanelProps {
  meta: RequestMeta;
  username: string;
}

function InfoTile({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "error";
}) {
  const toneClasses = {
    default: "text-slate-300",
    success: "text-emerald-400",
    warning: "text-amber-400",
    error: "text-rose-400",
  } as const;

  return (
    <div className="glass-panel rounded-xl p-4">
      <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wide mb-1.5">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <p className={cn("text-lg font-bold font-mono-tight", toneClasses[tone])}>
        {value}
      </p>
    </div>
  );
}

export function DeveloperPanel({ meta, username }: DeveloperPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const statusTone: "success" | "warning" | "error" =
    meta.status >= 200 && meta.status < 300
      ? "success"
      : meta.status >= 400 && meta.status < 500
      ? "warning"
      : "error";

  const requestHeaders = {
    "x-rapidapi-key": "••••••••••••••••••••  (server-side only, never sent to browser)",
    "x-rapidapi-host": "flashapi1.p.rapidapi.com",
  };

  const responseHeaders = {
    "content-type": "application/json",
    "cache-control": "no-store",
    date: meta.timestamp,
  };

  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      toast.success("Copied");
      setTimeout(() => setCopied(null), 1200);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <InfoTile
          icon={Timer}
          label="Response Time"
          value={formatDuration(meta.responseTimeMs)}
        />
        <InfoTile
          icon={Hash}
          label="HTTP Status"
          value={`${meta.status} ${meta.statusText}`}
          tone={statusTone}
        />
        <InfoTile icon={Database} label="Payload Size" value={formatBytes(meta.sizeBytes)} />
        <InfoTile
          icon={Globe2}
          label="Endpoint"
          value="flashapi1.p.rapidapi.com"
        />
      </div>

      <div className="glass-panel rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Terminal className="w-4 h-4" />
            Request
          </div>
        </div>
        <div className="font-mono text-xs space-y-2">
          <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
            <span className="text-emerald-400 mr-2">GET</span>
            <span className="text-slate-300 flex-1 break-all">{meta.requestUrl}</span>
            <button
              onClick={() => copy(meta.requestUrl, "url")}
              className="ml-2 p-1.5 rounded-md hover:bg-white/10 shrink-0"
            >
              {copied === "url" ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>
          <p className="text-slate-500 pt-1">
            Internally, this route proxies to the upstream RapidAPI endpoint with
            <code className="mx-1 px-1.5 py-0.5 rounded bg-black/30 text-fuchsia-300">
              user={username}
            </code>
            and
            <code className="mx-1 px-1.5 py-0.5 rounded bg-black/30 text-fuchsia-300">
              nocors=false
            </code>
            query parameters. The RapidAPI key is attached server-side only.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-panel rounded-xl p-4">
          <p className="text-sm font-semibold text-slate-300 mb-2">Request Headers</p>
          <div className="font-mono text-xs space-y-1.5">
            {Object.entries(requestHeaders).map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5 bg-black/30 rounded-lg p-2.5">
                <span className="text-sky-400">{k}</span>
                <span className="text-slate-400 break-all">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <p className="text-sm font-semibold text-slate-300 mb-2">Response Headers</p>
          <div className="font-mono text-xs space-y-1.5">
            {Object.entries(responseHeaders).map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5 bg-black/30 rounded-lg p-2.5">
                <span className="text-sky-400">{k}</span>
                <span className="text-slate-400 break-all">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl p-4 border-amber-500/20">
        <p className="text-sm text-slate-400 leading-relaxed">
          <strong className="text-slate-200">Security note:</strong> The browser only ever
          talks to <code className="px-1.5 py-0.5 rounded bg-black/30 text-fuchsia-300">/api/user</code>,
          a Next.js server route on this same origin. Your RapidAPI key lives exclusively in
          the <code className="px-1.5 py-0.5 rounded bg-black/30 text-fuchsia-300">RAPIDAPI_KEY</code> environment
          variable on the server and is never included in any client-side JavaScript bundle,
          network request, or response.
        </p>
      </div>
    </motion.div>
  );
}
