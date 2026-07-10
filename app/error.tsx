"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <AlertTriangle className="w-10 h-10 text-rose-400" />
      <h1 className="text-xl font-bold">Something went wrong</h1>
      <p className="text-slate-400 max-w-md text-sm">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-ig-gradient text-white text-sm font-semibold"
      >
        Try again
      </button>
    </div>
  );
}
