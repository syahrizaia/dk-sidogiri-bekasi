"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  LayoutGrid,
  ArrowLeft,
  Compass,
  Sparkles,
} from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="relative w-full max-w-2xl rounded-[36px] liquid-glass-elevated border border-white/60 dark:border-white/10 p-8 sm:p-14 shadow-2xl text-center space-y-8 animate-in fade-in zoom-in-95 duration-400">
        {/* Arabic Calligraphy Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
          <span className="font-serif tracking-wide text-sm">٤٠٤ - صَفْحَةٌ غَيْرُ مَوْجُودَةٍ</span>
        </div>

        {/* 404 Large Display */}
        <div className="space-y-2">
          <h1 className="text-7xl sm:text-9xl font-black tracking-tighter text-gradient-emerald drop-shadow-sm select-none">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            Afwan, tautan yang Anda tuju mungkin telah dipindahkan, alamat URL tidak tepat, atau halaman sedang dalam pembaruan berkala.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-600 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-950/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Home size={16} />
            <span>Ke Beranda Utama</span>
          </Link>

          <Link
            href="/modules"
            className="px-6 py-3 rounded-full liquid-glass border border-white/60 dark:border-white/15 text-xs sm:text-sm font-semibold text-foreground hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer"
          >
            <LayoutGrid size={16} className="text-emerald-600 dark:text-emerald-400" />
            <span>Portal Modul</span>
          </Link>

          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-3 rounded-full liquid-glass border border-white/40 dark:border-white/10 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Halaman Sebelumnya</span>
          </button>
        </div>

        {/* Quick Links Suggestions */}
        <div className="pt-6 border-t border-white/15 dark:border-white/10 space-y-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Compass size={13} />
            <span>Tautan Populer Darul Khidmah Sidogiri Bekasi</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/about"
              className="px-3.5 py-1.5 rounded-full liquid-glass border border-white/30 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Tentang Kami
            </Link>
            <Link
              href="/institutions"
              className="px-3.5 py-1.5 rounded-full liquid-glass border border-white/30 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Madrasah Miftahul Ulum
            </Link>
            <Link
              href="/media"
              className="px-3.5 py-1.5 rounded-full liquid-glass border border-white/30 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Galeri Media
            </Link>
            <Link
              href="/admissions"
              className="px-3.5 py-1.5 rounded-full liquid-glass border border-white/30 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pendaftaran Santri Baru
            </Link>
            <Link
              href="/about#kontak"
              className="px-3.5 py-1.5 rounded-full liquid-glass border border-white/30 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
