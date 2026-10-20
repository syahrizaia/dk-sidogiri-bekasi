"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  UserCheck, 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Users, 
  MessageCircle, 
  Building2, 
  Sparkles, 
  Video, 
  ChevronRight, 
  LogOut,
  Pencil,
  Plus,
  Send,
  HeartHandshake,
  Check,
  CalendarDays
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TeacherPortalViewProps {
  user: UserProfile;
  currentTime: string;
  onLogout: () => Promise<void>;
  loggingOut: boolean;
}

interface SantriBinaan {
  nis: string;
  nama: string;
  kelas: string;
  status: "MUKIM" | "NON-MUKIM";
  kamar: string;
  wali: string;
  noHp: string;
  tahfidz: string;
  kehadiran: string;
}

const SANTRI_BINAAN_LIST: SantriBinaan[] = [
  { nis: "2024.11.001", nama: "Ahmad Fawaid", kelas: "6 Ibtidaiyah A", status: "MUKIM", kamar: "Blok A - Kamar 04", wali: "H. Abdullah Syukri", noHp: "0812-3456-7890", tahfidz: "Jilid 6 Al-Qur'an (92%)", kehadiran: "98.5%" },
  { nis: "2024.11.007", nama: "Ali Zainal Musthofa", kelas: "6 Ibtidaiyah A", status: "MUKIM", kamar: "Blok A - Kamar 09", wali: "H. Abdul Wahab", noHp: "0818-2233-4455", tahfidz: "Jilid 6 Al-Qur'an (88%)", kehadiran: "97.0%" },
  { nis: "2024.11.003", nama: "Zainal Abidin", kelas: "5 Ibtidaiyah C", status: "MUKIM", kamar: "Blok B - Kamar 12", wali: "Hj. Siti Aminah", noHp: "0813-8765-4302", tahfidz: "Jilid 5 Al-Qur'an (95%)", kehadiran: "96.5%" },
  { nis: "2024.11.005", nama: "Fauzan Nur Rahmat", kelas: "4 Ibtidaiyah B", status: "MUKIM", kamar: "Blok A - Kamar 08", wali: "Ir. H. Gunawan", noHp: "0812-3344-5566", tahfidz: "Jilid 4 Al-Qur'an (90%)", kehadiran: "99.0%" },
];

export function TeacherPortalView({ user, currentTime, onLogout, loggingOut }: TeacherPortalViewProps) {
  const [activeTab, setActiveTab] = useState<"jadwal" | "santri" | "jurnal" | "kalender">("jadwal");
  
  // State Input Jurnal Mengajar
  const [jurnalSantri, setJurnalSantri] = useState("Ahmad Fawaid");
  const [jurnalMateri, setJurnalMateri] = useState("Fathul Qorib - Bab Sholat Berjamaah");
  const [jurnalNilai, setJurnalNilai] = useState("Mumtaz (Sangat Baik)");
  const [jurnalCatatan, setJurnalCatatan] = useState("");
  const [jurnalSaved, setJurnalSaved] = useState(false);

  const handleSaveJurnal = (e: React.FormEvent) => {
    e.preventDefault();
    setJurnalSaved(true);
    setTimeout(() => {
      setJurnalSaved(false);
      setJurnalCatatan("");
    }, 1800);
  };

  return (
    <div className="relative min-h-screen py-8 sm:py-10 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Background Islamic Accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10 flex items-center justify-center opacity-30 dark:opacity-20">
        <div className="w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-teal-500/10 via-emerald-500/10 to-blue-500/10 blur-3xl animate-pulse" />
      </div>

      {/* Top Welcome Header for Dewan Asatidz */}
      <div className="rounded-3xl liquid-glass-elevated p-6 sm:p-8 border border-white/60 dark:border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-teal-500/10 via-emerald-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 text-teal-800 dark:text-teal-300 border border-teal-500/30 text-xs font-bold">
              <UserCheck size={14} />
              <span>Portal Dewan Asatidz &amp; Pengajar Pesantren</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex flex-wrap items-baseline gap-2.5">
              <span className="font-serif font-bold text-teal-800 dark:text-teal-300 text-3xl sm:text-4xl leading-none">
                أَهْلاً وَسَهْلاً،
              </span>
              <span>{user.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Pusat kelola jadwal taklim, buku induk santri bimbingan, rekap mutaba&apos;ah setoran kitab kuning, dan koordinasi langsung dengan wali santri Sidogiri Bekasi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
            <div className="px-3.5 py-2 rounded-2xl liquid-glass-pill border border-white/50 text-xs font-semibold flex items-center gap-2 text-foreground/80">
              <Clock size={14} className="text-teal-600 dark:text-teal-400" />
              <span>{currentTime || "WIB"}</span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/20 text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut size={14} />
              <span>{loggingOut ? "Keluar..." : "Keluar Sesi"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Card: Profil Asatidz & Kinerja Pengajaran */}
      <div className="rounded-3xl liquid-glass-elevated p-6 sm:p-8 border border-white/70 dark:border-white/10 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/40">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-teal-800 via-teal-600 to-emerald-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-teal-950/25 shrink-0">
              AS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md">
                  NIP: DKS-AS-01
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                  PENDIDIK AKTIF
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground mt-1">
                {user.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Kepala Madrasah &amp; Pengajar Fiqih Fathul Qorib • Madrasah Ibtidaiyah (MI) Miftahul Ulum Sidogiri
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/students"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Users size={15} />
              <span>Buka Buku Induk Santri</span>
            </Link>

            <Link
              href="/parents"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full liquid-glass-pill hover:bg-white/40 text-foreground text-xs font-bold transition-all cursor-pointer"
            >
              <HeartHandshake size={15} className="text-indigo-600" />
              <span>Direktori Wali Santri</span>
            </Link>
          </div>
        </div>

        {/* 4 Stats Cards for Teacher */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl liquid-glass border border-border/40 space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium block">Santri Binaan Bimbingan</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-teal-700 dark:text-teal-400">8 Santri</span>
              <span className="text-[10px] text-teal-600 font-bold">Aktif</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Kelas 6 Ibtidaiyah A &amp; 5 C</p>
          </div>

          <div className="p-4 rounded-2xl liquid-glass border border-border/40 space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium block">Jadwal Pengajian Mingguan</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">5 Sesi</span>
              <span className="text-[10px] text-emerald-600 font-bold">Rutin</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Madrasah &amp; Sorogan Masjid</p>
          </div>

          <div className="p-4 rounded-2xl liquid-glass border border-border/40 space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium block">Tingkat Kehadiran Kelas</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-700 dark:text-indigo-400">98.2%</span>
              <span className="text-[10px] text-indigo-600 font-bold">Tinggi</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Kedisiplinan Shalat &amp; Belajar</p>
          </div>

          <div className="p-4 rounded-2xl liquid-glass border border-border/40 space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium block">Kitab Kuning Utama</span>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black text-foreground truncate">Fathul Qorib</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Serta Al-Jurumiyah &amp; Aqidatul Awam</p>
          </div>
        </div>
      </div>

      {/* Interactive Tabs Header */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab("jadwal")}
          className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
            activeTab === "jadwal"
              ? "bg-gradient-to-r from-teal-800 to-emerald-700 text-white shadow-md shadow-teal-950/20"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            <Calendar size={14} />
            <span>Jadwal Mengajar Hari Ini</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("santri")}
          className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
            activeTab === "santri"
              ? "bg-gradient-to-r from-teal-800 to-emerald-700 text-white shadow-md shadow-teal-950/20"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            <Users size={14} />
            <span>Santri Binaan &amp; Kontak Wali</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("jurnal")}
          className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
            activeTab === "jurnal"
              ? "bg-gradient-to-r from-teal-800 to-emerald-700 text-white shadow-md shadow-teal-950/20"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            <BookOpen size={14} />
            <span>Jurnal &amp; Mutaba&apos;ah Setoran</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("kalender")}
          className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
            activeTab === "kalender"
              ? "bg-gradient-to-r from-teal-800 to-emerald-700 text-white shadow-md shadow-teal-950/20"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            <CalendarDays size={14} />
            <span>Kalender Akademik &amp; Imtihan</span>
          </span>
        </button>
      </div>

      {/* Tab 1: Jadwal Mengajar */}
      {activeTab === "jadwal" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="rounded-3xl liquid-glass-elevated p-6 border border-white/60 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <BookOpen size={18} className="text-teal-600" />
                <span>Agenda Taklim &amp; Jadwal Mengajar Hari Ini</span>
              </h3>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                Semester Ganjil 1447 H / 2026 M
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl liquid-glass border border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="px-3 py-2 rounded-xl bg-teal-500/15 text-teal-800 dark:text-teal-300 font-mono text-xs font-bold">
                    07.30 - 09.00
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">Fiqih Ibadah Praktis (Fathul Qorib)</h4>
                    <p className="text-xs text-muted-foreground">Kelas 6 Ibtidaiyah A • Ruang Kelas Abu Bakar Ash-Shiddiq</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold self-start sm:self-center">
                  Selesai Terlaksana
                </span>
              </div>

              <div className="p-4 rounded-2xl liquid-glass border border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="px-3 py-2 rounded-xl bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 font-mono text-xs font-bold">
                    13.30 - 15.00
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">Nahwu Shorof Dasar (Al-Jurumiyah)</h4>
                    <p className="text-xs text-muted-foreground">Kelas 5 Ibtidaiyah C • Ruang Kelas Umar bin Khattab</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 text-[10px] font-bold self-start sm:self-center">
                  Sesi Berikutnya
                </span>
              </div>

              <div className="p-4 rounded-2xl liquid-glass border border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="px-3 py-2 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-300 font-mono text-xs font-bold">
                    18.30 - 19.45
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">Halaqah Sorogan Kitab Kuning Ba&apos;da Maghrib</h4>
                    <p className="text-xs text-muted-foreground">Santri Mukim Putra • Masjid Jami&apos; Darul Khidmah Sidogiri</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-muted/60 text-muted-foreground text-[10px] font-bold self-start sm:self-center">
                  Malam Hari
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Santri Binaan & Koordinasi Wali */}
      {activeTab === "santri" && (
        <div className="rounded-3xl liquid-glass-elevated p-6 sm:p-8 border border-white/60 dark:border-white/10 shadow-xl space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/40">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Santri Kelas Binaan &amp; Koordinasi Wali Santri
              </h3>
              <p className="text-xs text-muted-foreground">
                Hubungi langsung wali santri melalui WhatsApp untuk konsultasi kemajuan belajar santri
              </p>
            </div>
            <Link
              href="/students"
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 self-start sm:self-center"
            >
              <span>Lihat Seluruh Santri</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="border-b border-border/40 bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Nama Santri &amp; NIS</th>
                  <th className="py-3 px-4">Kelas &amp; Asrama</th>
                  <th className="py-3 px-4">Hafalan / Capaian</th>
                  <th className="py-3 px-4">Kehadiran</th>
                  <th className="py-3 px-4">Wali Santri</th>
                  <th className="py-3 px-4 text-right">Koordinasi WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 font-medium">
                {SANTRI_BINAAN_LIST.map((s) => {
                  const rawPhone = s.noHp.replace(/[^0-9]/g, "");
                  const waNumber = rawPhone.startsWith("0") ? `62${rawPhone.slice(1)}` : rawPhone;
                  return (
                    <tr key={s.nis} className="hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-foreground block text-sm">{s.nama}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">NIS: {s.nis}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-foreground block">{s.kelas}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {s.status === "MUKIM" ? `Mukim (${s.kamar})` : "Non-Mukim"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-teal-700 dark:text-teal-400 font-semibold">
                        {s.tahfidz}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        {s.kehadiran}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-foreground block">{s.wali}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">{s.noHp}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={`https://wa.me/${waNumber}?text=Assalamu%27alaikum%20Bapak%2FIbu%20${encodeURIComponent(s.wali)}%2C%20saya%20Ustadz%20Sholeh%20dari%20Darul%20Khidmah%20Sidogiri%20ingin%20mengabarkan%20perkembangan%20belajar%20ananda%20${encodeURIComponent(s.nama)}.`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-all"
                          title="Hubungi wali santri di WhatsApp"
                        >
                          <MessageCircle size={13} />
                          <span>Hubungi Wali</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Jurnal Mutaba'ah */}
      {activeTab === "jurnal" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
          <div className="rounded-3xl liquid-glass-elevated p-6 border border-white/60 dark:border-white/10 space-y-4">
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Pencil size={18} className="text-teal-600" />
              <span>Input Mutaba&apos;ah Setoran Santri</span>
            </h3>

            {jurnalSaved ? (
              <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
                <p>Data setoran berhasil dicatat ke dalam database akademik santri!</p>
              </div>
            ) : (
              <form onSubmit={handleSaveJurnal} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Pilih Santri</label>
                  <select 
                    value={jurnalSantri}
                    onChange={(e) => setJurnalSantri(e.target.value)}
                    className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground font-semibold cursor-pointer"
                  >
                    {SANTRI_BINAAN_LIST.map((s) => (
                      <option key={s.nis} value={s.nama}>
                        {s.nama} ({s.nis} - {s.kelas})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Materi Kitab / Nadhom</label>
                  <input 
                    type="text" 
                    required
                    value={jurnalMateri}
                    onChange={(e) => setJurnalMateri(e.target.value)}
                    placeholder="Contoh: Fathul Qorib / Aqidatul Awam"
                    className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Predikat Evaluasi</label>
                  <select 
                    value={jurnalNilai}
                    onChange={(e) => setJurnalNilai(e.target.value)}
                    className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground font-semibold cursor-pointer"
                  >
                    <option value="Mumtaz (Sangat Baik)">Mumtaz (Sangat Baik / Lancar Sekali)</option>
                    <option value="Jayyid Jiddan (Baik Sekali)">Jayyid Jiddan (Baik Sekali)</option>
                    <option value="Jayyid (Cukup Baik)">Jayyid (Cukup Baik)</option>
                    <option value="Maqbul (Perlu Pengulangan)">Maqbul (Perlu Pengulangan)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Catatan Ustadz untuk Santri &amp; Wali</label>
                  <textarea 
                    rows={3}
                    placeholder="Tuliskan catatan kelancaran atau adab santri..."
                    value={jurnalCatatan}
                    onChange={(e) => setJurnalCatatan(e.target.value)}
                    className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-600 hover:to-emerald-500 text-white font-bold cursor-pointer shadow-md"
                >
                  Simpan Catatan Setoran
                </button>
              </form>
            )}
          </div>

          <div className="rounded-3xl liquid-glass-elevated p-6 border border-white/60 dark:border-white/10 space-y-4">
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Check size={18} className="text-emerald-600" />
              <span>Setoran Terakhir yang Telah Tercatat</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl liquid-glass border border-border/40 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>Ahmad Fawaid (6A)</span>
                  <span className="text-emerald-600">Mumtaz</span>
                </div>
                <p className="text-muted-foreground text-[11px]">Nadhom Aqidatul Awam Bait 1 - 57 (Khatam)</p>
                <span className="text-[10px] text-muted-foreground block">Hari ini, 06.15 WIB</span>
              </div>

              <div className="p-3.5 rounded-2xl liquid-glass border border-border/40 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>Ali Zainal Musthofa (6A)</span>
                  <span className="text-teal-600">Jayyid Jiddan</span>
                </div>
                <p className="text-muted-foreground text-[11px]">Al-Jurumiyah Bab Al-Kalam &amp; I&apos;rab</p>
                <span className="text-[10px] text-muted-foreground block">Kemarin, 14.20 WIB</span>
              </div>

              <div className="p-3.5 rounded-2xl liquid-glass border border-border/40 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>Zainal Abidin (5C)</span>
                  <span className="text-emerald-600">Mumtaz</span>
                </div>
                <p className="text-muted-foreground text-[11px]">Safinatun Najah Bab Syarat Sah Shalat</p>
                <span className="text-[10px] text-muted-foreground block">Kemarin, 19.30 WIB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Kalender Akademik */}
      {activeTab === "kalender" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-6 rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 space-y-3">
            <h4 className="font-bold text-foreground text-base">
              Agenda Penting Kalender Tarbiyah Pondok Pesantren
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl liquid-glass border border-border/40 space-y-1">
                <span className="text-teal-700 dark:text-teal-400 font-bold block">12 - 19 November 2026</span>
                <span className="font-bold text-foreground text-sm block">Imtihan Caturwulan I</span>
                <p className="text-muted-foreground text-[11px]">Ujian lisan sorogan kitab kuning dan ujian tulis madrasah</p>
              </div>

              <div className="p-4 rounded-2xl liquid-glass border border-border/40 space-y-1">
                <span className="text-amber-700 dark:text-amber-400 font-bold block">25 November 2026</span>
                <span className="font-bold text-foreground text-sm block">Musyawarah Dewan Asatidz</span>
                <p className="text-muted-foreground text-[11px]">Rapat evaluasi kurikulum dan pembagian rapor caturwulan</p>
              </div>

              <div className="p-4 rounded-2xl liquid-glass border border-border/40 space-y-1">
                <span className="text-indigo-700 dark:text-indigo-400 font-bold block">01 - 07 Desember 2026</span>
                <span className="font-bold text-foreground text-sm block">Libur Santri Maulid</span>
                <p className="text-muted-foreground text-[11px]">Libur resmi semester ganjil dan kepulangan santri mukim</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Navigation Cards for Teachers */}
      <div className="pt-4 border-t border-border/40">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">
          Akses Cepat Modul Pengajaran
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Link
            href="/students"
            className="p-4 rounded-2xl liquid-glass border border-border/40 hover:border-emerald-500/40 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Users size={16} />
              </div>
              <div>
                <span className="font-bold text-xs text-foreground block group-hover:text-emerald-600 transition-colors">
                  Buku Induk Santri
                </span>
                <span className="text-[10px] text-muted-foreground">Database santri</span>
              </div>
            </div>
            <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/parents"
            className="p-4 rounded-2xl liquid-glass border border-border/40 hover:border-indigo-500/40 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
                <HeartHandshake size={16} />
              </div>
              <div>
                <span className="font-bold text-xs text-foreground block group-hover:text-indigo-600 transition-colors">
                  Wali Santri
                </span>
                <span className="text-[10px] text-muted-foreground">Kontak keluarga</span>
              </div>
            </div>
            <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/teachers"
            className="p-4 rounded-2xl liquid-glass border border-border/40 hover:border-teal-500/40 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
                <UserCheck size={16} />
              </div>
              <div>
                <span className="font-bold text-xs text-foreground block group-hover:text-teal-600 transition-colors">
                  Dewan Asatidz
                </span>
                <span className="text-[10px] text-muted-foreground">Direktori pengajar</span>
              </div>
            </div>
            <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/modules/media"
            className="p-4 rounded-2xl liquid-glass border border-border/40 hover:border-amber-500/40 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                <Video size={16} />
              </div>
              <div>
                <span className="font-bold text-xs text-foreground block group-hover:text-amber-600 transition-colors">
                  Pusat Media
                </span>
                <span className="text-[10px] text-muted-foreground">Dokumentasi dakwah</span>
              </div>
            </div>
            <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
