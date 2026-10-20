"use client";

import React from "react";
import { Download } from "lucide-react";

interface PrintButtonProps {
  label?: string;
  className?: string;
}

export function PrintButton({
  label = "Silabus Lengkap (PDF)",
  className = "hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-pill text-xs font-semibold text-foreground hover:bg-white/40 cursor-pointer active:scale-95 transition-all",
}: PrintButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={className}
      title="Cetak atau simpan sebagai PDF"
    >
      <Download size={13} />
      <span>{label}</span>
    </button>
  );
}
