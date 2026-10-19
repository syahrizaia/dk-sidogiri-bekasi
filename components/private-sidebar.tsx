"use client";

import React, { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { getCurrentUserAction, logoutAction } from "@/lib/actions/auth";
import { getUserPermissionsAction, type UserPermissionsResult } from "@/lib/actions/roles";
import type { ModulePermissionKey } from "@/lib/roles-config";
import {
  LayoutGrid,
  Users,
  UserCheck,
  HeartHandshake,
  BedDouble,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lock,
  BookOpen,
  Building2,
  Compass,
} from "lucide-react";

const emptySubscribe = () => () => {};

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  moduleKey: ModulePermissionKey;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export function PrivateSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissionsResult | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  // Fetch current authenticated user and dynamic RBAC permissions from database
  useEffect(() => {
    let ignore = false;
    Promise.all([
      getCurrentUserAction(),
      getUserPermissionsAction(),
    ])
      .then(([userSession, permsRes]) => {
        if (!ignore) {
          if (userSession) {
            setUser(userSession);
          }
          if (permsRes.success && permsRes.data) {
            setUserPermissions(permsRes.data);
          }
        }
      })
      .catch((err) => {
        console.error("Gagal membaca profil sesi atau hak akses:", err);
      });

    return () => {
      ignore = true;
    };
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

  const isActive = (path: string) => {
    if (pathname === path) return true;
    if (path !== "/modules" && pathname.startsWith(`${path}/`)) return true;
    return false;
  };

  // Helper format role display
  const getRoleLabel = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "super_admin":
        return "Super Admin";
      case "ketua_ranting":
      case "ketua":
      case "ketua_yayasan":
        return "Ketua Ranting";
      case "staf_administrasi":
      case "staf":
      case "staff":
        return "Staf Administrasi";
      case "dewan_asatidz":
      case "guru":
      case "teacher":
        return "Dewan Asatidz";
      case "wali_santri":
      case "orang_tua":
      case "parent":
        return "Wali Santri";
      default:
        return "Staf Administrasi";
    }
  };

  const filteredNavGroups = useMemo<NavGroup[]>(() => {
    const role = user?.role?.toLowerCase();

    const getDashboardLabel = () => {
      if (role === "wali_santri" || role === "orang_tua" || role === "parent") return "Portal Wali Santri";
      if (role === "dewan_asatidz" || role === "guru" || role === "teacher") return "Portal Dewan Asatidz";
      if (role === "ketua_ranting" || role === "ketua" || role === "ketua_yayasan") return "Portal Eksekutif";
      if (role === "staf_administrasi" || role === "staf" || role === "staff") return "Portal Administrasi";
      return "Modul Sistem";
    };

    const allGroups: NavGroup[] = [
      {
        groupName: role === "wali_santri" ? "Portal Keluarga" : "Portal Utama",
        items: [
          { href: "/modules", label: getDashboardLabel(), icon: LayoutGrid, moduleKey: "modules" },
        ],
      },
      {
        groupName: "Unit Pendidikan",
        items: [
          { href: "/modules/mi", label: "Madrasah Ibtidaiyah (MI)", icon: BookOpen, moduleKey: "mi" },
          { href: "/modules/mts", label: "Madrasah Tsanawiyah (MTs)", icon: Building2, moduleKey: "mts" },
          { href: "/modules/tpq", label: "TPQ Al-Qur'an Sidogiri", icon: Compass, moduleKey: "tpq" },
        ],
      },
      {
        groupName: "Akademik & Santri",
        items: [
          { href: "/students", label: "Buku Induk Santri", icon: Users, moduleKey: "students" },
          { href: "/teachers", label: "Dewan Asatidz", icon: UserCheck, moduleKey: "teachers" },
          { href: "/parents", label: "Wali Santri", icon: HeartHandshake, moduleKey: "parents" },
        ],
      },
      {
        groupName: "Fasilitas & Syiar",
        items: [
          { href: "/modules/dormitory", label: "Manajemen Asrama", icon: BedDouble, moduleKey: "dormitory" },
          { href: "/modules/media", label: "Pusat Media", icon: ImageIcon, moduleKey: "media" },
        ],
      },
      {
        groupName: "Keamanan & Sistem",
        items: [
          { href: "/modules/users", label: "Manajemen Pengguna", icon: ShieldCheck, badge: "RBAC", moduleKey: "users" },
          { href: "/data-science", label: "AI & Analitik", icon: Sparkles, moduleKey: "data_science" },
          { href: "/settings", label: "Pengaturan Sistem", icon: Settings, moduleKey: "settings" },
        ],
      },
    ];

    // Jika konfigurasi RBAC database telah termuat, saring 100% dinamis sesuai permissions matriks
    if (userPermissions?.permissions) {
      return allGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => {
            // Root Security Failsafe: users hanya untuk super_admin
            if (item.moduleKey === "users" && !userPermissions.isSuperAdmin) {
              return false;
            }
            return Boolean(userPermissions.permissions[item.moduleKey]);
          }),
        }))
        .filter((group) => group.items.length > 0);
    }

    // Fallback awal sebelum permissions termuat: sembunyikan users untuk non-super_admin
    const isSuper = role === "super_admin" || role === "admin";
    return allGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (item.moduleKey === "users" && !isSuper) return false;
          return true;
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [user, userPermissions]);

  return (
    <>
      {/* ========================================================= */}
      {/* MOBILE TOP BAR (<lg)                                      */}
      {/* ========================================================= */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 px-4 py-3 liquid-glass-elevated border-b border-white/40 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-2xl liquid-glass border border-white/50 text-foreground hover:bg-white/10 transition-colors shrink-0"
            aria-label="Buka Menu Sidebar"
          >
            <Menu size={20} />
          </button>

          <Link href="/modules" className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-white/95 dark:bg-emerald-950/90 p-0.5 shadow-md shadow-emerald-950/20 ring-1 ring-emerald-600/40 dark:ring-emerald-400/40 flex items-center justify-center shrink-0">
              <Image
                src="/logo-sidogiri.jpeg"
                alt="Logo Darul Khidmah Sidogiri Bekasi"
                width={32}
                height={32}
                priority
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-xs tracking-tight text-foreground leading-tight truncate">
                Darul Khidmah Sidogiri
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 truncate">
                Bekasi Portal
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl liquid-glass border border-white/40 text-muted-foreground hover:text-foreground transition-colors"
            title="Ganti Tema"
          >
            {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-emerald-700" />}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-2 rounded-xl liquid-glass border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Keluar"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE DRAWER BACKDROP & SLIDE-OVER (<lg)                 */}
      {/* ========================================================= */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-72 max-w-[85vw] liquid-glass-elevated border-r border-white/60 dark:border-white/10 p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-300 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Header Drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-white/15 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/95 dark:bg-emerald-950/90 p-0.5 shadow-md ring-1 ring-emerald-600/40 dark:ring-emerald-400/40 flex items-center justify-center shrink-0">
                    <Image
                      src="/logo-sidogiri.jpeg"
                      alt="Logo Darul Khidmah Sidogiri Bekasi"
                      width={36}
                      height={36}
                      priority
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-foreground leading-snug">
                      Darul Khidmah Sidogiri
                    </h3>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      Bekasi Portal
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl liquid-glass border border-white/30 text-muted-foreground hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-5">
                {filteredNavGroups.map((group) => (
                  <div key={group.groupName} className="space-y-1.5">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70 px-3">
                      {group.groupName}
                    </p>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                              active
                                ? "bg-gradient-to-r from-emerald-800 to-teal-700 text-white shadow-md shadow-emerald-950/20"
                                : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon size={16} className={active ? "text-emerald-300" : "text-emerald-600 dark:text-emerald-400"} />
                              <span>{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>

            {/* Bottom Actions Drawer */}
            <div className="pt-4 border-t border-white/15 dark:border-white/10 space-y-3">
              <Link
                href="/"
                className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <span>Lihat Website Publik</span>
                <ExternalLink size={14} />
              </Link>

              {user && (
                <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-xs text-foreground truncate">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{getRoleLabel(user.role)}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-500/15 transition-colors"
                    title="Keluar"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DESKTOP SIDEBAR FIXED (lg+)                               */}
      {/* ========================================================= */}
      <aside
        className={`hidden lg:flex fixed top-0 left-0 bottom-0 z-30 flex-col justify-between transition-all duration-300 ease-in-out liquid-glass-elevated border-r border-white/60 dark:border-white/10 shadow-2xl p-4 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/15 dark:border-white/10">
            <Link
              href="/modules"
              className={`flex items-center gap-3 transition-opacity ${
                isCollapsed ? "justify-center w-full" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-2xl overflow-hidden bg-white/95 dark:bg-emerald-950/90 p-0.5 shadow-lg shadow-emerald-950/25 ring-2 ring-emerald-600/40 dark:ring-emerald-400/40 flex items-center justify-center shrink-0">
                <Image
                  src="/logo-sidogiri.jpeg"
                  alt="Logo Darul Khidmah Sidogiri Bekasi"
                  width={40}
                  height={40}
                  priority
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="font-extrabold text-xs tracking-tight text-foreground truncate">
                    Darul Khidmah Sidogiri
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                      Bekasi
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-semibold">
                      Portal
                    </span>
                  </div>
                </div>
              )}
            </Link>

            {!isCollapsed && (
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 rounded-xl liquid-glass border border-white/40 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                title="Ciutkan Sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            )}
          </div>

          {/* When collapsed, show expand button */}
          {isCollapsed && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="p-2 rounded-xl liquid-glass border border-white/40 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                title="Perlebar Sidebar"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Nav Groups */}
          <nav className="space-y-5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
            {filteredNavGroups.map((group) => (
              <div key={group.groupName} className="space-y-1">
                {!isCollapsed && (
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60 px-3 py-1">
                    {group.groupName}
                  </p>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={isCollapsed ? item.label : undefined}
                        className={`group relative flex items-center rounded-2xl text-xs font-semibold transition-all duration-200 ${
                          isCollapsed
                            ? "justify-center p-3"
                            : "justify-between px-3.5 py-2.5"
                        } ${
                          active
                            ? "bg-gradient-to-r from-emerald-800 to-teal-700 text-white shadow-md shadow-emerald-950/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            size={18}
                            className={`shrink-0 transition-transform group-hover:scale-110 ${
                              active
                                ? "text-emerald-300"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          />
                          {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </div>

                        {!isCollapsed && item.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold shrink-0">
                            {item.badge}
                          </span>
                        )}

                        {/* Collapsed Tooltip */}
                        {isCollapsed && (
                          <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl liquid-glass-elevated border border-white/40 text-foreground text-xs font-semibold shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                            {item.label}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Sidebar Desktop */}
        <div className="pt-3 border-t border-white/15 dark:border-white/10 space-y-3">
          {/* Quick Actions: Theme & Website */}
          <div className={`flex items-center gap-2 ${isCollapsed ? "flex-col justify-center" : "justify-between"}`}>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl liquid-glass border border-white/40 text-muted-foreground hover:text-foreground transition-colors"
              title={isDark ? "Ubah ke Terang" : "Ubah ke Gelap"}
            >
              {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-emerald-700" />}
            </button>

            {!isCollapsed ? (
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-xl liquid-glass border border-white/30"
              >
                <span>Website Publik</span>
                <ExternalLink size={12} />
              </Link>
            ) : (
              <Link
                href="/"
                target="_blank"
                className="p-2 rounded-xl liquid-glass border border-white/40 text-muted-foreground hover:text-foreground transition-colors"
                title="Website Publik"
              >
                <ExternalLink size={16} />
              </Link>
            )}
          </div>

          {/* User Session Profile Card */}
          <div
            className={`p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10 flex items-center justify-between ${
              isCollapsed ? "flex-col gap-2 p-2" : ""
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-800 to-teal-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : <Lock size={14} />}
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <p className="font-bold text-xs text-foreground truncate">
                    {user?.name || "Pengguna Portal"}
                  </p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold truncate">
                    {getRoleLabel(user?.role)}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="p-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/15 transition-colors shrink-0 cursor-pointer"
              title="Keluar (Logout)"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
