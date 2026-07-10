"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, Download, RotateCw } from "lucide-react";
import { toast } from "sonner";

interface ImageModalProps {
  url: string;
  label?: string;
  onClose: () => void;
}

export function ImageModal({ url, label = "Image", onClose }: ImageModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 0.25, 4));
      if (e.key === "-") setZoom((z) => Math.max(z - 0.25, 0.5));
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleDownloadImage = async () => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${label.replace(/\s+/g, "-").toLowerCase()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success("Image downloaded");
    } catch {
      window.open(url, "_blank");
      toast.info("Opened image in a new tab (direct download blocked by CORS)");
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 260 }}
          className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-slate-300 truncate max-w-[70%]">{label}</p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRotation((r) => r + 90)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Rotate"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownloadImage}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Download image"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/10 hover:bg-rose-500/40 text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="overflow-auto rounded-xl border border-white/10 bg-black/30 max-h-[70vh] flex items-center justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={label}
              className="max-w-full transition-transform duration-200 select-none"
              style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
              draggable={false}
            />
          </div>
          <p className="text-xs text-slate-500">
            Scroll wheel not required — use +/- keys or the buttons above. Press Esc to
            close.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
