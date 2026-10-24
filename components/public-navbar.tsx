"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { 
  UserPlus, 
  Menu, 
  X, 
  ChevronDown, 
  BookOpen, 
  Sun, 
  Moon,
  School,
  Building2,
  Compass,
  LogIn,
  Image as ImageIcon,
  ScrollText,
  Award,
  Users,
  GraduationCap,
  MapPin,
  Sparkles
} from "lucide-react";

const emptySubscribe = () => () => {};

export function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isInstansiOpen, setIsInstansiOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [mobileAboutExpanded, setMobileAboutExpanded] = useState(true);
  const closeInstansiTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const closeAboutTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();

  const handleInstansiEnter = () => {
    if (closeInstansiTimeoutRef.current) {
      clearTimeout(closeInstansiTimeoutRef.current);
      closeInstansiTimeoutRef.current = null;
    }
    setIsAboutOpen(false);
    setIsInstansiOpen(true);
  };

  const handleInstansiLeave = () => {
    if (closeInstansiTimeoutRef.current) {
      clearTimeout(closeInstansiTimeoutRef.current);
    }
    closeInstansiTimeoutRef.current = setTimeout(() => {
      setIsInstansiOpen(false);
    }, 220);
  };

  const handleAboutEnter = () => {
    if (closeAboutTimeoutRef.current) {
      clearTimeout(closeAboutTimeoutRef.current);
      closeAboutTimeoutRef.current = null;
    }
    setIsInstansiOpen(false);
    setIsAboutOpen(true);
  };

  const handleAboutLeave = () => {
    if (closeAboutTimeoutRef.current) {
      clearTimeout(closeAboutTimeoutRef.current);
    }
    closeAboutTimeoutRef.current = setTimeout(() => {
      setIsAboutOpen(false);
    }, 220);
  };

  const isDark = mounted ? (theme === "dark" || resolvedTheme === "dark") : false;

  const toggleTheme = () => {
    if (!mounted) return;
    setTheme(isDark ? "light" : "dark");
  };

  const isCurrent = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-3 sm:top-4 mx-auto max-w-7xl w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] z-50 transition-all duration-400">
      {/* Floating Apple Liquid Capsule Container */}
      <nav 
        aria-label="Navigasi Publik" 
        className="liquid-glass-elevated rounded-full px-3.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between shadow-2xl"
      >
        {/* Logo & Identitas: Darul Khidmah Sidogiri lalu Bekasi */}
        <Link 
          href="/" 
          className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full pr-1 min-w-0"
        >
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-white/95 dark:bg-emerald-950/90 p-0.5 shadow-md shadow-emerald-950/25 ring-2 ring-emerald-600/40 dark:ring-emerald-400/40 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center shrink-0">
            <Image
              src="/logo-sidogiri.jpeg"
              alt="Logo Resmi Darul Khidmah Sidogiri Bekasi"
              width={40}
              height={40}
              priority
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-xs sm:text-sm tracking-tight text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate">
                Darul Khidmah Sidogiri
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 shrink-0">
                Bekasi
              </span>
            </div>
            <p className="hidden xs:block text-[10px] text-muted-foreground tracking-wider uppercase font-medium truncate">
              Madrasah Miftahul Ulum & TPQ
            </p>
          </div>
        </Link>

        {/* Desktop Menu Navigation (Khusus Pengunjung Publik) */}
        <div className="hidden lg:flex items-center gap-1 bg-white/20 dark:bg-black/15 p-1 rounded-full border border-white/25 dark:border-white/5">
          <Link 
            href="/" 
            className={`text-xs font-medium px-4 py-1.5 rounded-full transition-all duration-200 ${
              isCurrent("/") 
                ? "bg-white/60 dark:bg-white/15 text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm" 
                : "text-foreground/85 hover:text-foreground hover:bg-white/50 dark:hover:bg-white/10"
            }`}
          >
            Beranda
          </Link>

          {/* Dropdown Tentang Kami Khas Sidogiri */}
          <div 
            className="relative"
            onMouseEnter={handleAboutEnter}
            onMouseLeave={handleAboutLeave}
          >
            <Link
              href="/about"
              onClick={() => setIsAboutOpen(false)}
              className={`text-xs font-medium px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                isCurrent("/about") 
                  ? "bg-white/60 dark:bg-white/15 text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm" 
                  : "text-foreground/85 hover:text-foreground hover:bg-white/50 dark:hover:bg-white/10"
              }`}
            >
              <span>Tentang Kami</span>
              <ChevronDown 
                size={13} 
                className={`opacity-60 transition-transform duration-300 ${
                  isAboutOpen ? "rotate-180 text-emerald-600 dark:text-emerald-400" : ""
                }`} 
              />
            </Link>

            {/* Gapless Bridge + Liquid Glass Submenu Dropdown */}
            <div 
              className={`absolute top-full left-0 pt-2 w-72 z-50 origin-top-left transition-all duration-300 ease-out ${
                isAboutOpen 
                  ? "opacity-100 scale-100 pointer-events-auto translate-y-0" 
                  : "opacity-0 scale-95 pointer-events-none -translate-y-1"
              }`}
            >
              <div className="rounded-2xl liquid-glass-elevated p-2.5 shadow-2xl border border-white/60 dark:border-white/10">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 mb-1.5 flex items-center justify-between">
                  <span>Profil & Lembaga</span>
                  <Link 
                    href="/about" 
                    onClick={() => setIsAboutOpen(false)}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline text-[10px]"
                  >
                    Selengkapnya
                  </Link>
                </div>

                <Link 
                  href="/about#profile" 
                  onClick={() => setIsAboutOpen(false)}
                  className="flex items-center gap-2.5 text-xs p-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <ScrollText size={13} />
                  </div>
                  <div>
                    <p className="font-semibold leading-tight">Profil & Sejarah 1745 M</p>
                    <p className="text-[10px] text-muted-foreground">Sanad Salaf Sayyid Sulaiman</p>
                  </div>
                </Link>

                <Link 
                  href="/about#vision-mission" 
                  onClick={() => setIsAboutOpen(false)}
                  className="flex items-center gap-2.5 text-xs p-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                    <Award size={13} />
                  </div>
                  <div>
                    <p className="font-semibold leading-tight">Visi, Misi & Panca Jiwa</p>
                    <p className="text-[10px] text-muted-foreground">Fondasi Karakter Santri</p>
                  </div>
                </Link>

                <Link 
                  href="/about#organization" 
                  onClick={() => setIsAboutOpen(false)}
                  className="flex items-center gap-2.5 text-xs p-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Users size={13} />
                  </div>
                  <div>
                    <p className="font-semibold leading-tight">Struktur Organisasi</p>
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">Pengurus & Pimpinan Unit</p>
                  </div>
                </Link>

                <Link 
                  href="/about#teachers" 
                  onClick={() => setIsAboutOpen(false)}
                  className="flex items-center gap-2.5 text-xs p-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <GraduationCap size={13} />
                  </div>
                  <div>
                    <p className="font-semibold leading-tight">Dewan Asatidz & Pengajar</p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Tahun Ajaran Sekarang</p>
                  </div>
                </Link>

                <Link 
                  href="/about#contact" 
                  onClick={() => setIsAboutOpen(false)}
                  className="flex items-center gap-2.5 text-xs p-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors border-t border-border/30 mt-1 pt-1.5"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <MapPin size={13} />
                  </div>
                  <div>
                    <p className="font-semibold leading-tight">Kontak & Lokasi Pesantren</p>
                    <p className="text-[10px] text-muted-foreground">Kranji, Bekasi Barat</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Dropdown Instansi Khas Sidogiri */}
          <div 
            className="relative"
            onMouseEnter={handleInstansiEnter}
            onMouseLeave={handleInstansiLeave}
          >
            <Link
              href="/institutions"
              onClick={() => setIsInstansiOpen(false)}
              className={`text-xs font-medium px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                isCurrent("/institutions") 
                  ? "bg-white/60 dark:bg-white/15 text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm" 
                  : "text-foreground/85 hover:text-foreground hover:bg-white/50 dark:hover:bg-white/10"
              }`}
            >
              <School size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Unit Pendidikan</span>
              <ChevronDown 
                size={13} 
                className={`opacity-60 transition-transform duration-300 ${
                  isInstansiOpen ? "rotate-180 text-emerald-600 dark:text-emerald-400" : ""
                }`} 
              />
            </Link>

            {/* Gapless Bridge + Liquid Glass Submenu Dropdown */}
            <div 
              className={`absolute top-full left-0 pt-2 w-64 z-50 origin-top-left transition-all duration-300 ease-out ${
                isInstansiOpen 
                  ? "opacity-100 scale-100 pointer-events-auto translate-y-0" 
                  : "opacity-0 scale-95 pointer-events-none -translate-y-1"
              }`}
            >
              <div className="rounded-2xl liquid-glass-elevated p-2.5 shadow-2xl border border-white/60 dark:border-white/10">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 mb-1.5 flex items-center justify-between">
                  <span>Lembaga Pendidikan</span>
                  <Link 
                    href="/institutions" 
                    onClick={() => setIsInstansiOpen(false)}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline text-[10px]"
                  >
                    Lihat Semua
                  </Link>
                </div>
                <Link 
                  href="/institutions/mi" 
                  onClick={() => setIsInstansiOpen(false)}
                  className="flex items-center gap-2.5 text-xs p-2.5 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <BookOpen size={13} />
                  </div>
                  <div>
                    <p className="font-semibold leading-tight">Madrasah Ibtidaiyah (MI)</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Beroperasi Aktif</p>
                  </div>
                </Link>
                <Link 
                  href="/institutions/mts" 
                  onClick={() => setIsInstansiOpen(false)}
                  className="flex items-center gap-2.5 text-xs p-2.5 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-600 dark:text-teal-400">
                    <Building2 size={13} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold leading-tight">Madrasah Tsanawiyah (MTs)</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300">Segera</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Buka Tahun Ajaran Depan</p>
                  </div>
                </Link>
                <Link 
                  href="/institutions/tpq" 
                  onClick={() => setIsInstansiOpen(false)}
                  className="flex items-center gap-2.5 text-xs p-2.5 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Compass size={13} />
                  </div>
                  <div>
                    <p className="font-semibold leading-tight">TPQ Al-Qur&apos;an</p>
                    <p className="text-[10px] text-muted-foreground">Metode Tartil Sidogiri</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <Link 
            href="/media" 
            className={`text-xs font-medium px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
              isCurrent("/media") 
                ? "bg-white/60 dark:bg-white/15 text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm" 
                : "text-foreground/85 hover:text-foreground hover:bg-white/50 dark:hover:bg-white/10"
            }`}
          >
            <ImageIcon size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>Media & Galeri</span>
          </Link>
        </div>

        {/* Action Controls & Theme Switcher */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Apple Liquid Glass Theme Switcher */}
          <button 
            type="button"
            onClick={toggleTheme}
            className="relative p-2.5 rounded-full liquid-glass-pill hover:bg-white/30 dark:hover:bg-white/10 text-foreground transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Beralih Tema Light / Dark Mode"
            title={isDark ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
          >
            {mounted ? (
              isDark ? (
                <Sun size={17} className="text-amber-400 animate-in spin-in-90 duration-300" />
              ) : (
                <Moon size={17} className="text-emerald-700 animate-in spin-in-90 duration-300" />
              )
            ) : (
              <div className="w-[17px] h-[17px] opacity-0" />
            )}
          </button>

          {/* Login Portal Link */}
          <Link 
            href="/auth/login"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold liquid-glass-pill hover:bg-white/50 dark:hover:bg-white/10 text-foreground transition-all duration-300"
          >
            <LogIn size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>Masuk Portal</span>
          </Link>
            
          {/* Liquid Sheen CTA Button */}
          <Link 
            href="/admissions"
            className="liquid-sheen relative flex items-center gap-2 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg shadow-emerald-900/15 hover:shadow-emerald-700/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus size={14} className="stroke-[2.5]" />
            <span>Santri Baru</span>
          </Link>
        </div>

        {/* Mobile Action & Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button 
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full liquid-glass-pill text-foreground transition-all"
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun size={16} className="text-amber-400" />
            ) : (
              <Moon size={16} className="text-emerald-700" />
            )}
          </button>

          <button 
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-full liquid-glass-pill text-foreground transition-colors cursor-pointer"
            aria-label={isOpen ? "Tutup Menu" : "Buka Menu"}
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer (Liquid Glass Sheet) */}
      {isOpen && (
        <div className="sm:hidden mx-1 mt-2.5 rounded-3xl liquid-glass-elevated p-4 space-y-3 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="space-y-1">
            <Link 
              href="/" 
              onClick={() => setIsOpen(false)}
              className="block text-xs font-medium p-2.5 rounded-2xl hover:bg-emerald-500/10 text-foreground transition-colors"
            >
              Beranda Utama
            </Link>
            {/* Tentang Kami Collapsible / Sub-menu */}
            <div>
              <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-emerald-500/10 transition-colors">
                <Link 
                  href="/about" 
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-semibold text-foreground flex-1"
                >
                  Tentang Kami & Profil
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileAboutExpanded(!mobileAboutExpanded)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                  aria-label="Toggle Tentang Kami Submenu"
                >
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${mobileAboutExpanded ? "rotate-180 text-emerald-600" : ""}`}
                  />
                </button>
              </div>

              {mobileAboutExpanded && (
                <div className="pl-3.5 space-y-1 mt-1 border-l border-emerald-500/30 ml-2">
                  <Link
                    href="/about#profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-[11px] p-2 rounded-xl text-foreground/80 hover:text-foreground hover:bg-emerald-500/10 transition-colors"
                  >
                    <ScrollText size={12} className="text-emerald-600" />
                    <span>Profil & Sejarah 1745 M</span>
                  </Link>
                  <Link
                    href="/about#vision-mission"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-[11px] p-2 rounded-xl text-foreground/80 hover:text-foreground hover:bg-emerald-500/10 transition-colors"
                  >
                    <Award size={12} className="text-teal-600" />
                    <span>Visi, Misi & Panca Jiwa</span>
                  </Link>
                  <Link
                    href="/about#organization"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-[11px] p-2 rounded-xl text-foreground/80 hover:text-foreground hover:bg-emerald-500/10 transition-colors"
                  >
                    <Users size={12} className="text-indigo-600" />
                    <span>Struktur Organisasi Ranting</span>
                  </Link>
                  <Link
                    href="/about#teachers"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-[11px] p-2 rounded-xl text-foreground/80 hover:text-foreground hover:bg-emerald-500/10 transition-colors"
                  >
                    <GraduationCap size={12} className="text-amber-600" />
                    <span>Dewan Asatidz & Pengajar TA Sekarang</span>
                  </Link>
                  <Link
                    href="/about#contact"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-[11px] p-2 rounded-xl text-foreground/80 hover:text-foreground hover:bg-emerald-500/10 transition-colors"
                  >
                    <MapPin size={12} className="text-emerald-600" />
                    <span>Kontak & Lokasi Pesantren</span>
                  </Link>
                </div>
              )}
            </div>
            <Link 
              href="/media" 
              onClick={() => setIsOpen(false)}
              className="block text-xs font-medium p-2.5 rounded-2xl hover:bg-emerald-500/10 text-foreground transition-colors"
            >
              Media & Galeri Kegiatan
            </Link>
            <div className="border-t border-border/40 my-1.5" />
            
            <p className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground px-2 pt-1">
              Unit Pendidikan Darul Khidmah Sidogiri Bekasi
            </p>
            <Link 
              href="/institutions/mi" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-xs p-2.5 rounded-2xl hover:bg-emerald-500/10 text-foreground/90 pl-3 transition-colors"
            >
              <BookOpen size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>Madrasah Ibtidaiyah (MI) - Aktif</span>
            </Link>
            <Link 
              href="/institutions/mts" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-xs p-2.5 rounded-2xl hover:bg-emerald-500/10 text-foreground/90 pl-3 transition-colors"
            >
              <Building2 size={14} className="text-teal-600 dark:text-teal-400" />
              <span>Madrasah Tsanawiyah (MTs) - Tahun Depan</span>
            </Link>
            <Link 
              href="/institutions/tpq" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-xs p-2.5 rounded-2xl hover:bg-emerald-500/10 text-foreground/90 pl-3 transition-colors"
            >
              <Compass size={14} className="text-amber-600 dark:text-amber-400" />
              <span>TPQ Al-Qur&apos;an Sidogiri</span>
            </Link>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <Link 
              href="/auth/login"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 text-foreground p-2.5 rounded-full text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <LogIn size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>Masuk Portal</span>
            </Link>
            <Link 
              href="/admissions"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-600 text-white p-2.5 rounded-full text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <UserPlus size={14} />
              <span>Pendaftaran Santri Baru</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
export default PublicNavbar;
