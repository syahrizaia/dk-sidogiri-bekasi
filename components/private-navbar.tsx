"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { getCurrentUserAction, logoutAction } from "@/lib/actions/auth";
import { 
  Menu, 
  X, 
  Sun, 
  Moon,
  LayoutGrid,
  Users,
  UserCheck,
  HeartHandshake,
  BedDouble,
  Image as ImageIcon,
  UserCog,
  Sparkles,
  Settings,
  LogOut,
  ShieldCheck,
  User
} from "lucide-react";

const emptySubscribe = () => () => {};

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function PrivateNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    getCurrentUserAction()
      .then((userSession) => {
        if (userSession) {
          setUser(userSession);
        }
      })
      .catch((err) => {
        console.error("Gagal membaca sesi user:", err);
      });
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logoutAction();
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      router.push("/auth/login");
      router.refresh();
    }
  };

  const isDark = mounted ? (theme === "dark" || resolvedTheme === "dark") : false;

  const toggleTheme = () => {
    if (!mounted) return;
    setTheme(isDark ? "light" : "dark");
  };

  const isCurrent = (path: string) => {
    if (pathname === path || pathname.startsWith(`${path}/`)) return true;
    return false;
  };

  const privateLinks = [
    { href: "/modules", label: "Modul", icon: LayoutGrid },
    { href: "/students", label: "Santri", icon: Users },
    { href: "/teachers", label: "Asatidz", icon: UserCheck },
    { href: "/parents", label: "Wali", icon: HeartHandshake },
    { href: "/modules/dormitory", label: "Asrama", icon: BedDouble },
    { href: "/modules/media", label: "Media", icon: ImageIcon },
    { href: "/modules/users", label: "Pengguna", icon: UserCog },
    { href: "/data-science", label: "AI & Sains", icon: Sparkles },
    { href: "/settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <header className="sticky top-4 mx-auto max-w-7xl w-[calc(100%-2rem)] z-50 transition-all duration-400">
      {/* Floating Apple Liquid Capsule Container for Private Portal */}
      <nav 
        aria-label="Navigasi Privat" 
        className="liquid-glass-elevated rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xl border border-white/60 dark:border-white/10"
      >
        {/* Logo & Identitas Portal: Darul Khidmah Sidogiri lalu Bekasi */}
        <Link 
          href="/modules" 
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full pr-2"
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/95 dark:bg-emerald-950/90 p-0.5 shadow-md shadow-emerald-950/25 ring-2 ring-emerald-600/40 dark:ring-emerald-400/40 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center shrink-0">
            <Image
              src="/logo-sidogiri.jpeg"
              alt="Logo Resmi Darul Khidmah Sidogiri Bekasi"
              width={40}
              height={40}
              priority
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                Darul Khidmah Sidogiri
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                Bekasi
              </span>
            </div>
            <p className="text-[10px] text-teal-700 dark:text-teal-400 tracking-wider uppercase font-semibold flex items-center gap-1">
              <ShieldCheck size={11} />
              <span>Portal Sistem Terpadu</span>
            </p>
          </div>
        </Link>

        {/* Desktop Menu Navigation (Khusus Pengguna Login) */}
        <div className="hidden xl:flex items-center gap-0.5 bg-white/20 dark:bg-black/15 p-1 rounded-full border border-white/25 dark:border-white/5">
          {privateLinks.map((item) => {
            const Icon = item.icon;
            const active = isCurrent(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                  active
                    ? "bg-gradient-to-r from-emerald-700 to-teal-600 text-white font-semibold shadow-md shadow-emerald-950/20"
                    : "text-foreground/80 hover:text-foreground hover:bg-white/50 dark:hover:bg-white/10"
                }`}
              >
                <Icon size={12} className={active ? "text-white" : "text-emerald-600 dark:text-emerald-400"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Info, Theme Switcher, & Logout Action */}
        <div className="hidden sm:flex items-center gap-2">
          {/* User Profile Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill border border-emerald-500/20">
            <div className="w-6 h-6 rounded-full bg-emerald-600/20 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <User size={13} />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold leading-none text-foreground max-w-[120px] truncate">
                {user?.name || "Pengguna"}
              </p>
              <p className="text-[9px] uppercase font-semibold text-emerald-700 dark:text-emerald-400">
                {user?.role || "Staff"}
              </p>
            </div>
          </div>

          {/* Theme Switcher */}
          <button 
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full liquid-glass-pill hover:bg-white/30 dark:hover:bg-white/10 text-foreground transition-all duration-300 cursor-pointer"
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun size={15} className="text-amber-400" />
            ) : (
              <Moon size={15} className="text-emerald-700" />
            )}
          </button>

          {/* Tombol Logout Sesi */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
            title="Keluar dari sesi portal"
          >
            <LogOut size={13} />
            <span>{loggingOut ? "Keluar..." : "Keluar"}</span>
          </button>
        </div>

        {/* Mobile Action & Hamburger Button */}
        <div className="flex xl:hidden items-center gap-2">
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

      {/* Mobile Drawer (Liquid Glass Sheet for Private Portal) */}
      {isOpen && (
        <div className="xl:hidden mx-1 mt-2.5 rounded-3xl liquid-glass-elevated p-4 space-y-3 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-300 border border-white/60 dark:border-white/10">
          {/* User Session Header */}
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600/20 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold">
                <User size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{user?.name || "Pengguna Portal"}</p>
                <p className="text-[10px] text-muted-foreground">{user?.email || "admin@sidogiri-bekasi.sch.id"}</p>
              </div>
            </div>
            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              {user?.role || "Staff"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {privateLinks.map((item) => {
              const Icon = item.icon;
              const active = isCurrent(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 p-2.5 rounded-2xl text-xs font-medium transition-colors ${
                    active
                      ? "bg-gradient-to-r from-emerald-700 to-teal-600 text-white font-semibold"
                      : "hover:bg-emerald-500/10 text-foreground"
                  }`}
                >
                  <Icon size={14} className={active ? "text-white" : "text-emerald-600 dark:text-emerald-400"} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-border/40 pt-2 flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 text-foreground p-2.5 rounded-full text-xs font-semibold transition-all"
            >
              <span>Kunjungi Website Publik</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center justify-center gap-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-500/30 p-2.5 rounded-full text-xs font-semibold transition-all"
            >
              <LogOut size={14} />
              <span>{loggingOut ? "Mengakhiri Sesi..." : "Keluar Sesi Portal"}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
export default PrivateNavbar;
