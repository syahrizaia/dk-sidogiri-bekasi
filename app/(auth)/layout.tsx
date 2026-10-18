import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6">
      {/* Minimal Top Brand Bar */}
      <header className="mx-auto max-w-7xl w-full flex items-center justify-between py-2">
        <Link 
          href="/" 
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden bg-white/95 dark:bg-emerald-950/90 p-0.5 shadow-md ring-1.5 ring-emerald-600/40 dark:ring-emerald-400/40 flex items-center justify-center shrink-0">
            <Image
              src="/logo-sidogiri.jpeg"
              alt="Logo Darul Khidmah Sidogiri Bekasi"
              width={36}
              height={36}
              priority
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              Darul Khidmah Sidogiri
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
              Bekasi
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 text-foreground transition-all"
        >
          <ArrowLeft size={13} />
          <span>Kembali ke Website</span>
        </Link>
      </header>

      {/* Auth Content */}
      <main className="flex-1 flex items-center justify-center w-full py-6">
        {children}
      </main>

      {/* Minimal Footer */}
      <footer className="text-center py-3 text-[11px] text-muted-foreground">
        © 2026 Darul Khidmah Sidogiri Bekasi. Khidmah Lil-Ma&apos;had Wal-Ummah.
      </footer>
    </div>
  );
}
