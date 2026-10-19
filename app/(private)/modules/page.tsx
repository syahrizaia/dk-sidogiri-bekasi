"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUserAction, logoutAction } from "@/lib/actions/auth";
import { getUserPermissionsAction, type UserPermissionsResult } from "@/lib/actions/roles";
import type { ModulePermissionKey } from "@/lib/roles-config";
import {
  Users,
  UserCheck,
  HeartHandshake,
  BookOpen,
  Building2,
  Compass,
  Sparkles,
  Settings,
  UserPlus,
  LogOut,
  Search,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkle,
  GraduationCap,
  Database,
  ExternalLink,
  ChevronRight,
  User,
  BedDouble,
  Video
} from "lucide-react";
import { ParentPortalView } from "./components/ParentPortalView";
import { TeacherPortalView } from "./components/TeacherPortalView";
import { ExecutivePortalView } from "./components/ExecutivePortalView";
import { StaffPortalView } from "./components/StaffPortalView";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  studentNis?: string;
  studentName?: string;
  studentId?: string;
  parentId?: string;
}

interface ModuleItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: "academic" | "institution" | "analytics" | "system";
  href: string;
  icon: React.ElementType;
  badge: {
    text: string;
    variant: "emerald" | "teal" | "amber" | "indigo" | "rose" | "slate";
  };
  highlight?: boolean;
}

const MODULES_LIST: ModuleItem[] = [
  {
    id: "students",
    title: "Buku Induk Santri",
    subtitle: "Student Master Database",
    description: "Manajemen komprehensif data pokok santri, Nomor Induk Santri (NIS), status mukim/non-mukim, asrama, dan rekam jejak akademik.",
    category: "academic",
    href: "/students",
    icon: Users,
    badge: { text: "Data Pokok", variant: "emerald" },
    highlight: true,
  },
  {
    id: "teachers",
    title: "Tenaga Pendidik & Asatidz",
    subtitle: "Faculty & Teachers Directory",
    description: "Direktori lengkap dewan asatidz pembina kajian kitab kuning, tahsin Al-Qur'an, wali kelas, dan pembina kedisiplinan santri.",
    category: "academic",
    href: "/teachers",
    icon: UserCheck,
    badge: { text: "Asatidz Sidogiri", variant: "teal" },
  },
  {
    id: "parents",
    title: "Wali Santri & Keluarga",
    subtitle: "Guardians & Family Portal",
    description: "Sistem pendataan orang tua / wali santri, kontak darurat keluarga, domisili asal, serta koordinasi komunikasi kepesantrenan.",
    category: "academic",
    href: "/parents",
    icon: HeartHandshake,
    badge: { text: "Relasi Santri", variant: "indigo" },
  },
  {
    id: "mi",
    title: "Madrasah Ibtidaiyah (MI)",
    subtitle: "Miftahul Ulum - Tingkat Dasar",
    description: "Jenjang pendidikan dasar setara SD bercirikan Islam khas Sidogiri yang mengintegrasikan kurikulum agama dan umum terpadu.",
    category: "institution",
    href: "/modules/mi",
    icon: BookOpen,
    badge: { text: "Beroperasi Aktif", variant: "emerald" },
  },
  {
    id: "mts",
    title: "Madrasah Tsanawiyah (MTs)",
    subtitle: "Miftahul Ulum - Persiapan Pembukaan",
    description: "Jenjang pendidikan lanjutan tingkat menengah pertama dengan penguatan ilmu syariah. Buka resmi tahun ajaran baru mendatang.",
    category: "institution",
    href: "/modules/mts",
    icon: Building2,
    badge: { text: "Buka Tahun Depan", variant: "teal" },
  },
  {
    id: "tpq",
    title: "TPQ Al-Qur'an Sidogiri",
    subtitle: "Taman Pendidikan Al-Qur'an",
    description: "Pendidikan tartil Al-Qur'an 6 jilid dengan sanad metode khas Pondok Pesantren Sidogiri Pasuruan, mencetak generasi fasih dan mutqin.",
    category: "institution",
    href: "/modules/tpq",
    icon: Compass,
    badge: { text: "Metode Tartil", variant: "amber" },
  },
  {
    id: "data-science",
    title: "Data Science & AI",
    subtitle: "Predictive Analytics & Intelligence",
    description: "Analitik prediktif perkembangan santri, pemantauan kapasitas kamar/asrama, dan kalkulasi performa akademik berbasis AI.",
    category: "analytics",
    href: "/data-science",
    icon: Sparkles,
    badge: { text: "Gemini 4 ML", variant: "indigo" },
  },
  {
    id: "admissions",
    title: "Pendaftaran Santri Baru",
    subtitle: "New Admissions Portal (PPDB)",
    description: "Portal pendaftaran online murid baru MI dan TPQ, verifikasi berkas formulir, jadwal wawancara, serta penempatan kelas.",
    category: "academic",
    href: "/santri-baru",
    icon: UserPlus,
    badge: { text: "PPDB Online", variant: "rose" },
  },
  {
    id: "dormitory",
    title: "Manajemen Asrama",
    subtitle: "Dormitory & Room Management",
    description: "Pemetaan kamar Asrama Sayyid Sulaiman & Kiai Aminullah, pemantauan kuota tempat tidur, fasilitas, dan alokasi santri mukim.",
    category: "institution",
    href: "/modules/dormitory",
    icon: BedDouble,
    badge: { text: "Asrama Santri", variant: "emerald" },
  },
  {
    id: "media-management",
    title: "Pusat Media & Dokumentasi",
    subtitle: "Media Content Management",
    description: "Pengelolaan arsip visual syiar dakwah, galeri foto kegiatan santri, dan video liputan kajian kitab kuning di Sidogiri Bekasi.",
    category: "system",
    href: "/modules/media",
    icon: Video,
    badge: { text: "Galeri & Syiar", variant: "teal" },
  },
  {
    id: "users-management",
    title: "Manajemen Pengguna & Hak Akses",
    subtitle: "Users & RBAC Access Control",
    description: "Administrasi akun pengguna sistem portal (Admin, Dewan Asatidz, Wali Santri, dan Staf), aktivasi akun, dan kontrol peran.",
    category: "system",
    href: "/modules/users",
    icon: ShieldCheck,
    badge: { text: "RBAC Security", variant: "indigo" },
  },
  {
    id: "settings",
    title: "Pengaturan & Sistem",
    subtitle: "Configuration & Database Security",
    description: "Pusat konfigurasi parameter sistem, status konektivitas MongoDB Atlas, audit trail aktivitas pengguna, dan manajemen akun.",
    category: "system",
    href: "/settings",
    icon: Settings,
    badge: { text: "MongoDB Atlas", variant: "slate" },
  },
];

export default function ModulesPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissionsResult | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "academic" | "institution" | "analytics" | "system">("all");
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    // Ambil data user yang sedang login dan izin RBAC dinamis dari database
    Promise.all([
      getCurrentUserAction(),
      getUserPermissionsAction(),
    ])
      .then(([userSession, permsRes]) => {
        if (userSession) {
          setUser(userSession);
        } else {
          // Fallback user display jika belum sinkron
          setUser({
            id: "session-active",
            name: "Pengguna Terotentikasi",
            email: "pengguna@sidogiri-bekasi.sch.id",
            role: "staff",
          });
        }
        if (permsRes.success && permsRes.data) {
          setUserPermissions(permsRes.data);
        }
      })
      .catch(() => {
        setUser({
          id: "session-active",
          name: "Pengguna Terotentikasi",
          email: "pengguna@sidogiri-bekasi.sch.id",
          role: "staff",
        });
      })
      .finally(() => {
        setLoadingUser(false);
      });

    // Jam digital real-time
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
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

  const [previewRole, setPreviewRole] = useState<
    "actual" | "super_admin" | "ketua_ranting" | "staf_administrasi" | "dewan_asatidz" | "wali_santri"
  >("actual");
  const isSuperAdmin = user?.role === "super_admin" || user?.role === "admin";
  const effectiveRole = previewRole !== "actual" && isSuperAdmin ? previewRole : user?.role?.toLowerCase();

  const getModulePermissionKey = (modId: string): ModulePermissionKey | null => {
    switch (modId) {
      case "students": return "students";
      case "teachers": return "teachers";
      case "parents": return "parents";
      case "mi": return "mi";
      case "mts": return "mts";
      case "tpq": return "tpq";
      case "data-science": return "data_science";
      case "dormitory": return "dormitory";
      case "media-management": return "media";
      case "users-management": return "users";
      case "settings": return "settings";
      default: return null;
    }
  };

  const filteredModules = useMemo(() => {
    return MODULES_LIST.filter((mod) => {
      const modKey = getModulePermissionKey(mod.id);

      if (modKey) {
        // Root Security Failsafe: users-management hanya bisa dilihat super_admin
        if (modKey === "users" && !isSuperAdmin && !userPermissions?.isSuperAdmin) {
          return false;
        }

        // Saring 100% dinamis berdasarkan izin matriks RBAC dari database
        if (userPermissions?.permissions) {
          if (!userPermissions.permissions[modKey]) {
            return false;
          }
        } else {
          // Fallback awal sebelum database permissions termuat
          if (modKey === "users" && !isSuperAdmin) {
            return false;
          }
        }
      }

      const matchSearch =
        mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (activeTab === "all") return matchSearch;
      return matchSearch && mod.category === activeTab;
    });
  }, [searchQuery, activeTab, isSuperAdmin, userPermissions]);

  const getBadgeClass = (variant: ModuleItem["badge"]["variant"]) => {
    switch (variant) {
      case "emerald":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
      case "teal":
        return "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30";
      case "amber":
        return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
      case "indigo":
        return "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30";
      case "rose":
        return "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30";
      case "slate":
      default:
        return "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30";
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "super_admin":
      case "admin":
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

  // 1. Tampilan Khusus Wali Santri
  if (!loadingUser && (effectiveRole === "wali_santri" || effectiveRole === "orang_tua" || effectiveRole === "parent")) {
    return (
      <div className="relative">
        {isSuperAdmin && (
          <div className="sticky top-16 z-30 p-2.5 mx-auto max-w-7xl px-4">
            <div className="rounded-2xl bg-amber-500/20 border border-amber-500/40 p-2.5 flex items-center justify-between text-xs font-semibold backdrop-blur-md">
              <span className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                <Sparkles size={14} />
                <span>Mode Pratinjau Tampilan: <strong>Wali Santri</strong></span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewRole("actual")}
                className="px-3 py-1 rounded-xl bg-amber-700 text-white text-[11px] font-bold hover:bg-amber-600 cursor-pointer transition-colors"
              >
                Kembali ke Super Admin
              </button>
            </div>
          </div>
        )}
        <ParentPortalView 
          user={user!} 
          currentTime={currentTime} 
          onLogout={handleLogout} 
          loggingOut={loggingOut} 
        />
      </div>
    );
  }

  // 2. Tampilan Khusus Dewan Asatidz / Guru
  if (!loadingUser && (effectiveRole === "dewan_asatidz" || effectiveRole === "guru" || effectiveRole === "teacher")) {
    return (
      <div className="relative">
        {isSuperAdmin && (
          <div className="sticky top-16 z-30 p-2.5 mx-auto max-w-7xl px-4">
            <div className="rounded-2xl bg-teal-500/20 border border-teal-500/40 p-2.5 flex items-center justify-between text-xs font-semibold backdrop-blur-md">
              <span className="flex items-center gap-2 text-teal-900 dark:text-teal-200">
                <Sparkles size={14} />
                <span>Mode Pratinjau Tampilan: <strong>Dewan Asatidz / Guru</strong></span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewRole("actual")}
                className="px-3 py-1 rounded-xl bg-teal-700 text-white text-[11px] font-bold hover:bg-teal-600 cursor-pointer transition-colors"
              >
                Kembali ke Super Admin
              </button>
            </div>
          </div>
        )}
        <TeacherPortalView 
          user={user!} 
          currentTime={currentTime} 
          onLogout={handleLogout} 
          loggingOut={loggingOut} 
        />
      </div>
    );
  }

  // 3. Tampilan Khusus Eksekutif / Ketua Ranting
  if (!loadingUser && (effectiveRole === "ketua_ranting" || effectiveRole === "ketua" || effectiveRole === "ketua_yayasan")) {
    return (
      <div className="relative">
        {isSuperAdmin && (
          <div className="sticky top-16 z-30 p-2.5 mx-auto max-w-7xl px-4">
            <div className="rounded-2xl bg-emerald-500/20 border border-emerald-500/40 p-2.5 flex items-center justify-between text-xs font-semibold backdrop-blur-md">
              <span className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
                <Sparkles size={14} />
                <span>Mode Pratinjau Tampilan: <strong>Ketua Ranting (Eksekutif)</strong></span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewRole("actual")}
                className="px-3 py-1 rounded-xl bg-emerald-700 text-white text-[11px] font-bold hover:bg-emerald-600 cursor-pointer transition-colors"
              >
                Kembali ke Super Admin
              </button>
            </div>
          </div>
        )}
        <ExecutivePortalView 
          user={user!} 
          currentTime={currentTime} 
          onLogout={handleLogout} 
          loggingOut={loggingOut} 
        />
      </div>
    );
  }

  // 4. Tampilan Khusus Staf Administrasi
  if (!loadingUser && (effectiveRole === "staf_administrasi" || effectiveRole === "staf" || effectiveRole === "staff")) {
    return (
      <div className="relative">
        {isSuperAdmin && (
          <div className="sticky top-16 z-30 p-2.5 mx-auto max-w-7xl px-4">
            <div className="rounded-2xl bg-indigo-500/20 border border-indigo-500/40 p-2.5 flex items-center justify-between text-xs font-semibold backdrop-blur-md">
              <span className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
                <Sparkles size={14} />
                <span>Mode Pratinjau Tampilan: <strong>Staf Administrasi (Operasional)</strong></span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewRole("actual")}
                className="px-3 py-1 rounded-xl bg-indigo-700 text-white text-[11px] font-bold hover:bg-indigo-600 cursor-pointer transition-colors"
              >
                Kembali ke Super Admin
              </button>
            </div>
          </div>
        )}
        <StaffPortalView 
          user={user!} 
          currentTime={currentTime} 
          onLogout={handleLogout} 
          loggingOut={loggingOut} 
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Islamic Watermark Accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10 flex items-center justify-center opacity-30 dark:opacity-20">
        <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-amber-500/5 blur-3xl animate-pulse" />
      </div>

      {/* Top Welcome & Session Profile Bar */}
      <div className="rounded-3xl liquid-glass-elevated p-6 sm:p-8 mb-10 border border-white/60 dark:border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* User Info & Islamic Greeting */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 p-0.5 shadow-xl flex-shrink-0">
              <div className="w-full h-full rounded-[14px] bg-card flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.8]" />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-serif tracking-wide">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>{loadingUser ? "Memuat Sesi..." : user?.name || "Ahlan wa Sahlan"}</span>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck size={11} />
                  {getRoleLabel(user?.role)}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <User size={13} className="text-emerald-600 dark:text-emerald-400" />
                  {user?.email || "admin@sidogiri-bekasi.sch.id"}
                </span>
                <span className="hidden sm:inline opacity-40">•</span>
                <span className="flex items-center gap-1 font-mono text-xs">
                  <Clock size={13} className="text-teal-600 dark:text-teal-400" />
                  {currentTime || "WIB"}
                </span>
                <span className="hidden sm:inline opacity-40">•</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  <Database size={12} />
                  MongoDB Atlas Connected
                </span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons & Role Preview Toggle */}
          <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-center">
            {isSuperAdmin && (
              <div className="flex items-center gap-1 p-1 rounded-2xl liquid-glass border border-white/50 text-[11px] font-semibold">
                <span className="text-muted-foreground px-2 hidden sm:inline flex items-center gap-1">
                  <Sparkles size={12} className="text-emerald-600" />
                  <span>Pratinjau:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewRole("actual")}
                  className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    previewRole === "actual" || previewRole === "super_admin"
                      ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Lihat Dashboard Super Admin"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewRole("ketua_ranting")}
                  className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    previewRole === "ketua_ranting"
                      ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Pratinjau Tampilan Eksekutif Ketua Ranting"
                >
                  Ketua
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewRole("staf_administrasi")}
                  className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    previewRole === "staf_administrasi"
                      ? "bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 font-bold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Pratinjau Tampilan Operasional Staf Administrasi"
                >
                  Staf
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewRole("dewan_asatidz")}
                  className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    previewRole === "dewan_asatidz"
                      ? "bg-teal-500/20 text-teal-800 dark:text-teal-300 font-bold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Pratinjau Tampilan Dewan Asatidz / Guru"
                >
                  Guru
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewRole("wali_santri")}
                  className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    previewRole === "wali_santri"
                      ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Pratinjau Tampilan Wali Santri"
                >
                  Wali
                </button>
              </div>
            )}

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 text-xs font-semibold text-foreground transition-all duration-200"
            >
              <ExternalLink size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Halaman Utama</span>
            </Link>

            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 text-xs font-semibold text-foreground transition-all duration-200"
            >
              <Settings size={13} className="text-teal-600 dark:text-teal-400" />
              <span>Pengaturan</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <LogOut size={13} />
              <span>{loggingOut ? "Keluar..." : "Keluar"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section Title & Search / Filter Controls */}
      <div className="space-y-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-2">
              <Sparkle size={13} className="text-emerald-600 dark:text-emerald-400 animate-spin-slow" />
              <span>Pusat Layanan Terpadu Sidogiri</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Portal Modul Sistem
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
              Akses cepat seluruh modul akademik, direktori asatidz & wali santri, lembaga pendidikan (MI Miftahul Ulum, persiapan MTs, dan TPQ), serta modul data science.
            </p>
          </div>

          {/* Search Bar with Liquid Glass */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari modul atau layanan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl liquid-glass-input text-xs font-medium placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-b border-border/40 pb-4">
          {[
            { id: "all", label: "Semua Modul", count: MODULES_LIST.length },
            { id: "academic", label: "Akademik & Santri", count: 3 },
            { id: "institution", label: "Lembaga Pendidikan", count: 3 },
            { id: "analytics", label: "Data Science & AI", count: 1 },
            { id: "system", label: "Sistem & Konfigurasi", count: 1 },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-md shadow-emerald-900/20 font-semibold"
                    : "liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 text-foreground/80 hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modules Grid */}
      {filteredModules.length === 0 ? (
        <div className="rounded-3xl liquid-glass-card p-12 text-center my-8">
          <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-foreground">Modul Tidak Ditemukan</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Tidak ada modul yang sesuai dengan kata kunci &quot;{searchQuery}&quot;. Coba gunakan kata kunci lain seperti &quot;santri&quot;, &quot;guru&quot;, atau &quot;MI&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setActiveTab("all");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="group relative rounded-3xl liquid-glass-card liquid-sheen p-6 border border-white/60 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between overflow-hidden"
              >
                {/* Glow accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 group-hover:bg-emerald-500/15 rounded-full blur-2xl transition-all duration-500 pointer-events-none" />

                <div>
                  {/* Top Icon & Badge Row */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/15 to-teal-500/15 dark:from-emerald-500/25 dark:to-teal-500/25 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                      <Icon className="w-6 h-6 stroke-[1.8]" />
                    </div>

                    <span
                      className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border ${getBadgeClass(
                        item.badge.variant
                      )}`}
                    >
                      {item.badge.text}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-base font-bold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors flex items-center justify-between">
                    <span>{item.title}</span>
                    <ChevronRight
                      size={16}
                      className="text-muted-foreground group-hover:translate-x-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all duration-200"
                    />
                  </h3>
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase mt-0.5">
                    {item.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <span className="flex items-center gap-1 group-hover:underline">
                    Buka Modul
                  </span>
                  <div className="w-7 h-7 rounded-full liquid-glass-pill flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Info Card: Institutional Clarity (MI, MTs, TPQ) */}
      <div className="mt-12 rounded-3xl liquid-glass-elevated p-6 sm:p-8 border border-white/60 dark:border-white/10 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <Compass size={14} />
              <span>Struktur Lembaga Resmi Yayasan</span>
            </div>
            <h4 className="text-lg font-bold text-foreground">
              Darul Khidmah Sidogiri Bekasi
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Yayasan menyelenggarakan <strong>Madrasah Ibtidaiyah (MI) Miftahul Ulum</strong> yang sedang beroperasi aktif, persiapan pembukaan <strong>Madrasah Tsanawiyah (MTs) Miftahul Ulum</strong> untuk tahun ajaran mendatang, serta <strong>TPQ Al-Qur&apos;an Metode Tartil Sidogiri</strong>. Yayasan di Bekasi tidak menyelenggarakan jenjang Madrasah Aliyah (MA).
            </p>
          </div>

          <Link
            href="/instansi"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-700 to-teal-600 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <span>Selayang Pandang Instansi</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
