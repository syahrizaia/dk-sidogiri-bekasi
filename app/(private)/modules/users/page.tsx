"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  getUsersAction, 
  createUserAction, 
  updateUserAction 
} from "@/lib/actions/users";
import {
  Users,
  ShieldCheck,
  UserPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
  KeyRound,
  UserCheck,
  Power,
  Sparkles,
} from "lucide-react";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  phone?: string;
  createdAt: string;
}

const ROLES = [
  { value: "all", label: "Semua Peran", badgeColor: "bg-muted/40 text-muted-foreground border-white/10" },
  { value: "super_admin", label: "Super Admin", badgeColor: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30" },
  { value: "admin_yayasan", label: "Admin Yayasan", badgeColor: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30" },
  { value: "guru", label: "Dewan Asatidz", badgeColor: "bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30" },
  { value: "orang_tua", label: "Wali Santri", badgeColor: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30" },
  { value: "staf", label: "Staf Administrasi", badgeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" },
];

function getRoleMetadata(role: string) {
  if (role === "super_admin" || role === "admin") {
    return { label: "Super Admin", badgeColor: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30" };
  }
  if (role === "admin_yayasan") {
    return { label: "Admin Yayasan", badgeColor: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30" };
  }
  if (role === "guru" || role === "teacher") {
    return { label: "Dewan Asatidz", badgeColor: "bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30" };
  }
  if (role === "orang_tua" || role === "parent") {
    return { label: "Wali Santri", badgeColor: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30" };
  }
  return { label: "Staf Administrasi", badgeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" };
}

export default function UsersManagementModulePage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState<string>("guru");
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = () => {
    getUsersAction()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setUsers(res.data as unknown as UserItem[]);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat pengguna:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (text: string, type: "success" | "error") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Stats
  const totalUsers = users.length;
  const totalAdmins = useMemo(() => users.filter((u) => u.role === "admin" || u.role === "super_admin").length, [users]);
  const totalTeachers = useMemo(() => users.filter((u) => u.role === "teacher" || u.role === "guru").length, [users]);
  const totalParents = useMemo(() => users.filter((u) => u.role === "parent" || u.role === "orang_tua").length, [users]);

  // Filter
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchRole = activeRole === "all" || user.role === activeRole;
      const matchSearch =
        searchQuery.trim() === "" ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.phone && user.phone.includes(searchQuery));
      return matchRole && matchSearch;
    });
  }, [users, activeRole, searchQuery]);

  // Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createUserAction({
        name: formName,
        email: formEmail,
        password: formPassword,
        phone: formPhone,
        role: formRole,
        status: formStatus,
      });

      if (res.success) {
        showToast("Pengguna baru berhasil didaftarkan!", "success");
        setShowAddModal(false);
        setFormName("");
        setFormEmail("");
        setFormPassword("");
        setFormPhone("");
        fetchUsers();
      } else {
        showToast(res.error || "Gagal menambahkan pengguna.", "error");
      }
    } catch {
      showToast("Terjadi kendala saat menambahkan pengguna.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle user status
  const handleToggleStatus = async (user: UserItem) => {
    const nextStatus = user.status === "active" ? "inactive" : "active";
    try {
      const res = await updateUserAction(user._id, { status: nextStatus });
      if (res.success) {
        showToast(`Status akun ${user.name} diubah menjadi ${nextStatus === "active" ? "Aktif" : "Nonaktif"}.`, "success");
        fetchUsers();
      } else {
        showToast(res.error || "Gagal mengubah status.", "error");
      }
    } catch {
      showToast("Gagal mengubah status akun.", "error");
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
          href="/modules"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors liquid-glass-pill px-4 py-2"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Modul Sistem</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/modules/users/roles"
            className="px-4 py-2 rounded-full liquid-glass border border-white/50 text-xs font-semibold flex items-center gap-1.5 text-foreground hover:bg-white/10 transition-all cursor-pointer"
          >
            <KeyRound size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>Atur Hak Akses (RBAC)</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-700 to-teal-600 text-white text-xs font-semibold shadow-md flex items-center gap-2 hover:opacity-95 transition-all cursor-pointer"
          >
            <UserPlus size={15} />
            <span>Tambah Pengguna Baru</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="relative rounded-[32px] overflow-hidden liquid-glass-elevated border border-white/60 dark:border-white/10 p-6 sm:p-10 shadow-2xl space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/15 dark:border-white/10 pb-3">
          <button
            type="button"
            className="px-4 py-2 rounded-2xl text-xs font-semibold bg-gradient-to-r from-emerald-800 to-teal-700 text-white shadow-md cursor-default"
          >
            Daftar Akun Pengguna
          </button>
          <Link
            href="/modules/users/roles"
            className="px-4 py-2 rounded-2xl text-xs font-semibold liquid-glass border border-white/40 text-muted-foreground hover:text-foreground transition-colors"
          >
            Matriks Hak Akses (RBAC)
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>Pusat Keamanan &amp; Manajemen Hak Akses</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Manajemen Pengguna &amp; Akun
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Pengelolaan kredensial akun, kontrol peran bertingkat (RBAC) untuk Administrator, Dewan Asatidz, Wali Santri, dan Staf Tarbiyah Darul Khidmah Sidogiri Bekasi.
            </p>
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-80 relative">
            <div className="liquid-glass rounded-full border border-white/50 dark:border-white/15 p-1.5 shadow-md flex items-center">
              <Search className="ml-3 text-muted-foreground shrink-0" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, email, no. telp..."
                className="w-full bg-transparent px-2.5 py-1.5 text-xs text-foreground focus:outline-none placeholder:text-muted-foreground/60"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 mr-1 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats 4-Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/20 dark:border-white/10">
          <div className="p-4 rounded-2xl liquid-glass border border-white/40 dark:border-white/10 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold">Total Pengguna</span>
              <Users size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">{totalUsers}</div>
            <div className="text-[10px] text-muted-foreground">Terdaftar di database</div>
          </div>

          <div className="p-4 rounded-2xl liquid-glass border border-white/40 dark:border-white/10 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold">Administrator</span>
              <ShieldCheck size={16} className="text-rose-600 dark:text-rose-400" />
            </div>
            <div className="text-2xl font-extrabold text-rose-700 dark:text-rose-300">{totalAdmins}</div>
            <div className="text-[10px] text-muted-foreground">Hak akses penuh</div>
          </div>

          <div className="p-4 rounded-2xl liquid-glass border border-white/40 dark:border-white/10 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold">Dewan Asatidz</span>
              <UserCheck size={16} className="text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">{totalTeachers}</div>
            <div className="text-[10px] text-muted-foreground">Guru &amp; Pembina</div>
          </div>

          <div className="p-4 rounded-2xl liquid-glass border border-white/40 dark:border-white/10 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold">Wali Santri</span>
              <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{totalParents}</div>
            <div className="text-[10px] text-muted-foreground">Akses portal keluarga</div>
          </div>
        </div>

        {/* Filter Capsule Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {ROLES.map((r) => {
            const isActive = activeRole === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setActiveRole(r.value)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-md scale-105"
                    : "liquid-glass border border-white/40 dark:border-white/10 text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-2xl liquid-glass border border-white/30 animate-pulse" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-3xl liquid-glass border border-white/40 dark:border-white/10 p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">
            Tidak ditemukan akun pengguna dengan kriteria pencarian ini.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/5 dark:bg-white/5 border-b border-white/10 text-muted-foreground font-semibold">
                <tr>
                  <th className="py-4 px-6">Pengguna</th>
                  <th className="py-4 px-4">Kontak</th>
                  <th className="py-4 px-4">Peran Sistem (Role)</th>
                  <th className="py-4 px-4">Status Akun</th>
                  <th className="py-4 px-4">Tanggal Daftar</th>
                  <th className="py-4 px-6 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((item) => {
                  const roleMeta = getRoleMetadata(item.role);
                  const isUserActive = item.status === "active";

                  return (
                    <tr key={item._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-600 text-white font-extrabold flex items-center justify-center shrink-0 shadow-md">
                            {item.name ? item.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm">{item.name}</p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Mail size={12} />
                              {item.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-muted-foreground">
                        {item.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone size={12} className="text-emerald-600 dark:text-emerald-400" />
                            {item.phone}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border ${roleMeta.badgeColor}`}
                        >
                          {roleMeta.label}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                            isUserActive
                              ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                              : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/25"
                          }`}
                          title="Klik untuk mengubah status aktif/nonaktif"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isUserActive ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          <span>{isUserActive ? "Aktif" : "Nonaktif"}</span>
                        </button>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-muted-foreground text-[11px]">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID") : "-"}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass border border-white/30 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          <Power size={13} className={isUserActive ? "text-rose-500" : "text-emerald-500"} />
                          <span>{isUserActive ? "Nonaktifkan" : "Aktifkan"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Pengguna Baru */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-[32px] liquid-glass-elevated border border-white/50 dark:border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Pendaftaran Akun Pengguna Baru</h2>
                <p className="text-xs text-muted-foreground">
                  Buat akun untuk dewan asatidz, staf administrasi, atau wali santri.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="misal: Ust. Ahmad Fauzi, S.Pd.I"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Alamat Email</label>
                <input
                  type="email"
                  required
                  placeholder="nama@sidogiri-bekasi.sch.id"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Nomor Telepon / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="08123456789"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Kata Sandi Awal</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="Minimal 6 karakter"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none"
                    />
                    <KeyRound size={14} className="absolute right-3 top-2.5 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Peran Sistem (Role)</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none bg-background text-foreground"
                  >
                    <option value="guru">Dewan Asatidz (Guru)</option>
                    <option value="admin_yayasan">Admin Yayasan</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="orang_tua">Wali Santri</option>
                    <option value="staf">Staf Administrasi</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Status Akun</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as "active" | "inactive")}
                    className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none bg-background text-foreground"
                  >
                    <option value="active">Aktif (Dapat Login)</option>
                    <option value="inactive">Nonaktif (Ditangguhkan)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full liquid-glass border border-white/30 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-full bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer shadow-md"
                >
                  {submitting ? "Mendaftarkan..." : "Daftarkan Pengguna"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
