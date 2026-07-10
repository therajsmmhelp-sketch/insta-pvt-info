import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format large numbers like 1234567 -> 1.2M */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Format a byte count into a human readable size string. */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(exponent === 0 ? 0 : 2)} ${units[exponent]}`;
}

/** Format milliseconds nicely (e.g. 850ms, 1.24s) */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Detect and format values that look like unix timestamps (seconds or ms)
 * or ISO date strings. Returns null if the value doesn't look like a date.
 */
export function tryFormatDate(value: unknown): string | null {
  if (typeof value === "number") {
    // Heuristic: 10-digit numbers are unix seconds, 13-digit are unix ms.
    const str = Math.trunc(value).toString();
    if (str.length === 10) {
      const date = new Date(value * 1000);
      if (!isNaN(date.getTime()) && date.getFullYear() > 2000 && date.getFullYear() < 2100) {
        return date.toLocaleString();
      }
    }
    if (str.length === 13) {
      const date = new Date(value);
      if (!isNaN(date.getTime()) && date.getFullYear() > 2000 && date.getFullYear() < 2100) {
        return date.toLocaleString();
      }
    }
    return null;
  }
  if (typeof value === "string") {
    // Only treat as date if it strongly resembles an ISO date string.
    const isoPattern = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?)?/;
    if (isoPattern.test(value)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString();
      }
    }
  }
  return null;
}

/** Basic check whether a string value looks like a URL. */
export function isUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Basic check whether a URL string looks like it points to an image. */
export function isImageUrl(value: unknown): value is string {
  if (!isUrl(value)) return false;
  const lower = value.toLowerCase();
  return (
    /\.(jpg|jpeg|png|gif|webp|avif)(\?|$)/.test(lower) ||
    lower.includes("cdninstagram") ||
    lower.includes("fbcdn") ||
    lower.includes("profile_pic")
  );
}

/** Convert a camelCase / snake_case key into Title Case for display. */
export function humanizeKey(key: string): string {
  const spaced = key
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
  return spaced
    .split(" ")
    .map((word) =>
      word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word
    )
    .join(" ");
}

/** Deeply search a JSON value's keys/values for a case-insensitive query match. */
export function jsonContainsQuery(value: unknown, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const visit = (val: unknown, keyPath: string): boolean => {
    if (keyPath.toLowerCase().includes(q)) return true;
    if (val === null || val === undefined) return false;
    if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
      return String(val).toLowerCase().includes(q);
    }
    if (Array.isArray(val)) {
      return val.some((item, idx) => visit(item, `${keyPath}[${idx}]`));
    }
    if (typeof val === "object") {
      return Object.entries(val as Record<string, unknown>).some(([k, v]) =>
        visit(v, k)
      );
    }
    return false;
  };
  return visit(value, "");
}

export function getValueByPath(obj: unknown, path: string): unknown {
  const parts = path.split(".").filter(Boolean);
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    const arrayMatch = part.match(/^(.*)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, key, idx] = arrayMatch;
      current = key
        ? (current as Record<string, unknown>)[key]
        : current;
      current = (current as unknown[])?.[Number(idx)];
    } else {
      current = (current as Record<string, unknown>)[part];
    }
  }
  return current;
}
