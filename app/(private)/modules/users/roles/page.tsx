"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  getRolesAction,
  updateRolePermissionsAction,
} from "@/lib/actions/roles";
import {
  DEFAULT_ROLE_PERMISSIONS,
  type RolePermission,
  type CrudActionPermissions,
  type ModulePermissionKey,
} from "@/lib/roles-config";
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
  Plus,
  Eye,
  Pencil,
  Trash2,
  RotateCcw,
  CheckCheck,
  Layers,
  BookOpen,
  Building2,
  Compass,
  WalletCards,
  UserPlus,
} from "lucide-react";

interface ModuleMeta {
  key: ModulePermissionKey;
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
    key: "admissions",
    title: "Pendaftaran Santri Baru (Admissions)",
    path: "/modules/admissions",
    icon: UserPlus,
    description: "Verifikasi pendaftaran online calon santri baru MI/MTs/TPQ, seleksi berkas, dan penetapan status kelulusan.",
    category: "Akademik",
  },
  {
    key: "mi",
    title: "Madrasah Ibtidaiyah (MI)",
    path: "/modules/mi",
    icon: BookOpen,
    description: "Unit pendidikan dasar Miftahul Ulum, santri tingkat ibtidaiyah, kurikulum salaf & umum.",
    category: "Akademik",
  },
  {
    key: "mts",
    title: "Madrasah Tsanawiyah (MTs)",
    path: "/modules/mts",
    icon: Building2,
    description: "Unit pendidikan menengah Miftahul Ulum, pendalaman kitab fathul qarib, dan asatidz pembina.",
    category: "Akademik",
  },
  {
    key: "tpq",
    title: "TPQ Al-Qur'an Sidogiri",
    path: "/modules/tpq",
    icon: Compass,
    description: "Pendidikan Al-Qur'an tartil metode Sidogiri, tahsin qira'ah, dan kelas sore santri.",
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
    key: "finance",
    title: "Keuangan & Tagihan Santri",
    path: "/modules/finance",
    icon: WalletCards,
    description: "Pusat transaksi kas masuk/keluar, pembayaran iuran syahriyah (SPP), dan cetak kwitansi.",
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

  // Helper Toggle Master Module Visibility
  const handleTogglePermission = (moduleKey: ModulePermissionKey) => {
    if (!selectedRole) return;

    // Protected rules for Super Admin
    if (
      selectedRole.id === "super_admin" &&
      (moduleKey === "users" || moduleKey === "settings" || moduleKey === "modules")
    ) {
      showToast("Modul keamanan inti Super Admin tidak dapat dinonaktifkan.", "error");
      return;
    }

    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.id !== selectedRole.id) return role;

        const willBeAllowed = !role.permissions[moduleKey];
        const currentCrud = role.crudPermissions?.[moduleKey];

        const updatedCrud: CrudActionPermissions = willBeAllowed
          ? {
              create: currentCrud?.create ?? false,
              read: true,
              update: currentCrud?.update ?? false,
              delete: currentCrud?.delete ?? false,
            }
          : {
              create: false,
              read: false,
              update: false,
              delete: false,
            };

        return {
          ...role,
          permissions: {
            ...role.permissions,
            [moduleKey]: willBeAllowed,
          },
          crudPermissions: {
            ...role.crudPermissions,
            [moduleKey]: updatedCrud,
          },
        };
      })
    );
  };

  // Helper Toggle Specific CRUD Action (Create, Read, Update, Delete)
  const handleToggleCrudAction = (
    moduleKey: ModulePermissionKey,
    action: "create" | "read" | "update" | "delete"
  ) => {
    if (!selectedRole) return;

    // Protected rules for Super Admin
    if (
      selectedRole.id === "super_admin" &&
      (moduleKey === "users" || moduleKey === "settings" || moduleKey === "modules")
    ) {
      showToast("Hak akses inti Super Admin terkunci untuk menjaga keamanan sistem.", "error");
      return;
    }

    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.id !== selectedRole.id) return role;

        const currentCrud = role.crudPermissions?.[moduleKey] || {
          create: false,
          read: false,
          update: false,
          delete: false,
        };

        const newActionVal = !currentCrud[action];
        const updatedCrudForMod: CrudActionPermissions = {
          ...currentCrud,
          [action]: newActionVal,
        };

        // Rule: If activating Create, Update, or Delete, automatically ensure Read is enabled
        if (newActionVal && (action === "create" || action === "update" || action === "delete")) {
          updatedCrudForMod.read = true;
        }

        // Rule: If deactivating Read, automatically turn off Create, Update, and Delete
        if (!newActionVal && action === "read") {
          updatedCrudForMod.create = false;
          updatedCrudForMod.update = false;
          updatedCrudForMod.delete = false;
        }

        const isAnyCrudAllowed =
          updatedCrudForMod.create ||
          updatedCrudForMod.read ||
          updatedCrudForMod.update ||
          updatedCrudForMod.delete;

        return {
          ...role,
          permissions: {
            ...role.permissions,
            [moduleKey]: isAnyCrudAllowed,
          },
          crudPermissions: {
            ...role.crudPermissions,
            [moduleKey]: updatedCrudForMod,
          },
        };
      })
    );
  };

  // Per-Card Quick Presets
  const handleSetModuleCrudPreset = (
    moduleKey: ModulePermissionKey,
    preset: "full" | "readonly" | "none"
  ) => {
    if (!selectedRole) return;

    if (
      selectedRole.id === "super_admin" &&
      (moduleKey === "users" || moduleKey === "settings" || moduleKey === "modules")
    ) {
      showToast("Modul inti Super Admin tidak dapat diubah ke preset terbatas.", "error");
      return;
    }

    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.id !== selectedRole.id) return role;

        let newCrud: CrudActionPermissions;
        let isAllowed = true;

        if (preset === "full") {
          newCrud = { create: true, read: true, update: true, delete: true };
          isAllowed = true;
        } else if (preset === "readonly") {
          newCrud = { create: false, read: true, update: false, delete: false };
          isAllowed = true;
        } else {
          newCrud = { create: false, read: false, update: false, delete: false };
          isAllowed = false;
        }

        return {
          ...role,
          permissions: {
            ...role.permissions,
            [moduleKey]: isAllowed,
          },
          crudPermissions: {
            ...role.crudPermissions,
            [moduleKey]: newCrud,
          },
        };
      })
    );
  };

  // Global Presets for the Selected Role
  const handleApplyGlobalPreset = (mode: "all-crud" | "read-only" | "default") => {
    if (!selectedRole) return;

    if (mode === "default") {
      const defaultRole = DEFAULT_ROLE_PERMISSIONS.find((d) => d.id === selectedRole.id);
      if (defaultRole) {
        setRoles((prev) =>
          prev.map((r) =>
            r.id === selectedRole.id
              ? {
                  ...r,
                  permissions: { ...defaultRole.permissions },
                  crudPermissions: { ...defaultRole.crudPermissions },
                }
              : r
          )
        );
        showToast(`Preset rekomendasi untuk peran "${selectedRole.name}" berhasil diterapkan.`, "success");
        return;
      }
    }

    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== selectedRole.id) return r;

        const newPermissions = { ...r.permissions };
        const newCrud = { ...r.crudPermissions };

        MODULES_META.forEach((mod) => {
          if (
            r.id === "super_admin" &&
            (mod.key === "users" || mod.key === "settings" || mod.key === "modules")
          ) {
            newPermissions[mod.key] = true;
            newCrud[mod.key] = { create: true, read: true, update: true, delete: true };
            return;
          }

          if (mode === "all-crud") {
            newPermissions[mod.key] = true;
            newCrud[mod.key] = { create: true, read: true, update: true, delete: true };
          } else if (mode === "read-only") {
            if (newPermissions[mod.key]) {
              newCrud[mod.key] = { create: false, read: true, update: false, delete: false };
            }
          }
        });

        return {
          ...r,
          permissions: newPermissions,
          crudPermissions: newCrud,
        };
      })
    );

    showToast(
      mode === "all-crud"
        ? `Semua modul dan hak CRUD berhasil diaktifkan untuk "${selectedRole.name}".`
        : `Semua modul aktif berhasil diubah ke mode Hanya Baca (Read-Only).`,
      "success"
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      const res = await updateRolePermissionsAction(
        selectedRole.id,
        selectedRole.permissions,
        selectedRole.crudPermissions
      );
      if (res.success) {
        showToast(`Hak akses & wewenang CRUD peran "${selectedRole.name}" berhasil disimpan ke database!`, "success");
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

  // Metrics for active role
  const crudStats = useMemo(() => {
    if (!selectedRole?.crudPermissions) {
      return { create: 0, read: 0, update: 0, delete: 0, totalModules: 0 };
    }
    const cruds = Object.values(selectedRole.crudPermissions);
    return {
      create: cruds.filter((c) => c?.create).length,
      read: cruds.filter((c) => c?.read).length,
      update: cruds.filter((c) => c?.update).length,
      delete: cruds.filter((c) => c?.delete).length,
      totalModules: Object.values(selectedRole.permissions || {}).filter(Boolean).length,
    };
  }, [selectedRole]);

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

      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-600 hover:from-emerald-700 hover:to-teal-600 text-white text-xs font-semibold shadow-lg shadow-emerald-950/20 flex items-center gap-2 hover:scale-105 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? "Menyimpan ke Database..." : `Simpan Wewenang ${selectedRole.name}`}</span>
          </button>
        )}
      </div>

      {/* Header Banner */}
      <div className="relative rounded-[32px] overflow-hidden liquid-glass-elevated border border-white/60 dark:border-white/10 p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>Role-Based Access Control (RBAC) &amp; Granular CRUD System</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Kustomisasi Hak Akses &amp; Wewenang CRUD
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Atur wewenang operasional sistem secara presisi: izinkan akses modul dan kelola izin <strong>Create (Tambah)</strong>, <strong>Read (Lihat)</strong>, <strong>Update (Ubah)</strong>, serta <strong>Delete (Hapus)</strong> untuk setiap peran pengurus dan wali santri.
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
            className="px-4 py-2 rounded-2xl text-xs font-semibold bg-gradient-to-r from-emerald-800 to-teal-700 text-white shadow-md cursor-default flex items-center gap-1.5"
          >
            <Layers size={13} />
            <span>Matriks RBAC &amp; CRUD</span>
          </button>
        </div>

        {/* Role Capsule Selector */}
        {loading ? (
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 w-32 rounded-full bg-muted/40 animate-pulse" />
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
                      ? "bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-600 text-white shadow-md shadow-emerald-950/25 scale-105"
                      : "liquid-glass border border-white/40 dark:border-white/10 text-muted-foreground hover:text-foreground hover:border-white/80"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span>{role.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Role Active Card with CRUD Analytics */}
      {selectedRole && (
        <div className="rounded-3xl liquid-glass border border-white/50 dark:border-white/10 p-6 space-y-5 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedRole.badgeColor}`}>
                  {selectedRole.level}
                </span>
                <span className="text-xs font-mono text-muted-foreground">Role ID: {selectedRole.id}</span>
                {selectedRole.id === "super_admin" && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 text-[11px] font-semibold border border-rose-500/30 flex items-center gap-1">
                    <Lock size={11} /> Root Protected
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">{selectedRole.name}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                {selectedRole.description}
              </p>
            </div>

            {/* Granular CRUD Breakdown Badges */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
              <div className="p-3 rounded-2xl liquid-glass border border-white/40 text-center min-w-[70px]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Modul</div>
                <div className="text-lg font-black text-foreground">
                  {crudStats.totalModules}/{MODULES_META.length}
                </div>
              </div>

              <div className="p-3 rounded-2xl liquid-glass border border-emerald-500/30 bg-emerald-500/5 text-center min-w-[70px]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  [C] Create
                </div>
                <div className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                  {crudStats.create}
                </div>
              </div>

              <div className="p-3 rounded-2xl liquid-glass border border-sky-500/30 bg-sky-500/5 text-center min-w-[70px]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-400">
                  [R] Read
                </div>
                <div className="text-lg font-black text-sky-700 dark:text-sky-300">
                  {crudStats.read}
                </div>
              </div>

              <div className="p-3 rounded-2xl liquid-glass border border-amber-500/30 bg-amber-500/5 text-center min-w-[70px]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  [U] Update
                </div>
                <div className="text-lg font-black text-amber-700 dark:text-amber-300">
                  {crudStats.update}
                </div>
              </div>

              <div className="p-3 rounded-2xl liquid-glass border border-rose-500/30 bg-rose-500/5 text-center min-w-[70px]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  [D] Delete
                </div>
                <div className="text-lg font-black text-rose-600 dark:text-rose-400">
                  {crudStats.delete}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Preset Toolbar */}
          <div className="pt-3 border-t border-white/15 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold">Preset Cepat Wewenang Peran:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleApplyGlobalPreset("all-crud")}
                className="px-3 py-1.5 rounded-xl liquid-glass border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-800 dark:text-emerald-300 font-semibold transition-all flex items-center gap-1.5 cursor-pointer text-[11px]"
              >
                <CheckCheck size={13} />
                <span>Pilih Semua CRUD</span>
              </button>
              <button
                type="button"
                onClick={() => handleApplyGlobalPreset("read-only")}
                className="px-3 py-1.5 rounded-xl liquid-glass border border-sky-500/30 hover:border-sky-500/60 text-sky-800 dark:text-sky-300 font-semibold transition-all flex items-center gap-1.5 cursor-pointer text-[11px]"
              >
                <Eye size={13} />
                <span>Hanya Baca (Read-Only)</span>
              </button>
              <button
                type="button"
                onClick={() => handleApplyGlobalPreset("default")}
                className="px-3 py-1.5 rounded-xl liquid-glass border border-white/40 hover:border-white/70 text-muted-foreground hover:text-foreground font-semibold transition-all flex items-center gap-1.5 cursor-pointer text-[11px]"
              >
                <RotateCcw size={13} />
                <span>Preset Standar Rekomendasi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Matrix Grid with CRUD Options */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Matriks Modul &amp; Hak Operasi CRUD
            </h3>
            <p className="text-xs text-muted-foreground">
              Klik switch master untuk mengaktifkan modul, lalu pilih wewenang Create, Read, Update, atau Delete.
            </p>
          </div>

          {/* CRUD Legend */}
          <div className="flex items-center gap-2 text-[10px] font-semibold shrink-0">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
              [C] Create
            </span>
            <span className="px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-800 dark:text-sky-300 border border-sky-500/30">
              [R] Read
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
              [U] Update
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
              [D] Delete
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES_META.map((mod) => {
            const isAllowed = selectedRole ? selectedRole.permissions[mod.key] : false;
            const crud = selectedRole?.crudPermissions?.[mod.key] || {
              create: false,
              read: false,
              update: false,
              delete: false,
            };
            const Icon = mod.icon;
            const isProtectedAdmin =
              selectedRole?.id === "super_admin" &&
              (mod.key === "users" || mod.key === "settings" || mod.key === "modules");

            return (
              <div
                key={mod.key}
                className={`rounded-3xl border p-5 flex flex-col justify-between space-y-4 transition-all duration-300 ${
                  isAllowed
                    ? "liquid-glass-elevated border-emerald-500/40 bg-emerald-500/[0.03] shadow-md"
                    : "liquid-glass border-white/30 dark:border-white/10 opacity-75 hover:opacity-100"
                }`}
              >
                {/* Card Header & Master Switch */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
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

                    {/* Apple Style Toggle Switch (Master Module Permission) */}
                    <button
                      type="button"
                      onClick={() => handleTogglePermission(mod.key)}
                      disabled={isProtectedAdmin}
                      title={isProtectedAdmin ? "Modul dilindungi Super Admin" : "Nyalakan / Matikan Akses Modul"}
                      className={`relative inline-flex items-center cursor-pointer shrink-0 transition-opacity ${
                        isProtectedAdmin ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
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
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {mod.description}
                  </p>
                </div>

                {/* Granular CRUD Action Controls */}
                <div className="pt-3 border-t border-white/15 dark:border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-muted-foreground">
                      Pilihan Aksi CRUD:
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground/75">{mod.path}</span>
                  </div>

                  {/* 4 Interactive CRUD Buttons */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {/* Create [C] */}
                    <button
                      type="button"
                      disabled={isProtectedAdmin}
                      onClick={() => handleToggleCrudAction(mod.key, "create")}
                      className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        crud.create
                          ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/30 font-bold shadow-sm"
                          : "liquid-glass border-white/30 dark:border-white/10 text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
                      }`}
                      title="Create: Izin menambah data baru"
                    >
                      <Plus size={13} className={crud.create ? "stroke-[2.5]" : ""} />
                      <span className="text-[10px] font-extrabold uppercase">Create</span>
                    </button>

                    {/* Read [R] */}
                    <button
                      type="button"
                      disabled={isProtectedAdmin}
                      onClick={() => handleToggleCrudAction(mod.key, "read")}
                      className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        crud.read
                          ? "bg-sky-500/20 text-sky-800 dark:text-sky-300 border-sky-500/40 ring-1 ring-sky-500/30 font-bold shadow-sm"
                          : "liquid-glass border-white/30 dark:border-white/10 text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
                      }`}
                      title="Read: Izin melihat dan membuka data"
                    >
                      <Eye size={13} className={crud.read ? "stroke-[2.5]" : ""} />
                      <span className="text-[10px] font-extrabold uppercase">Read</span>
                    </button>

                    {/* Update [U] */}
                    <button
                      type="button"
                      disabled={isProtectedAdmin}
                      onClick={() => handleToggleCrudAction(mod.key, "update")}
                      className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        crud.update
                          ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40 ring-1 ring-amber-500/30 font-bold shadow-sm"
                          : "liquid-glass border-white/30 dark:border-white/10 text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
                      }`}
                      title="Update: Izin mengedit dan memperbarui data"
                    >
                      <Pencil size={13} className={crud.update ? "stroke-[2.5]" : ""} />
                      <span className="text-[10px] font-extrabold uppercase">Update</span>
                    </button>

                    {/* Delete [D] */}
                    <button
                      type="button"
                      disabled={isProtectedAdmin}
                      onClick={() => handleToggleCrudAction(mod.key, "delete")}
                      className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        crud.delete
                          ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40 ring-1 ring-rose-500/30 font-bold shadow-sm"
                          : "liquid-glass border-white/30 dark:border-white/10 text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
                      }`}
                      title="Delete: Izin menghapus data permanen"
                    >
                      <Trash2 size={13} className={crud.delete ? "stroke-[2.5]" : ""} />
                      <span className="text-[10px] font-extrabold uppercase">Delete</span>
                    </button>
                  </div>

                  {/* Card Mini Presets */}
                  <div className="pt-2 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSetModuleCrudPreset(mod.key, "full")}
                        className="px-2 py-0.5 rounded-md liquid-glass border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-800 dark:text-emerald-300 font-semibold cursor-pointer transition-colors"
                      >
                        Semua CRUD
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetModuleCrudPreset(mod.key, "readonly")}
                        className="px-2 py-0.5 rounded-md liquid-glass border border-sky-500/30 hover:border-sky-500/60 text-sky-800 dark:text-sky-300 font-semibold cursor-pointer transition-colors"
                      >
                        Hanya Baca
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSetModuleCrudPreset(mod.key, "none")}
                      className="px-2 py-0.5 rounded-md liquid-glass border border-white/30 text-muted-foreground hover:text-rose-500 font-semibold cursor-pointer transition-colors"
                    >
                      Nonaktif
                    </button>
                  </div>
                </div>

                {/* Footer status pill */}
                <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
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
                      <span>Akses Dibatasi</span>
                    )}
                  </span>

                  <span className="text-[10px] font-mono text-muted-foreground">
                    {[
                      crud.create ? "C" : "-",
                      crud.read ? "R" : "-",
                      crud.update ? "U" : "-",
                      crud.delete ? "D" : "-",
                    ].join("")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Sticky Save Bar */}
      {selectedRole && (
        <div className="sticky bottom-6 z-20 liquid-glass-elevated rounded-3xl border border-white/60 dark:border-white/10 p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-muted-foreground">
              Konfigurasi wewenang RBAC &amp; CRUD: <strong>{selectedRole.name}</strong>
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
              className="px-6 py-2 rounded-full bg-gradient-to-r from-emerald-800 to-teal-700 hover:from-emerald-700 hover:to-teal-600 text-white text-xs font-semibold shadow-lg shadow-emerald-950/20 hover:scale-105 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={14} />
              <span>{saving ? "Menyimpan ke MongoDB..." : "Simpan Perubahan RBAC & CRUD"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
