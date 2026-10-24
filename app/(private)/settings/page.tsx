"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  Sun,
  Moon,
  Laptop,
  ShieldCheck,
  Bell,
  CheckCircle2,
  Save,
  Lock,
  Database,
  User,
  KeyRound,
  Building2,
  GraduationCap,
  RefreshCw,
  Download,
  AlertCircle,
  Phone,
  Mail,
  Globe,
  Clock,
  Sparkles,
  Eye,
  EyeOff,
  RotateCcw,
  FileJson,
  Server,
  Activity,
  Layers
} from "lucide-react";
import {
  getSystemSettingsAction,
  updateSystemSettingsAction,
  getCurrentUserProfileDetailsAction,
  updateUserProfileAction,
  updateUserPasswordAction,
  resetSystemSettingsAction,
  getSystemDatabaseHealthAction,
  revalidateAllSystemCacheAction,
  type SystemSettingsDocument,
  type InstitutionSettings,
  type AcademicSettings,
  type NotificationSettings,
} from "@/lib/actions/settings";
import { getUserPermissionsAction, type UserPermissionsResult } from "@/lib/actions/roles";

const emptySubscribe = () => () => {};

export default function SettingsPage() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { theme, setTheme } = useTheme();

  // Active Tab: "profile" | "security" | "institution" | "academic" | "preferences" | "maintenance"
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "institution" | "academic" | "preferences" | "maintenance"
  >("profile");

  // Loading States
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);
  const [revalidating, setRevalidating] = useState(false);

  // Feedback Messages
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // User Permissions & Sesi
  const [userPermissions, setUserPermissions] = useState<UserPermissionsResult | null>(null);

  // User Profile Form State
  const [userProfile, setUserProfile] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    phone: string;
    status: string;
    createdAt?: string;
  }>({
    id: "",
    name: "",
    email: "",
    role: "",
    phone: "",
    status: "active",
  });

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // System Settings Document State
  const [institutionForm, setInstitutionForm] = useState<InstitutionSettings>({
    name: "",
    subHeader: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    leaderName: "",
  });

  const [academicForm, setAcademicForm] = useState<AcademicSettings>({
    academicYear: "",
    semester: "Ganjil",
    operationalStatus: "AKTIF",
    curfewTime: "22:00 WIB",
    defaultQuota: 150,
  });

  const [notificationForm, setNotificationForm] = useState<NotificationSettings>({
    waNewAdmission: true,
    waPermitMutation: true,
    waExamSchedule: true,
    adminNotificationPhone: "",
  });

  const [systemMetadata, setSystemMetadata] = useState<{ updatedAt: string; updatedBy: string } | null>(null);

  // Database Health State
  const [databaseHealth, setDatabaseHealth] = useState<{
    status: "CONNECTED" | "DEGRADED" | "DISCONNECTED";
    latencyMs: number;
    databaseName: string;
    totalCollections: number;
    totalDocuments: number;
    collectionsDetail: { name: string; count: number }[];
    serverTime: string;
  } | null>(null);

  // Reset Modal Confirmation State
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const canManageSystem = Boolean(
    userPermissions?.isSuperAdmin ||
    userPermissions?.role === "ketua_ranting" ||
    userPermissions?.permissions?.settings
  );

  const isSuperAdmin = Boolean(userPermissions?.isSuperAdmin);

  // Fetch initial data from MongoDB Atlas
  useEffect(() => {
    let ignore = false;
    setInitialLoading(true);

    Promise.all([
      getCurrentUserProfileDetailsAction(),
      getSystemSettingsAction(),
      getUserPermissionsAction(),
    ])
      .then(([userRes, settingsRes, permRes]) => {
        if (ignore) return;

        if (userRes.success && userRes.data) {
          setUserProfile(userRes.data);
        }

        if (settingsRes.success && settingsRes.data) {
          const s = settingsRes.data;
          setInstitutionForm(s.institution);
          setAcademicForm(s.academic);
          setNotificationForm(s.notifications);
          setSystemMetadata({ updatedAt: s.updatedAt, updatedBy: s.updatedBy });
        }

        if (permRes?.success && permRes?.data) {
          setUserPermissions(permRes.data);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat pengaturan:", err);
        setFeedback({ type: "error", text: "Terjadi kesalahan saat memuat konfigurasi dari database." });
      })
      .finally(() => {
        if (!ignore) setInitialLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Fetch Database Health when entering maintenance tab
  useEffect(() => {
    if (activeTab === "maintenance" && !databaseHealth && canManageSystem) {
      loadDatabaseHealth();
    }
  }, [activeTab, databaseHealth, canManageSystem]);

  const loadDatabaseHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await getSystemDatabaseHealthAction();
      if (res.success && res.data) {
        setDatabaseHealth(res.data);
      }
    } catch (err) {
      console.error("Health check error:", err);
    } finally {
      setHealthLoading(false);
    }
  };

  // Helper trigger feedback
  const triggerFeedback = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback(null);
    }, 5000);
  };

  // 1. Submit Profile Form
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await updateUserProfileAction({
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
      });

      if (res.success) {
        triggerFeedback("success", res.message || "Profil berhasil diperbarui dan disinkronkan.");
      } else {
        triggerFeedback("error", res.error || "Gagal memperbarui profil.");
      }
    } catch {
      triggerFeedback("error", "Terjadi kesalahan sistem saat memperbarui profil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Submit Password Form
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      triggerFeedback("error", "Konfirmasi kata sandi baru tidak cocok.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      triggerFeedback("error", "Kata sandi baru minimal 6 karakter.");
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await updateUserPasswordAction({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      if (res.success) {
        triggerFeedback("success", res.message || "Kata sandi berhasil diperbarui dengan aman.");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        triggerFeedback("error", res.error || "Gagal memperbarui kata sandi.");
      }
    } catch {
      triggerFeedback("error", "Terjadi kesalahan sistem saat memperbarui kata sandi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Submit System Settings (Institution, Academic, Notifications)
  const handleSaveSystemSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await updateSystemSettingsAction({
        institution: institutionForm,
        academic: academicForm,
        notifications: notificationForm,
      });

      if (res.success && res.data) {
        setSystemMetadata({
          updatedAt: res.data.updatedAt,
          updatedBy: res.data.updatedBy,
        });
        triggerFeedback("success", res.message || "Pengaturan sistem berhasil disimpan ke MongoDB Atlas.");
      } else {
        triggerFeedback("error", res.error || "Gagal menyimpan pengaturan sistem.");
      }
    } catch {
      triggerFeedback("error", "Terjadi kesalahan jaringan saat menyimpan konfigurasi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Revalidate Cache Action
  const handleRevalidateCache = async () => {
    setRevalidating(true);
    try {
      const res = await revalidateAllSystemCacheAction();
      if (res.success) {
        triggerFeedback("success", res.message || "Cache sistem berhasil disinkronisasi ulang.");
      } else {
        triggerFeedback("error", res.error || "Gagal merevalidasi cache sistem.");
      }
    } catch {
      triggerFeedback("error", "Terjadi kesalahan saat merevalidasi cache.");
    } finally {
      setRevalidating(false);
    }
  };

  // 5. Reset System Settings to Default
  const handleConfirmReset = async () => {
    setIsSubmitting(true);
    setShowResetConfirm(false);
    try {
      const res = await resetSystemSettingsAction();
      if (res.success && res.data) {
        setInstitutionForm(res.data.institution);
        setAcademicForm(res.data.academic);
        setNotificationForm(res.data.notifications);
        setSystemMetadata({
          updatedAt: res.data.updatedAt,
          updatedBy: res.data.updatedBy,
        });
        triggerFeedback("success", res.message || "Pengaturan telah dikembalikan ke standar Sidogiri.");
      } else {
        triggerFeedback("error", res.error || "Gagal mereset pengaturan.");
      }
    } catch {
      triggerFeedback("error", "Terjadi kesalahan saat mereset pengaturan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. Export Configuration JSON Snapshot
  const handleExportJson = () => {
    const configSnapshot = {
      system: "Darul Khidmah Sidogiri Bekasi",
      exportDate: new Date().toISOString(),
      institution: institutionForm,
      academic: academicForm,
      notifications: notificationForm,
      metadata: systemMetadata,
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(configSnapshot, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dk-sidogiri-system-config-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerFeedback("success", "File cadangan konfigurasi sistem (JSON) berhasil diunduh.");
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen py-16 px-4 max-w-5xl mx-auto flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 animate-spin mb-4">
          <RefreshCw className="w-8 h-8" />
        </div>
        <p className="text-sm font-semibold text-muted-foreground animate-pulse font-mono">
          Menghubungkan & Memuat Konfigurasi Pengaturan dari MongoDB Atlas...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-6 sm:py-8 px-3.5 sm:px-6 lg:px-8 w-full max-w-6xl mx-auto space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Background Watermark Accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10 flex items-center justify-center opacity-30 dark:opacity-20">
        <div className="w-[850px] h-[850px] rounded-full bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-amber-500/5 blur-3xl" />
      </div>

      {/* Top Breadcrumb & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full max-w-full">
        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0 truncate">
          <Link href="/modules" className="hover:text-emerald-600 transition-colors shrink-0">
            Modul Sistem
          </Link>
          <span className="shrink-0">/</span>
          <span className="font-semibold text-foreground truncate">Pengaturan & Sistem</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-3 py-1 rounded-full liquid-glass-pill border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-bold shrink-0">
            Peran: {userProfile.role.toUpperCase()}
          </span>
          {isSuperAdmin && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 shrink-0">
              Root Access
            </span>
          )}
        </div>
      </div>

      {/* Header Banner - Apple Liquid Glass Style */}
      <div className="rounded-3xl liquid-glass-elevated p-5 sm:p-8 border border-white/60 dark:border-white/10 shadow-2xl relative overflow-hidden w-full max-w-full">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 min-w-0">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-5 min-w-0">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 p-0.5 shadow-xl flex-shrink-0">
              <div className="w-full h-full rounded-[14px] bg-card flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-7 h-7 sm:w-10 sm:h-10 stroke-[1.8]" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-serif">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </span>
                <span className="opacity-40">•</span>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Pondok Pesantren Sidogiri Ranting Bekasi
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5 truncate">
                <span>Pengaturan Sistem & Akun</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl line-clamp-2 break-words">
                Kelola profil akun pribadi, keamanan kata sandi, parameter institusi, tahun ajaran aktif, dan pemeliharaan database terintegrasi.
              </p>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="p-3.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs space-y-1 shrink-0 lg:max-w-xs w-full lg:w-auto">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block truncate">
              Sinkronisasi Terakhir
            </span>
            <div className="font-mono text-[11px] text-foreground font-semibold truncate">
              {systemMetadata?.updatedAt ? new Date(systemMetadata.updatedAt).toLocaleString("id-ID") : "Baru saja"}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              Oleh: {systemMetadata?.updatedBy || "Sistem"}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
            feedback.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-200"
              : "bg-red-500/15 border-red-500/30 text-red-800 dark:text-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-red-600 dark:text-red-400 shrink-0" />
          )}
          <span className="flex-1">{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-[10px] underline hover:no-underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Tabs Navigation (Pill Container) */}
      <div className="flex items-center gap-2 border-b border-border/50 pb-3 overflow-x-auto max-w-full scrollbar-none py-1">
        {/* Tab 1: Profil Akun */}
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "profile"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5"
          }`}
        >
          <User size={16} className="shrink-0" />
          <span>Profil Pengguna</span>
        </button>

        {/* Tab 2: Keamanan & Kata Sandi */}
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "security"
              ? "bg-teal-600 text-white shadow-lg shadow-teal-600/30"
              : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5"
          }`}
        >
          <Lock size={16} className="shrink-0" />
          <span>Keamanan & Sandi</span>
        </button>

        {/* Tab 3: Profil Institusi (Guarded) */}
        {canManageSystem && (
          <button
            type="button"
            onClick={() => setActiveTab("institution")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "institution"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5"
            }`}
          >
            <Building2 size={16} className="shrink-0" />
            <span>Profil Institusi</span>
          </button>
        )}

        {/* Tab 4: Akademik & Operasional (Guarded) */}
        {canManageSystem && (
          <button
            type="button"
            onClick={() => setActiveTab("academic")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "academic"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5"
            }`}
          >
            <GraduationCap size={16} className="shrink-0" />
            <span>Akademik & Operasional</span>
          </button>
        )}

        {/* Tab 5: Tampilan & Notifikasi */}
        <button
          type="button"
          onClick={() => setActiveTab("preferences")}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "preferences"
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
              : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5"
          }`}
        >
          <Bell size={16} className="shrink-0" />
          <span>Tampilan & Notifikasi</span>
        </button>

        {/* Tab 6: Pemeliharaan & Utilitas Database (Super Admin Only) */}
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab("maintenance")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "maintenance"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5"
            }`}
          >
            <Database size={16} className="shrink-0" />
            <span>Utilitas & Database</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PROFIL AKUN PENGGUNA                                               */}
      {/* ========================================================================= */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="liquid-glass rounded-[28px] p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/40 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Profil Akun Pengguna</h2>
                  <p className="text-xs text-muted-foreground">Perbarui informasi identitas pribadi Anda yang terdaftar pada sistem</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/30 shrink-0">
                STATUS: {userProfile.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={userProfile.name}
                  onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Contoh: Ust. M. Sholeh Al-Bantani"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Alamat Email Resmi <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={userProfile.email}
                  onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
                  placeholder="email@sidogiri-bekasi.sch.id"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  value={userProfile.phone}
                  onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
                  placeholder="0812-xxxx-xxxx"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Peran Akses Sistem (RBAC)
                </label>
                <div className="w-full px-4 py-2.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-border/40 text-xs text-muted-foreground flex items-center justify-between">
                  <span className="font-semibold text-foreground uppercase">{userProfile.role}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">Ditetapkan Super Admin</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
              <Sparkles size={16} className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-[11px] leading-relaxed">
                Perubahan nama atau alamat email pada formulir ini akan langsung memperbarui sesi login Anda. Nama baru Anda akan seketika tercermin pada bilah navigasi (Navbar) dan Sidebar sistem.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="liquid-sheen inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-emerald-950/20 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Menyimpan Profil...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Perbarui Profil Akun</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: KEAMANAN & KATA SANDI                                             */}
      {/* ========================================================================= */}
      {activeTab === "security" && (
        <form onSubmit={handleSavePassword} className="space-y-6">
          <div className="liquid-glass rounded-[28px] p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/40">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Keamanan & Ubah Kata Sandi</h2>
                <p className="text-xs text-muted-foreground">Pastikan kata sandi Anda kuat untuk melindungi akses akun portal pesantren</p>
              </div>
            </div>

            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Kata Sandi Saat Ini <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full pl-4 pr-10 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50 font-mono"
                    placeholder="Masukkan kata sandi lama Anda"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Kata Sandi Baru <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50 font-mono"
                    placeholder="Minimal 6 karakter"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50 font-mono"
                    placeholder="Ulangi kata sandi baru"
                  />
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/30 text-xs text-teal-800 dark:text-teal-300 flex items-start gap-2.5">
              <KeyRound size={16} className="shrink-0 mt-0.5 text-teal-600 dark:text-teal-400" />
              <p className="text-[11px] leading-relaxed">
                Kata sandi Anda dilindungi menggunakan fungsi hash kriptografi standar industri (scrypt) dengan 64-byte derived key dan unique salt 16-byte untuk menjamin kerahasiaan penuh di database.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="liquid-sheen inline-flex items-center gap-2 bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 hover:from-teal-600 hover:to-emerald-500 text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-teal-950/20 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Memperbarui Sandi...</span>
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    <span>Perbarui Kata Sandi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PROFIL INSTITUSI (GUARDED)                                        */}
      {/* ========================================================================= */}
      {activeTab === "institution" && canManageSystem && (
        <form onSubmit={handleSaveSystemSettings} className="space-y-6">
          <div className="liquid-glass rounded-[28px] p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/40 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Identitas & Informasi Resmi Institusi</h2>
                  <p className="text-xs text-muted-foreground">Parameter institusi digunakan pada kop surat resmi, laporan ekspor, dan informasi publik</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 font-bold border border-indigo-500/30 shrink-0">
                Koleksi: settings (Atlas)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Nama Resmi Institusi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={institutionForm.name}
                  onChange={(e) => setInstitutionForm({ ...institutionForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="Darul Khidmah Sidogiri Bekasi"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Sub-Header / Tagline Lembaga
                </label>
                <input
                  type="text"
                  value={institutionForm.subHeader}
                  onChange={(e) => setInstitutionForm({ ...institutionForm, subHeader: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="Pondok Pesantren Sidogiri Ranting Bekasi • Madrasah Miftahul Ulum (MI - MTs) & TPQ Tartil"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Alamat Lengkap Kompleks Pesantren <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={institutionForm.address}
                  onChange={(e) => setInstitutionForm({ ...institutionForm, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="Jl. Lapangan Kranji, Bintara, Bekasi Barat, Kota Bekasi, Jawa Barat 17134"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Nomor Telepon / WhatsApp Resmi Sekretariat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={institutionForm.phone}
                  onChange={(e) => setInstitutionForm({ ...institutionForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                  placeholder="0812-3456-7890"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Alamat Email Sekretariat
                </label>
                <input
                  type="email"
                  value={institutionForm.email}
                  onChange={(e) => setInstitutionForm({ ...institutionForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                  placeholder="sekretariat@sidogiri-bekasi.sch.id"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Situs Web Resmi
                </label>
                <input
                  type="text"
                  value={institutionForm.website}
                  onChange={(e) => setInstitutionForm({ ...institutionForm, website: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                  placeholder="https://dksidogiribekasi.vercel.app"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Nama Pimpinan / Ketua Ranting
                </label>
                <input
                  type="text"
                  value={institutionForm.leaderName}
                  onChange={(e) => setInstitutionForm({ ...institutionForm, leaderName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="KH. Bahruddin Thohir"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="liquid-sheen inline-flex items-center gap-2 bg-gradient-to-r from-indigo-700 via-indigo-600 to-emerald-600 hover:from-indigo-600 hover:to-emerald-500 text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-indigo-950/20 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Menyimpan ke Atlas...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Simpan Profil Institusi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AKADEMIK & OPERASIONAL (GUARDED)                                   */}
      {/* ========================================================================= */}
      {activeTab === "academic" && canManageSystem && (
        <form onSubmit={handleSaveSystemSettings} className="space-y-6">
          <div className="liquid-glass rounded-[28px] p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/40 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Parameter Akademik & Operasional</h2>
                  <p className="text-xs text-muted-foreground">Tentukan tahun ajaran berjalan, semester aktif, dan jam tata tertib santri</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/30 shrink-0">
                STATUS: {academicForm.operationalStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Tahun Ajaran Aktif <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={academicForm.academicYear}
                  onChange={(e) => setAcademicForm({ ...academicForm, academicYear: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
                  placeholder="2026/2027"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Semester Aktif <span className="text-red-500">*</span>
                </label>
                <select
                  value={academicForm.semester}
                  onChange={(e) => setAcademicForm({ ...academicForm, semester: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                >
                  <option value="Ganjil" className="bg-card text-foreground">Semester Ganjil</option>
                  <option value="Genap" className="bg-card text-foreground">Semester Genap</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Status Operasional Pesantren <span className="text-red-500">*</span>
                </label>
                <select
                  value={academicForm.operationalStatus}
                  onChange={(e) => setAcademicForm({ ...academicForm, operationalStatus: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                >
                  <option value="AKTIF" className="bg-card text-foreground">Beroperasi Aktif / Normal</option>
                  <option value="IMTIHAN" className="bg-card text-foreground">Masa Imtihan / Ujian Semester</option>
                  <option value="LIBUR" className="bg-card text-foreground">Masa Libur Semester</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Batas Jam Malam Santri (Curfew)
                </label>
                <input
                  type="text"
                  value={academicForm.curfewTime}
                  onChange={(e) => setAcademicForm({ ...academicForm, curfewTime: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
                  placeholder="Contoh: 22:00 WIB"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Target / Kuota Default Santri Baru Per Tahun
                </label>
                <input
                  type="number"
                  min={10}
                  max={1000}
                  value={academicForm.defaultQuota}
                  onChange={(e) => setAcademicForm({ ...academicForm, defaultQuota: Number(e.target.value) || 150 })}
                  className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
                  placeholder="150"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="liquid-sheen inline-flex items-center gap-2 bg-gradient-to-r from-amber-700 via-amber-600 to-emerald-600 hover:from-amber-600 hover:to-emerald-500 text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-amber-950/20 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Menyimpan ke Atlas...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Simpan Pengaturan Akademik</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: TAMPILAN & NOTIFIKASI                                              */}
      {/* ========================================================================= */}
      {activeTab === "preferences" && (
        <form onSubmit={handleSaveSystemSettings} className="space-y-6">
          {/* Section A: Tema Antarmuka */}
          <div className="liquid-glass rounded-[28px] p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-border/40">
              <div className="w-9 h-9 rounded-2xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <Sun size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Mode Tampilan Antarmuka (Apple Liquid Glass)</h2>
                <p className="text-xs text-muted-foreground">Pilih estetika warna tema yang nyaman bagi pandangan Anda di seluruh modul</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Light Mode */}
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-4 rounded-2xl border text-left space-y-2 transition-all cursor-pointer ${
                  mounted && theme === "light"
                    ? "bg-white/90 dark:bg-black/50 border-emerald-500 shadow-md ring-2 ring-emerald-500/40"
                    : "liquid-glass border-border/40 hover:bg-white/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Sun size={20} className="text-amber-500" />
                  {mounted && theme === "light" && <CheckCircle2 size={16} className="text-emerald-600" />}
                </div>
                <div>
                  <strong className="block text-xs text-foreground">Frosted Pearl</strong>
                  <span className="text-[11px] text-muted-foreground">Mode Terang Teduh Sidogiri</span>
                </div>
              </button>

              {/* Dark Mode */}
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-4 rounded-2xl border text-left space-y-2 transition-all cursor-pointer ${
                  mounted && theme === "dark"
                    ? "bg-white/90 dark:bg-black/50 border-emerald-500 shadow-md ring-2 ring-emerald-500/40"
                    : "liquid-glass border-border/40 hover:bg-white/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Moon size={20} className="text-emerald-400" />
                  {mounted && theme === "dark" && <CheckCircle2 size={16} className="text-emerald-600" />}
                </div>
                <div>
                  <strong className="block text-xs text-foreground">Obsidian Smoked</strong>
                  <span className="text-[11px] text-muted-foreground">Mode Gelap Kaca Jade</span>
                </div>
              </button>

              {/* System Preference */}
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`p-4 rounded-2xl border text-left space-y-2 transition-all cursor-pointer ${
                  mounted && theme === "system"
                    ? "bg-white/90 dark:bg-black/50 border-emerald-500 shadow-md ring-2 ring-emerald-500/40"
                    : "liquid-glass border-border/40 hover:bg-white/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Laptop size={20} className="text-teal-600" />
                  {mounted && theme === "system" && <CheckCircle2 size={16} className="text-emerald-600" />}
                </div>
                <div>
                  <strong className="block text-xs text-foreground">Sistem Otomatis</strong>
                  <span className="text-[11px] text-muted-foreground">Menyesuaikan Device OS</span>
                </div>
              </button>
            </div>
          </div>

          {/* Section B: Notifikasi WhatsApp Gateway */}
          <div className="liquid-glass rounded-[28px] p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/40 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-teal-500/15 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Bell size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Integrasi Notifikasi WhatsApp Gateway</h2>
                  <p className="text-xs text-muted-foreground">Pengiriman otomatis tembusan pesan resmi kepada kontak wali santri & nomor pengurus</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-800 dark:text-teal-300 font-bold border border-teal-500/30 shrink-0">
                Live Gateway
              </span>
            </div>

            <div className="space-y-3.5">
              <label className="flex items-center justify-between p-4 rounded-2xl liquid-glass border border-border/40 cursor-pointer hover:bg-white/20 transition-colors">
                <div className="space-y-0.5 pr-4">
                  <strong className="text-xs text-foreground block">Notifikasi Status Pendaftaran Baru (PPDB)</strong>
                  <span className="text-[11px] text-muted-foreground">Kirim pesan WhatsApp otomatis saat berkas santri baru berhasil didaftarkan atau diverifikasi</span>
                </div>
                <input
                  type="checkbox"
                  disabled={!canManageSystem}
                  checked={notificationForm.waNewAdmission}
                  onChange={(e) => setNotificationForm({ ...notificationForm, waNewAdmission: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer shrink-0"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-2xl liquid-glass border border-border/40 cursor-pointer hover:bg-white/20 transition-colors">
                <div className="space-y-0.5 pr-4">
                  <strong className="text-xs text-foreground block">Pemberitahuan Izin Pulang & Mutasi Santri</strong>
                  <span className="text-[11px] text-muted-foreground">Kirim konfirmasi resmi ke kontak wali saat surat izin atau mutasi santri diterbitkan</span>
                </div>
                <input
                  type="checkbox"
                  disabled={!canManageSystem}
                  checked={notificationForm.waPermitMutation}
                  onChange={(e) => setNotificationForm({ ...notificationForm, waPermitMutation: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer shrink-0"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-2xl liquid-glass border border-border/40 cursor-pointer hover:bg-white/20 transition-colors">
                <div className="space-y-0.5 pr-4">
                  <strong className="text-xs text-foreground block">Pengingat Jadwal Imtihan & Ujian Semester</strong>
                  <span className="text-[11px] text-muted-foreground">Kirim notifikasi jadwal imtihan berkala kepada para wali santri</span>
                </div>
                <input
                  type="checkbox"
                  disabled={!canManageSystem}
                  checked={notificationForm.waExamSchedule}
                  onChange={(e) => setNotificationForm({ ...notificationForm, waExamSchedule: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer shrink-0"
                />
              </label>

              {canManageSystem && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Nomor WhatsApp Admin Penerima Tembusan Log
                  </label>
                  <input
                    type="text"
                    value={notificationForm.adminNotificationPhone}
                    onChange={(e) => setNotificationForm({ ...notificationForm, adminNotificationPhone: e.target.value })}
                    className="w-full max-w-md px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono"
                    placeholder="Contoh: 0812-3456-7899"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Setiap notifikasi penting akan dikirimkan salinan tembusan ke nomor admin ini.
                  </p>
                </div>
              )}
            </div>

            {canManageSystem && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="liquid-sheen inline-flex items-center gap-2 bg-gradient-to-r from-cyan-700 via-cyan-600 to-emerald-600 hover:from-cyan-600 hover:to-emerald-500 text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-cyan-950/20 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Menyimpan ke Atlas...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Simpan Preferensi Notifikasi</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: PEMELIHARAAN & DATABASE (SUPER ADMIN ONLY)                         */}
      {/* ========================================================================= */}
      {activeTab === "maintenance" && isSuperAdmin && (
        <div className="space-y-6">
          {/* Health Metrics Card */}
          <div className="liquid-glass rounded-[28px] p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border/40 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Activity size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Status Pangkalan Data MongoDB Atlas</h2>
                  <p className="text-xs text-muted-foreground">Pantauan kesehatan koneksi klaster, latensi ping jaringan, dan total koleksi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={loadDatabaseHealth}
                disabled={healthLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass border border-white/60 dark:border-white/10 text-xs font-bold text-foreground hover:bg-white/30 transition-all cursor-pointer shrink-0"
              >
                <RefreshCw size={13} className={healthLoading ? "animate-spin" : ""} />
                <span>Uji Latensi</span>
              </button>
            </div>

            {databaseHealth ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl liquid-glass border border-emerald-500/30 text-center">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Status Klaster
                  </span>
                  <span className="inline-flex items-center justify-center gap-1.5 mt-1 text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{databaseHealth.status}</span>
                  </span>
                </div>

                <div className="p-4 rounded-2xl liquid-glass border border-emerald-500/30 text-center">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Latensi Ping Atlas
                  </span>
                  <span className="text-lg font-black text-foreground font-mono mt-0.5 block">
                    {databaseHealth.latencyMs} <span className="text-xs font-normal text-muted-foreground">ms</span>
                  </span>
                </div>

                <div className="p-4 rounded-2xl liquid-glass border border-emerald-500/30 text-center">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Jumlah Koleksi
                  </span>
                  <span className="text-lg font-black text-purple-700 dark:text-purple-300 font-mono mt-0.5 block">
                    {databaseHealth.totalCollections} <span className="text-xs font-normal text-muted-foreground">koleksi</span>
                  </span>
                </div>

                <div className="p-4 rounded-2xl liquid-glass border border-emerald-500/30 text-center">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Total Dokumen
                  </span>
                  <span className="text-lg font-black text-foreground font-mono mt-0.5 block">
                    {databaseHealth.totalDocuments} <span className="text-xs font-normal text-muted-foreground">dokumen</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <RefreshCw size={24} className="mx-auto animate-spin mb-2" />
                <p className="text-xs font-semibold">Memeriksa status koneksi klaster...</p>
              </div>
            )}

            {/* Collections Breakdown Grid */}
            {databaseHealth?.collectionsDetail && (
              <div className="pt-2">
                <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider block mb-2">
                  Daftar Koleksi MongoDB Atlas Terverifikasi
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {databaseHealth.collectionsDetail.map((col) => (
                    <div
                      key={col.name}
                      className="p-2.5 rounded-xl bg-white/40 dark:bg-white/5 border border-border/30 flex items-center justify-between"
                    >
                      <span className="font-mono text-[11px] font-semibold text-foreground truncate mr-2">
                        {col.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-bold shrink-0">
                        {col.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Maintenance Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Action 1: Revalidate Cache */}
            <div className="rounded-3xl liquid-glass-elevated p-6 border border-white/60 dark:border-white/10 shadow-lg flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-3">
                  <RefreshCw size={20} />
                </div>
                <h3 className="font-extrabold text-foreground text-sm">Sinkronisasi & Revalidasi Cache</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Perbarui seluruh cache halaman Next.js (SSR & ISR) agar seluruh perubahan data santri, guru, dan modul langsung segar.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRevalidateCache}
                disabled={revalidating}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-60"
              >
                {revalidating ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Sinkronisasi...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    <span>Sinkronkan Cache</span>
                  </>
                )}
              </button>
            </div>

            {/* Action 2: Export JSON Snapshot */}
            <div className="rounded-3xl liquid-glass-elevated p-6 border border-white/60 dark:border-white/10 shadow-lg flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <FileJson size={20} />
                </div>
                <h3 className="font-extrabold text-foreground text-sm">Ekspor Cadangan Konfigurasi</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Unduh berkas JSON cadangan berisikan seluruh konfigurasi institusi, akademik, dan preferensi gateway.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportJson}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md"
              >
                <Download size={14} />
                <span>Unduh Berkas JSON</span>
              </button>
            </div>

            {/* Action 3: Reset to Default */}
            <div className="rounded-3xl liquid-glass-elevated p-6 border border-red-500/30 shadow-lg flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-red-500/15 text-red-700 dark:text-red-400 flex items-center justify-center mb-3">
                  <RotateCcw size={20} />
                </div>
                <h3 className="font-extrabold text-red-600 dark:text-red-400 text-sm">Reset ke Standar Sidogiri</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Kembalikan parameter institusi dan akademik ke konfigurasi baku resmi Pondok Pesantren Sidogiri Ranting Bekasi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md"
              >
                <RotateCcw size={14} />
                <span>Reset Konfigurasi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL KONFIRMASI RESET                                                   */}
      {/* ========================================================================= */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl liquid-glass-elevated p-6 border border-red-500/30 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center">
              <RotateCcw size={24} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground">Konfirmasi Reset Pengaturan</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Tindakan ini akan mengembalikan seluruh nama institusi, kontak sekretariat, tahun ajaran aktif, dan notifikasi ke nilai baku awal resmi Sidogiri Bekasi. Apakah Anda yakin ingin melanjutkan?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-2xl liquid-glass border border-border/40 text-xs font-semibold text-foreground hover:bg-white/30 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? "Mereset..." : "Ya, Reset Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
