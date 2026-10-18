"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getRolesAction, updateRolePermissionsAction } from "@/lib/actions/roles";
import {
  ShieldCheck,
  Users,
  LayoutGrid,
  UserCheck,
  HeartHandshake,
  BedDouble,
  Image as ImageIcon,
  Sparkles,
  Settings,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  Check,
} from "lucide-react";

interface RolePermission {
  id: string;
  name: string;
  description: string;
  level: "Root Security" | "Manajerial" | "Akademik" | "Keluarga" | "Operasional";
  badgeColor: string;
  permissions: {
    modules: boolean;
    students: boolean;
    teachers: boolean;
    parents: boolean;
    dormitory: boolean;
    media: boolean;
    users: boolean;
    data_science: boolean;
    settings: boolean;
  };
  updatedAt?: string;
}

interface ModuleMeta {
  key: keyof RolePermission["permissions"];
  title: string;
  path: string;
  icon: React.ElementType;
  description: string;
  category: "Dasar" | "Akademik" | "Fasilitas" | "Sistem";
}

const MODULES_META: ModuleMeta[] = [
  {
    key: "modules",
    title: "Dashboard & Modul Sistem",
    path: "/modules",
    icon: LayoutGrid,
    description: "Akses ke halaman beranda modul dan katalog navigasi internal pesantren.",
    category: "Dasar",
  },
  {
    key: "students",
    title: "Buku Induk Santri",
    path: "/students",
    icon: Users,
    description: "Pendataan santri mukim/non-mukim MI, MTs, dan TPQ Sidogiri.",
    category: "Akademik",
  },
  {
    key: "teachers",
    title: "Direktori Dewan Asatidz",
    path: "/teachers",
    icon: UserCheck,
    description: "Daftar pengajar kitab kuning, guru kelas, dan pembina tahsin tartil.",
    category: "Akademik",
  },
  {
    key: "parents",
    title: "Portal Wali Santri",
    path: "/parents",
    icon: HeartHandshake,
    description: "Data relasi keluarga, kontak darurat, dan koordinasi dengan orang tua.",
    category: "Akademik",
  },
  {
    key: "dormitory",
    title: "Manajemen Asrama Santri",
    path: "/modules/dormitory",
    icon: BedDouble,
    description: "Pemetaan kamar Asrama Sayyid Sulaiman & Kiai Aminullah serta kuota tempat tidur.",
    category: "Fasilitas",
  },
  {
    key: "media",
    title: "Pusat Media & Dokumentasi",
    path: "/modules/media",
    icon: ImageIcon,
    description: "Pengelolaan arsip foto, video kajian, dan publikasi syiar dakwah ke galeri publik.",
    category: "Fasilitas",
  },
  {
    key: "users",
    title: "Manajemen Pengguna & RBAC",
    path: "/modules/users",
    icon: ShieldCheck,
    description: "Pengelolaan akun login pengguna dan kustomisasi matriks hak akses peran.",
    category: "Sistem",
  },
  {
    key: "data_science",
    title: "AI & Analitik Prediktif",
    path: "/data-science",
    icon: Sparkles,
    description: "Model analitik perkembangan santri dan visualisasi data kepesantrenan terpadu.",
    category: "Sistem",
  },
  {
    key: "settings",
    title: "Pengaturan & Keamanan Database",
    path: "/settings",
    icon: Settings,
    description: "Status koneksi MongoDB Atlas, audit trail, dan konfigurasi lingkungan server.",
    category: "Sistem",
  },
];

export default function RolesPermissionCustomizationPage() {
  const [roles, setRoles] = useState<RolePermission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("super_admin");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchRoles = () => {
    getRolesAction()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setRoles(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat roles:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const showToast = (text: string, type: "success" | "error") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  const handleTogglePermission = (moduleKey: keyof RolePermission["permissions"]) => {
    if (!selectedRole) return;

    // Protected rules for Super Admin
    if (selectedRole.id === "super_admin" && (moduleKey === "users" || moduleKey === "settings" || moduleKey === "modules")) {
      showToast("Modul keamanan inti Super Admin tidak dapat dinonaktifkan.", "error");
      return;
    }

    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.id !== selectedRole.id) return role;
        return {
          ...role,
          permissions: {
            ...role.permissions,
            [moduleKey]: !role.permissions[moduleKey],
          },
        };
      })
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      const res = await updateRolePermissionsAction(selectedRole.id, selectedRole.permissions);
      if (res.success) {
        showToast(`Hak akses peran "${selectedRole.name}" berhasil disimpan ke database!`, "success");
        fetchRoles();
      } else {
        showToast(res.error || "Gagal menyimpan perubahan.", "error");
      }
    } catch {
      showToast("Terjadi kendala saat menyimpan hak akses.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl liquid-glass border shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 text-xs font-semibold ${
            toastMessage.type === "success"
              ? "border-emerald-500/40 text-emerald-800 dark:text-emerald-300 bg-emerald-500/15"
              : "border-rose-500/40 text-rose-700 dark:text-rose-300 bg-rose-500/15"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/modules/users"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors liquid-glass-pill px-4 py-2"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Daftar Pengguna</span>
        </Link>

        {selectedRole && (
          <button
            type="button"
            onClick={handleSavePermissions}
            disabled={saving}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-600 text-white text-xs font-semibold shadow-md flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
          >
            <Save size={15} />
            <span>{saving ? "Menyimpan..." : `Simpan Wewenang ${selectedRole.name}`}</span>
          </button>
        )}
      </div>

      {/* Header Banner */}
      <div className="relative rounded-[32px] overflow-hidden liquid-glass-elevated border border-white/60 dark:border-white/10 p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>Role-Based Access Control (RBAC) System</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Kustomisasi Hak Akses &amp; Peran Sistem
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Atur wewenang akses dan visibilitas setiap modul secara fleksibel bagi Super Admin, Admin Yayasan, Dewan Asatidz, Wali Santri, dan Staf Tarbiyah Darul Khidmah Sidogiri Bekasi.
          </p>
        </div>

        {/* Navigation Tabs (Users vs Roles) */}
        <div className="flex items-center gap-2 border-b border-white/15 dark:border-white/10 pb-3">
          <Link
            href="/modules/users"
            className="px-4 py-2 rounded-2xl text-xs font-semibold liquid-glass border border-white/40 text-muted-foreground hover:text-foreground transition-colors"
          >
            Daftar Akun Pengguna
          </Link>
          <button
            type="button"
            className="px-4 py-2 rounded-2xl text-xs font-semibold bg-gradient-to-r from-emerald-800 to-teal-700 text-white shadow-md cursor-default"
          >
            Matriks Hak Akses (RBAC)
          </button>
        </div>

        {/* Role Capsule Selector */}
        {loading ? (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-28 rounded-full bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {roles.map((role) => {
              const isSelected = selectedRole?.id === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-600 text-white shadow-md shadow-emerald-950/20 scale-105"
                      : "liquid-glass border border-white/40 dark:border-white/10 text-muted-foreground hover:text-foreground hover:border-white/80"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{role.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Role Active Card */}
      {selectedRole && (
        <div className="rounded-3xl liquid-glass border border-white/50 dark:border-white/10 p-6 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedRole.badgeColor}`}>
                  {selectedRole.level}
                </span>
                <span className="text-xs font-mono text-muted-foreground">ID: {selectedRole.id}</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">{selectedRole.name}</h2>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                {selectedRole.description}
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs font-semibold text-muted-foreground">Modul Diizinkan</div>
              <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                {Object.values(selectedRole.permissions).filter(Boolean).length} / {MODULES_META.length} Modul
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permission Matrix Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Matriks Modul &amp; Hak Akses
          </h3>
          <span className="text-xs text-muted-foreground">
            Klik toggle switch untuk mengubah status izin
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES_META.map((mod) => {
            const isAllowed = selectedRole ? selectedRole.permissions[mod.key] : false;
            const Icon = mod.icon;
            const isProtectedAdmin = selectedRole?.id === "super_admin" && (mod.key === "users" || mod.key === "settings" || mod.key === "modules");

            return (
              <div
                key={mod.key}
                onClick={() => handleTogglePermission(mod.key)}
                className={`group rounded-3xl liquid-glass-interactive border p-5 flex flex-col justify-between space-y-4 cursor-pointer transition-all duration-300 ${
                  isAllowed
                    ? "border-emerald-500/40 bg-emerald-500/5 shadow-md"
                    : "border-white/40 dark:border-white/10 opacity-70 hover:opacity-100"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                          isAllowed
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20"
                            : "liquid-glass border border-white/30 text-muted-foreground"
                        }`}
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {mod.category}
                        </span>
                        <h4 className="font-extrabold text-sm text-foreground leading-snug">
                          {mod.title}
                        </h4>
                      </div>
                    </div>

                    {/* Apple Style Toggle Switch */}
                    <div className="relative inline-flex items-center cursor-pointer shrink-0">
                      <div
                        className={`w-11 h-6 rounded-full transition-colors duration-300 relative ${
                          isAllowed ? "bg-emerald-600" : "bg-black/20 dark:bg-white/20"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 absolute top-0.5 ${
                            isAllowed ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                {/* Footer status pill */}
                <div className="pt-3 border-t border-white/15 dark:border-white/10 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-[10px] text-muted-foreground">{mod.path}</span>

                  <span
                    className={`inline-flex items-center gap-1 font-bold ${
                      isAllowed
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isProtectedAdmin ? (
                      <>
                        <Lock size={12} />
                        <span>Terkunci Root</span>
                      </>
                    ) : isAllowed ? (
                      <>
                        <Check size={12} />
                        <span>Akses Diizinkan</span>
                      </>
                    ) : (
                      <span>Dibatasi</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Save Bar */}
      {selectedRole && (
        <div className="sticky bottom-6 z-20 liquid-glass-elevated rounded-3xl border border-white/60 dark:border-white/10 p-4 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-muted-foreground">
              Konfigurasi wewenang peran: <strong>{selectedRole.name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchRoles}
              className="px-4 py-2 rounded-full liquid-glass border border-white/40 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSavePermissions}
              disabled={saving}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-emerald-800 to-teal-700 text-white text-xs font-semibold shadow-md hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
            >
              <Save size={14} />
              <span>{saving ? "Menyimpan..." : "Simpan Perubahan RBAC"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
