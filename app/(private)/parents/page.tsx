"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getParentsAction, createParentAction } from "@/lib/actions/parents";
import {
  HeartHandshake,
  Search,
  Plus,
  BookOpen,
  Building2,
  Compass,
  ArrowLeft,
  MapPin,
  CheckCircle2,
  X,
  Filter,
  Users,
  ShieldCheck,
  MessageCircle
} from "lucide-react";

interface Parent {
  id: string;
  name: string;
  phone: string;
  studentName: string;
  studentNis: string;
  studentInstitution: "MI" | "MTs" | "TPQ";
  relation: "Ayah" | "Ibu" | "Wali";
  address: string;
  status: "AKTIF" | "ALUMNI";
}

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInst, setSelectedInst] = useState<"ALL" | "MI" | "MTs" | "TPQ">("ALL");
  const [selectedRelation, setSelectedRelation] = useState<"ALL" | "Ayah" | "Ibu" | "Wali">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    studentName: "",
    studentNis: "",
    studentInstitution: "MI" as "MI" | "MTs" | "TPQ",
    relation: "Ayah" as "Ayah" | "Ibu" | "Wali",
    address: "",
  });

  const loadParents = async () => {
    try {
      const res = await getParentsAction();
      if (res.success && res.data) {
        setParents(res.data as unknown as Parent[]);
      }
    } catch (err) {
      console.error("Gagal mengambil data parents:", err);
    }
  };

  useEffect(() => {
    let ignore = false;
    getParentsAction()
      .then((res) => {
        if (!ignore && res.success && res.data) {
          setParents(res.data as unknown as Parent[]);
        }
      })
      .catch((err) => {
        console.error("Gagal mengambil data parents:", err);
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

  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification(null);

    try {
      const res = await createParentAction({
        name: formData.name,
        phone: formData.phone,
        studentName: formData.studentName,
        studentNis: formData.studentNis,
        studentInstitution: formData.studentInstitution,
        relation: formData.relation,
        address: formData.address,
        status: "AKTIF",
      });

      if (res.success) {
        setNotification({ type: "success", message: "Data wali santri berhasil disimpan ke MongoDB Atlas!" });
        setIsModalOpen(false);
        setFormData({
          name: "",
          phone: "",
          studentName: "",
          studentNis: "",
          studentInstitution: "MI",
          relation: "Ayah",
          address: "",
        });
        await loadParents();
      } else {
        setNotification({ type: "error", message: res.error || "Gagal menyimpan data." });
      }
    } catch {
      setNotification({ type: "error", message: "Terjadi gangguan saat menyimpan data." });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredParents = useMemo(() => {
    return parents.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.studentNis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchInst = selectedInst === "ALL" || p.studentInstitution === selectedInst;
      const matchRel = selectedRelation === "ALL" || p.relation === selectedRelation;
      return matchSearch && matchInst && matchRel;
    });
  }, [parents, searchQuery, selectedInst, selectedRelation]);

  const stats = useMemo(() => {
    return {
      total: parents.length,
      mi: parents.filter((p) => p.studentInstitution === "MI").length,
      mts: parents.filter((p) => p.studentInstitution === "MTs").length,
      tpq: parents.filter((p) => p.studentInstitution === "TPQ").length,
    };
  }, [parents]);

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
              <HeartHandshake size={14} />
              <span>Sinergi Wali Santri & Pesantren</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Data Orang Tua & Wali Santri
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
              Pusat koordinasi komunikasi keluarga santri, nomor darurat WhatsApp wali, pemetaan domisili, dan relasi santri terdaftar di MI, persiapan MTs, dan TPQ Sidogiri.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer self-start md:self-center"
          >
            <Plus size={15} />
            <span>Tambah Data Wali Santri</span>
          </button>
        </div>

        {/* KPI Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-border/40">
          <div className="p-3.5 rounded-2xl liquid-glass-card">
            <span className="text-[11px] font-semibold text-muted-foreground block">Total Wali Terdaftar</span>
            <span className="text-2xl font-bold text-foreground font-mono">{stats.total}</span>
          </div>
          <div className="p-3.5 rounded-2xl liquid-glass-card">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block">Wali Santri MI</span>
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono">{stats.mi}</span>
          </div>
          <div className="p-3.5 rounded-2xl liquid-glass-card">
            <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 block">Wali Santri MTs</span>
            <span className="text-2xl font-bold text-teal-700 dark:text-teal-400 font-mono">{stats.mts}</span>
          </div>
          <div className="p-3.5 rounded-2xl liquid-glass-card">
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 block">Wali Murid TPQ</span>
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
            placeholder="Cari nama wali, nama santri, NIS, atau domisili..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl liquid-glass-input text-xs font-medium placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter size={14} className="text-muted-foreground ml-1 mr-1 hidden sm:inline" />
          {[
            { id: "ALL", label: "Semua Jenjang" },
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

          <span className="text-muted-foreground/30 mx-1 hidden sm:inline">|</span>

          {[
            { id: "ALL", label: "Semua Relasi" },
            { id: "Ayah", label: "Ayah" },
            { id: "Ibu", label: "Ibu" },
            { id: "Wali", label: "Wali" },
          ].map((rel) => (
            <button
              key={rel.id}
              type="button"
              onClick={() => setSelectedRelation(rel.id as typeof selectedRelation)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedRelation === rel.id
                  ? "bg-teal-700 text-white shadow-sm"
                  : "liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 text-foreground/70"
              }`}
            >
              {rel.label}
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
        ) : filteredParents.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="font-semibold text-foreground">Tidak ada data wali santri yang sesuai.</p>
            <p className="mt-1">Coba sesuaikan kata kunci pencarian atau filter lembaga.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/40 bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Nama Wali & Relasi</th>
                  <th className="py-3.5 px-4">Santri Terhubung</th>
                  <th className="py-3.5 px-4">NIS</th>
                  <th className="py-3.5 px-4">Jenjang Lembaga</th>
                  <th className="py-3.5 px-4">Kontak WhatsApp</th>
                  <th className="py-3.5 px-4">Domisili Asal</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 font-medium">
                {filteredParents.map((p) => {
                  const rawPhone = p.phone.replace(/[^0-9]/g, "");
                  const waNumber = rawPhone.startsWith("0") ? `62${rawPhone.slice(1)}` : rawPhone;
                  return (
                    <tr key={p.id || `${p.name}-${p.studentNis}`} className="hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold flex-shrink-0">
                            <HeartHandshake size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm leading-tight">{p.name}</p>
                            <span className="inline-block text-[10px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full mt-1">
                              {p.relation}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-foreground">
                        {p.studentName}
                      </td>
                      <td className="py-4 px-4 font-mono text-muted-foreground">
                        {p.studentNis}
                      </td>
                      <td className="py-4 px-4">
                        {p.studentInstitution === "MI" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                            <BookOpen size={11} />
                            MI Miftahul Ulum
                          </span>
                        )}
                        {p.studentInstitution === "MTs" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-800 dark:text-teal-300 border border-teal-500/30">
                            <Building2 size={11} />
                            MTs Persiapan
                          </span>
                        )}
                        {p.studentInstitution === "TPQ" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                            <Compass size={11} />
                            TPQ Tartil
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-mono">
                        <a
                          href={`https://wa.me/${waNumber}?text=Assalamu%27alaikum%20Warahmatullahi%20Wabarakatuh%2C%20Bapak%2FIbu%20${encodeURIComponent(p.name)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 transition-colors"
                          title="Kirim pesan WhatsApp"
                        >
                          <MessageCircle size={13} className="text-emerald-600 dark:text-emerald-400" />
                          <span>{p.phone}</span>
                        </a>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground max-w-xs">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                          <span>{p.address}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Wali Santri */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">Tambah Data Wali Santri</h3>
                <p className="text-xs text-muted-foreground">Data tersinkronisasi langsung dengan MongoDB Atlas.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateParent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-foreground mb-1">Nama Lengkap Wali *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: H. Ahmad Subagio"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Hubungan *</label>
                  <select
                    value={formData.relation}
                    onChange={(e) => setFormData({ ...formData, relation: e.target.value as "Ayah" | "Ibu" | "Wali" })}
                    className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                  >
                    <option value="Ayah">Ayah</option>
                    <option value="Ibu">Ibu</option>
                    <option value="Wali">Wali Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Nama Santri Terhubung *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama santri"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">NIS Santri</label>
                  <input
                    type="text"
                    placeholder="Contoh: 202601001"
                    value={formData.studentNis}
                    onChange={(e) => setFormData({ ...formData, studentNis: e.target.value })}
                    className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Jenjang Lembaga *</label>
                  <select
                    value={formData.studentInstitution}
                    onChange={(e) => setFormData({ ...formData, studentInstitution: e.target.value as "MI" | "MTs" | "TPQ" })}
                    className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                  >
                    <option value="MI">MI Miftahul Ulum (Aktif)</option>
                    <option value="MTs">MTs Miftahul Ulum (Persiapan)</option>
                    <option value="TPQ">TPQ Al-Qur&apos;an Sidogiri</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">No. WhatsApp / HP *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0812-xxxx-xxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Domisili / Alamat</label>
                <input
                  type="text"
                  placeholder="Contoh: Bekasi Timur, Kota Bekasi"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
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
