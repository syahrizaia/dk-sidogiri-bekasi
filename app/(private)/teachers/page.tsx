"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getTeachersAction, createTeacherAction } from "@/lib/actions/teachers";
import {
  UserCheck,
  Search,
  Plus,
  BookOpen,
  Building2,
  Compass,
  ArrowLeft,
  Phone,
  Calendar,
  CheckCircle2,
  X,
  Filter,
  Users,
  ShieldCheck,
  GraduationCap
} from "lucide-react";

interface Teacher {
  id: string;
  nip: string;
  name: string;
  role: string;
  institution: "MI" | "MTs" | "TPQ";
  specialization: string;
  phone: string;
  status: "AKTIF" | "CUTI";
  joinedYear: number;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInst, setSelectedInst] = useState<"ALL" | "MI" | "MTs" | "TPQ">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    nip: "",
    role: "",
    institution: "MI" as "MI" | "MTs" | "TPQ",
    specialization: "",
    phone: "",
    joinedYear: new Date().getFullYear(),
  });

  const loadTeachers = async () => {
    try {
      const res = await getTeachersAction();
      if (res.success && res.data) {
        setTeachers(res.data as unknown as Teacher[]);
      }
    } catch (err) {
      console.error("Gagal mengambil data teachers:", err);
    }
  };

  useEffect(() => {
    let ignore = false;
    getTeachersAction()
      .then((res) => {
        if (!ignore && res.success && res.data) {
          setTeachers(res.data as unknown as Teacher[]);
        }
      })
      .catch((err) => {
        console.error("Gagal mengambil data teachers:", err);
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification(null);

    try {
      const res = await createTeacherAction({
        name: formData.name,
        nip: formData.nip,
        role: formData.role,
        institution: formData.institution,
        specialization: formData.specialization,
        phone: formData.phone,
        status: "AKTIF",
        joinedYear: formData.joinedYear,
      });

      if (res.success) {
        setNotification({ type: "success", message: "Data asatidz berhasil disimpan ke MongoDB Atlas!" });
        setIsModalOpen(false);
        setFormData({
          name: "",
          nip: "",
          role: "",
          institution: "MI",
          specialization: "",
          phone: "",
          joinedYear: new Date().getFullYear(),
        });
        await loadTeachers();
      } else {
        setNotification({ type: "error", message: res.error || "Gagal menyimpan data." });
      }
    } catch {
      setNotification({ type: "error", message: "Terjadi kesalahan saat menyimpan data." });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.role.toLowerCase().includes(searchQuery.toLowerCase());

      const matchInst = selectedInst === "ALL" || t.institution === selectedInst;
      return matchSearch && matchInst;
    });
  }, [teachers, searchQuery, selectedInst]);

  const stats = useMemo(() => {
    return {
      total: teachers.length,
      mi: teachers.filter((t) => t.institution === "MI").length,
      mts: teachers.filter((t) => t.institution === "MTs").length,
      tpq: teachers.filter((t) => t.institution === "TPQ").length,
    };
  }, [teachers]);

  return (
    <div className="relative min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb & Navigation Back */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/modules"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill text-xs font-semibold text-foreground/80 hover:text-foreground transition-all"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Portal Modul</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <ShieldCheck size={14} />
          <span>MongoDB Atlas Sync</span>
        </span>
      </div>

      {/* Header Banner */}
      <div className="rounded-3xl liquid-glass-elevated p-6 sm:p-8 mb-8 border border-white/60 dark:border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
              <UserCheck size={14} />
              <span>Direktori Dewan Asatidz Sidogiri</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Tenaga Pendidik & Asatidz
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
              Manajemen dan direktori resmi dewan guru, asatidz pengampu kajian kitab kuning, tahsin Al-Qur&apos;an, dan pembina santri MI, MTs persiapan, dan TPQ Sidogiri.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer self-start md:self-center"
          >
            <Plus size={15} />
            <span>Tambah Asatidz Baru</span>
          </button>
        </div>

        {/* KPI Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-border/40">
          <div className="p-3.5 rounded-2xl liquid-glass-card">
            <span className="text-[11px] font-semibold text-muted-foreground block">Total Asatidz</span>
            <span className="text-2xl font-bold text-foreground font-mono">{stats.total}</span>
          </div>
          <div className="p-3.5 rounded-2xl liquid-glass-card">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block">MI Miftahul Ulum</span>
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono">{stats.mi}</span>
          </div>
          <div className="p-3.5 rounded-2xl liquid-glass-card">
            <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 block">MTs Persiapan</span>
            <span className="text-2xl font-bold text-teal-700 dark:text-teal-400 font-mono">{stats.mts}</span>
          </div>
          <div className="p-3.5 rounded-2xl liquid-glass-card">
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 block">TPQ Tartil</span>
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">{stats.tpq}</span>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-2xl text-xs font-medium flex items-center justify-between border ${
            notification.type === "success"
              ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/30"
              : "bg-rose-500/15 text-rose-800 dark:text-rose-200 border-rose-500/30"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{notification.message}</span>
          </div>
          <button type="button" onClick={() => setNotification(null)} className="opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama asatidz, NIP, atau spesialisasi kitab..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl liquid-glass-input text-xs font-medium placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter size={14} className="text-muted-foreground ml-1 mr-1 hidden sm:inline" />
          {[
            { id: "ALL", label: "Semua" },
            { id: "MI", label: "MI (Aktif)" },
            { id: "MTs", label: "MTs (Persiapan)" },
            { id: "TPQ", label: "TPQ (Tartil)" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedInst(tab.id as typeof selectedInst)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedInst === tab.id
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 text-foreground/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-3xl liquid-glass-card border border-white/60 dark:border-white/10 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto mb-3" />
            <p>Menghubungkan ke MongoDB Atlas...</p>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="font-semibold text-foreground">Tidak ada data asatidz yang sesuai.</p>
            <p className="mt-1">Coba sesuaikan kata kunci pencarian atau filter lembaga.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/40 bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Asatidz & NIP</th>
                  <th className="py-3.5 px-4">Jabatan</th>
                  <th className="py-3.5 px-4">Lembaga</th>
                  <th className="py-3.5 px-4">Keahlian & Kitab</th>
                  <th className="py-3.5 px-4">Kontak</th>
                  <th className="py-3.5 px-4">Tahun Masuk</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 font-medium">
                {filteredTeachers.map((t) => (
                  <tr key={t.id || t.nip} className="hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold flex-shrink-0">
                          <GraduationCap size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm leading-tight">{t.name}</p>
                          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{t.nip}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-foreground/90">{t.role}</td>
                    <td className="py-4 px-4">
                      {t.institution === "MI" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                          <BookOpen size={11} />
                          MI Miftahul Ulum
                        </span>
                      )}
                      {t.institution === "MTs" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-800 dark:text-teal-300 border border-teal-500/30">
                          <Building2 size={11} />
                          MTs Persiapan
                        </span>
                      )}
                      {t.institution === "TPQ" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                          <Compass size={11} />
                          TPQ Tartil
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-foreground/85 max-w-xs">{t.specialization}</td>
                    <td className="py-4 px-4 font-mono text-muted-foreground">
                      <a
                        href={`https://wa.me/${t.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        <Phone size={12} />
                        <span>{t.phone}</span>
                      </a>
                    </td>
                    <td className="py-4 px-4 font-mono text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} />
                        {t.joinedYear}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Asatidz */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">Tambah Dewan Asatidz</h3>
                <p className="text-xs text-muted-foreground">Data akan tersimpan langsung ke MongoDB Atlas.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ust. M. Hasan Basri, S.Pd.I"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Lembaga Naungan *</label>
                  <select
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value as "MI" | "MTs" | "TPQ" })}
                    className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                  >
                    <option value="MI">MI Miftahul Ulum (Aktif)</option>
                    <option value="MTs">MTs Miftahul Ulum (Persiapan)</option>
                    <option value="TPQ">TPQ Al-Qur&apos;an Sidogiri</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Jabatan / Peran *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Guru Kitab / Wali Kelas"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Bidang Keahlian / Spesialisasi Kitab *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Fathul Qorib, Jurumiyah, Metode Tartil"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">No. WhatsApp / Telepon</label>
                  <input
                    type="tel"
                    placeholder="Contoh: 0812-3456-7890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Tahun Bergabung</label>
                  <input
                    type="number"
                    value={formData.joinedYear}
                    onChange={(e) => setFormData({ ...formData, joinedYear: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 text-foreground font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white font-bold shadow-md disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan ke Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
