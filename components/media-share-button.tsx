"use client";

import React, { useState } from "react";
import { Share2, Check } from "lucide-react";

interface MediaShareButtonProps {
  title: string;
  description?: string;
}

export function MediaShareButton({ title, description }: MediaShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} | Darul Khidmah Sidogiri Bekasi`,
          text: description || title,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${title} - ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 text-foreground text-xs font-semibold shadow-sm transition-all duration-300 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      aria-label="Bagikan dokumentasi ini"
      title="Bagikan tautan dokumentasi"
    >
      {copied ? (
        <>
          <Check size={14} className="text-emerald-500" />
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Tautan Tersalin!</span>
        </>
      ) : (
        <>
          <Share2 size={14} className="text-emerald-600 dark:text-emerald-400" />
          <span>Bagikan</span>
        </>
      )}
    </button>
  );
}
